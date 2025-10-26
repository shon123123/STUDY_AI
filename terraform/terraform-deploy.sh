#!/bin/bash

# Terraform deployment script for Study AI platform
# Usage: ./terraform-deploy.sh [environment] [action]
# Environments: dev, staging, production
# Actions: plan, apply, destroy, validate

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-plan}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR"
ENV_DIR="$TERRAFORM_DIR/environments/$ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate inputs
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Valid environments: dev, staging, production"
    exit 1
fi

if [[ ! "$ACTION" =~ ^(plan|apply|destroy|validate|init|refresh)$ ]]; then
    print_error "Invalid action: $ACTION"
    print_error "Valid actions: init, validate, plan, apply, destroy, refresh"
    exit 1
fi

print_status "🚀 Terraform $ACTION for $ENVIRONMENT environment"

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed. Please install Terraform first."
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS CLI is not configured or credentials are invalid."
    exit 1
fi

print_success "✅ Prerequisites check passed"

# Check if environment directory exists
if [[ ! -d "$ENV_DIR" ]]; then
    print_error "Environment directory not found: $ENV_DIR"
    exit 1
fi

# Change to terraform directory
cd "$TERRAFORM_DIR"

# Initialize Terraform if .terraform directory doesn't exist
if [[ ! -d ".terraform" ]] || [[ "$ACTION" == "init" ]]; then
    print_status "🔧 Initializing Terraform..."
    terraform init \
        -backend-config="bucket=study-ai-terraform-state-$ENVIRONMENT" \
        -backend-config="key=$ENVIRONMENT/terraform.tfstate" \
        -backend-config="region=us-west-2" \
        -backend-config="dynamodb_table=study-ai-terraform-locks-$ENVIRONMENT"
    
    if [[ $? -eq 0 ]]; then
        print_success "✅ Terraform initialized successfully"
    else
        print_error "❌ Terraform initialization failed"
        exit 1
    fi
fi

# Validate Terraform configuration
if [[ "$ACTION" == "validate" ]] || [[ "$ACTION" != "destroy" ]]; then
    print_status "🔍 Validating Terraform configuration..."
    terraform validate
    
    if [[ $? -eq 0 ]]; then
        print_success "✅ Terraform configuration is valid"
    else
        print_error "❌ Terraform configuration validation failed"
        exit 1
    fi
fi

# Format check
print_status "📝 Checking Terraform formatting..."
if ! terraform fmt -check -recursive; then
    print_warning "⚠️  Terraform files are not properly formatted. Run 'terraform fmt -recursive' to fix."
fi

# Execute the requested action
case $ACTION in
    "init")
        print_success "✅ Terraform initialization completed"
        ;;
    "validate")
        print_success "✅ Terraform validation completed"
        ;;
    "plan")
        print_status "📋 Creating Terraform plan..."
        terraform plan \
            -var-file="$ENV_DIR/terraform.tfvars" \
            -out="$ENVIRONMENT.tfplan" \
            -detailed-exitcode
        
        PLAN_EXIT_CODE=$?
        if [[ $PLAN_EXIT_CODE -eq 0 ]]; then
            print_success "✅ No changes needed"
        elif [[ $PLAN_EXIT_CODE -eq 2 ]]; then
            print_success "✅ Plan created successfully with changes"
            print_status "📄 Plan saved as: $ENVIRONMENT.tfplan"
        else
            print_error "❌ Terraform plan failed"
            exit 1
        fi
        ;;
    "apply")
        # Check if plan file exists
        if [[ -f "$ENVIRONMENT.tfplan" ]]; then
            print_status "📦 Applying Terraform plan..."
            terraform apply "$ENVIRONMENT.tfplan"
        else
            print_status "📦 Applying Terraform configuration..."
            terraform apply \
                -var-file="$ENV_DIR/terraform.tfvars" \
                -auto-approve
        fi
        
        if [[ $? -eq 0 ]]; then
            print_success "✅ Terraform apply completed successfully"
            
            # Clean up plan file
            rm -f "$ENVIRONMENT.tfplan"
            
            print_status "📊 Getting output values..."
            terraform output -json > "$ENVIRONMENT-outputs.json"
            print_success "✅ Outputs saved to: $ENVIRONMENT-outputs.json"
        else
            print_error "❌ Terraform apply failed"
            exit 1
        fi
        ;;
    "destroy")
        print_warning "⚠️  This will destroy all resources in the $ENVIRONMENT environment!"
        read -p "Are you sure you want to continue? (yes/no): " -r
        
        if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
            print_status "🗑️  Destroying Terraform resources..."
            terraform destroy \
                -var-file="$ENV_DIR/terraform.tfvars" \
                -auto-approve
            
            if [[ $? -eq 0 ]]; then
                print_success "✅ Resources destroyed successfully"
            else
                print_error "❌ Terraform destroy failed"
                exit 1
            fi
        else
            print_status "Operation cancelled"
        fi
        ;;
    "refresh")
        print_status "🔄 Refreshing Terraform state..."
        terraform refresh \
            -var-file="$ENV_DIR/terraform.tfvars"
        
        if [[ $? -eq 0 ]]; then
            print_success "✅ State refreshed successfully"
        else
            print_error "❌ Terraform refresh failed"
            exit 1
        fi
        ;;
esac

print_status "🎉 Terraform $ACTION completed for $ENVIRONMENT environment"

# Display useful information
if [[ "$ACTION" == "apply" ]]; then
    echo ""
    print_status "📋 Quick reference commands:"
    echo "  View outputs: terraform output"
    echo "  View state: terraform show"
    echo "  Update kubeconfig: aws eks update-kubeconfig --region us-west-2 --name study-ai-$ENVIRONMENT-cluster"
    echo ""
fi