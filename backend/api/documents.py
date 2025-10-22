# Document Upload and Processing API Routes
# Handles file uploads, content extraction, and AI analysis

from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from services.llama_service import llama_ai_service
from core.database import get_database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Document Processing"])

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload and process a document with AI analysis
    
    This endpoint handles:
    - File upload and validation
    - Content extraction (PDF, PPTX, DOCX, TXT)
    - LLaMA 3.2 content analysis
    - Study material generation
    - Database storage
    """
    try:
        logger.info(f"Processing upload: {file.filename}")
        
        # Validate file size (max 50MB)
        content = await file.read()
        file_size = len(content)
        
        if file_size > 50 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="File size too large. Maximum size is 50MB."
            )
        
        # Generate document ID
        import uuid
        document_id = str(uuid.uuid4())
        
        # Reset file pointer
        await file.seek(0)
        
        # Process document in background
        background_tasks.add_task(
            process_document_background,
            document_id,
            file.filename,
            content,
            file.content_type
        )
        
        # Return immediate response with processing status
        return {
            "message": "Document upload received. Processing will begin shortly.",
            "document_id": document_id,
            "filename": file.filename,
            "status": "processing",
            "estimated_time": "2-5 minutes"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {str(e)}"
        )

async def process_document_background(document_id: str, filename: str, content: bytes, content_type: str):
    """Background task for document processing"""
    try:
        logger.info(f"Starting background processing for {filename}")
        
        # Import here to avoid circular dependency
        import tempfile
        import os
        
        # Get database connection
        db = await get_database()
        documents_collection = db.documents
        
        # Save to temporary file for processing
        suffix = os.path.splitext(filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        try:
            # Process the document
            from services.document_processor import document_processor
            result = await document_processor.process_file(tmp_path, filename)
            
            logger.info(f"Successfully processed {filename}")
            
            # Store document in MongoDB
            document_data = {
                "_id": document_id,
                "id": document_id,
                "filename": filename,
                "file_type": content_type,
                "file_size": len(content),
                "upload_date": datetime.utcnow(),
                "processed": True,
                "processing_status": "completed",
                "status": "ready",
                "summary": result.get("summary", ""),
                "flashcard_count": len(result.get("flashcards", [])),
                "question_count": len(result.get("questions", [])),
                "content": result.get("content", ""),
                "flashcards": result.get("flashcards", []),
                "questions": result.get("questions", []),
                "error": None
            }
            
            await documents_collection.update_one(
                {"_id": document_id},
                {"$set": document_data},
                upsert=True
            )
            
            logger.info(f"Document {document_id} saved to MongoDB")
            
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_path)
            except:
                pass
        
    except Exception as e:
        logger.error(f"Background processing error: {str(e)}")
        
        # Store error in MongoDB
        db = await get_database()
        documents_collection = db.documents
        
        error_data = {
            "_id": document_id,
            "id": document_id,
            "filename": filename,
            "file_type": content_type,
            "file_size": len(content),
            "upload_date": datetime.utcnow(),
            "processed": False,
            "processing_status": "failed",
            "status": "failed",
            "error": str(e)
        }
        
        await documents_collection.update_one(
            {"_id": document_id},
            {"$set": error_data},
            upsert=True
        )



@router.get("/{document_id}/status")
async def get_processing_status(document_id: str):
    """
    Get processing status for an uploaded document
    """
    try:
        db = await get_database()
        documents_collection = db.documents
        
        doc = await documents_collection.find_one({"_id": document_id})
        
        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        return {
            "document_id": document_id,
            "filename": doc["filename"],
            "processed": doc["processed"],
            "processing_status": doc["processing_status"],
            "status": doc.get("status", "processing"),
            "summary": doc.get("summary", ""),
            "flashcard_count": doc.get("flashcard_count", 0),
            "question_count": doc.get("question_count", 0),
            "error": doc.get("error")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status check error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check status"
        )

@router.get("")
async def list_user_documents():
    """
    List all uploaded documents from MongoDB
    """
    try:
        db = await get_database()
        documents_collection = db.documents
        
        # Get all documents from MongoDB, sorted by upload date (newest first)
        cursor = documents_collection.find({}).sort("upload_date", -1)
        documents = await cursor.to_list(length=None)
        
        # Convert ObjectId to string and format dates
        for doc in documents:
            doc["id"] = str(doc.get("_id", doc.get("id", "")))
            if "_id" in doc:
                del doc["_id"]
            
            # Convert datetime to ISO string if needed
            if isinstance(doc.get("upload_date"), datetime):
                doc["upload_date"] = doc["upload_date"].isoformat()
        
        return {
            "documents": documents,
            "total": len(documents)
        }
        
    except Exception as e:
        logger.error(f"Document list error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve documents"
        )



@router.post("/{document_id}/quiz")
async def generate_quiz_from_document(
    document_id: str,
    background_tasks: BackgroundTasks
):
    """
    Generate a quiz from an uploaded document using LLaMA 3.2
    """
    try:
        db = await get_database()
        documents_collection = db.documents
        
        doc = await documents_collection.find_one({"_id": document_id})
        
        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        if not doc.get("processed"):
            raise HTTPException(
                status_code=400,
                detail="Document is still processing"
            )
        
        # Check if quiz already exists
        if doc.get("questions") and len(doc.get("questions", [])) > 0:
            return {
                "message": "Quiz already exists",
                "document_id": document_id,
                "questions": doc.get("questions", [])
            }
        
        # Generate quiz using LLaMA
        content = doc.get("content", "")
        
        quiz_data = await llama_ai_service.generate_quiz_from_content(
            content=content,
            num_questions=10,
            difficulty="mixed"
        )
        
        questions = quiz_data.get("questions", [])
        
        # Update document in MongoDB with quiz
        await documents_collection.update_one(
            {"_id": document_id},
            {"$set": {
                "questions": questions,
                "question_count": len(questions)
            }}
        )
        
        return {
            "message": "Quiz generated successfully",
            "document_id": document_id,
            "questions": questions
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate quiz: {str(e)}"
        )



@router.post("/{document_id}/flashcards")
async def generate_flashcards_from_document(
    document_id: str
):
    """
    Generate flashcards from an uploaded document using LLaMA 3.2
    """
    try:
        db = await get_database()
        documents_collection = db.documents
        
        doc = await documents_collection.find_one({"_id": document_id})
        
        if not doc:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        if not doc.get("processed"):
            raise HTTPException(
                status_code=400,
                detail="Document is still processing"
            )
        
        # Check if flashcards already exist
        if doc.get("flashcards") and len(doc.get("flashcards", [])) > 0:
            return {
                "message": "Flashcards already exist",
                "document_id": document_id,
                "flashcards": doc.get("flashcards", [])
            }
        
        # Generate flashcards using LLaMA
        content = doc.get("content", "")
        
        flashcard_prompt = f"""
        Create 20 flashcards from this content. Format each as:
        Q: [Question]
        A: [Answer]
        
        Focus on key concepts, definitions, and important facts.
        
        Content:
        {content[:4000]}
        """
        
        response = await llama_ai_service.generate_response(
            prompt=flashcard_prompt,
            context="flashcard_generation",
            max_tokens=2000
        )
        
        # Parse flashcards
        flashcards = parse_flashcards_response(response)
        
        # Update document in MongoDB with flashcards
        await documents_collection.update_one(
            {"_id": document_id},
            {"$set": {
                "flashcards": flashcards,
                "flashcard_count": len(flashcards)
            }}
        )
        
        return {
            "message": "Flashcards generated successfully",
            "document_id": document_id,
            "flashcards": flashcards
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Flashcard generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate flashcards: {str(e)}"
        )



def parse_flashcards_response(response: str) -> List[Dict[str, str]]:
    """Parse flashcards from LLaMA response"""
    flashcards = []
    lines = response.split('\n')
    current_question = ""
    current_answer = ""
    
    for line in lines:
        line = line.strip()
        if line.startswith('Q:'):
            if current_question and current_answer:
                flashcards.append({
                    'front': current_question,
                    'back': current_answer,
                    'difficulty': 'medium',
                    'created_at': datetime.utcnow().isoformat()
                })
            current_question = line[2:].strip()
            current_answer = ""
        elif line.startswith('A:'):
            current_answer = line[2:].strip()
    
    # Add the last flashcard
    if current_question and current_answer:
        flashcards.append({
            'front': current_question,
            'back': current_answer,
            'difficulty': 'medium',
            'created_at': datetime.utcnow().isoformat()
        })
    
    return flashcards

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document and all associated data from MongoDB
    """
    try:
        db = await get_database()
        documents_collection = db.documents
        
        result = await documents_collection.delete_one({"_id": document_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        logger.info(f"Document {document_id} deleted from MongoDB")
        
        return {
            "message": "Document deleted successfully",
            "document_id": document_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document deletion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete document"
        )