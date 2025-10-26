# PowerShell deployment script for Study AI platform on Windows
# Usage: .\deploy.ps1 [environment]
# Environments: local, staging, production

param(
    [string]$Environment = "local"
)

$ErrorActionPreference = "Stop"
$Namespace = "study-ai"

Write-Host "🚀 Deploying Study AI Platform to $Environment environment..." -ForegroundColor Green

# Check if kubectl is installed
try {
    kubectl version --client=true | Out-Null
    Write-Host "✅ kubectl is available" -ForegroundColor Green
} catch {
    Write-Host "❌ kubectl is not installed. Please install kubectl first." -ForegroundColor Red
    exit 1
}

# Check if cluster is accessible
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Kubernetes cluster is accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig." -ForegroundColor Red
    exit 1
}

# Function to wait for deployment
function Wait-ForDeployment {
    param([string]$DeploymentName)
    Write-Host "⏳ Waiting for deployment/$DeploymentName to be ready..." -ForegroundColor Yellow
    kubectl wait --for=condition=available --timeout=300s deployment/$DeploymentName -n $Namespace
}

# Function to check service health
function Test-ServiceHealth {
    param([string]$ServiceName, [int]$Port)
    Write-Host "🔍 Checking health of service/$ServiceName..." -ForegroundColor Yellow
    
    # Start port forward
    $portForwardJob = Start-Job -ScriptBlock {
        param($service, $port, $namespace)
        kubectl port-forward service/$service "$port`:$port" -n $namespace
    } -ArgumentList $ServiceName, $Port, $Namespace
    
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Service $ServiceName is healthy" -ForegroundColor Green
        }
    } catch {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Service $ServiceName is healthy" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Service $ServiceName might not be fully ready yet" -ForegroundColor Yellow
        }
    }
    
    Stop-Job $portForwardJob -ErrorAction SilentlyContinue
    Remove-Job $portForwardJob -ErrorAction SilentlyContinue
}

# Build Docker images if in local environment
if ($Environment -eq "local") {
    Write-Host "🔨 Building Docker images..." -ForegroundColor Blue
    
    # Build backend image
    Write-Host "Building backend image..." -ForegroundColor Blue
    docker build -t study-ai-backend:latest ./backend
    
    # Build frontend image
    Write-Host "Building frontend image..." -ForegroundColor Blue
    docker build -t study-ai-frontend:latest ./frontend
    
    Write-Host "✅ Docker images built successfully" -ForegroundColor Green
}

# Apply Kubernetes manifests
Write-Host "📦 Applying Kubernetes manifests..." -ForegroundColor Blue

# Apply in order
kubectl apply -f k8s/00-namespace-config.yaml
Write-Host "✅ Namespace and ConfigMap applied" -ForegroundColor Green

kubectl apply -f k8s/01-mongodb.yaml
Write-Host "✅ MongoDB deployed" -ForegroundColor Green

# Wait for MongoDB to be ready
Wait-ForDeployment "mongodb-deployment"

kubectl apply -f k8s/02-backend.yaml
Write-Host "✅ Backend deployed" -ForegroundColor Green

# Wait for Backend to be ready
Wait-ForDeployment "backend-deployment"

kubectl apply -f k8s/03-frontend.yaml
Write-Host "✅ Frontend deployed" -ForegroundColor Green

# Wait for Frontend to be ready
Wait-ForDeployment "frontend-deployment"

kubectl apply -f k8s/04-ingress-hpa.yaml
Write-Host "✅ Ingress and HPA applied" -ForegroundColor Green

# Display deployment status
Write-Host ""
Write-Host "📊 Deployment Status:" -ForegroundColor Cyan
kubectl get all -n $Namespace

# Display services and endpoints
Write-Host ""
Write-Host "🔗 Services:" -ForegroundColor Cyan
kubectl get services -n $Namespace

# Check if ingress controller is available
try {
    kubectl get pods -n ingress-nginx | Out-Null
    Write-Host ""
    Write-Host "🌐 Ingress:" -ForegroundColor Cyan
    kubectl get ingress -n $Namespace
} catch {
    Write-Host "⚠️  Ingress controller not found" -ForegroundColor Yellow
}

# Health checks
Write-Host ""
Write-Host "🏥 Performing health checks..." -ForegroundColor Blue
Start-Sleep -Seconds 10  # Give services time to start

Test-ServiceHealth "backend-service" 8000
Test-ServiceHealth "frontend-service" 3000

Write-Host ""
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Add 'study-ai.local' to your C:\Windows\System32\drivers\etc\hosts file pointing to your ingress IP"
Write-Host "2. Access the application at: http://study-ai.local"
Write-Host "3. Monitor the deployment with: kubectl get pods -n $Namespace -w"
Write-Host ""
Write-Host "🔧 Useful commands:" -ForegroundColor Cyan
Write-Host "  kubectl logs -f deployment/backend-deployment -n $Namespace"
Write-Host "  kubectl logs -f deployment/frontend-deployment -n $Namespace"
Write-Host "  kubectl port-forward service/frontend-service 3000:3000 -n $Namespace"
Write-Host "  kubectl port-forward service/backend-service 8000:8000 -n $Namespace"