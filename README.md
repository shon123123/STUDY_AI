# 🎓 AI Study Assistant

An intelligent study companion powered by **Llama 3.2 3B Instruct** for personalized learning experiences.

[![CI/CD Pipeline](https://github.com/shon123123/STUDY_AI/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/shon123123/STUDY_AI/actions)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5.svg)](https://kubernetes.io)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC.svg)](https://terraform.io)

## 📋 DevOps Implementation

This project demonstrates comprehensive DevOps practices across 6 weeks:

| Week | Focus Area | Tools / Deliverables | Implementation |
|------|-----------|---------------------|----------------|
| 1 | Version Control & Setup | Git, GitHub | ✅ Repository structure, branching strategy |
| 2 | Containerization | Docker | 🐳 Multi-stage Dockerfiles, docker-compose |
| 3 | Kubernetes Deployment | kubectl, YAML | ☸️ K8s manifests, deployment automation |
| 4 | CI/CD Automation | GitHub Actions | 🔄 Automated testing, building, deployment |
| 5 | Infrastructure as Code | Terraform | 🏗️ Cloud infrastructure provisioning |
| 6 | Documentation & Demo | Report + Video | 📚 Comprehensive documentation |

## ✨ Features

- 🤖 **AI-Powered Q&A** - Get instant help with your studies using Llama 3.2 3B Instruct
- 📚 **Personalized Learning** - Adaptive content based on your skill level and progress
- 📊 **Progress Analytics** - Track your learning journey with detailed insights
- 🧠 **Smart Study Sessions** - AI-guided study sessions with topic recommendations
- ✨ **Content Summarization** - Quickly understand complex materials
- 🎯 **Interactive Quizzes** - Test your knowledge with AI-generated questions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Models     │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   (Llama 3.2)   │
│   Port: 3000    │    │   Port: 8000    │    │   Local/HF      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Database     │
                    │   (MongoDB)     │
                    │   Port: 27017   │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (local or cloud)
- Docker & Docker Compose
- kubectl (for Kubernetes deployment)
- CUDA-compatible GPU (optional, for faster inference)

### Installation

#### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/shon123123/STUDY_AI.git
cd STUDY_AI
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

#### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build individual containers
docker build -t study-ai-backend ./backend
docker build -t study-ai-frontend ./frontend
```

#### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## 🔄 DevOps Workflow

### Git Workflow
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature branches
- **hotfix/***: Critical bug fixes

### CI/CD Pipeline
1. **Trigger**: Push to main/develop or Pull Request
2. **Test**: Run automated tests (pytest, jest)
3. **Build**: Create Docker images
4. **Deploy**: 
   - Staging: Automatic deployment on develop
   - Production: Manual approval on main

### Infrastructure
- **Local**: Docker Compose for development
- **Staging**: Kubernetes cluster (Minikube/Kind)
- **Production**: Cloud Kubernetes (EKS/GKE/AKS)

## 📁 Project Structure

```
STUDY_AI/
├── backend/                 # FastAPI backend
│   ├── api/                # API endpoints
│   ├── core/               # Core configurations
│   ├── models/             # Data models & AI models
│   ├── services/           # Business logic
│   ├── main.py            # Application entry point
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container config
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── services/          # API services
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container config
├── k8s/                   # Kubernetes manifests
├── terraform/             # Infrastructure as Code
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Multi-container setup
└── README.md             # This file
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📚 Documentation

- [API Documentation](./docs/api/)
- [Setup Guide](./docs/setup/)
- [User Guide](./docs/user_guide/)
- [DevOps Report](./docs/devops-report.md)

## 🎥 Demo Video

[Watch the project demo](./docs/demo-video.mp4)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

```
