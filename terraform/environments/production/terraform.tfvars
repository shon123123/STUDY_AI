# Production Environment Configuration
aws_region    = "us-west-2"
environment   = "production"
project_name  = "study-ai"
# Network Configuration
vpc_cidr           = "10.1.0.0/16"
availability_zones = ["us-west-2a", "us-west-2b", "us-west-2c"]

# EKS Configuration
eks_cluster_version         = "1.28"
eks_node_group_instance_types = ["t3.medium", "t3.large"]
eks_node_group_scaling_config = {
  desired_size = 3
  max_size     = 10
  min_size     = 2
}

# Database Configuration
use_mongodb_atlas          = true
mongodb_atlas_cluster_tier = "M10"  # Production tier

# Domain Configuration
domain_name      = "study-ai.com"
subdomain_prefix = ""

# SSL Certificate (replace with actual ARN)
ssl_certificate_arn = "arn:aws:acm:us-west-2:123456789012:certificate/12345678-1234-1234-1234-123456789012"

# Monitoring
enable_monitoring    = true
log_retention_days   = 30

# Backup
backup_retention_period = 30

# Additional Tags
additional_tags = {
  CostCenter  = "production"
  Team        = "engineering"
  Environment = "prod"
  Compliance  = "required"
}