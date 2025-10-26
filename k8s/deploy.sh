#!/bin/bash

# Kubernetes deployment script for Study AI platform
# Usage: ./deploy.sh [environment]
# Environments: local, staging, production

set -e

ENVIRONMENT=${1:-local}
NAMESPACE="study-ai"

echo "🚀 Deploying Study AI Platform to $ENVIRONMENT environment..."

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Function to wait for deployment
wait_for_deployment() {
    local deployment=$1
    echo "⏳ Waiting for deployment/$deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/$deployment -n $NAMESPACE
}

# Function to check service health
check_service_health() {
    local service=$1
    local port=$2
    echo "🔍 Checking health of service/$service..."
    
    # Port forward and check health
    kubectl port-forward service/$service $port:$port -n $NAMESPACE &
    PF_PID=$!
    sleep 5
    
    if curl -f http://localhost:$port/health &> /dev/null || curl -f http://localhost:$port &> /dev/null; then
        echo "✅ Service $service is healthy"
    else
        echo "⚠️  Service $service might not be fully ready yet"
    fi
    
    kill $PF_PID 2>/dev/null || true
}

# Build Docker images if in local environment
if [ "$ENVIRONMENT" = "local" ]; then
    echo "🔨 Building Docker images..."
    
    # Build backend image
    echo "Building backend image..."
    docker build -t study-ai-backend:latest ./backend
    
    # Build frontend image
    echo "Building frontend image..."
    docker build -t study-ai-frontend:latest ./frontend
    
    echo "✅ Docker images built successfully"
fi

# Apply Kubernetes manifests
echo "📦 Applying Kubernetes manifests..."

# Apply in order
kubectl apply -f k8s/00-namespace-config.yaml
echo "✅ Namespace and ConfigMap applied"

kubectl apply -f k8s/01-mongodb.yaml
echo "✅ MongoDB deployed"

# Wait for MongoDB to be ready
wait_for_deployment "mongodb-deployment"

kubectl apply -f k8s/02-backend.yaml
echo "✅ Backend deployed"

# Wait for Backend to be ready
wait_for_deployment "backend-deployment"

kubectl apply -f k8s/03-frontend.yaml
echo "✅ Frontend deployed"

# Wait for Frontend to be ready
wait_for_deployment "frontend-deployment"

kubectl apply -f k8s/04-ingress-hpa.yaml
echo "✅ Ingress and HPA applied"

# Display deployment status
echo ""
echo "📊 Deployment Status:"
kubectl get all -n $NAMESPACE

# Display services and endpoints
echo ""
echo "🔗 Services:"
kubectl get services -n $NAMESPACE

# Check if ingress controller is available
if kubectl get pods -n ingress-nginx &> /dev/null; then
    echo ""
    echo "🌐 Ingress:"
    kubectl get ingress -n $NAMESPACE
fi

# Health checks
echo ""
echo "🏥 Performing health checks..."
sleep 10  # Give services time to start

check_service_health "backend-service" 8000
check_service_health "frontend-service" 3000

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Add 'study-ai.local' to your /etc/hosts file pointing to your ingress IP"
echo "2. Access the application at: http://study-ai.local"
echo "3. Monitor the deployment with: kubectl get pods -n $NAMESPACE -w"
echo ""
echo "🔧 Useful commands:"
echo "  kubectl logs -f deployment/backend-deployment -n $NAMESPACE"
echo "  kubectl logs -f deployment/frontend-deployment -n $NAMESPACE"
echo "  kubectl port-forward service/frontend-service 3000:3000 -n $NAMESPACE"
echo "  kubectl port-forward service/backend-service 8000:8000 -n $NAMESPACE"