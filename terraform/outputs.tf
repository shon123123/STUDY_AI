# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr_block
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = module.vpc.public_subnet_ids
}

# EKS Outputs
output "eks_cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "eks_cluster_arn" {
  description = "EKS cluster ARN"
  value       = module.eks.cluster_arn
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

output "eks_node_group_arn" {
  description = "EKS node group ARN"
  value       = module.eks.node_group_arn
}

# Database Outputs
output "database_endpoint" {
  description = "Database endpoint"
  value       = var.use_mongodb_atlas ? module.mongodb_atlas[0].connection_string : module.rds[0].endpoint
  sensitive   = true
}

output "database_port" {
  description = "Database port"
  value       = var.use_mongodb_atlas ? 27017 : module.rds[0].port
}

# Load Balancer Outputs
output "load_balancer_dns_name" {
  description = "DNS name of the load balancer"
  value       = module.alb.dns_name
}

output "load_balancer_zone_id" {
  description = "Zone ID of the load balancer"
  value       = module.alb.zone_id
}

# Route53 Outputs
output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = module.route53.zone_id
}

output "application_url" {
  description = "Application URL"
  value       = "https://${local.full_domain_name}"
}

# ECR Outputs
output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.frontend_repository_url
}

# Secrets Manager Outputs
output "secrets_manager_arn" {
  description = "Secrets Manager secret ARN"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

# CloudWatch Outputs
output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.app_logs.name
}

# S3 Outputs
output "s3_bucket_name" {
  description = "S3 bucket name for static assets"
  value       = module.s3.bucket_name
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = module.s3.bucket_domain_name
}

# Security Group Outputs
output "app_security_group_id" {
  description = "Application security group ID"
  value       = aws_security_group.app_sg.id
}

output "database_security_group_id" {
  description = "Database security group ID"
  value       = aws_security_group.database_sg.id
}