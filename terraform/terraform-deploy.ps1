# PowerShell Terraform deployment script for Study AI platform
# Usage: .\terraform-deploy.ps1 [environment] [action]
# Environments: dev, staging, production
# Actions: plan, apply, destroy, validate

param(
    [string]$Environment = "dev",
    [string]$Action = "plan"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TerraformDir = $ScriptDir
$EnvDir = Join-Path $TerraformDir "environments\$Environment"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Validate inputs
if ($Environment -notmatch "^(dev|staging|production)$") {
    Write-Error "Invalid environment: $Environment"
    Write-Error "Valid environments: dev, staging, production"
    exit 1
}

if ($Action -notmatch "^(plan|apply|destroy|validate|init|refresh)$") {
    Write-Error "Invalid action: $Action"
    Write-Error "Valid actions: init, validate, plan, apply, destroy, refresh"
    exit 1
}

Write-Status "🚀 Terraform $Action for $Environment environment"

# Check if terraform is installed
try {
    terraform version | Out-Null
    Write-Success "✅ Terraform is available"
} catch {
    Write-Error "❌ Terraform is not installed. Please install Terraform first."
    exit 1
}

# Check if AWS CLI is configured
try {
    aws sts get-caller-identity | Out-Null
    Write-Success "✅ AWS CLI is configured"
} catch {
    Write-Error "❌ AWS CLI is not configured or credentials are invalid."
    exit 1
}

Write-Success "✅ Prerequisites check passed"

# Check if environment directory exists
if (-not (Test-Path $EnvDir)) {
    Write-Error "❌ Environment directory not found: $EnvDir"
    exit 1
}

# Change to terraform directory
Set-Location $TerraformDir

# Initialize Terraform if .terraform directory doesn't exist
if (-not (Test-Path ".terraform") -or $Action -eq "init") {
    Write-Status "🔧 Initializing Terraform..."
    
    $initArgs = @(
        "init",
        "-backend-config=bucket=study-ai-terraform-state-$Environment",
        "-backend-config=key=$Environment/terraform.tfstate",
        "-backend-config=region=us-west-2",
        "-backend-config=dynamodb_table=study-ai-terraform-locks-$Environment"
    )
    
    & terraform $initArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ Terraform initialized successfully"
    } else {
        Write-Error "❌ Terraform initialization failed"
        exit 1
    }
}

# Validate Terraform configuration
if ($Action -eq "validate" -or $Action -ne "destroy") {
    Write-Status "🔍 Validating Terraform configuration..."
    terraform validate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ Terraform configuration is valid"
    } else {
        Write-Error "❌ Terraform configuration validation failed"
        exit 1
    }
}

# Format check
Write-Status "📝 Checking Terraform formatting..."
$formatCheck = terraform fmt -check -recursive
if ($LASTEXITCODE -ne 0) {
    Write-Warning "⚠️  Terraform files are not properly formatted. Run 'terraform fmt -recursive' to fix."
}

# Execute the requested action
switch ($Action) {
    "init" {
        Write-Success "✅ Terraform initialization completed"
    }
    "validate" {
        Write-Success "✅ Terraform validation completed"
    }
    "plan" {
        Write-Status "📋 Creating Terraform plan..."
        
        $planArgs = @(
            "plan",
            "-var-file=$EnvDir\terraform.tfvars",
            "-out=$Environment.tfplan",
            "-detailed-exitcode"
        )
        
        & terraform $planArgs
        
        $planExitCode = $LASTEXITCODE
        if ($planExitCode -eq 0) {
            Write-Success "✅ No changes needed"
        } elseif ($planExitCode -eq 2) {
            Write-Success "✅ Plan created successfully with changes"
            Write-Status "📄 Plan saved as: $Environment.tfplan"
        } else {
            Write-Error "❌ Terraform plan failed"
            exit 1
        }
    }
    "apply" {
        if (Test-Path "$Environment.tfplan") {
            Write-Status "📦 Applying Terraform plan..."
            terraform apply "$Environment.tfplan"
        } else {
            Write-Status "📦 Applying Terraform configuration..."
            
            $applyArgs = @(
                "apply",
                "-var-file=$EnvDir\terraform.tfvars",
                "-auto-approve"
            )
            
            & terraform $applyArgs
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ Terraform apply completed successfully"
            
            # Clean up plan file
            if (Test-Path "$Environment.tfplan") {
                Remove-Item "$Environment.tfplan"
            }
            
            Write-Status "📊 Getting output values..."
            terraform output -json | Out-File -FilePath "$Environment-outputs.json" -Encoding utf8
            Write-Success "✅ Outputs saved to: $Environment-outputs.json"
        } else {
            Write-Error "❌ Terraform apply failed"
            exit 1
        }
    }
    "destroy" {
        Write-Warning "⚠️  This will destroy all resources in the $Environment environment!"
        $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
        
        if ($confirmation -match "^[Yy][Ee][Ss]$") {
            Write-Status "🗑️  Destroying Terraform resources..."
            
            $destroyArgs = @(
                "destroy",
                "-var-file=$EnvDir\terraform.tfvars",
                "-auto-approve"
            )
            
            & terraform $destroyArgs
            
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✅ Resources destroyed successfully"
            } else {
                Write-Error "❌ Terraform destroy failed"
                exit 1
            }
        } else {
            Write-Status "Operation cancelled"
        }
    }
    "refresh" {
        Write-Status "🔄 Refreshing Terraform state..."
        
        $refreshArgs = @(
            "refresh",
            "-var-file=$EnvDir\terraform.tfvars"
        )
        
        & terraform $refreshArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✅ State refreshed successfully"
        } else {
            Write-Error "❌ Terraform refresh failed"
            exit 1
        }
    }
}

Write-Status "🎉 Terraform $Action completed for $Environment environment"

# Display useful information
if ($Action -eq "apply") {
    Write-Host ""
    Write-Status "📋 Quick reference commands:"
    Write-Host "  View outputs: terraform output"
    Write-Host "  View state: terraform show"
    Write-Host "  Update kubeconfig: aws eks update-kubeconfig --region us-west-2 --name study-ai-$Environment-cluster"
    Write-Host ""
}