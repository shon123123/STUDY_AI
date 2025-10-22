# Tutoring-related Pydantic models

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class TutoringMode(str, Enum):
    """Different tutoring modes available"""
    CONVERSATIONAL = "conversational"
    STEP_BY_STEP = "step_by_step"
    PRACTICE = "practice"
    EXPLANATION = "explanation"
    QUIZ = "quiz"

class DifficultyLevel(str, Enum):
    """Learning difficulty levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"

class SessionStatus(str, Enum):
    """Tutoring session status"""
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"

class TutoringRequest(BaseModel):
    """Model for starting a tutoring session"""
    topic: str = Field(..., description="Main topic to study")
    subject: str = Field(..., description="Subject area (math, physics, etc.)")
    difficulty: DifficultyLevel = Field(..., description="Student's level")
    learning_goals: List[str] = Field(..., description="What student wants to achieve")
    tutoring_mode: TutoringMode = Field(TutoringMode.CONVERSATIONAL, description="Preferred tutoring style")
    document_context: Optional[str] = Field(None, description="Reference document content")
    preferred_language: str = Field("english", description="Language for tutoring")
    session_duration: Optional[int] = Field(None, description="Preferred session length in minutes")

class TutoringResponse(BaseModel):
    """Model for tutoring system responses"""
    session_id: str = Field(..., description="Unique session identifier")
    message: str = Field(..., description="Tutor's response message")
    session_status: SessionStatus = Field(..., description="Current session status")
    next_steps: List[str] = Field(..., description="Suggested next actions")
    learning_progress: float = Field(..., ge=0, le=100, description="Estimated progress percentage")
    confidence_level: Optional[float] = Field(None, description="AI confidence in response")
    response_type: str = Field("explanation", description="Type of response given")

class ConversationMessage(BaseModel):
    """Model for individual conversation messages"""
    role: str = Field(..., description="Message role (student/tutor)")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(..., description="When message was sent")
    message_type: str = Field("text", description="Type of message")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional message data")

class TutoringSession(BaseModel):
    """Model for complete tutoring session"""
    session_id: str = Field(..., description="Unique session identifier")
    user_id: str = Field(..., description="Student user ID")
    topic: str = Field(..., description="Session topic")
    subject: str = Field(..., description="Subject area")
    difficulty: DifficultyLevel = Field(..., description="Difficulty level")
    learning_goals: List[str] = Field(..., description="Session goals")
    started_at: datetime = Field(..., description="Session start time")
    status: SessionStatus = Field(..., description="Current status")
    conversation_history: List[ConversationMessage] = Field(..., description="All messages")
    document_context: Optional[str] = Field(None, description="Reference document")
    tutoring_mode: TutoringMode = Field(..., description="Active tutoring mode")
    last_activity: Optional[datetime] = Field(None, description="Last interaction time")

class QuestionRequest(BaseModel):
    """Model for asking questions during tutoring"""
    session_id: str = Field(..., description="Active session ID")
    question: str = Field(..., description="Student's question")
    context: Optional[str] = Field(None, description="Additional context")
    question_type: str = Field("general", description="Type of question being asked")

class ExplanationRequest(BaseModel):
    """Model for requesting concept explanations"""
    session_id: str = Field(..., description="Active session ID")
    concept: str = Field(..., description="Concept to explain")
    explanation_type: str = Field("detailed", description="Type of explanation needed")
    include_examples: bool = Field(True, description="Whether to include examples")
    current_understanding: Optional[str] = Field(None, description="Student's current knowledge")

class PracticeRequest(BaseModel):
    """Model for requesting practice problems"""
    session_id: str = Field(..., description="Active session ID")
    topic: str = Field(..., description="Topic for practice")
    num_problems: int = Field(3, ge=1, le=10, description="Number of problems")
    difficulty: Optional[DifficultyLevel] = Field(None, description="Problem difficulty")
    problem_type: str = Field("mixed", description="Type of problems wanted")

class AnswerSubmission(BaseModel):
    """Model for submitting answers to practice problems"""
    session_id: str = Field(..., description="Active session ID")
    problem_id: str = Field(..., description="Problem identifier")
    student_answer: str = Field(..., description="Student's answer")
    work_shown: Optional[str] = Field(None, description="Student's work/reasoning")
    confidence: Optional[float] = Field(None, description="Student's confidence level")

class FeedbackResponse(BaseModel):
    """Model for AI feedback on student answers"""
    evaluation_id: str = Field(..., description="Unique evaluation ID")
    score: float = Field(..., ge=0, le=100, description="Score percentage")
    is_correct: bool = Field(..., description="Whether answer is correct")
    feedback: str = Field(..., description="Detailed feedback message")
    strengths: List[str] = Field(..., description="What student did well")
    areas_for_improvement: List[str] = Field(..., description="Areas to work on")
    suggestions: List[str] = Field(..., description="Specific suggestions")
    concept_understanding: str = Field(..., description="Assessment of understanding")
    encouragement: str = Field(..., description="Motivational message")
    next_steps: List[str] = Field(..., description="Recommended next actions")

class LearningInsight(BaseModel):
    """Model for AI-generated learning insights"""
    insight_type: str = Field(..., description="Type of insight")
    description: str = Field(..., description="Insight description")
    recommendation: str = Field(..., description="Specific recommendation")
    priority: str = Field("medium", description="Priority level")
    estimated_impact: str = Field(..., description="Expected learning impact")

class SessionSummary(BaseModel):
    """Model for tutoring session summary"""
    session_id: str = Field(..., description="Session identifier")
    duration_minutes: int = Field(..., description="Session length")
    topics_covered: List[str] = Field(..., description="Topics discussed")
    questions_asked: int = Field(..., description="Number of questions")
    problems_solved: int = Field(..., description="Practice problems completed")
    learning_progress: float = Field(..., description="Estimated progress made")
    key_insights: List[LearningInsight] = Field(..., description="AI-generated insights")
    strengths_identified: List[str] = Field(..., description="Student strengths")
    areas_to_focus: List[str] = Field(..., description="Areas needing attention")
    recommended_next_session: str = Field(..., description="Suggestion for next session")

class TutoringPreferences(BaseModel):
    """Model for student tutoring preferences"""
    user_id: str = Field(..., description="Student user ID")
    preferred_explanation_style: str = Field("detailed", description="How student likes explanations")
    learning_pace: str = Field("medium", description="Preferred learning speed")
    feedback_style: str = Field("encouraging", description="Preferred feedback approach")
    difficulty_preference: DifficultyLevel = Field(..., description="Preferred difficulty level")
    practice_frequency: str = Field("medium", description="How often student wants practice")
    subjects_of_interest: List[str] = Field(..., description="Favorite subjects")
    learning_goals: List[str] = Field(..., description="Long-term learning goals")
    updated_at: datetime = Field(..., description="When preferences were updated")

class SessionMetrics(BaseModel):
    """Model for session performance metrics"""
    session_id: str = Field(..., description="Session identifier")
    engagement_score: float = Field(..., description="Student engagement level")
    comprehension_rate: float = Field(..., description="Rate of understanding")
    question_quality: float = Field(..., description="Quality of questions asked")
    response_accuracy: float = Field(..., description="Accuracy of student responses")
    learning_velocity: float = Field(..., description="Speed of learning")
    ai_effectiveness: float = Field(..., description="How well AI tutoring worked")
    student_satisfaction: Optional[float] = Field(None, description="Student satisfaction rating")

class TutoringAnalytics(BaseModel):
    """Model for comprehensive tutoring analytics"""
    user_id: str = Field(..., description="Student user ID")
    total_sessions: int = Field(..., description="Total tutoring sessions")
    total_hours: float = Field(..., description="Total tutoring time")
    favorite_subjects: List[str] = Field(..., description="Most studied subjects")
    average_session_length: float = Field(..., description="Average session duration")
    learning_streak: int = Field(..., description="Current learning streak")
    improvement_trend: str = Field(..., description="Learning improvement direction")
    mastery_levels: Dict[str, float] = Field(..., description="Subject mastery percentages")
    recent_achievements: List[str] = Field(..., description="Recent learning milestones")
    recommended_focus: List[str] = Field(..., description="Areas to focus on next")