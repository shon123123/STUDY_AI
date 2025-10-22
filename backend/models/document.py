# Document-related Pydantic models

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum

class ProcessingStatus(str, Enum):
    """Document processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ContentType(str, Enum):
    """Supported content types"""
    PDF = "pdf"
    PPTX = "pptx"
    DOCX = "docx"
    TXT = "txt"

class DocumentCreate(BaseModel):
    """Model for document creation request"""
    filename: str = Field(..., description="Name of the uploaded file")
    content_type: ContentType = Field(..., description="Type of document")
    user_id: str = Field(..., description="ID of the user uploading")

class DocumentAnalysis(BaseModel):
    """Model for AI analysis results"""
    subject_area: str = Field(..., description="Primary subject area")
    difficulty_level: int = Field(..., ge=1, le=10, description="Difficulty from 1-10")
    key_concepts: List[str] = Field(..., description="Main concepts covered")
    learning_objectives: List[str] = Field(..., description="Learning goals")
    prerequisite_knowledge: List[str] = Field(..., description="Required prior knowledge")
    content_structure: str = Field(..., description="How content is organized")
    teaching_approach: str = Field(..., description="Recommended teaching method")
    assessment_ideas: List[str] = Field(..., description="Suggested assessments")
    estimated_study_time: str = Field(..., description="Estimated time to study")
    complexity_factors: List[str] = Field(..., description="What makes it complex")
    practical_applications: List[str] = Field(..., description="Real-world uses")

class StudyMaterials(BaseModel):
    """Model for generated study materials"""
    summary: str = Field(..., description="AI-generated summary")
    flashcards: List[Dict[str, str]] = Field(..., description="Generated flashcards")
    generated_at: datetime = Field(..., description="When materials were created")
    flashcard_count: int = Field(..., description="Number of flashcards")

class DocumentMetadata(BaseModel):
    """Model for document metadata"""
    file_size: int = Field(..., description="File size in bytes")
    content_type: str = Field(..., description="MIME type")
    processing_time: str = Field(..., description="When processing completed")
    total_pages: Optional[int] = Field(None, description="Number of pages (PDF)")
    total_slides: Optional[int] = Field(None, description="Number of slides (PPT)")
    word_count: Optional[int] = Field(None, description="Total word count")

class DocumentResponse(BaseModel):
    """Model for document API responses"""
    id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Original filename")
    upload_timestamp: datetime = Field(..., description="When uploaded")
    processing_status: ProcessingStatus = Field(..., description="Current status")
    analysis: Optional[DocumentAnalysis] = Field(None, description="AI analysis results")
    study_materials: Optional[StudyMaterials] = Field(None, description="Generated materials")
    metadata: DocumentMetadata = Field(..., description="File metadata")

class DocumentListItem(BaseModel):
    """Model for document list responses"""
    id: str = Field(..., description="Document ID")
    filename: str = Field(..., description="Original filename")
    upload_timestamp: datetime = Field(..., description="When uploaded")
    processing_status: ProcessingStatus = Field(..., description="Current status")
    content_type: str = Field(..., description="File type")
    file_size: int = Field(..., description="File size in bytes")
    analysis_summary: Dict[str, Any] = Field(..., description="Brief analysis summary")

class QuizGenerationRequest(BaseModel):
    """Model for quiz generation from document"""
    document_id: str = Field(..., description="Source document ID")
    num_questions: int = Field(10, ge=1, le=50, description="Number of questions")
    difficulty: str = Field("mixed", description="Difficulty level")
    question_types: List[str] = Field(
        ["multiple_choice", "true_false", "short_answer"],
        description="Types of questions to include"
    )

class FlashcardGenerationRequest(BaseModel):
    """Model for flashcard generation from document"""
    document_id: str = Field(..., description="Source document ID")
    num_cards: int = Field(20, ge=1, le=100, description="Number of flashcards")
    difficulty: str = Field("mixed", description="Difficulty level")
    focus_areas: Optional[List[str]] = Field(None, description="Specific topics to focus on")

class DocumentSearchRequest(BaseModel):
    """Model for searching within documents"""
    query: str = Field(..., description="Search query")
    document_ids: Optional[List[str]] = Field(None, description="Specific documents to search")
    search_type: str = Field("semantic", description="Type of search (semantic, keyword)")

class ContentExtraction(BaseModel):
    """Model for extracted content structure"""
    text: str = Field(..., description="Full extracted text")
    pages: Optional[List[Dict[str, Any]]] = Field(None, description="Page-by-page content")
    slides: Optional[List[Dict[str, Any]]] = Field(None, description="Slide-by-slide content")
    paragraphs: Optional[List[Dict[str, str]]] = Field(None, description="Paragraph structure")
    metadata: Dict[str, Any] = Field(..., description="Content metadata")

class ProcessingProgress(BaseModel):
    """Model for processing progress updates"""
    document_id: str = Field(..., description="Document being processed")
    stage: str = Field(..., description="Current processing stage")
    progress_percentage: float = Field(..., ge=0, le=100, description="Completion percentage")
    estimated_remaining: Optional[str] = Field(None, description="Estimated time remaining")
    current_operation: str = Field(..., description="What's currently happening")

class DocumentStats(BaseModel):
    """Model for document statistics"""
    total_documents: int = Field(..., description="Total documents uploaded")
    processing_queue: int = Field(..., description="Documents awaiting processing")
    completed_today: int = Field(..., description="Documents processed today")
    total_size_mb: float = Field(..., description="Total storage used in MB")
    average_processing_time: float = Field(..., description="Average processing time in seconds")
    success_rate: float = Field(..., description="Processing success rate percentage")