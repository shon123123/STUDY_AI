from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from services.ai_study_features import AIStudyFeatures
from services.smart_document_processor import SmartDocumentProcessor
from core.database import get_document_collection
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize AI services
ai_study_features = AIStudyFeatures()
smart_processor = SmartDocumentProcessor()

class StudyAnalysisRequest(BaseModel):
    document_id: str
    user_id: str = "anonymous"

class LearningPatternRequest(BaseModel):
    quiz_results: List[Dict[str, Any]]
    user_id: str = "anonymous"

class StudyPlanRequest(BaseModel):
    document_id: str
    user_id: str = "anonymous"
    study_goals: Optional[List[str]] = []
    time_available: Optional[int] = 60  # minutes per day

class RealtimeAssistanceRequest(BaseModel):
    question: str
    context: Optional[str] = ""
    user_id: str = "anonymous"

@router.get("/ai-insights/dashboard/{user_id}")
async def get_ai_insights_dashboard(user_id: str = "anonymous"):
    """Get comprehensive AI insights dashboard data"""
    try:
        # Get user's documents
        documents_collection = get_document_collection()
        user_documents = list(documents_collection.find({"user_id": user_id}))
        
        if not user_documents:
            return {
                "study_efficiency": {"score": 0, "trend": "stable", "insights": []},
                "learning_patterns": [],
                "knowledge_gaps": [],
                "recommendations": []
            }
        
        # Analyze learning patterns from documents
        learning_patterns = []
        knowledge_gaps = []
        recommendations = []
        
        for doc in user_documents:
            if doc.get('content'):
                # Analyze document for learning insights
                patterns = await ai_study_features.analyze_learning_patterns({
                    'document_content': doc['content'],
                    'timestamp': doc.get('created_at', ''),
                    'quiz_performance': doc.get('quiz_results', [])
                })
                learning_patterns.extend(patterns.get('patterns', []))
                
                # Get knowledge gaps
                gaps = await ai_study_features.identify_comprehension_gaps(
                    doc['content'], 
                    doc.get('quiz_results', [])
                )
                knowledge_gaps.extend(gaps.get('gaps', []))
        
        # Generate recommendations
        if user_documents:
            recommendations = await ai_study_features.generate_study_recommendations(
                user_id, user_documents
            )
        
        # Calculate study efficiency score
        efficiency_score = min(100, max(0, 
            len([p for p in learning_patterns if p.get('confidence', 0) > 0.7]) * 20 +
            max(0, 50 - len(knowledge_gaps) * 5)
        ))
        
        return {
            "study_efficiency": {
                "score": efficiency_score,
                "trend": "improving" if efficiency_score > 70 else "stable",
                "insights": [
                    f"Analyzed {len(user_documents)} documents",
                    f"Identified {len(learning_patterns)} learning patterns",
                    f"Found {len(knowledge_gaps)} areas for improvement"
                ]
            },
            "learning_patterns": learning_patterns[:10],  # Limit to top 10
            "knowledge_gaps": knowledge_gaps[:10],  # Limit to top 10
            "recommendations": recommendations[:5]  # Limit to top 5
        }
        
    except Exception as e:
        logger.error(f"Error getting AI insights dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI insights: {str(e)}")

@router.post("/ai-insights/analyze-study-pattern")
async def analyze_study_pattern(request: LearningPatternRequest):
    """Analyze learning patterns from quiz results"""
    try:
        analysis = await ai_study_features.analyze_learning_patterns({
            'quiz_results': request.quiz_results,
            'user_id': request.user_id
        })
        return analysis
    except Exception as e:
        logger.error(f"Error analyzing study pattern: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze study pattern: {str(e)}")

@router.post("/ai-insights/generate-study-plan")
async def generate_study_plan(request: StudyPlanRequest):
    """Generate adaptive study plan"""
    try:
        # Get document content
        documents_collection = get_document_collection()
        document = documents_collection.find_one({"_id": request.document_id})
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        study_plan = await ai_study_features.create_adaptive_study_plan(
            document['content'], 
            request.study_goals, 
            request.time_available
        )
        return study_plan
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating study plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate study plan: {str(e)}")

@router.post("/ai-insights/realtime-assistance")
async def get_realtime_assistance(request: RealtimeAssistanceRequest):
    """Get real-time study assistance"""
    try:
        assistance = await ai_study_features.provide_realtime_assistance(
            request.question, 
            request.context
        )
        return assistance
    except Exception as e:
        logger.error(f"Error providing realtime assistance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to provide assistance: {str(e)}")

@router.post("/ai-insights/analyze-document")
async def analyze_document_intelligence(request: StudyAnalysisRequest):
    """Analyze document with smart processing"""
    try:
        # Get document content
        documents_collection = get_document_collection()
        document = documents_collection.find_one({"_id": request.document_id})
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        analysis = await smart_processor.analyze_document_for_study(
            document['content']
        )
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze document: {str(e)}")

@router.get("/ai-insights/study-recommendations/{user_id}")
async def get_study_recommendations(user_id: str = "anonymous"):
    """Get personalized study recommendations"""
    try:
        # Get user's documents
        documents_collection = get_document_collection()
        user_documents = list(documents_collection.find({"user_id": user_id}))
        
        if not user_documents:
            return {"recommendations": []}
        
        recommendations = await ai_study_features.generate_study_recommendations(
            user_id, user_documents
        )
        return {"recommendations": recommendations}
        
    except Exception as e:
        logger.error(f"Error getting study recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")