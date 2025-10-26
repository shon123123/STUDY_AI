# Development Environment Configuration
aws_region    = "us-west-2"
environment   = "dev"
project_name  = "study-ai"

# Network Configuration
vpc_cidr           = "10.0.0.0/16"
availability_zones = ["us-west-2a", "us-west-2b"]

# EKS Configuration
eks_cluster_version         = "1.28"
eks_node_group_instance_types = ["t3.small"]
eks_node_group_scaling_config = {
  desired_size = 1
  max_size     = 3
  min_size     = 1
}

# Database Configuration
use_mongodb_atlas          = true
mongodb_atlas_cluster_tier = "M0"  # Free tier

# Domain Configuration
domain_name      = "study-ai-dev.com"
subdomain_prefix = ""

# Monitoring
enable_monitoring    = true
log_retention_days   = 7

# Backup
backup_retention_period = 3

# Additional Tags
additional_tags = {
  CostCenter = "development"
  Team       = "engineering"
}