# Local variables
locals {
  name_prefix = "${var.project_name}-${var.environment}"
  full_domain_name = var.subdomain_prefix != "" ? "${var.subdomain_prefix}.${var.domain_name}" : var.domain_name
  
  common_tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    },
    var.additional_tags
  )
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_id
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_id
}

# Random password for database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  name_prefix        = local.name_prefix
  vpc_cidr          = var.vpc_cidr
  availability_zones = var.availability_zones
  
  tags = local.common_tags
}

# EKS Module
module "eks" {
  source = "./modules/eks"
  
  name_prefix                    = local.name_prefix
  vpc_id                        = module.vpc.vpc_id
  private_subnet_ids            = module.vpc.private_subnet_ids
  public_subnet_ids             = module.vpc.public_subnet_ids
  
  cluster_version               = var.eks_cluster_version
  node_group_instance_types     = var.eks_node_group_instance_types
  node_group_scaling_config     = var.eks_node_group_scaling_config
  
  tags = local.common_tags
}

# RDS Module (conditional)
module "rds" {
  count  = var.use_mongodb_atlas ? 0 : 1
  source = "./modules/rds"
  
  name_prefix               = local.name_prefix
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  
  instance_class           = var.rds_instance_class
  allocated_storage        = var.rds_allocated_storage
  max_allocated_storage    = var.rds_max_allocated_storage
  backup_retention_period  = var.backup_retention_period
  
  database_password        = random_password.db_password.result
  
  tags = local.common_tags
}

# MongoDB Atlas Module (conditional)
module "mongodb_atlas" {
  count  = var.use_mongodb_atlas ? 1 : 0
  source = "./modules/mongodb-atlas"
  
  name_prefix    = local.name_prefix
  cluster_tier   = var.mongodb_atlas_cluster_tier
  
  tags = local.common_tags
}

# ECR Module
module "ecr" {
  source = "./modules/ecr"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# ALB Module
module "alb" {
  source = "./modules/alb"
  
  name_prefix        = local.name_prefix
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  
  ssl_certificate_arn = var.ssl_certificate_arn
  
  tags = local.common_tags
}

# Route53 Module
module "route53" {
  source = "./modules/route53"
  
  domain_name           = var.domain_name
  subdomain_prefix      = var.subdomain_prefix
  load_balancer_dns_name = module.alb.dns_name
  load_balancer_zone_id  = module.alb.zone_id
  
  tags = local.common_tags
}

# S3 Module for static assets
module "s3" {
  source = "./modules/s3"
  
  name_prefix = local.name_prefix
  
  tags = local.common_tags
}

# Security Groups
resource "aws_security_group" "app_sg" {
  name_prefix = "${local.name_prefix}-app-"
  vpc_id      = module.vpc.vpc_id
  
  description = "Security group for Study AI application"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP traffic"
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS traffic"
  }
  
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Frontend application"
  }
  
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "Backend API"
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-app-sg"
  })
}

resource "aws_security_group" "database_sg" {
  name_prefix = "${local.name_prefix}-db-"
  vpc_id      = module.vpc.vpc_id
  
  description = "Security group for database"
  
  ingress {
    from_port       = var.use_mongodb_atlas ? 27017 : 5432
    to_port         = var.use_mongodb_atlas ? 27017 : 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
    description     = "Database access from application"
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-database-sg"
  })
}

# Secrets Manager
resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${local.name_prefix}-secrets"
  description = "Application secrets for Study AI"
  
  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    database_password = random_password.db_password.result
    jwt_secret       = random_password.jwt_secret.result
    api_keys = {
      openai     = "your-openai-api-key"
      huggingface = "your-huggingface-token"
    }
  })
}

resource "random_password" "jwt_secret" {
  length  = 32
  special = true
}

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/eks/${local.name_prefix}/application"
  retention_in_days = var.log_retention_days
  
  tags = local.common_tags
}

# IAM Role for EKS pods to access AWS services
resource "aws_iam_role" "pod_execution_role" {
  name = "${local.name_prefix}-pod-execution-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = module.eks.oidc_provider_arn
        }
        Condition = {
          StringEquals = {
            "${replace(module.eks.oidc_provider_url, "https://", "")}:sub" = "system:serviceaccount:study-ai:study-ai-service-account"
            "${replace(module.eks.oidc_provider_url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })
  
  tags = local.common_tags
}

# IAM Policy for accessing Secrets Manager and CloudWatch
resource "aws_iam_policy" "pod_policy" {
  name = "${local.name_prefix}-pod-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.app_secrets.arn
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "${aws_cloudwatch_log_group.app_logs.arn}:*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${module.s3.bucket_arn}/*"
      }
    ]
  })
  
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "pod_policy" {
  role       = aws_iam_role.pod_execution_role.name
  policy_arn = aws_iam_policy.pod_policy.arn
}