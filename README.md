# 🎓 AI Study Assistant# 🎓 AI Study Assistant



An intelligent study companion powered by **Llama 3.2 3B Instruct** for personalized learning experiences.An intelligent study companion powered by **Llama 3.2 3B Instruct** for personalized learning experiences.



[![CI/CD Pipeline](https://github.com/shon123123/STUDY_AI/actions/workflows/devops-demonstration.yml/badge.svg)](https://github.com/shon123123/STUDY_AI/actions)[![CI/CD Pipeline](https://github.com/shon123123/STUDY_AI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/shon123123/STUDY_AI/actions)

[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://docker.com)[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://docker.com)

[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io)[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io)

[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC.svg)](https://terraform.io)[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC.svg)](https://terraform.io)



## 📋 DevOps Implementation Checklist## 📋 DevOps Implementation



This project demonstrates comprehensive DevOps practices according to the following requirements:This project demonstrates comprehensive DevOps practices across 6 weeks:



### 1️⃣ **Version Control & Collaboration** ✅| Week | Focus Area | Tools / Deliverables | Implementation |

**Files & Evidence:**|------|-----------|---------------------|----------------|

- **Repository Structure**: [`.github/`](.github/), [`README.md`](README.md)| 1 | Version Control & Setup | Git, GitHub | ✅ Repository structure, branching strategy |

- **Branching Strategy**: `main`, `develop`, `feature/*` branches| 2 | Containerization | Docker | 🐳 Multi-stage Dockerfiles, docker-compose |

- **Collaboration**: Pull requests, code reviews, issue tracking| 3 | Kubernetes Deployment | kubectl, YAML | ☸️ K8s manifests, deployment automation |

- **Documentation**: Comprehensive project documentation| 4 | CI/CD Automation | GitHub Actions | 🔄 Automated testing, building, deployment |

| 5 | Infrastructure as Code | Terraform | 🏗️ Cloud infrastructure provisioning |

**Key Files:**| 6 | Documentation & Demo | Report + Video | 📚 Comprehensive documentation |

- [`.gitignore`](.gitignore) - Version control exclusions

- [`CONTRIBUTING.md`](CONTRIBUTING.md) - Collaboration guidelines## ✨ Features

- [Commit History](https://github.com/shon123123/STUDY_AI/commits/main) - Professional git workflow

- 🤖 **AI-Powered Q&A** - Get instant help with your studies using Llama 3.2 3B Instruct

### 2️⃣ **CI/CD Pipeline** ✅- 📚 **Personalized Learning** - Adaptive content based on your skill level and progress

**Files & Evidence:**- 📊 **Progress Analytics** - Track your learning journey with detailed insights

- **GitHub Actions**: [`.github/workflows/devops-demonstration.yml`](.github/workflows/devops-demonstration.yml)- 🧠 **Smart Study Sessions** - AI-guided study sessions with topic recommendations

- **Automated Testing**: Frontend (Jest) + Backend (Pytest)- ✨ **Content Summarization** - Quickly understand complex materials

- **Build Automation**: Docker image building and registry push- 🎯 **Interactive Quizzes** - Test your knowledge with AI-generated questions

- **Deployment Pipeline**: Staging and production workflows

## 🏗️ Architecture

**Key Files:**

- [`.github/workflows/devops-demonstration.yml`](.github/workflows/devops-demonstration.yml) - Main CI/CD pipeline```

- [`frontend/package.json`](frontend/package.json) - Frontend test scripts┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐

- [`backend/requirements.txt`](backend/requirements.txt) - Backend dependencies│   Frontend      │    │    Backend      │    │   AI Models     │

│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Llama 3.2)   │

### 3️⃣ **Containerization & Deployment** ✅│   Port: 3000    │    │   Port: 8000    │    │   Local/HF      │

**Files & Evidence:**└─────────────────┘    └─────────────────┘    └─────────────────┘

- **Docker Configuration**: Multi-stage Dockerfiles for frontend and backend         │                       │                       │

- **Container Orchestration**: Docker Compose for local development         └───────────────────────┼───────────────────────┘

- **Registry Integration**: GitHub Container Registry (GHCR)                                 │

- **Environment Management**: Development, staging, production configs                    ┌─────────────────┐

                    │    Database     │

**Key Files:**                    │   (MongoDB)     │

- [`docker-compose.yml`](docker-compose.yml) - Multi-container orchestration                    │   Port: 27017   │

- [`backend/Dockerfile`](backend/Dockerfile) - Backend containerization                    └─────────────────┘

- [`frontend/Dockerfile`](frontend/Dockerfile) - Frontend containerization```

- [`config/environments/`](config/environments/) - Environment configurations

## 🚀 Quick Start

### 4️⃣ **Kubernetes Orchestration** ✅

**Files & Evidence:**### Prerequisites

- **K8s Manifests**: Complete cluster configuration- Python 3.8+

- **Service Discovery**: Internal service communication- Node.js 18+

- **Scaling & Health Checks**: Auto-scaling and monitoring- MongoDB (local or cloud)

- **Deployment Automation**: GitOps-style deployments- Docker & Docker Compose

- kubectl (for Kubernetes deployment)

**Key Files:**- CUDA-compatible GPU (optional, for faster inference)

- [`k8s/00-namespace-config.yaml`](k8s/00-namespace-config.yaml) - Namespace setup

- [`k8s/01-mongodb.yaml`](k8s/01-mongodb.yaml) - Database deployment### Installation

- [`k8s/02-backend.yaml`](k8s/02-backend.yaml) - Backend service

- [`k8s/03-frontend.yaml`](k8s/03-frontend.yaml) - Frontend service#### Local Development

- [`k8s/04-ingress-hpa.yaml`](k8s/04-ingress-hpa.yaml) - Ingress and auto-scaling

1. **Clone the repository**

### 5️⃣ **Infrastructure as Code (IaC)** ✅<<<<<<< HEAD

**Files & Evidence:**```bash

- **Terraform Configuration**: Complete cloud infrastructuregit clone https://github.com/shon123123/STUDY_AI.git

- **Environment Management**: Development, staging, productioncd STUDY_AI

- **Resource Provisioning**: VPC, EKS, RDS, networking```

- **State Management**: Remote state and workspace organization

2. **Backend Setup**

**Key Files:**```bash

- [`terraform/main.tf`](terraform/main.tf) - Main infrastructure configurationcd backend

- [`terraform/variables.tf`](terraform/variables.tf) - Infrastructure variablespip install -r requirements.txt

- [`terraform/modules/`](terraform/modules/) - Reusable infrastructure modulespython main.py

- [`terraform/environments/`](terraform/environments/) - Environment-specific configs```



## 🎯 **Faculty Demonstration**3. **Frontend Setup**

```bash

**Quick Demo Access:**cd frontend

1. **Live Demo**: [GitHub Actions Workflow](https://github.com/shon123123/STUDY_AI/actions/workflows/devops-demonstration.yml)npm install

2. **Demo Script**: [`FACULTY_DEMO_GUIDE.md`](FACULTY_DEMO_GUIDE.md)npm run dev

3. **Execution Guide**: [`DEVOPS_EXECUTION_GUIDE.md`](DEVOPS_EXECUTION_GUIDE.md)```



## ✨ Application Features#### Docker Deployment



- 🤖 **AI-Powered Q&A** - Get instant help with your studies using Llama 3.2 3B Instruct```bash

- 📚 **Personalized Learning** - Adaptive content based on your skill level and progress# Build and run with Docker Compose

- 📊 **Progress Analytics** - Track your learning journey with detailed insightsdocker-compose up --build

- 🧠 **Smart Study Sessions** - AI-guided study sessions with topic recommendations

- ✨ **Content Summarization** - Quickly understand complex materials# Or build individual containers

- 🎯 **Interactive Quizzes** - Test your knowledge with AI-generated questionsdocker build -t study-ai-backend ./backend

docker build -t study-ai-frontend ./frontend

## 🏗️ Architecture```



```#### Kubernetes Deployment

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐

│   Frontend      │    │    Backend      │    │   AI Models     │```bash

│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Llama 3.2)   │# Apply Kubernetes manifests

│   Port: 3000    │    │   Port: 8000    │    │   Local/HF      │kubectl apply -f k8s/

└─────────────────┘    └─────────────────┘    └─────────────────┘```

         │                       │                       │

         └───────────────────────┼───────────────────────┘## 🔄 DevOps Workflow

                                 │

                    ┌─────────────────┐### Git Workflow

                    │    Database     │- **main**: Production-ready code

                    │   (MongoDB)     │- **develop**: Integration branch for features

                    │   Port: 27017   │- **feature/***: Individual feature branches

                    └─────────────────┘- **hotfix/***: Critical bug fixes

```

### CI/CD Pipeline

## 🚀 Quick Start1. **Trigger**: Push to main/develop or Pull Request

2. **Test**: Run automated tests (pytest, jest)

### Prerequisites3. **Build**: Create Docker images

- Python 3.8+4. **Deploy**: 

- Node.js 18+   - Staging: Automatic deployment on develop

- MongoDB (local or cloud)   - Production: Manual approval on main

- Docker & Docker Compose

- kubectl (for Kubernetes deployment)### Infrastructure

- CUDA-compatible GPU (optional, for faster inference)- **Local**: Docker Compose for development

- **Staging**: Kubernetes cluster (Minikube/Kind)

### Local Development- **Production**: Cloud Kubernetes (EKS/GKE/AKS)



1. **Clone the repository**## 📁 Project Structure

```bash

git clone https://github.com/shon123123/STUDY_AI.git```

cd STUDY_AISTUDY_AI/

```├── backend/                 # FastAPI backend

│   ├── api/                # API endpoints

2. **Backend Setup**│   ├── core/               # Core configurations

```bash│   ├── models/             # Data models & AI models

cd backend│   ├── services/           # Business logic

pip install -r requirements.txt│   ├── main.py            # Application entry point

python main.py│   ├── requirements.txt   # Python dependencies

```│   └── Dockerfile         # Backend container config

├── frontend/               # Next.js frontend

3. **Frontend Setup**│   ├── app/               # App router pages

```bash│   ├── components/        # React components

cd frontend│   ├── services/          # API services

npm install│   ├── package.json       # Node.js dependencies

npm run dev│   └── Dockerfile         # Frontend container config

```├── k8s/                   # Kubernetes manifests

├── terraform/             # Infrastructure as Code

### Docker Deployment├── .github/workflows/     # CI/CD pipelines

├── docker-compose.yml     # Multi-container setup

```bash└── README.md             # This file

# Build and run with Docker Compose```

docker-compose up --build

```## 🧪 Testing



### Kubernetes Deployment```bash

# Backend tests

```bashcd backend

# Apply Kubernetes manifestspytest

kubectl apply -f k8s/

```# Frontend tests

cd frontend

### Infrastructure Deploymentnpm test

```

```bash

# Deploy with Terraform## 📚 Documentation

cd terraform

terraform init- [API Documentation](./docs/api/)

terraform plan- [Setup Guide](./docs/setup/)

terraform apply- [User Guide](./docs/user_guide/)

```- [DevOps Report](./docs/devops-report.md)



## 📁 Project Structure## 🎥 Demo Video



```[Watch the project demo](./docs/demo-video.mp4)

STUDY_AI/

├── 📋 Version Control & Collaboration## 📄 License

│   ├── .github/                    # GitHub configuration

│   ├── .gitignore                  # Version control exclusionsMIT License - see [LICENSE](LICENSE) file for details.

│   └── README.md                   # Project documentation

├── 🔄 CI/CD Pipeline```

│   ├── .github/workflows/          # GitHub Actions workflows=======

│   ├── frontend/package.json       # Frontend test scripts2. Run the backend with thhe command "python main.py"

│   └── backend/requirements.txt    # Backend dependencies3.Frontend "npm run dev"

├── 🐳 Containerization & Deployment

│   ├── docker-compose.yml          # Multi-container orchestration

│   ├── backend/Dockerfile          # Backend containerization>>>>>>> 06cc7a141137ae765fe71706958b8d39874f3e33

│   ├── frontend/Dockerfile         # Frontend containerization
│   └── config/environments/        # Environment configurations
├── ☸️ Kubernetes Orchestration
│   ├── k8s/00-namespace-config.yaml # Namespace setup
│   ├── k8s/01-mongodb.yaml         # Database deployment
│   ├── k8s/02-backend.yaml         # Backend service
│   ├── k8s/03-frontend.yaml        # Frontend service
│   └── k8s/04-ingress-hpa.yaml     # Ingress & auto-scaling
├── 🏗️ Infrastructure as Code
│   ├── terraform/main.tf           # Main infrastructure
│   ├── terraform/variables.tf      # Infrastructure variables
│   ├── terraform/modules/          # Reusable modules
│   └── terraform/environments/     # Environment-specific configs
└── 📱 Application Code
    ├── backend/                    # FastAPI backend
    ├── frontend/                   # Next.js frontend
    └── docs/                       # Additional documentation
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Run full CI/CD pipeline locally
.github/workflows/devops-demonstration.yml
```

## 📚 Documentation

- [Faculty Demo Guide](./FACULTY_DEMO_GUIDE.md) - Complete demonstration script
- [DevOps Execution Guide](./DEVOPS_EXECUTION_GUIDE.md) - Step-by-step execution
- [API Documentation](./docs/api/) - Backend API reference
- [Setup Guide](./docs/setup/) - Detailed setup instructions

## 🎯 DevOps Compliance Summary

| Requirement | Implementation | Key Files | Status |
|-------------|---------------|-----------|--------|
| **1. Version Control & Collaboration** | Git workflow, branching strategy, documentation | `.github/`, `README.md`, `.gitignore` | ✅ Complete |
| **2. CI/CD Pipeline** | GitHub Actions, automated testing, build pipeline | `.github/workflows/devops-demonstration.yml` | ✅ Complete |
| **3. Containerization & Deployment** | Docker, Docker Compose, multi-stage builds | `docker-compose.yml`, `Dockerfile`s | ✅ Complete |
| **4. Kubernetes Orchestration** | K8s manifests, services, ingress, auto-scaling | `k8s/*.yaml` files | ✅ Complete |
| **5. Infrastructure as Code** | Terraform, cloud provisioning, state management | `terraform/*.tf` files | ✅ Complete |

## 📊 DevOps Metrics Assessment

Based on the provided rubrics, here is our project's evaluation:

| Metrics | Key Files |
|---------|-----------|
| **Version Control & Collaboration** | • [`.gitignore`](.gitignore)<br>• [`.github/CODEOWNERS`](.github/CODEOWNERS)<br>• [`CONTRIBUTING.md`](CONTRIBUTING.md)<br>• [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/)<br>• [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) |
| **CI/CD Pipeline Implementation** | • [`.github/workflows/devops-demonstration.yml`](.github/workflows/devops-demonstration.yml)<br>• [`frontend/package.json`](frontend/package.json)<br>• [`backend/requirements.txt`](backend/requirements.txt)<br>• [`sonar-project.properties`](sonar-project.properties) |
| **Containerization & Deployment** | • [`docker-compose.yml`](docker-compose.yml)<br>• [`backend/Dockerfile`](backend/Dockerfile)<br>• [`frontend/Dockerfile`](frontend/Dockerfile)<br>• [`config/environments/development.env`](config/environments/development.env)<br>• [`config/environments/production.env`](config/environments/production.env) |
| **Kubernetes Orchestration** | • [`k8s/00-namespace-config.yaml`](k8s/00-namespace-config.yaml)<br>• [`k8s/01-mongodb.yaml`](k8s/01-mongodb.yaml)<br>• [`k8s/02-backend.yaml`](k8s/02-backend.yaml)<br>• [`k8s/03-frontend.yaml`](k8s/03-frontend.yaml)<br>• [`k8s/04-ingress-hpa.yaml`](k8s/04-ingress-hpa.yaml)<br>• [`k8s/deploy.sh`](k8s/deploy.sh) |
| **Infrastructure as Code (IaC)** | • [`terraform/main.tf`](terraform/main.tf)<br>• [`terraform/variables.tf`](terraform/variables.tf)<br>• [`terraform/outputs.tf`](terraform/outputs.tf)<br>• [`terraform/infrastructure.tf`](terraform/infrastructure.tf)<br>• [`terraform/modules/`](terraform/modules/)<br>• [`terraform/environments/`](terraform/environments/) |

### 📁 **File Organization by DevOps Requirement:**

#### 1️⃣ Version Control & Collaboration Files:
- `.gitignore` - Version control exclusions and best practices
- `.github/CODEOWNERS` - Code ownership and review assignments
- `.github/ISSUE_TEMPLATE/` - Issue templates for bug reports and features
- `.github/PULL_REQUEST_TEMPLATE.md` - Pull request guidelines
- `CONTRIBUTING.md` - Collaboration and contribution guidelines
- `README.md` - Comprehensive project documentation

#### 2️⃣ CI/CD Pipeline Files:
- `.github/workflows/devops-demonstration.yml` - Main CI/CD pipeline
- `.github/workflows/ci-cd.yml` - Additional CI/CD workflows
- `frontend/package.json` - Frontend build and test scripts
- `backend/requirements.txt` - Backend dependencies and testing tools
- `sonar-project.properties` - Code quality analysis configuration

#### 3️⃣ Containerization & Deployment Files:
- `docker-compose.yml` - Multi-container development environment
- `backend/Dockerfile` - Backend containerization with multi-stage build
- `frontend/Dockerfile` - Frontend containerization with optimization
- `config/environments/development.env` - Development environment variables
- `config/environments/production.env` - Production environment variables

#### 4️⃣ Kubernetes Orchestration Files:
- `k8s/00-namespace-config.yaml` - Namespace and RBAC configuration
- `k8s/01-mongodb.yaml` - Database deployment and persistence
- `k8s/02-backend.yaml` - Backend service with health checks
- `k8s/03-frontend.yaml` - Frontend service with load balancing
- `k8s/04-ingress-hpa.yaml` - Ingress controller and auto-scaling
- `k8s/deploy.sh` - Kubernetes deployment automation script

#### 5️⃣ Infrastructure as Code Files:
- `terraform/main.tf` - Main infrastructure configuration
- `terraform/variables.tf` - Infrastructure input variables
- `terraform/outputs.tf` - Infrastructure output values
- `terraform/infrastructure.tf` - Additional infrastructure resources
- `terraform/modules/vpc/` - VPC module for network infrastructure
- `terraform/modules/eks/` - EKS module for Kubernetes cluster
- `terraform/modules/rds/` - RDS module for database infrastructure
- `terraform/environments/development/` - Development environment config
- `terraform/environments/production/` - Production environment config

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.