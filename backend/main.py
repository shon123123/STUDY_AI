from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import logging
from datetime import datetime, timedelta
import uuid
from bson import ObjectId

# Request/Response Models
class QuizGenerationRequest(BaseModel):
    num_questions: int = Field(default=10, description="Number of questions to generate")
    difficulty: str = Field(default="medium", description="Difficulty level: easy, medium, hard")

class FlashcardGenerationRequest(BaseModel):
    num_cards: int = Field(default=15, description="Number of flashcards to generate")

# Comprehensive recursive serialization function for MongoDB documents
def serialize_value(value):
    """Recursively serialize any value, converting ObjectId and datetime to strings"""
    if value is None:
        return None
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    return value

# Simple imports without complex dependencies
try:
    from core.config import get_settings
    from core.database import connect_to_mongo, close_mongo_connection, get_database
    settings = get_settings()
    mongodb_available = True
except Exception:
    # Fallback settings if config fails
    class Settings:
        host = "0.0.0.0"
        port = 8000
        debug = False
    settings = Settings()
    connect_to_mongo = None
    close_mongo_connection = None
    get_database = None
    mongodb_available = False

# In-memory storage for dynamic data (fallback)
student_classes = []
student_schedule = []
student_grades = []
student_profile = {
    "id": "student_001",
    "name": "Student",
    "email": "student@example.com",
    "program": "General Studies", 
    "year": 1,
    "gpa": 0.0,
    "avatar": "👨‍🎓"
}

# Pydantic models for API
class ClassCreate(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    instructor: str
    time: str
    location: str
    students: int = 0
    totalLessons: int = 12
    icon: str = "📚"
    color: str = "bg-blue-100"
    type: str = "class"

class Class(BaseModel):
    id: str
    title: str
    subtitle: str
    instructor: str
    time: str
    location: str
    students: int
    currentLesson: int
    totalLessons: int
    progress: int
    icon: str
    color: str
    type: str
    status: Optional[str] = None

class ScheduleEvent(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = ""
    date: str
    time: str
    location: str
    type: str
    color: str
    status: str

class Grade(BaseModel):
    id: str
    subject: str
    term: str
    grade: int
    maxGrade: int
    examType: str
    date: str
    instructor: str

class StudentProfile(BaseModel):
    id: str
    name: str
    email: str
    program: str
    year: int
    gpa: float
    avatar: Optional[str] = None

class FlashcardGenerateRequest(BaseModel):
    document_id: str
    max_cards: int = 20

# Simple imports without complex dependencies
try:
    from core.config import get_settings
    settings = get_settings()
except Exception:
    # Fallback settings if config fails
    class Settings:
        host = "0.0.0.0"
        port = 8000
        debug = False
    settings = Settings()

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Import Gemini service (Fast API-based AI)
try:
    from services.gemini_service import GeminiAIService
    gemini_ai_service = GeminiAIService()
    ai_service = gemini_ai_service  # Main AI service
except Exception as e:
    logger.warning(f"Failed to import Gemini service: {e}")
    gemini_ai_service = None
    ai_service = None

# Import document processor
try:
    from services.document_processor import DocumentProcessor
    document_processor = DocumentProcessor()
except Exception as e:
    logger.warning(f"Failed to import document processor: {e}")
    document_processor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("🚀 Starting AI Study Assistant...")
    
    # Try to connect to MongoDB
    if mongodb_available and connect_to_mongo is not None:
        try:
            logger.info("🔌 Attempting to connect to MongoDB...")
            await connect_to_mongo()
            logger.info("✅ MongoDB connected successfully!")
            app.state.using_mongodb = True
        except Exception as e:
            logger.error(f"❌ MongoDB connection failed: {str(e)}")
            logger.warning("⚠️ Falling back to in-memory storage")
            app.state.using_mongodb = False
    else:
        logger.info("📝 Running in simplified mode (in-memory storage)")
        app.state.using_mongodb = False
    
    # Gemini service is already initialized in constructor
    if gemini_ai_service:
        logger.info("✅ Gemini AI service ready!")
    else:
        logger.warning("⚠️ Gemini service not available")
    
    logger.info("🎓 AI Study Assistant ready!")
    
    yield
    
    # Shutdown
    logger.info("📚 Shutting down AI Study Assistant...")
    
    # Close MongoDB connection
    if mongodb_available and close_mongo_connection:
        try:
            await close_mongo_connection()
        except Exception:
            pass
    
    logger.info("✅ Shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="AI Study Assistant API",
    description="""
    🤖 **Advanced AI-Powered Study Assistant using LLaMA 3.2**
    
    ## Revolutionary Features
    
    ### 📚 **Document Processing**
    - Upload PDF, PowerPoint, Word, and text files
    - AI-powered content analysis and summarization
    - Automatic study material generation
    
    ### 🎓 **AI Tutoring**
    - Human-like conversational tutoring
    - Personalized explanations and examples
    - Step-by-step problem solving
    - Real-time Q&A support
    
    ### 📝 **Quiz Generation**
    - AI-generated quizzes from uploaded content
    - Multiple question types and difficulty levels
    - Intelligent answer evaluation with detailed feedback
    - Performance analytics and recommendations
    
    ### 🧠 **LLaMA 3.2 Integration**
    - Advanced natural language understanding
    - Context-aware responses
    - Educational content optimization
    - Adaptive learning support
    
    Perfect for students, educators, and anyone looking to enhance their learning experience with AI.
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers (simplified without complex dependencies)
# app.include_router(documents_router, prefix="/api")
# app.include_router(tutoring_router, prefix="/api") 
# app.include_router(quizzes_router, prefix="/api")
# TODO: Add back when dependencies are fixed

# Add AI Insights router
try:
    from services.ai_study_features import ai_study_router
    app.include_router(ai_study_router, prefix="/api/ai")
    logger.info("✅ AI Insights router loaded successfully")
except Exception as e:
    logger.warning(f"⚠️  AI Insights router failed to load: {e}")

# MongoDB storage for uploaded documents (persistent)
# uploaded_documents = {}  # Remove in-memory storage

@app.post("/api/documents/upload", tags=["Documents"])
async def upload_document_simple(file: UploadFile = File(...)):
    """Upload document and process PDF content immediately - Save to MongoDB"""
    try:
        # Generate unique document ID
        doc_id = str(abs(hash(f"{file.filename}_{datetime.utcnow().isoformat()}")))
        
        # Read and store file content
        file_content = await file.read()
        file_size = len(file_content)
        await file.seek(0)  # Reset file pointer
        
        # Extract actual content from PDF
        extracted_content = ""
        final_summary = "Document uploaded and ready for use"
        
        if file.content_type == 'application/pdf' or file.filename.lower().endswith('.pdf'):
            try:
                # Extract PDF content
                import PyPDF2
                import io
                
                pdf_buffer = io.BytesIO(file_content)
                pdf_reader = PyPDF2.PdfReader(pdf_buffer)
                
                # Extract text from all pages
                pdf_text = ""
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():
                        pdf_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                
                if pdf_text.strip():
                    extracted_content = pdf_text
                    # Generate a better summary using Gemini if available
                    if gemini_ai_service and len(pdf_text) > 50:
                        try:
                            summary_prompt = f"Provide a concise summary of this document content:\n\n{pdf_text[:3000]}"
                            final_summary = await gemini_ai_service.generate_study_response(
                                question=summary_prompt,
                                context="Document Summary",
                                difficulty="medium"
                            )
                        except:
                            final_summary = f"PDF document with {len(pdf_reader.pages)} pages processed successfully"
                else:
                    final_summary = "PDF uploaded but text extraction may be limited"
                    
                logger.info(f"📄 PDF processed: {len(pdf_reader.pages)} pages, {len(extracted_content)} characters extracted")
                
            except Exception as e:
                logger.warning(f"PDF processing failed: {e}")
                extracted_content = f"PDF file uploaded: {file.filename}"
                final_summary = "PDF uploaded - content extraction encountered issues"
        
        elif file.content_type.startswith('text/') or file.filename.lower().endswith(('.txt', '.md')):
            # Handle text files
            try:
                extracted_content = file_content.decode('utf-8', errors='ignore')
                if len(extracted_content) > 100:
                    final_summary = f"Text document with {len(extracted_content)} characters processed"
            except:
                extracted_content = "Text file uploaded but could not decode content"
                final_summary = "Text file uploaded with encoding issues"
        
        else:
            # Other file types
            extracted_content = f"File uploaded: {file.filename}"
            final_summary = f"Document uploaded: {file.filename}"
        
        # Store document info with extracted content in MongoDB
        document_data = {
            '_id': doc_id,
            'id': doc_id,
            'filename': file.filename,
            'file_type': file.content_type,
            'file_size': file_size,
            'upload_date': datetime.utcnow().isoformat(),
            'processed': True,
            'processing_status': 'completed',
            'status': 'ready',
            'content': extracted_content,  # Now contains actual extracted text
            'final_summary': final_summary,
            'analysis_results': [],
            'flashcards': [],
            'processed_pages': 0,
            'total_pages': 0,
            'study_materials': {},
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Save to MongoDB
        if get_database:
            try:
                db = await get_database()
                documents_collection = db.documents
                await documents_collection.insert_one(document_data)
                logger.info(f"💾 Document saved to MongoDB: {doc_id}")
            except Exception as e:
                logger.error(f"❌ Failed to save to MongoDB: {e}")
                # Continue without failing the upload
        
        # Also keep in memory for backward compatibility (temporary)
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        uploaded_documents[doc_id] = document_data
        app.state.uploaded_documents = uploaded_documents
        
        logger.info(f"📄 Upload completed: {file.filename} ({file_size} bytes) - Content extracted: {len(extracted_content)} chars")
        
        return {
            "message": "File uploaded and processed successfully",
            "document_id": doc_id,
            "filename": file.filename,
            "size": file_size,
            "status": "ready",
            "processed": True,
            "content_length": len(extracted_content)
        }
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/documents/{doc_id}/process", tags=["Documents"])
async def process_uploaded_document(doc_id: str):
    """Process a previously uploaded document"""
    if not document_processor:
        raise HTTPException(status_code=503, detail="Document processor not available")
    
    if doc_id not in uploaded_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = uploaded_documents[doc_id]
    if doc['processed']:
        raise HTTPException(status_code=400, detail="Document already processed")
    
    try:
        # Update status
        doc['processing_status'] = 'processing'
        
        # Create a temporary file from stored content
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{doc['filename']}") as temp_file:
            temp_file.write(doc['content'])
            temp_file_path = temp_file.name
        
        try:
            # Create a mock UploadFile for processing
            class MockUploadFile:
                def __init__(self, filename: str, content: bytes):
                    self.filename = filename
                    self.content_type = doc['file_type']
                    self.file = tempfile.BytesIO(content)
            
            mock_file = MockUploadFile(doc['filename'], doc['content'])
            
            # Process the document
            result = await document_processor.process_document(mock_file, "anonymous")
            
            # Update document with results
            doc.update({
                'processed': True,
                'processing_status': 'completed',
                'final_summary': result.get('final_summary', ''),
                'analysis_results': result.get('analysis_results', []),
                'flashcards': result.get('flashcards', []),
                'processed_pages': result.get('processed_pages', 0),
                'total_pages': result.get('total_pages', 0),
                'study_materials': result.get('study_materials', {})
            })
            
            # Remove raw content to save memory
            del doc['content']
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
        logger.info(f"📄 Document processed: {doc['filename']}")
        
        return {
            "message": "Document processed successfully",
            "document_id": doc_id,
            "summary": doc['final_summary'][:200] + "..." if len(doc['final_summary']) > 200 else doc['final_summary'],
            "flashcards": len(doc['flashcards']),
            "processed_pages": doc['processed_pages'],
            "total_pages": doc['total_pages']
        }
        
    except Exception as e:
        doc['processing_status'] = 'failed'
        doc['error'] = str(e)
        logger.error(f"Document processing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@app.post("/api/documents/upload-streaming", tags=["Documents"])
async def upload_document_streaming(file: UploadFile = File(...)):
    """Upload and process document with page-by-page streaming results"""
    if not document_processor:
        raise HTTPException(status_code=503, detail="Document processor not available")
    
    try:
        # Generate unique document ID
        doc_id = str(abs(hash(f"{file.filename}_{datetime.utcnow().isoformat()}")))
        
        # Store initial document info
        uploaded_documents[doc_id] = {
            'id': doc_id,
            'filename': file.filename,
            'upload_timestamp': datetime.utcnow().isoformat(),
            'processing_status': 'streaming',
            'progress': [],
            'analysis_results': [],
            'flashcards': [],
            'processed_pages': 0,
            'total_pages': 0
        }
        
        # Progress callback to update stored data
        async def progress_callback(message: str):
            uploaded_documents[doc_id]['progress'].append({
                'timestamp': datetime.utcnow().isoformat(),
                'message': message
            })
            logger.info(f"📱 Streaming progress for {file.filename}: {message}")
        
        # Process document with streaming
        result = await document_processor.process_document_streaming(file, "anonymous", progress_callback)
        
        # Update final results
        uploaded_documents[doc_id].update({
            'processing_status': 'completed',
            'analysis_results': result.get('analysis_results', []),
            'flashcards': result.get('flashcards', []),
            'final_summary': result.get('final_summary', ''),
            'processed_pages': result.get('processed_pages', 0),
            'total_pages': result.get('total_pages', 0),
            'processed_slides': result.get('processed_slides', 0),
            'total_slides': result.get('total_slides', 0)
        })
        
        return {
            "success": True,
            "message": "Document processed with streaming analysis!",
            "document_id": doc_id,
            "filename": file.filename,
            "total_flashcards": len(result.get('flashcards', [])),
            "analysis_results": result.get('analysis_results', []),
            "final_summary": result.get('final_summary', ''),
            "streaming_complete": True
        }
        
    except Exception as e:
        logger.error(f"Streaming document processing error: {e}")
        if doc_id in uploaded_documents:
            uploaded_documents[doc_id]['processing_status'] = 'error'
            uploaded_documents[doc_id]['error'] = str(e)
        raise HTTPException(status_code=500, detail=f"Streaming processing failed: {str(e)}")

@app.get("/api/documents/{doc_id}/progress", tags=["Documents"])
async def get_document_progress(doc_id: str):
    """Get real-time processing progress for a document"""
    if doc_id not in uploaded_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc = uploaded_documents[doc_id]
    return {
        "document_id": doc_id,
        "filename": doc.get('filename'),
        "status": doc.get('processing_status', 'unknown'),
        "progress": doc.get('progress', []),
        "analysis_results": doc.get('analysis_results', []),
        "flashcards": doc.get('flashcards', []),
        "processed_pages": doc.get('processed_pages', 0),
        "total_pages": doc.get('total_pages', 0),
        "processed_slides": doc.get('processed_slides', 0),
        "total_slides": doc.get('total_slides', 0),
        "final_summary": doc.get('final_summary', ''),
        "last_update": datetime.utcnow().isoformat()
    }

@app.get("/api/documents", tags=["Documents"])
async def list_documents():
    """List all uploaded documents from MongoDB"""
    try:
        documents = []
        
        # Try to get from MongoDB first
        if get_database:
            try:
                db = await get_database()
                documents_collection = db.documents
                
                # Get all documents from MongoDB, sorted by upload date (newest first)
                cursor = documents_collection.find({}).sort("upload_date", -1)
                mongo_documents = await cursor.to_list(length=None)
                
                # Convert ObjectId to string and format dates
                for doc in mongo_documents:
                    doc["id"] = str(doc.get("_id", doc.get("id", "")))
                    if "_id" in doc:
                        del doc["_id"]
                    
                    # Convert datetime to ISO string if needed
                    if isinstance(doc.get("upload_date"), datetime):
                        doc["upload_date"] = doc["upload_date"].isoformat()
                    
                    documents.append({
                        "id": doc.get("id"),
                        "filename": doc.get('filename', 'Unknown'),
                        "file_type": doc.get('file_type', 'application/pdf'),
                        "file_size": doc.get('file_size', 0),
                        "upload_date": doc.get('upload_date', datetime.now().isoformat()),
                        "processed": doc.get('processed', True),
                        "processing_status": doc.get('processing_status', 'ready'),
                        "status": doc.get('status', 'ready'),
                        "summary": doc.get('final_summary', 'Document ready for use'),
                        "flashcard_count": len(doc.get('flashcards', [])),
                        "question_count": len(doc.get('questions', [])),
                        "error": doc.get('error', None)
                    })
                
                logger.info(f"📊 Retrieved {len(documents)} documents from MongoDB")
                
            except Exception as e:
                logger.error(f"❌ MongoDB read error: {e}")
                # Fallback to in-memory storage
                uploaded_documents = getattr(app.state, 'uploaded_documents', {})
                documents = [
                    {
                        "id": doc_id,
                        "filename": doc.get('filename', 'Unknown'),
                        "file_type": doc.get('file_type', 'application/pdf'),
                        "file_size": doc.get('file_size', 0),
                        "upload_date": doc.get('upload_date', datetime.now().isoformat()),
                        "processed": doc.get('processed', True),
                        "processing_status": doc.get('processing_status', 'ready'),
                        "summary": doc.get('final_summary', 'Document ready for use'),
                        "flashcard_count": len(doc.get('flashcards', [])),
                        "question_count": len(doc.get('questions', [])),
                        "error": doc.get('error', None)
                    }
                    for doc_id, doc in uploaded_documents.items()
                ]
        
        return {
            "documents": documents,
            "total": len(documents)
        }
        
    except Exception as e:
        logger.error(f"❌ Document list error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve documents"
        )

@app.get("/api/documents/{doc_id}/status", tags=["Documents"])
async def get_document_status(doc_id: str):
    """Get processing status of a specific document from MongoDB"""
    try:
        doc = None
        
        # Try to get from MongoDB first
        if get_database:
            try:
                db = await get_database()
                documents_collection = db.documents
                doc = await documents_collection.find_one({"_id": doc_id})
                
                if doc:
                    return {
                        "id": doc_id,
                        "filename": doc.get('filename'),
                        "status": doc.get('status', doc.get('processing_status', 'ready')),
                        "processing_status": doc.get('processing_status', 'completed'),
                        "upload_time": doc.get('upload_date'),
                        "processing_time": doc.get('processing_time'),
                        "study_materials_ready": bool(doc.get('study_materials', {}))
                    }
            except Exception as e:
                logger.error(f"❌ MongoDB status read error: {e}")
        
        # Fallback to in-memory storage
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        if doc_id not in uploaded_documents:
            raise HTTPException(status_code=404, detail="Document not found")
        
        doc = uploaded_documents[doc_id]
        return {
            "id": doc_id,
            "filename": doc.get('filename'),
            "status": doc.get('processing_status', 'completed'),
            "upload_time": doc.get('upload_timestamp'),
            "processing_time": doc.get('processing_time'),
            "study_materials_ready": bool(doc.get('study_materials'))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Document status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get document status")

@app.post("/api/documents/{doc_id}/quiz", tags=["Documents"])
async def generate_quiz_for_document(doc_id: str, quiz_request: QuizGenerationRequest):
    """Generate a quiz from an uploaded document stored in MongoDB"""
    logger.info(f"❓ Quiz generation request for document ID: {doc_id}")
    logger.info(f"📊 Quiz options: {quiz_request.num_questions} questions, {quiz_request.difficulty} difficulty")
    
    # Try to get document from MongoDB first
    doc = None
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            doc = await documents_collection.find_one({"_id": doc_id})
            logger.info(f"📊 Retrieved document from MongoDB: {doc_id}")
        except Exception as e:
            logger.error(f"❌ MongoDB read error: {e}")
    
    # Fallback to in-memory storage
    if not doc:
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        if doc_id not in uploaded_documents:
            logger.error(f"❌ Document not found: {doc_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        doc = uploaded_documents[doc_id]
    
    try:
        content = doc.get('content', '')  # Use extracted content
        
        # Fallback to summary if no extracted content
        if not content or len(content.strip()) < 50:
            content = doc.get('final_summary', '')
        
        if not content or len(content.strip()) < 20:
            raise HTTPException(status_code=400, detail="Document has no usable content for quiz generation")
        
        logger.info(f"📝 Generating quiz from {len(content)} characters of content from {doc['filename']}")
        
        # Use Gemini service to generate quiz
        if gemini_ai_service:
            try:
                # Create quiz prompt with user parameters
                quiz_prompt = f"""
                Generate {quiz_request.num_questions} multiple choice quiz questions based on this content from "{doc['filename']}":
                
                DOCUMENT CONTENT:
                {content[:5000]}
                
                Requirements:
                - Questions must be based on the actual content above
                - Test understanding, not just memorization  
                - Difficulty level: {quiz_request.difficulty}
                - Provide clear explanations
                
                Format each question as JSON:
                {{
                    "question": "Question text based on the content?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Correct option text",
                    "explanation": "Why this is correct based on the content"
                }}
                
                Return only a JSON array of {quiz_request.num_questions} questions.
                """
                
                response = await gemini_ai_service.generate_study_response(
                    question=quiz_prompt,
                    context="Quiz Generation",
                    difficulty=quiz_request.difficulty
                )
                
                # Parse response
                import json
                import re
                
                # Try to extract JSON from response
                json_match = re.search(r'\[[\s\S]*\]', response)
                if json_match:
                    questions = json.loads(json_match.group())
                else:
                    # Fallback: create simple questions
                    questions = []
                    sentences = content.split('. ')[:10]
                    for i, sentence in enumerate(sentences):
                        if len(sentence.strip()) > 20:
                            questions.append({
                                'id': i + 1,
                                'question': f"What does the document state about: {sentence[:50]}...?",
                                'options': [sentence.strip(), "Not mentioned", "Opposite is true", "Partially correct"],
                                'correctAnswer': sentence.strip(),
                                'explanation': "This is directly stated in the document."
                            })
                
                # Update document
                doc['questions'] = questions
                doc['question_count'] = len(questions)
                
                # Also store in global generated_quizzes for /api/quizzes endpoint
                quiz_id = str(uuid.uuid4())
                quiz_data = {
                    "id": quiz_id,
                    "title": f"Quiz: {doc['filename']}",
                    "description": f"Generated from {doc['filename']}",
                    "questions": questions,
                    "source": doc['filename'],
                    "document_id": doc_id,
                    "difficulty": quiz_request.difficulty,
                    "created_at": datetime.now().isoformat(),
                    "status": "ready"
                }
                generated_quizzes[quiz_id] = quiz_data
                
                logger.info(f"✅ Generated {len(questions)} quiz questions for {doc['filename']}")
                logger.info(f"✅ Stored quiz in global collection with ID: {quiz_id}")
                
                return {
                    "success": True,
                    "message": "Quiz generated successfully",
                    "document_id": doc_id,
                    "quiz_id": quiz_id,
                    "questions": questions,
                    "total": len(questions)
                }
                
            except Exception as e:
                logger.error(f"Quiz generation failed: {e}")
                raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")
        else:
            raise HTTPException(status_code=503, detail="AI service not available")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

@app.post("/api/documents/{doc_id}/flashcards", tags=["Documents"])
async def generate_flashcards_for_document(doc_id: str, flashcard_request: FlashcardGenerationRequest):
    """Generate flashcards from an uploaded document stored in MongoDB"""
    logger.info(f"🧠 Flashcard generation request for document ID: {doc_id}")
    logger.info(f"📊 Flashcard options: {flashcard_request.num_cards} cards")
    
    # Try to get document from MongoDB first
    doc = None
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            doc = await documents_collection.find_one({"_id": doc_id})
            logger.info(f"📊 Retrieved document from MongoDB: {doc_id}")
        except Exception as e:
            logger.error(f"❌ MongoDB read error: {e}")
    
    # Fallback to in-memory storage
    if not doc:
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        if doc_id not in uploaded_documents:
            logger.error(f"❌ Document not found: {doc_id}")
            raise HTTPException(status_code=404, detail="Document not found")
        doc = uploaded_documents[doc_id]
    
    try:
        content = doc.get('content', '')
        if not content:
            raise HTTPException(status_code=400, detail="Document has no content")
        
        # Use Gemini service to generate flashcards
        if gemini_ai_service:
            try:
                # Use more content for better flashcard generation (increase from 5000 to 15000 chars)
                # Split content into chunks if it's very long
                content_for_flashcards = content[:15000] if len(content) > 15000 else content
                
                # If content is still very long, prioritize the beginning and middle sections
                if len(content) > 15000:
                    # Take first 10k chars and last 5k chars to capture key concepts
                    first_part = content[:10000]
                    last_part = content[-5000:] if len(content) > 10000 else ""
                    content_for_flashcards = first_part + "\n\n[...content continues...]\n\n" + last_part
                
                logger.info(f"🃏 Using {len(content_for_flashcards)} characters from {len(content)} total for flashcard generation")
                
                # Generate flashcards using Gemini with user-specified number
                flashcards_raw = await gemini_ai_service.generate_flashcards(
                    content=content_for_flashcards,
                    filename=doc['filename'],
                    num_cards=flashcard_request.num_cards
                )
                
                # Transform to flashcard format with spaced repetition metadata
                flashcards = []
                for card_data in flashcards_raw:
                    card_id = str(uuid.uuid4())
                    flashcard = {
                        "id": card_id,
                        "document_id": doc_id,
                        "front": card_data.get('question', ''),
                        "back": card_data.get('answer', ''),
                        "difficulty": 3,  # Default medium difficulty
                        "topic": doc['filename'],
                        "next_review": (datetime.now() + timedelta(days=1)).isoformat(),
                        "review_count": 0,
                        "confidence_level": 0,
                        "created_at": datetime.now().isoformat()
                    }
                    flashcards.append(flashcard)
                    # Add to global flashcards store (in-memory fallback)
                    flashcards_store[card_id] = flashcard
                
                # Save flashcards to MongoDB if available
                if get_database:
                    try:
                        db = await get_database()
                        if flashcards:
                            await db.flashcards.insert_many(flashcards)
                            logger.info(f"💾 Saved {len(flashcards)} flashcards to MongoDB")
                    except Exception as e:
                        logger.warning(f"Failed to save flashcards to MongoDB: {e}")
                
                # Update document
                doc['flashcards'] = flashcards
                doc['flashcard_count'] = len(flashcards)
                
                logger.info(f"✅ Generated {len(flashcards)} flashcards for {doc['filename']}")
                
                # Serialize before returning
                return {
                    "success": True,
                    "message": "Flashcards generated successfully",
                    "document_id": doc_id,
                    "flashcards": serialize_value(flashcards),
                    "total": len(flashcards)
                }
            except Exception as e:
                logger.error(f"Gemini flashcard generation failed: {e}")
                # Fallback to simple generation
                flashcards = []
                sentences = content.split('. ')[:20]
                for i, sentence in enumerate(sentences):
                    if len(sentence.strip()) > 20:
                        flashcards.append({
                            'id': f"{doc['filename']}_{i}",
                            'question': f"What is covered in: {sentence[:50]}...?",
                            'answer': sentence.strip(),
                            'difficulty': 'medium',
                            'created_at': datetime.utcnow().isoformat()
                        })
                
                doc['flashcards'] = flashcards
                doc['flashcard_count'] = len(flashcards)
                
                return {
                    "success": True,
                    "message": "Flashcards generated (simple mode)",
                    "document_id": doc_id,
                    "flashcards": flashcards,
                    "total": len(flashcards)
                }
        else:
            raise HTTPException(status_code=503, detail="AI service not available")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Flashcard generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Flashcard generation failed: {str(e)}")

@app.delete("/api/documents/{doc_id}", tags=["Documents"])
async def delete_document(doc_id: str):
    """Delete an uploaded document from MongoDB and memory"""
    logger.info(f"🗑️ Delete request received for document ID: {doc_id}")
    
    # Try to delete from MongoDB first
    doc = None
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            
            # Get document before deletion for logging
            doc = await documents_collection.find_one({"_id": doc_id})
            if doc:
                # Delete from MongoDB
                result = await documents_collection.delete_one({"_id": doc_id})
                if result.deleted_count > 0:
                    logger.info(f"✅ Deleted document from MongoDB: {doc.get('filename', 'Unknown')} (ID: {doc_id})")
                else:
                    logger.warning(f"⚠️ Document not found in MongoDB: {doc_id}")
            
        except Exception as e:
            logger.error(f"❌ MongoDB delete error: {e}")
    
    # Also check and delete from in-memory storage as fallback
    uploaded_documents = getattr(app.state, 'uploaded_documents', {})
    if doc_id in uploaded_documents:
        filename = uploaded_documents[doc_id].get('filename', 'Unknown')
        del uploaded_documents[doc_id]
        app.state.uploaded_documents = uploaded_documents
        logger.info(f"✅ Deleted document from memory: {filename} (ID: {doc_id})")
        if not doc:  # If not found in MongoDB, use memory doc for response
            doc = {"filename": filename}
    
    if not doc and doc_id not in uploaded_documents:
        logger.error(f"❌ Document not found in either MongoDB or memory: {doc_id}")
        raise HTTPException(
            status_code=404, 
            detail=f"Document not found: {doc_id}"
        )

    try:
        filename = doc.get('filename', 'Unknown') if doc else 'Unknown'
        
        # Count remaining documents
        remaining_count = 0
        if get_database:
            try:
                db = await get_database()
                documents_collection = db.documents
                remaining_count = await documents_collection.count_documents({})
            except:
                remaining_count = len(uploaded_documents)
        else:
            remaining_count = len(uploaded_documents)
        
        logger.info(f"📊 Remaining documents: {remaining_count}")
        
        return {
            "success": True,
            "message": f"Document '{filename}' deleted successfully",
            "document_id": doc_id,
            "remaining_documents": remaining_count
        }
    except Exception as e:
        logger.error(f"❌ Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete document: {str(e)}")

@app.get("/api/debug/quiz-status", tags=["Debug"])
async def debug_quiz_status():
    """Debug endpoint to check quiz generation status"""
    return {
        "total_generated_quizzes": len(generated_quizzes),
        "quiz_ids": list(generated_quizzes.keys()),
        "quiz_summaries": [
            {
                "id": quiz.get("id"),
                "title": quiz.get("title"),
                "source": quiz.get("source"),
                "question_count": len(quiz.get("questions", []))
            }
            for quiz in generated_quizzes.values()
        ]
    }
    """Debug endpoint to see what documents are in storage (MongoDB + Memory)"""
    
    # Get documents from MongoDB
    mongodb_docs = []
    mongodb_count = 0
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            mongodb_count = await documents_collection.count_documents({})
            
            async for doc in documents_collection.find({}).limit(10):
                mongodb_docs.append({
                    "id": doc.get('_id'),
                    "filename": doc.get('filename', 'Unknown'),
                    "file_size": doc.get('file_size', 0),
                    "upload_date": doc.get('upload_date', 'Unknown'),
                    "has_content": bool(doc.get('content', '')),
                    "source": "MongoDB"
                })
        except Exception as e:
            logger.error(f"❌ MongoDB debug error: {e}")
    
    # Get documents from memory
    uploaded_documents = getattr(app.state, 'uploaded_documents', {})
    memory_docs = [
        {
            "id": doc_id,
            "filename": doc.get('filename', 'Unknown'),
            "file_size": doc.get('file_size', 0),
            "upload_date": doc.get('upload_date', 'Unknown'),
            "has_content": bool(doc.get('content', '')),
            "source": "Memory"
        }
        for doc_id, doc in uploaded_documents.items()
    ]
    
    return {
        "mongodb": {
            "total_documents": mongodb_count,
            "documents": mongodb_docs
        },
        "memory": {
            "total_documents": len(uploaded_documents),
            "document_ids": list(uploaded_documents.keys()),
            "documents": memory_docs
        },
        "summary": {
            "total_mongodb": mongodb_count,
            "total_memory": len(uploaded_documents),
            "combined_unique": len(set(
                [doc['id'] for doc in mongodb_docs] + list(uploaded_documents.keys())
            ))
        }
    }

@app.post("/api/tutoring/chat", tags=["AI Tutoring"])
async def chat_with_tutor(message: dict):
    """Chat with AI tutor using Gemini API (FAST!)"""
    if not gemini_ai_service:
        raise HTTPException(status_code=503, detail="Gemini service not available")
    
    try:
        user_message = message.get('message', '')
        context = message.get('context', '')
        study_mode = message.get('study_mode', 'chat')
        difficulty = message.get('difficulty', 'medium')
        
        # Handle simple greetings more professionally
        simple_greetings = ['hi', 'hello', 'hey', 'howdy', 'good morning', 'good afternoon', 'good evening']
        if user_message.lower().strip() in simple_greetings:
            return {
                "response": f"Hello! I'm your AI Study Assistant, equipped with advanced pedagogical frameworks to support your learning journey. 📚\n\n**I can help you with:**\n• **Content Mastery**: Breaking down complex concepts into understandable components\n• **Study Strategy**: Personalized learning techniques based on cognitive science\n• **Assessment Preparation**: Creating targeted practice materials from your documents\n• **Knowledge Synthesis**: Connecting ideas across different subjects and materials\n\n**How would you like to begin?** You can ask me to explain a concept, generate study materials, or help you develop a learning strategy.",
                "timestamp": datetime.utcnow().isoformat()
            }
        
        # Detect study request types and enhance context
        study_context = ""
        user_message_lower = user_message.lower()
        
        if any(word in user_message_lower for word in ['explain', 'understand', 'clarify', 'what is', 'define']):
            study_context = "CONCEPTUAL_EXPLANATION"
            difficulty = "detailed"
        elif any(word in user_message_lower for word in ['how to', 'steps', 'process', 'method', 'technique']):
            study_context = "PROCEDURAL_GUIDANCE"
        elif any(word in user_message_lower for word in ['study plan', 'schedule', 'organize', 'strategy']):
            study_context = "STUDY_STRATEGY"
        elif any(word in user_message_lower for word in ['quiz', 'test', 'exam', 'practice', 'assessment']):
            study_context = "ASSESSMENT_PREPARATION"
        elif any(word in user_message_lower for word in ['summary', 'summarize', 'key points', 'overview']):
            study_context = "CONTENT_SYNTHESIS"
        
        # Enhanced context for Gemini
        enhanced_context = f"{context}\n\nRequest Type: {study_context}" if study_context else context
        
        # Use Gemini for more complex questions
        response = await gemini_ai_service.generate_study_response(
            question=user_message,
            subject="general",  # Can be extracted from context later
            difficulty=difficulty,
            user_id="anonymous",
            context=enhanced_context
        )
        
        return {
            "response": response,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Tutoring error: {e}")
        raise HTTPException(status_code=500, detail=f"Tutoring failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tutoring failed: {str(e)}")

# In-memory storage for quizzes
generated_quizzes = {}
quiz_results = {}  # Store quiz submissions and scores

class QuizGenerateRequest(BaseModel):
    document_id: str
    question_count: int = 15
    difficulty: str = "mixed"
    question_types: List[str] = ["multiple-choice", "short-answer"]

class QuizAnalyzeRequest(BaseModel):
    answers: dict
    document_id: str

class QuizSubmissionRequest(BaseModel):
    quiz_id: str
    answers: dict
    time_taken: int  # in seconds

class QuizResult(BaseModel):
    id: str
    quiz_id: str
    answers: dict
    score: float
    total_questions: int
    correct_answers: int
    time_taken: int
    submitted_at: str
    analysis: Optional[dict] = None

@app.get("/api/quizzes", tags=["Quizzes"])
async def get_quizzes():
    """Get all generated quizzes"""
    logger.info(f"📊 Fetching quizzes. Current count: {len(generated_quizzes)}")
    logger.info(f"📋 Quiz IDs: {list(generated_quizzes.keys())}")
    return {"quizzes": list(generated_quizzes.values())}

@app.get("/api/debug/quiz-status", tags=["Debug"])
async def debug_quiz_status():
    """Debug endpoint to check quiz generation status"""
    return {
        "total_generated_quizzes": len(generated_quizzes),
        "quiz_ids": list(generated_quizzes.keys()),
        "quiz_summaries": [
            {
                "id": quiz.get("id"),
                "title": quiz.get("title"),
                "source": quiz.get("source"),
                "question_count": len(quiz.get("questions", []))
            }
            for quiz in generated_quizzes.values()
        ]
    }

@app.post("/api/quizzes/generate", tags=["Quizzes"])
async def generate_quiz(request: QuizGenerateRequest):
    """Generate a quiz from uploaded document using Gemini AI"""
    if not gemini_ai_service:
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    # Find the document
    document = None
    for doc in uploaded_documents.values():
        if doc['id'] == request.document_id:
            document = doc
            break
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.get('final_summary'):
        raise HTTPException(status_code=400, detail="Document not processed yet")
    
    try:
        logger.info(f"Generating quiz with {request.question_count} questions from document: {document['filename']}")
        
        # Get actual document content for quiz generation (prioritize extracted content)
        content = document.get('content', '')  # Use extracted PDF/text content
        
        # Fallback to summary if no content available
        if not content or len(content.strip()) < 50:
            content = document.get('final_summary', '') + "\n\n"
            if document.get('analysis_results'):
                for result in document['analysis_results']:
                    content += result.get('summary', '') + "\n"
                    if result.get('key_points'):
                        content += "\n".join(result['key_points']) + "\n\n"
        
        if not content or len(content.strip()) < 20:
            raise HTTPException(status_code=400, detail="No content available for quiz generation")
        
        logger.info(f"📝 Using content for quiz: {len(content)} characters from {document['filename']}")
        
        # Generate quiz using Gemini AI
        quiz_prompt = f"""
        Create a comprehensive quiz based on the following educational content from "{document['filename']}". Generate exactly {request.question_count} questions.

        DOCUMENT CONTENT:
        {content[:12000]}  # Increased content size for better context

        Requirements:
        - Generate {request.question_count} questions directly based on the content above
        - Mix of multiple choice and short answer questions
        - Difficulty: {request.difficulty}
        - Questions should test understanding of the specific content provided
        - Include detailed explanations for each answer
        - Ensure questions are relevant to the actual document content
        - Format as JSON with this structure:
        {{
            "questions": [
                {{
                    "id": 1,
                    "type": "multiple-choice",
                    "question": "Question text based on the content",
                    "options": ["A", "B", "C", "D"],
                    "correctAnswer": "Correct option text",
                    "explanation": "Why this is correct",
                    "difficulty": "medium",
                    "points": 10
                }},
                {{
                    "id": 2,
                    "type": "short-answer",
                    "question": "Question text",
                    "correctAnswer": "Expected answer",
                    "explanation": "Detailed explanation",
                    "difficulty": "hard",
                    "points": 15
                }}
            ]
        }}
        """
        
        response = await gemini_ai_service.generate_study_response(
            question=quiz_prompt,
            context="Quiz Generation",
            difficulty=request.difficulty
        )
        
        # Try to parse JSON from response
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            try:
                quiz_data = json.loads(json_match.group())
                questions = quiz_data.get('questions', [])
            except:
                # Fallback to simple question generation
                questions = await generate_fallback_questions(content, request.question_count, request.difficulty)
        else:
            questions = await generate_fallback_questions(content, request.question_count, request.difficulty)
        
        # Create quiz record
        quiz_id = str(uuid.uuid4())
        quiz = {
            "quiz_id": quiz_id,
            "title": f"Quiz: {document['filename']}",
            "source_document": document['filename'],
            "questions": questions,
            "created_at": datetime.utcnow().isoformat(),
            "difficulty": request.difficulty,
            "question_count": len(questions)
        }
        
        generated_quizzes[quiz_id] = quiz
        logger.info(f"Successfully generated quiz with {len(questions)} questions")
        
        return quiz
        
    except Exception as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Quiz generation failed: {str(e)}")

async def generate_fallback_questions(content: str, count: int, difficulty: str):
    """Generate simple questions if JSON parsing fails"""
    questions = []
    content_parts = content.split('\n\n')[:count]
    
    for i, part in enumerate(content_parts):
        if len(part.strip()) > 20:
            questions.append({
                "id": i + 1,
                "type": "short-answer",
                "question": f"Explain the key concepts from: {part[:100]}...",
                "correctAnswer": part.strip(),
                "explanation": "This tests understanding of the content section.",
                "difficulty": difficulty,
                "points": 10
            })
    
    return questions[:count]

@app.post("/api/quizzes/submit", tags=["Quizzes"])
async def submit_quiz(request: QuizSubmissionRequest):
    """Submit quiz answers and get score"""
    quiz = generated_quizzes.get(request.quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Calculate score
    total_questions = len(quiz['questions'])
    correct_answers = 0
    
    for question in quiz['questions']:
        question_id = str(question['id'])
        user_answer = request.answers.get(question_id, "").strip().lower()
        
        if question['type'] == 'multiple-choice':
            correct_answer = question.get('correctAnswer', '').strip().lower()
            if user_answer == correct_answer:
                correct_answers += 1
        elif question['type'] == 'short-answer':
            # For short answers, use basic matching (can be enhanced with AI)
            correct_answer = question.get('correctAnswer', '').strip().lower()
            if user_answer and len(user_answer) > 10:  # Basic check for substantive answer
                # Simple keyword matching for now
                correct_keywords = correct_answer.split()[:5]  # First 5 words
                user_keywords = user_answer.split()
                
                matches = sum(1 for keyword in correct_keywords if keyword in user_keywords)
                if matches >= len(correct_keywords) * 0.3:  # 30% keyword match
                    correct_answers += 1
    
    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Store the result
    result_id = str(uuid.uuid4())
    quiz_result = {
        "id": result_id,
        "quiz_id": request.quiz_id,
        "answers": request.answers,
        "score": round(score, 1),
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "time_taken": request.time_taken,
        "submitted_at": datetime.utcnow().isoformat(),
        "analysis": None
    }
    
    quiz_results[result_id] = quiz_result
    
    logger.info(f"Quiz submitted: {correct_answers}/{total_questions} correct, Score: {score}%")
    
    return {
        "result_id": result_id,
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "percentage": round(score, 1)
    }

@app.get("/api/quiz-results", tags=["Quizzes"])
async def get_quiz_results():
    """Get all quiz results for progress tracking"""
    return {"results": list(quiz_results.values())}

@app.get("/api/learning-progress", tags=["Progress"])
async def get_learning_progress():
    """Get comprehensive learning progress analytics"""
    
    # Calculate document stats using MongoDB
    total_documents = 0
    processed_documents = 0
    
    # Try to get documents from MongoDB first
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            
            # Count total documents
            total_documents = await documents_collection.count_documents({})
            
            # Count processed documents (those with content or processed status)
            processed_documents = await documents_collection.count_documents({
                "$or": [
                    {"content": {"$exists": True, "$ne": ""}},
                    {"final_summary": {"$exists": True, "$ne": ""}},
                    {"processed_pages": {"$gt": 0}}
                ]
            })
            
        except Exception as e:
            logger.error(f"❌ MongoDB read error in learning progress: {e}")
    
    # Fallback to in-memory storage if MongoDB fails
    if total_documents == 0:
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        total_documents = len(uploaded_documents)
        processed_documents = sum(1 for doc in uploaded_documents.values() 
                                 if doc.get('final_summary') or doc.get('processed_pages', 0) > 0)
    
    # Calculate quiz stats
    total_quizzes = len(generated_quizzes)
    quiz_attempts = len(quiz_results)
    
    # Calculate average score
    if quiz_results:
        total_score = sum(result['score'] for result in quiz_results.values())
        average_score = total_score / len(quiz_results)
    else:
        average_score = 0
    
    # Calculate recent activity
    recent_results = sorted(quiz_results.values(), 
                           key=lambda x: x['submitted_at'], reverse=True)[:5]
    
    # Calculate improvement trend
    if len(recent_results) >= 2:
        recent_scores = [r['score'] for r in recent_results[:3]]
        earlier_scores = [r['score'] for r in recent_results[-3:]]
        
        recent_avg = sum(recent_scores) / len(recent_scores)
        earlier_avg = sum(earlier_scores) / len(earlier_scores)
        improvement_trend = recent_avg - earlier_avg
    else:
        improvement_trend = 0
    
    # Study consistency (days with activity)
    activity_dates = set()
    for result in quiz_results.values():
        date = result['submitted_at'][:10]  # Extract date part
        activity_dates.add(date)
    
    return {
        "documents": {
            "total": total_documents,
            "processed": processed_documents,
            "processing_rate": (processed_documents / total_documents * 100) if total_documents > 0 else 0
        },
        "quizzes": {
            "generated": total_quizzes,
            "attempted": quiz_attempts,
            "completion_rate": (quiz_attempts / total_quizzes * 100) if total_quizzes > 0 else 0
        },
        "performance": {
            "average_score": round(average_score, 1),
            "total_attempts": quiz_attempts,
            "improvement_trend": round(improvement_trend, 1),
            "grade_letter": get_letter_grade(average_score)
        },
        "activity": {
            "days_active": len(activity_dates),
            "recent_results": recent_results[:3]
        },
        "next_steps": get_learning_recommendations(average_score, processed_documents, total_quizzes)
    }

def get_letter_grade(score):
    """Convert numerical score to letter grade"""
    if score >= 90: return "A"
    elif score >= 80: return "B" 
    elif score >= 70: return "C"
    elif score >= 60: return "D"
    else: return "F"

def get_learning_recommendations(avg_score, processed_docs, total_quizzes):
    """Generate personalized learning recommendations"""
    recommendations = []
    
    if processed_docs == 0:
        recommendations.append("Upload your first study material to get started")
    elif processed_docs < 3:
        recommendations.append("Upload more study materials to expand your knowledge base")
    
    if total_quizzes == 0:
        recommendations.append("Generate your first quiz to test your understanding")
    elif avg_score < 70:
        recommendations.append("Review materials and retake quizzes to improve comprehension")
    elif avg_score > 85:
        recommendations.append("Great job! Try more challenging materials or advanced topics")
    
    if len(recommendations) == 0:
        recommendations.append("Keep up the consistent study routine!")
    
    return recommendations

@app.get("/api/smart-recommendations", tags=["Progress"])
async def get_smart_recommendations():
    """Get AI-powered study recommendations based on learning patterns"""
    
    # Get documents count from MongoDB or memory
    total_docs = 0
    processed_docs = 0
    uploaded_documents = {}
    
    # Try to get document stats from MongoDB
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            
            total_docs = await documents_collection.count_documents({})
            processed_docs = await documents_collection.count_documents({
                "$or": [
                    {"processed": True},
                    {"content": {"$exists": True, "$ne": ""}},
                    {"final_summary": {"$exists": True, "$ne": ""}}
                ]
            })
            
        except Exception as e:
            logger.error(f"❌ MongoDB read error in recommendations: {e}")
    
    # Fallback to in-memory storage
    if total_docs == 0:
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        total_docs = len(uploaded_documents)
        processed_docs = sum(1 for doc in uploaded_documents.values() if doc.get('processed'))
    
    # Analyze quiz performance patterns
    quiz_performance = []
    topic_strengths = {}
    time_patterns = {}
    
    for result in quiz_results.values():
        quiz_performance.append(result['score'])
        
        # Analyze submission times
        hour = int(result['submitted_at'][11:13])
        if hour not in time_patterns:
            time_patterns[hour] = []
        time_patterns[hour].append(result['score'])
    
    # Calculate optimal study times
    best_hours = []
    for hour, scores in time_patterns.items():
        avg_score = sum(scores) / len(scores)
        if avg_score > 75:  # Good performance threshold
            best_hours.append(hour)
    
    # Generate smart recommendations
    recommendations = []
    
    if quiz_performance:
        avg_score = sum(quiz_performance) / len(quiz_performance)
        recent_scores = quiz_performance[-3:] if len(quiz_performance) >= 3 else quiz_performance
        recent_avg = sum(recent_scores) / len(recent_scores)
        
        # Performance-based recommendations
        if avg_score < 60:
            recommendations.append({
                "type": "urgent",
                "title": "Foundation Review Required",
                "description": "Your average score suggests reviewing fundamental concepts first",
                "action": "Start with basic concept review sessions",
                "priority": "high",
                "estimated_time": "2-3 hours",
                "icon": "🎯"
            })
        elif avg_score > 85:
            recommendations.append({
                "type": "advancement",
                "title": "Ready for Advanced Topics",
                "description": "Your strong performance indicates readiness for challenging material",
                "action": "Explore advanced concepts and complex problems",
                "priority": "medium",
                "estimated_time": "1-2 hours",
                "icon": "🚀"
            })
        
        # Improvement trend recommendations
        if len(quiz_performance) >= 3:
            trend = recent_avg - quiz_performance[0]
            if trend > 10:
                recommendations.append({
                    "type": "momentum",
                    "title": "Excellent Learning Momentum",
                    "description": f"You've improved by {trend:.1f}% - maintain your current strategy",
                    "action": "Continue current study methods and increase difficulty",
                    "priority": "medium",
                    "estimated_time": "1 hour",
                    "icon": "📈"
                })
            elif trend < -10:
                recommendations.append({
                    "type": "adjustment",
                    "title": "Study Strategy Adjustment Needed",
                    "description": f"Recent decline of {abs(trend):.1f}% suggests strategy change",
                    "action": "Take a break and review study methods",
                    "priority": "high",
                    "estimated_time": "30 minutes reflection",
                    "icon": "🔄"
                })
    
    # Time-based recommendations
    if best_hours:
        recommendations.append({
            "type": "scheduling",
            "title": "Optimize Study Schedule",
            "description": f"You perform best between {min(best_hours)}:00-{max(best_hours)+1}:00",
            "action": f"Schedule important study sessions during your peak hours",
            "priority": "medium",
            "estimated_time": "Planning: 15 minutes",
            "icon": "⏰"
        })
    
    # Document processing recommendations using MongoDB
    total_docs = 0
    processed_docs = 0
    
    # Try to get document stats from MongoDB
    if get_database:
        try:
            db = await get_database()
            documents_collection = db.documents
            
            total_docs = await documents_collection.count_documents({})
            processed_docs = await documents_collection.count_documents({
                "$or": [
                    {"processed": True},
                    {"content": {"$exists": True, "$ne": ""}},
                    {"final_summary": {"$exists": True, "$ne": ""}}
                ]
            })
            
        except Exception as e:
            logger.error(f"❌ MongoDB read error in recommendations: {e}")
    
    # Fallback to in-memory storage
    if total_docs == 0:
        uploaded_documents = getattr(app.state, 'uploaded_documents', {})
        total_docs = len(uploaded_documents)
        processed_docs = sum(1 for doc in uploaded_documents.values() if doc.get('processed'))
    
    if total_docs > 0 and processed_docs / total_docs < 0.5:
        recommendations.append({
            "type": "efficiency",
            "title": "Maximize Document Learning",
            "description": f"Only {processed_docs}/{total_docs} documents processed",
            "action": "Process remaining documents for comprehensive coverage",
            "priority": "medium",
            "estimated_time": f"{(total_docs-processed_docs)*10} minutes",
            "icon": "📄"
        })
    
    # Quiz completion recommendations
    if total_docs > 0 and len(generated_quizzes) < total_docs:
        recommendations.append({
            "type": "assessment",
            "title": "Generate More Practice Tests",
            "description": "Create quizzes from unassessed materials",
            "action": "Generate quizzes for comprehensive topic coverage",
            "priority": "medium",
            "estimated_time": "5-10 minutes per quiz",
            "icon": "❓"
        })
    
    # Spaced repetition recommendations
    if quiz_results:
        old_results = [r for r in quiz_results.values() 
                      if (datetime.utcnow() - datetime.fromisoformat(r['submitted_at'])).days > 7]
        
        if old_results:
            recommendations.append({
                "type": "retention",
                "title": "Spaced Repetition Review",
                "description": f"{len(old_results)} topics may need review for long-term retention",
                "action": "Review previously studied materials",
                "priority": "low",
                "estimated_time": "20-30 minutes",
                "icon": "🔄"
            })
    
    # Default recommendations for new users
    if not quiz_results and total_docs == 0:
        recommendations.extend([
            {
                "type": "getting_started",
                "title": "Start Your Learning Journey",
                "description": "Upload your first study material to begin",
                "action": "Upload a document or PDF",
                "priority": "high",
                "estimated_time": "2 minutes",
                "icon": "📚"
            },
            {
                "type": "getting_started",
                "title": "Take Your First Quiz",
                "description": "Test your knowledge with an AI-generated quiz",
                "action": "Generate and complete a quiz",
                "priority": "high",
                "estimated_time": "10-15 minutes",
                "icon": "🎯"
            }
        ])
    
    return {
        "recommendations": recommendations,
        "personalization_score": min(len(quiz_results) * 10, 100),
        "last_updated": datetime.utcnow().isoformat(),
        "next_update": (datetime.utcnow() + timedelta(hours=4)).isoformat()
    }

@app.post("/api/quizzes/{quiz_id}/analyze", tags=["Quizzes"])
async def analyze_quiz_answers(quiz_id: str, request: QuizAnalyzeRequest):
    """Analyze quiz answers using AI and provide detailed feedback"""
    if not gemini_ai_service:
        raise HTTPException(status_code=503, detail="Gemini AI service not available")
    
    quiz = generated_quizzes.get(quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Get original document content
    document = None
    for doc in uploaded_documents.values():
        if doc['id'] == request.document_id:
            document = doc
            break
    
    if not document:
        raise HTTPException(status_code=404, detail="Source document not found")
    
    try:
        # Prepare analysis prompt
        analysis_prompt = f"""
        Analyze the student's quiz performance based on the original content and provide detailed feedback.

        Original Content Summary:
        {document.get('final_summary', '')[:2000]}

        Quiz Questions and Student Answers:
        """
        
        for question in quiz['questions']:
            user_answer = request.answers.get(str(question['id']), 'No answer provided')
            analysis_prompt += f"""
            Q{question['id']}: {question['question']}
            Correct Answer: {question['correctAnswer']}
            Student Answer: {user_answer}
            
            """
        
        analysis_prompt += """
        Please provide:
        1. Overall understanding level (Excellent/Good/Fair/Needs Improvement)
        2. Specific strengths demonstrated
        3. Areas needing improvement
        4. Personalized study recommendations
        5. Encouraging feedback

        Format as JSON:
        {
            "overall_understanding": "Good",
            "strengths": ["Understanding of basic concepts", "Good analytical thinking"],
            "improvements": ["Need to study advanced topics", "Practice more examples"],
            "study_recommendations": ["Review chapter 3", "Do more practice problems"],
            "feedback": "You show good understanding of the fundamentals..."
        }
        """
        
        response = await gemini_ai_service.generate_study_response(
            question=analysis_prompt,
            context="Quiz Analysis",
            difficulty="adaptive"
        )
        
        # Try to parse JSON response
        import json
        import re
        
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            try:
                analysis = json.loads(json_match.group())
            except:
                analysis = {
                    "overall_understanding": "Good",
                    "strengths": ["Completed the quiz"],
                    "improvements": ["Continue studying"],
                    "study_recommendations": ["Review the material"],
                    "feedback": "Keep up the good work! Continue practicing with the study materials."
                }
        else:
            analysis = {
                "overall_understanding": "Good",
                "strengths": ["Completed the quiz"],
                "improvements": ["Continue studying"],
                "study_recommendations": ["Review the material"],
                "feedback": response[:200] + "..." if len(response) > 200 else response
            }
        
        logger.info(f"Generated analysis for quiz {quiz_id}")
        return analysis
        
    except Exception as e:
        logger.error(f"Quiz analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint with comprehensive system information"""
    try:
        model_status = await llama_ai_service.get_model_status() if llama_ai_service and hasattr(llama_ai_service, 'get_model_status') else {}
    except:
        model_status = {"initialized": False, "status": "loading"}
    
    return {
        "message": "🤖 AI Study Assistant API",
        "description": "Revolutionary AI-powered learning platform using LLaMA 3.2",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "features": {
            "document_processing": "Upload & analyze PDF, PPT, DOCX files",
            "ai_tutoring": "Human-like conversational tutoring",
            "quiz_generation": "AI-generated quizzes from content",
            "answer_evaluation": "Intelligent grading with feedback",
            "flashcard_creation": "Automated flashcard generation",
            "progress_tracking": "Advanced learning analytics"
        },
        "ai_model": {
            "name": model_status.get('model_name', 'LLaMA 3.2 3B'),
            "device": model_status.get('device', 'auto'),
            "status": "ready" if model_status.get('initialized') else "initializing",
            "available": llama_ai_service is not None
        },
        "new_endpoints": {
            "health": "/health",
            "test_upload": "/test-upload",
            "api_docs": "/docs"
        },
        "note": "Full API endpoints will be available once dependencies are fixed",
        "test_endpoints": {
            "health": "/health",
            "upload_test": "/test-upload",
            "api_docs": "/docs"
        }
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "api": "ready",
                "database": "in-memory mode",
                "status": "simplified mode"
            },
            "system_info": {
                "api_version": "2.0.0",
                "mode": "simplified",
                "features_available": [
                    "health_check",
                    "file_upload_test"
                ]
            }
        }
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")

@app.post("/test-upload", tags=["Testing"])
async def test_file_upload(file: UploadFile = File(...)):
    """Test file upload functionality"""
    try:
        # Read file content
        content = await file.read()
        
        return {
            "success": True,
            "filename": file.filename,
            "content_type": file.content_type,
            "size_bytes": len(content),
            "size_kb": round(len(content) / 1024, 2),
            "message": f"Successfully received {file.filename}",
            "next_steps": [
                "File upload working correctly",
                "Document processing will be available when dependencies are fixed",
                "LLaMA 3.2 integration to be restored"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload test failed: {str(e)}")

# === DYNAMIC DATA ENDPOINTS ===

@app.get("/api/classes", response_model=List[Class], tags=["Classes"])
async def get_classes():
    """Get all student classes"""
    return student_classes

@app.post("/api/classes", response_model=Class, tags=["Classes"])
async def add_class(class_data: ClassCreate):
    """Add a new class"""
    new_class = Class(
        id=str(uuid.uuid4()),
        title=class_data.title,
        subtitle=class_data.subtitle or "",
        instructor=class_data.instructor,
        time=class_data.time,
        location=class_data.location,
        students=class_data.students,
        currentLesson=1,
        totalLessons=class_data.totalLessons,
        progress=0,
        icon=class_data.icon,
        color=class_data.color,
        type=class_data.type
    )
    
    student_classes.append(new_class.dict())
    logger.info(f"Added new class: {new_class.title}")
    return new_class

@app.put("/api/classes/{class_id}/progress", tags=["Classes"])
async def update_class_progress(class_id: str, progress: int):
    """Update class progress"""
    for i, cls in enumerate(student_classes):
        if cls["id"] == class_id:
            student_classes[i]["progress"] = progress
            # Update current lesson based on progress
            student_classes[i]["currentLesson"] = max(1, int((progress / 100) * cls["totalLessons"]))
            return {"success": True}
    
    raise HTTPException(status_code=404, detail="Class not found")

@app.get("/api/schedule", response_model=List[ScheduleEvent], tags=["Schedule"])
async def get_schedule(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Get student schedule"""
    # Filter by date range if provided
    filtered_schedule = student_schedule
    if start_date or end_date:
        # Add date filtering logic here
        pass
    return filtered_schedule

@app.get("/api/grades", response_model=List[Grade], tags=["Grades"])
async def get_grades(semester: Optional[str] = None):
    """Get student grades"""
    # Filter by semester if provided
    filtered_grades = student_grades
    if semester:
        filtered_grades = [g for g in student_grades if g.get("term") == semester]
    return filtered_grades

@app.get("/api/profile", response_model=StudentProfile, tags=["Profile"])
async def get_profile():
    """Get student profile"""
    return student_profile

@app.put("/api/profile", response_model=StudentProfile, tags=["Profile"])
async def update_profile(profile_data: StudentProfile):
    """Update student profile"""
    global student_profile
    student_profile.update(profile_data.dict())
    return student_profile

# ==================== INNOVATIVE FEATURES ====================

# Storage for innovative features
study_plans = {}
flashcards_store = {}
knowledge_gaps = {}
user_goals = {}

class StudyGoal(BaseModel):
    id: Optional[str] = None
    title: str
    target_date: str
    priority: str  # high, medium, low
    subject: Optional[str] = None
    description: Optional[str] = None

class StudyPlan(BaseModel):
    id: str
    user_id: str
    week_start: str
    week_end: str
    daily_tasks: dict
    goals: List[str]
    estimated_hours: float
    completion_rate: float

class Flashcard(BaseModel):
    id: str
    document_id: str
    front: str
    back: str
    difficulty: int  # 1-5
    next_review: str
    review_count: int
    confidence_level: int  # 1-5

class KnowledgeGap(BaseModel):
    id: str
    subject: str
    topic: str
    severity: str  # critical, moderate, minor
    identified_from: str  # quiz, document_analysis, etc
    recommended_actions: List[str]
    resources: List[dict]

# 1. AI-Powered Personalized Study Plans
@app.post("/api/study-plans/generate", tags=["Study Plans"])
async def generate_study_plan(
    goals: List[StudyGoal],
    available_hours_per_day: float = 3.0,
    start_date: Optional[str] = None
):
    """Generate AI-powered personalized study plan"""
    try:
        from datetime import datetime, timedelta
        
        if not start_date:
            start_date = datetime.now().strftime("%Y-%m-%d")
        
        # Calculate week range
        start = datetime.fromisoformat(start_date)
        week_end = (start + timedelta(days=6)).strftime("%Y-%m-%d")
        
        # Analyze user's past performance
        recent_results = list(quiz_results.values())[-10:] if quiz_results else []
        avg_score = sum(r['score'] for r in recent_results) / len(recent_results) if recent_results else 0
        
        # Sort goals by priority and deadline
        priority_map = {'high': 3, 'medium': 2, 'low': 1}
        sorted_goals = sorted(goals, key=lambda g: (
            -priority_map.get(g.priority, 1),
            datetime.fromisoformat(g.target_date)
        ))
        
        # Generate daily tasks using AI logic
        daily_tasks = {}
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        for i, day in enumerate(days):
            day_date = (start + timedelta(days=i)).strftime("%Y-%m-%d")
            tasks = []
            
            # Distribute goals across the week
            for j, goal in enumerate(sorted_goals):
                if j % 7 == i:  # Spread goals across days
                    task_duration = min(available_hours_per_day / 2, 2.0)
                    
                    # Adjust based on performance
                    if avg_score < 60:
                        task_type = "Review fundamentals"
                    elif avg_score < 80:
                        task_type = "Practice problems"
                    else:
                        task_type = "Advanced concepts"
                    
                    tasks.append({
                        "id": f"task_{day}_{j}",
                        "title": f"{task_type}: {goal.title}",
                        "subject": goal.subject or "General",
                        "duration_hours": task_duration,
                        "priority": goal.priority,
                        "completed": False,
                        "goal_id": goal.id
                    })
            
            # Add review sessions for weak areas
            if knowledge_gaps:
                weak_topics = [g for g in knowledge_gaps.values() if g.get('severity') == 'critical']
                if weak_topics and i % 2 == 0:  # Every other day
                    tasks.append({
                        "id": f"task_{day}_review",
                        "title": f"Review: {weak_topics[0].get('topic', 'Important Topics')}",
                        "subject": weak_topics[0].get('subject', 'General'),
                        "duration_hours": 0.5,
                        "priority": "high",
                        "completed": False,
                        "type": "review"
                    })
            
            daily_tasks[day] = {
                "date": day_date,
                "tasks": tasks,
                "total_hours": sum(t['duration_hours'] for t in tasks)
            }
        
        # Create study plan
        plan_id = str(uuid.uuid4())
        study_plan = {
            "id": plan_id,
            "user_id": "student_001",
            "week_start": start_date,
            "week_end": week_end,
            "daily_tasks": daily_tasks,
            "goals": [g.dict() for g in goals],
            "estimated_hours": sum(day['total_hours'] for day in daily_tasks.values()),
            "completion_rate": 0.0,
            "created_at": datetime.now().isoformat(),
            "performance_baseline": avg_score
        }
        
        study_plans[plan_id] = study_plan
        
        return {
            "success": True,
            "plan": study_plan,
            "recommendations": [
                f"Focus on {'fundamentals' if avg_score < 60 else 'advanced topics' if avg_score >= 80 else 'practice'}",
                f"Dedicate {available_hours_per_day} hours daily for optimal progress",
                f"Review weak areas every {'2 days' if avg_score < 70 else '3 days'}"
            ]
        }
        
    except Exception as e:
        logger.error(f"Study plan generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/study-plans", tags=["Study Plans"])
async def get_study_plans(active_only: bool = True):
    """Get user's study plans"""
    from datetime import datetime
    
    if active_only:
        # Return only current/future plans
        current_date = datetime.now().date()
        active_plans = {
            pid: plan for pid, plan in study_plans.items()
            if datetime.fromisoformat(plan['week_end']).date() >= current_date
        }
        return {"plans": list(active_plans.values()), "total": len(active_plans)}
    
    return {"plans": list(study_plans.values()), "total": len(study_plans)}

@app.put("/api/study-plans/{plan_id}/task/{task_id}/complete", tags=["Study Plans"])
async def complete_task(plan_id: str, task_id: str):
    """Mark a task as completed and adjust plan in real-time"""
    if plan_id not in study_plans:
        raise HTTPException(status_code=404, detail="Study plan not found")
    
    plan = study_plans[plan_id]
    task_found = False
    
    # Find and update task
    for day, day_data in plan['daily_tasks'].items():
        for task in day_data['tasks']:
            if task['id'] == task_id:
                task['completed'] = True
                task['completed_at'] = datetime.now().isoformat()
                task_found = True
                break
    
    if not task_found:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Recalculate completion rate
    total_tasks = sum(len(day['tasks']) for day in plan['daily_tasks'].values())
    completed_tasks = sum(
        sum(1 for task in day['tasks'] if task.get('completed', False))
        for day in plan['daily_tasks'].values()
    )
    plan['completion_rate'] = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
    
    # Real-time adjustment: if falling behind, suggest catch-up tasks
    if plan['completion_rate'] < 50 and datetime.now().weekday() >= 3:  # Thursday or later
        return {
            "success": True,
            "completion_rate": plan['completion_rate'],
            "message": "Task completed!",
            "adjustment_needed": True,
            "suggestion": "You're falling behind. Consider extending study hours or prioritizing high-impact tasks."
        }
    
    return {
        "success": True,
        "completion_rate": plan['completion_rate'],
        "message": "Task completed! Keep up the great work!"
    }

# 2. Adaptive Quiz Generation
@app.post("/api/quizzes/adaptive/generate", tags=["Quizzes"])
async def generate_adaptive_quiz(
    document_id: str,
    num_questions: int = 10,
    user_performance_level: Optional[str] = None
):
    """Generate adaptive quiz based on user performance"""
    if document_id not in uploaded_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Determine difficulty level based on past performance
        if not user_performance_level:
            recent_results = list(quiz_results.values())[-5:] if quiz_results else []
            if recent_results:
                avg_score = sum(r['score'] for r in recent_results) / len(recent_results)
                if avg_score >= 85:
                    difficulty = "advanced"
                elif avg_score >= 70:
                    difficulty = "intermediate"
                else:
                    difficulty = "basic"
            else:
                difficulty = "intermediate"
        else:
            difficulty = user_performance_level
        
        doc = uploaded_documents[document_id]
        content = doc.get('content', '')
        
        # Use Gemini to generate adaptive questions
        if gemini_service:
            difficulty_prompts = {
                "basic": "Focus on fundamental concepts, definitions, and simple recall. Use clear, straightforward language.",
                "intermediate": "Include application-based questions requiring analysis and problem-solving.",
                "advanced": "Create complex questions involving synthesis, evaluation, and critical thinking."
            }
            
            prompt = f"""Based on the following content, generate {num_questions} quiz questions.

Difficulty Level: {difficulty}
{difficulty_prompts[difficulty]}

Generate a mix of question types:
- Multiple Choice (60%)
- Fill in the Blank (20%)
- True/False (20%)

Content:
{content[:3000]}

Return ONLY a valid JSON array with this structure:
[
  {{
    "question": "question text",
    "type": "multiple_choice|fill_blank|true_false",
    "options": ["A", "B", "C", "D"] (for multiple choice only),
    "correct_answer": "correct answer",
    "explanation": "why this is correct",
    "difficulty": "{difficulty}",
    "topic": "relevant topic"
  }}
]"""
            
            response = await gemini_service.generate_content(prompt)
            
            # Parse response
            import json
            import re
            
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                questions = json.loads(json_match.group())
            else:
                questions = json.loads(response)
            
            # Store quiz
            quiz_id = str(uuid.uuid4())
            quiz_data = {
                "id": quiz_id,
                "document_id": document_id,
                "questions": questions,
                "difficulty": difficulty,
                "created_at": datetime.now().isoformat(),
                "adaptive": True
            }
            
            # Store in quiz_results as pending
            quiz_results[quiz_id] = {
                "quiz_id": quiz_id,
                "questions": questions,
                "status": "pending",
                "difficulty": difficulty
            }
            
            return {
                "success": True,
                "quiz_id": quiz_id,
                "questions": questions,
                "difficulty": difficulty,
                "total_questions": len(questions),
                "question_types": {
                    "multiple_choice": sum(1 for q in questions if q['type'] == 'multiple_choice'),
                    "fill_blank": sum(1 for q in questions if q['type'] == 'fill_blank'),
                    "true_false": sum(1 for q in questions if q['type'] == 'true_false')
                }
            }
        else:
            raise HTTPException(status_code=503, detail="AI service not available")
            
    except Exception as e:
        logger.error(f"Adaptive quiz generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# 3. Smart Flashcard System with Spaced Repetition
@app.post("/api/flashcards/generate", tags=["Flashcards"])
async def generate_flashcards(request: FlashcardGenerateRequest):
    """Auto-generate flashcards from document using AI"""
    document_id = request.document_id
    max_cards = request.max_cards
    
    if document_id not in uploaded_documents:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        doc = uploaded_documents[document_id]
        content = doc.get('content', '')
        
        if gemini_ai_service:
            # Use the existing generate_flashcards method
            flashcards_raw = await gemini_ai_service.generate_flashcards(
                content=content[:5000],
                filename=doc.get('filename', 'document'),
                num_cards=max_cards
            )
            
            import json
            import re
            from datetime import datetime, timedelta
            
            # Add spaced repetition metadata
            flashcards = []
            for card_data in flashcards_raw:
                card_id = str(uuid.uuid4())
                flashcard = {
                    "id": card_id,
                    "document_id": document_id,
                    "front": card_data.get('question', card_data.get('front', '')),
                    "back": card_data.get('answer', card_data.get('back', '')),
                    "difficulty": card_data.get('difficulty', 3),
                    "topic": card_data.get('topic', doc.get('filename', 'General')),
                    "next_review": (datetime.now() + timedelta(days=1)).isoformat(),
                    "review_count": 0,
                    "confidence_level": 0,
                    "created_at": datetime.now().isoformat()
                }
                flashcards.append(flashcard)
                flashcards_store[card_id] = flashcard
            
            # Save flashcards to MongoDB if available
            if get_database:
                try:
                    db = await get_database()
                    if flashcards:
                        await db.flashcards.insert_many(flashcards)
                        logger.info(f"💾 Saved {len(flashcards)} flashcards to MongoDB")
                except Exception as e:
                    logger.warning(f"Failed to save flashcards to MongoDB: {e}")
            
            # Serialize before returning
            return {
                "success": True,
                "flashcards": serialize_value(flashcards),
                "total": len(flashcards),
                "document_id": document_id
            }
        else:
            raise HTTPException(status_code=503, detail="AI service not available")
            
    except Exception as e:
        logger.error(f"Flashcard generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/flashcards/due", tags=["Flashcards"])
async def get_due_flashcards():
    """Get flashcards due for review using spaced repetition"""
    from datetime import datetime
    
    now = datetime.now()
    
    # Try to read from MongoDB first
    if get_database:
        try:
            db = await get_database()
            # Get all flashcards from MongoDB
            cursor = db.flashcards.find({})
            all_cards = await cursor.to_list(length=1000)
            
            # Filter for due cards
            due_cards = [
                card for card in all_cards
                if datetime.fromisoformat(card['next_review']) <= now
            ]
            
            # Sort by difficulty (harder cards first) and review count (less reviewed first)
            due_cards.sort(key=lambda c: (-c['difficulty'], c['review_count']))
            
            # Serialize before returning
            return {
                "flashcards": serialize_value(due_cards),
                "total_due": len(due_cards),
                "total_cards": len(all_cards)
            }
        except Exception as e:
            logger.warning(f"Failed to read flashcards from MongoDB: {e}")
    
    # Fallback to in-memory store
    due_cards = [
        card for card in flashcards_store.values()
        if datetime.fromisoformat(card['next_review']) <= now
    ]
    
    # Sort by difficulty (harder cards first) and review count (less reviewed first)
    due_cards.sort(key=lambda c: (-c['difficulty'], c['review_count']))
    
    # Serialize before returning
    return {
        "flashcards": serialize_value(due_cards),
        "total_due": len(due_cards),
        "total_cards": len(flashcards_store)
    }

@app.post("/api/flashcards/{card_id}/review", tags=["Flashcards"])
async def review_flashcard(card_id: str, confidence: int):
    """Record flashcard review and calculate next review date using spaced repetition"""
    if card_id not in flashcards_store:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    from datetime import datetime, timedelta
    
    card = flashcards_store[card_id]
    card['review_count'] += 1
    card['confidence_level'] = confidence
    card['last_reviewed'] = datetime.now().isoformat()
    
    # Spaced repetition algorithm (simplified SM-2)
    if confidence >= 4:  # Good recall
        interval_days = [1, 3, 7, 14, 30, 60, 120][min(card['review_count'], 6)]
    elif confidence == 3:  # Medium recall
        interval_days = [1, 2, 4, 7, 14, 30][min(card['review_count'], 5)]
    else:  # Poor recall
        interval_days = 1
        card['review_count'] = max(0, card['review_count'] - 1)  # Reset progress
    
    card['next_review'] = (datetime.now() + timedelta(days=interval_days)).isoformat()
    
    return {
        "success": True,
        "next_review": card['next_review'],
        "interval_days": interval_days,
        "message": f"Next review in {interval_days} days"
    }

# 4. AI-Driven Knowledge Gap Analysis
@app.post("/api/knowledge-gaps/analyze", tags=["Knowledge Gaps"])
async def analyze_knowledge_gaps(quiz_id: Optional[str] = None):
    """Analyze knowledge gaps from quiz results or overall performance"""
    try:
        gaps = []
        
        if quiz_id:
            # Analyze specific quiz
            if quiz_id not in quiz_results:
                raise HTTPException(status_code=404, detail="Quiz not found")
            
            result = quiz_results[quiz_id]
            answers = result.get('answers', [])
            questions = result.get('questions', [])
            
            # Identify weak topics
            topic_performance = {}
            for i, answer in enumerate(answers):
                if i < len(questions):
                    topic = questions[i].get('topic', 'General')
                    correct = answer.get('is_correct', False)
                    
                    if topic not in topic_performance:
                        topic_performance[topic] = {'correct': 0, 'total': 0}
                    
                    topic_performance[topic]['total'] += 1
                    if correct:
                        topic_performance[topic]['correct'] += 1
            
            # Create gaps for topics with <70% accuracy
            for topic, perf in topic_performance.items():
                accuracy = (perf['correct'] / perf['total'] * 100) if perf['total'] > 0 else 0
                if accuracy < 70:
                    gap_id = str(uuid.uuid4())
                    severity = 'critical' if accuracy < 50 else 'moderate' if accuracy < 60 else 'minor'
                    
                    gap = {
                        "id": gap_id,
                        "subject": result.get('subject', 'Unknown'),
                        "topic": topic,
                        "severity": severity,
                        "accuracy": accuracy,
                        "identified_from": f"quiz_{quiz_id}",
                        "identified_at": datetime.now().isoformat(),
                        "recommended_actions": [
                            f"Review {topic} fundamentals",
                            f"Complete practice problems on {topic}",
                            f"Create flashcards for {topic} concepts"
                        ],
                        "resources": [
                            {"type": "practice", "title": f"{topic} Practice Quiz"},
                            {"type": "review", "title": f"{topic} Study Guide"}
                        ]
                    }
                    gaps.append(gap)
                    knowledge_gaps[gap_id] = gap
        else:
            # Analyze overall performance
            if not quiz_results:
                return {"gaps": [], "total": 0, "message": "No quiz data available"}
            
            # Aggregate performance across all quizzes
            all_topics = {}
            for result in quiz_results.values():
                answers = result.get('answers', [])
                questions = result.get('questions', [])
                
                for i, answer in enumerate(answers):
                    if i < len(questions):
                        topic = questions[i].get('topic', 'General')
                        correct = answer.get('is_correct', False)
                        
                        if topic not in all_topics:
                            all_topics[topic] = {'correct': 0, 'total': 0}
                        
                        all_topics[topic]['total'] += 1
                        if correct:
                            all_topics[topic]['correct'] += 1
            
            # Create comprehensive gaps
            for topic, perf in all_topics.items():
                accuracy = (perf['correct'] / perf['total'] * 100) if perf['total'] > 0 else 0
                if accuracy < 75:
                    gap_id = str(uuid.uuid4())
                    severity = 'critical' if accuracy < 50 else 'moderate' if accuracy < 65 else 'minor'
                    
                    gap = {
                        "id": gap_id,
                        "subject": "Overall",
                        "topic": topic,
                        "severity": severity,
                        "accuracy": accuracy,
                        "questions_attempted": perf['total'],
                        "identified_from": "overall_analysis",
                        "identified_at": datetime.now().isoformat(),
                        "recommended_actions": [
                            f"Intensive review of {topic}",
                            f"Schedule daily practice on {topic}",
                            f"Seek additional resources for {topic}"
                        ],
                        "resources": [
                            {"type": "video", "title": f"{topic} Tutorial"},
                            {"type": "practice", "title": f"{topic} Exercises"}
                        ]
                    }
                    gaps.append(gap)
                    knowledge_gaps[gap_id] = gap
        
        return {
            "gaps": gaps,
            "total": len(gaps),
            "critical_count": sum(1 for g in gaps if g['severity'] == 'critical'),
            "moderate_count": sum(1 for g in gaps if g['severity'] == 'moderate'),
            "minor_count": sum(1 for g in gaps if g['severity'] == 'minor')
        }
        
    except Exception as e:
        logger.error(f"Knowledge gap analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/knowledge-gaps", tags=["Knowledge Gaps"])
async def get_knowledge_gaps(severity: Optional[str] = None):
    """Get all identified knowledge gaps"""
    gaps = list(knowledge_gaps.values())
    
    if severity:
        gaps = [g for g in gaps if g['severity'] == severity]
    
    # Sort by severity (critical first)
    severity_order = {'critical': 0, 'moderate': 1, 'minor': 2}
    gaps.sort(key=lambda g: severity_order.get(g['severity'], 3))
    
    return {
        "gaps": gaps,
        "total": len(gaps),
        "by_severity": {
            "critical": sum(1 for g in knowledge_gaps.values() if g['severity'] == 'critical'),
            "moderate": sum(1 for g in knowledge_gaps.values() if g['severity'] == 'moderate'),
            "minor": sum(1 for g in knowledge_gaps.values() if g['severity'] == 'minor')
        }
    }

# ==========================================
# AI STUDY PLANNER ENDPOINTS
# ==========================================

from services.ai_study_planner import get_ai_study_planner

@app.post("/api/study-planner/create-plan", tags=["AI Study Planner"])
async def create_personalized_study_plan(
    plan_request: Dict[str, Any] = {
        "user_id": "default_user",
        "available_hours_per_day": 2.0,
        "learning_goals": [],
        "current_knowledge": [],
        "learning_style": "balanced"
    }
):
    """Create a personalized AI-powered study plan"""
    logger.info(f"🎯 Creating personalized study plan")
    
    try:
        planner = get_ai_study_planner()
        
        study_plan = await planner.create_personalized_study_plan(
            user_id=plan_request.get("user_id", "default_user"),
            available_hours_per_day=plan_request.get("available_hours_per_day", 2.0),
            learning_goals=plan_request.get("learning_goals", []),
            current_knowledge=plan_request.get("current_knowledge", []),
            learning_style=plan_request.get("learning_style", "balanced"),
            study_preferences=plan_request.get("study_preferences", {})
        )
        
        return {
            "success": True,
            "plan": study_plan,
            "message": "Personalized study plan created successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error creating study plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create study plan: {str(e)}")

@app.post("/api/study-planner/optimize-session", tags=["AI Study Planner"])
async def optimize_current_session(
    session_data: Dict[str, Any] = {
        "user_id": "default_user",
        "current_energy": 7,
        "available_time": 60,
        "subject_preferences": []
    }
):
    """Optimize current study session based on real-time factors"""
    logger.info(f"⚡ Optimizing study session")
    
    try:
        planner = get_ai_study_planner()
        
        optimization = await planner.optimize_study_session(
            user_id=session_data.get("user_id", "default_user"),
            current_energy=session_data.get("current_energy", 7),
            available_time=session_data.get("available_time", 60),
            subject_preferences=session_data.get("subject_preferences", [])
        )
        
        return {
            "success": True,
            "optimization": optimization,
            "message": "Study session optimized successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error optimizing session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to optimize session: {str(e)}")

@app.post("/api/study-planner/track-progress", tags=["AI Study Planner"])
async def track_study_progress(
    progress_data: Dict[str, Any] = {
        "user_id": "default_user",
        "completed_sessions": [],
        "performance_data": {}
    }
):
    """Track progress and adapt study plan based on performance"""
    logger.info(f"📊 Tracking study progress")
    
    try:
        planner = get_ai_study_planner()
        
        progress_analysis = await planner.track_progress_and_adapt(
            user_id=progress_data.get("user_id", "default_user"),
            completed_sessions=progress_data.get("completed_sessions", []),
            performance_data=progress_data.get("performance_data", {})
        )
        
        return {
            "success": True,
            "analysis": progress_analysis,
            "message": "Progress tracked and plan adapted successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error tracking progress: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to track progress: {str(e)}")

@app.get("/api/study-planner/daily-schedule/{user_id}", tags=["AI Study Planner"])
async def get_daily_schedule(user_id: str, date: str = None):
    """Get optimized daily study schedule for a specific date"""
    logger.info(f"📅 Getting daily schedule for {user_id}")
    
    try:
        # For now, return a sample schedule
        # In a real implementation, this would fetch from database
        sample_schedule = {
            "date": date or datetime.now().date().isoformat(),
            "user_id": user_id,
            "sessions": [
                {
                    "id": "session_1",
                    "time": "09:00",
                    "subject": "Morning Review",
                    "duration_minutes": 30,
                    "type": "review",
                    "difficulty": "easy",
                    "topics": ["Previous day concepts"],
                    "energy_requirement": 6
                },
                {
                    "id": "session_2", 
                    "time": "14:00",
                    "subject": "Core Learning",
                    "duration_minutes": 60,
                    "type": "reading",
                    "difficulty": "medium",
                    "topics": ["New concepts", "Key principles"],
                    "energy_requirement": 8
                },
                {
                    "id": "session_3",
                    "time": "19:00",
                    "subject": "Practice & Application",
                    "duration_minutes": 45,
                    "type": "practice",
                    "difficulty": "medium",
                    "topics": ["Problem solving", "Application exercises"],
                    "energy_requirement": 7
                }
            ],
            "total_study_time": 135,
            "difficulty_distribution": {"easy": 30, "medium": 105},
            "recommendations": [
                "Take 10-minute breaks between sessions",
                "Hydrate regularly",
                "Review yesterday's material before new content"
            ]
        }
        
        return {
            "success": True,
            "schedule": sample_schedule,
            "message": "Daily schedule retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting schedule: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get schedule: {str(e)}")

@app.get("/api/study-planner/learning-paths", tags=["AI Study Planner"])
async def get_learning_paths(subject: str = None, difficulty: str = None):
    """Get available learning paths based on subject and difficulty"""
    logger.info(f"🛤️ Getting learning paths for {subject or 'all subjects'}")
    
    try:
        planner = get_ai_study_planner()
        
        # Sample learning goals and knowledge for path generation
        sample_goals = [
            {"title": subject or "General Study", "description": "Comprehensive learning", "priority": 5}
        ]
        sample_knowledge = [
            {"area": "foundations", "level": difficulty or "beginner"}
        ]
        
        learning_paths = await planner._generate_learning_paths(sample_goals, sample_knowledge)
        
        return {
            "success": True,
            "paths": learning_paths,
            "total_paths": len(learning_paths),
            "message": "Learning paths retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting learning paths: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get learning paths: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=False,  # Disabled to prevent restart warnings
        log_level="info"
    )
