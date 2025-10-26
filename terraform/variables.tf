# AWS Region
variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-west-2"
}

# Environment
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

# Project Name
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "study-ai"
}

# VPC CIDR
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Availability Zones
variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

# EKS Cluster Configuration
variable "eks_cluster_version" {
  description = "EKS cluster version"
  type        = string
  default     = "1.28"
}

variable "eks_node_group_instance_types" {
  description = "EC2 instance types for EKS node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_node_group_scaling_config" {
  description = "EKS node group scaling configuration"
  type = object({
    desired_size = number
    max_size     = number
    min_size     = number
  })
  default = {
    desired_size = 2
    max_size     = 5
    min_size     = 1
  }
}

# RDS Configuration
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "RDS maximum allocated storage in GB"
  type        = number
  default     = 100
}

# MongoDB Atlas Configuration (Alternative)
variable "use_mongodb_atlas" {
  description = "Whether to use MongoDB Atlas instead of RDS"
  type        = bool
  default     = true
}

variable "mongodb_atlas_cluster_tier" {
  description = "MongoDB Atlas cluster tier"
  type        = string
  default     = "M10"
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "study-ai.com"
}

variable "subdomain_prefix" {
  description = "Subdomain prefix for environment"
  type        = string
  default     = ""
}

# SSL Certificate
variable "ssl_certificate_arn" {
  description = "ARN of SSL certificate in ACM"
  type        = string
  default     = ""
}

# Monitoring and Logging
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring and logging"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 14
}

# Backup Configuration
variable "backup_retention_period" {
  description = "Database backup retention period in days"
  type        = number
  default     = 7
}

# Tags
variable "additional_tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}