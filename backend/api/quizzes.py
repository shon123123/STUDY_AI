# Quiz Generation and Evaluation API Routes
# AI-powered quiz system using LLaMA 3.2

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from pydantic import BaseModel

from services.llama_service import llama_ai_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quizzes", tags=["Quiz System"])

class QuizRequest(BaseModel):
    topic: str
    subject: str
    difficulty: str = "medium"
    num_questions: int = 10
    question_types: List[str] = ["multiple_choice", "true_false", "short_answer"]
    document_id: Optional[str] = None

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: Dict[str, str]  # question_id -> answer

class QuizResponse(BaseModel):
    quiz_id: str
    title: str
    questions: List[Dict[str, Any]]
    metadata: Dict[str, Any]

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    request: QuizRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Generate an AI-powered quiz using LLaMA 3.2
    
    Can generate from:
    - General topic knowledge
    - Specific uploaded document content
    - Mixed sources
    """
    try:
        logger.info(f"Generating quiz: {request.topic} for user {current_user.id}")
        
        # Get document content if specified
        content_context = ""
        if request.document_id:
            content_context = await get_document_content(request.document_id, current_user.id)
        
        # Generate quiz using LLaMA in background
        quiz_id = f"quiz_{current_user.id}_{int(datetime.utcnow().timestamp())}"
        
        background_tasks.add_task(
            generate_quiz_background,
            quiz_id,
            request,
            current_user.id,
            content_context
        )
        
        return JSONResponse(
            status_code=202,
            content={
                "quiz_id": quiz_id,
                "status": "generating",
                "message": "Quiz generation started. This will take 1-2 minutes.",
                "topic": request.topic,
                "subject": request.subject,
                "estimated_questions": request.num_questions
            }
        )
        
    except Exception as e:
        logger.error(f"Quiz generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start quiz generation: {str(e)}"
        )

async def generate_quiz_background(quiz_id: str, request: QuizRequest, user_id: str, content_context: str):
    """Background task for quiz generation"""
    try:
        logger.info(f"Starting background quiz generation for {quiz_id}")
        
        # Build comprehensive prompt for LLaMA
        quiz_prompt = f"""
        Create a comprehensive {request.difficulty}-level quiz about {request.topic} in {request.subject}.
        
        Requirements:
        - Generate {request.num_questions} questions
        - Include these question types: {', '.join(request.question_types)}
        - Make questions challenging but fair
        - Provide clear, correct answers with explanations
        
        {f"Base the quiz on this content: {content_context[:2000]}" if content_context else "Use general knowledge about the topic."}
        
        Format your response as JSON:
        {{
            "title": "Quiz title",
            "description": "Brief description",
            "questions": [
                {{
                    "id": "q1",
                    "type": "multiple_choice",
                    "question": "Question text",
                    "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
                    "correct_answer": "B",
                    "explanation": "Why this is correct",
                    "difficulty": "easy|medium|hard",
                    "points": 10,
                    "concept": "Key concept being tested"
                }}
            ]
        }}
        
        Ensure variety in question types and difficulty levels.
        """
        
        # Generate quiz using LLaMA
        quiz_response = await llama_ai_service.generate_response(
            prompt=quiz_prompt,
            context="quiz_generation",
            max_tokens=3000,
            temperature=0.4  # Lower temperature for structured output
        )
        
        # Parse the response
        try:
            quiz_data = parse_quiz_response(quiz_response, quiz_id, request)
        except Exception as parse_error:
            logger.error(f"Quiz parsing error: {str(parse_error)}")
            quiz_data = create_fallback_quiz(quiz_id, request)
        
        # Save to database
        db = await get_database()
        quiz_record = {
            "quiz_id": quiz_id,
            "user_id": user_id,
            "quiz_data": quiz_data,
            "request_params": request.dict(),
            "content_context": bool(content_context),
            "created_at": datetime.utcnow(),
            "status": "ready",
            "attempts": [],
            "analytics": {
                "generation_time": datetime.utcnow(),
                "ai_generated": True,
                "content_based": bool(content_context)
            }
        }
        
        await db.quizzes.insert_one(quiz_record)
        
        logger.info(f"Quiz {quiz_id} generated successfully")
        
    except Exception as e:
        logger.error(f"Background quiz generation error: {str(e)}")
        
        # Update status to failed
        db = await get_database()
        await db.quizzes.update_one(
            {"quiz_id": quiz_id},
            {
                "$set": {
                    "status": "failed",
                    "error": str(e),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

@router.get("/status/{quiz_id}")
async def get_quiz_status(
    quiz_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check the generation status of a quiz
    """
    try:
        db = await get_database()
        
        quiz = await db.quizzes.find_one({
            "quiz_id": quiz_id,
            "user_id": current_user.id
        })
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        return {
            "quiz_id": quiz_id,
            "status": quiz["status"],
            "created_at": quiz.get("created_at"),
            "ready": quiz["status"] == "ready",
            "error": quiz.get("error"),
            "question_count": len(quiz.get("quiz_data", {}).get("questions", []))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz status error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to check quiz status"
        )

@router.get("/{quiz_id}")
async def get_quiz(
    quiz_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a completed quiz for taking
    """
    try:
        db = await get_database()
        
        quiz = await db.quizzes.find_one({
            "quiz_id": quiz_id,
            "user_id": current_user.id
        })
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        if quiz["status"] != "ready":
            raise HTTPException(
                status_code=400, 
                detail=f"Quiz is not ready. Status: {quiz['status']}"
            )
        
        # Return quiz without answers for taking
        quiz_data = quiz["quiz_data"]
        questions_for_taking = []
        
        for question in quiz_data["questions"]:
            question_copy = question.copy()
            # Remove correct answer and explanation for quiz taking
            question_copy.pop("correct_answer", None)
            question_copy.pop("explanation", None)
            questions_for_taking.append(question_copy)
        
        return {
            "quiz_id": quiz_id,
            "title": quiz_data["title"],
            "description": quiz_data.get("description", ""),
            "questions": questions_for_taking,
            "total_questions": len(questions_for_taking),
            "total_points": sum(q.get("points", 10) for q in quiz_data["questions"]),
            "time_limit": quiz_data.get("time_limit"),
            "instructions": quiz_data.get("instructions", "Answer all questions to the best of your ability.")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz retrieval error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve quiz"
        )

@router.post("/submit")
async def submit_quiz(
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user)
):
    """
    Submit quiz answers for AI-powered evaluation
    """
    try:
        db = await get_database()
        
        # Get quiz
        quiz = await db.quizzes.find_one({
            "quiz_id": submission.quiz_id,
            "user_id": current_user.id
        })
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Evaluate answers using LLaMA
        evaluation_results = await evaluate_quiz_answers(
            quiz["quiz_data"], 
            submission.answers,
            current_user.id
        )
        
        # Calculate overall score
        total_score = sum(result["score"] for result in evaluation_results["question_results"])
        max_score = sum(q.get("points", 10) for q in quiz["quiz_data"]["questions"])
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        
        # Create attempt record
        attempt = {
            "attempt_id": f"attempt_{current_user.id}_{int(datetime.utcnow().timestamp())}",
            "user_id": current_user.id,
            "quiz_id": submission.quiz_id,
            "submitted_at": datetime.utcnow(),
            "answers": submission.answers,
            "evaluation": evaluation_results,
            "score": {
                "points": total_score,
                "max_points": max_score,
                "percentage": round(percentage, 2)
            },
            "time_taken": None,  # Could be tracked on frontend
            "feedback_generated": True
        }
        
        # Save attempt
        await db.quiz_attempts.insert_one(attempt)
        
        # Update quiz with attempt reference
        await db.quizzes.update_one(
            {"quiz_id": submission.quiz_id},
            {"$push": {"attempts": attempt["attempt_id"]}}
        )
        
        return {
            "attempt_id": attempt["attempt_id"],
            "quiz_id": submission.quiz_id,
            "score": attempt["score"],
            "evaluation": evaluation_results,
            "performance_analysis": generate_performance_analysis(evaluation_results),
            "next_steps": generate_learning_recommendations(evaluation_results, quiz["quiz_data"]),
            "submitted_at": attempt["submitted_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz submission error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit quiz: {str(e)}"
        )

@router.get("/attempts/{quiz_id}")
async def get_quiz_attempts(
    quiz_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get all attempts for a specific quiz
    """
    try:
        db = await get_database()
        
        attempts = await db.quiz_attempts.find({
            "quiz_id": quiz_id,
            "user_id": current_user.id
        }).sort("submitted_at", -1).to_list(length=10)
        
        formatted_attempts = []
        for attempt in attempts:
            formatted_attempts.append({
                "attempt_id": attempt["attempt_id"],
                "submitted_at": attempt["submitted_at"],
                "score": attempt["score"],
                "time_taken": attempt.get("time_taken"),
                "question_count": len(attempt["answers"])
            })
        
        return {
            "quiz_id": quiz_id,
            "attempts": formatted_attempts,
            "total_attempts": len(formatted_attempts)
        }
        
    except Exception as e:
        logger.error(f"Quiz attempts error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve quiz attempts"
        )

@router.get("/user-quizzes")
async def get_user_quizzes(
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """
    Get all quizzes created by the user
    """
    try:
        db = await get_database()
        
        quizzes = await db.quizzes.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        formatted_quizzes = []
        for quiz in quizzes:
            quiz_data = quiz.get("quiz_data", {})
            formatted_quizzes.append({
                "quiz_id": quiz["quiz_id"],
                "title": quiz_data.get("title", "Untitled Quiz"),
                "topic": quiz["request_params"]["topic"],
                "subject": quiz["request_params"]["subject"],
                "difficulty": quiz["request_params"]["difficulty"],
                "question_count": len(quiz_data.get("questions", [])),
                "created_at": quiz["created_at"],
                "status": quiz["status"],
                "attempt_count": len(quiz.get("attempts", [])),
                "content_based": quiz["analytics"]["content_based"]
            })
        
        total = await db.quizzes.count_documents({"user_id": current_user.id})
        
        return {
            "quizzes": formatted_quizzes,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"User quizzes error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve user quizzes"
        )

@router.delete("/{quiz_id}")
async def delete_quiz(
    quiz_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a quiz and all associated attempts
    """
    try:
        db = await get_database()
        
        # Verify ownership
        quiz = await db.quizzes.find_one({
            "quiz_id": quiz_id,
            "user_id": current_user.id
        })
        
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")
        
        # Delete quiz and attempts
        await db.quizzes.delete_one({"quiz_id": quiz_id})
        await db.quiz_attempts.delete_many({"quiz_id": quiz_id})
        
        return {
            "message": "Quiz deleted successfully",
            "quiz_id": quiz_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Quiz deletion error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete quiz"
        )

# Helper functions

async def evaluate_quiz_answers(quiz_data: Dict, user_answers: Dict[str, str], user_id: str) -> Dict[str, Any]:
    """Evaluate quiz answers using LLaMA AI"""
    
    question_results = []
    
    for question in quiz_data["questions"]:
        question_id = question["id"]
        user_answer = user_answers.get(question_id, "")
        correct_answer = question.get("correct_answer", "")
        
        # Use LLaMA to evaluate the answer
        evaluation = await llama_ai_service.evaluate_answer(
            question=question["question"],
            student_answer=user_answer,
            correct_answer=correct_answer,
            content_context=""
        )
        
        question_results.append({
            "question_id": question_id,
            "question": question["question"],
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "evaluation": evaluation,
            "score": evaluation.get("score", 0) * question.get("points", 10) / 100,
            "max_score": question.get("points", 10)
        })
    
    return {
        "question_results": question_results,
        "overall_feedback": generate_overall_feedback(question_results),
        "evaluated_at": datetime.utcnow().isoformat(),
        "ai_evaluated": True
    }

def generate_overall_feedback(question_results: List[Dict]) -> str:
    """Generate overall quiz feedback"""
    total_score = sum(result["score"] for result in question_results)
    max_score = sum(result["max_score"] for result in question_results)
    percentage = (total_score / max_score * 100) if max_score > 0 else 0
    
    if percentage >= 90:
        return "Excellent work! You demonstrated strong understanding of the material."
    elif percentage >= 80:
        return "Good job! You have a solid grasp of most concepts with room for minor improvements."
    elif percentage >= 70:
        return "Fair performance. Review the areas where you lost points and try again."
    elif percentage >= 60:
        return "You're on the right track but need more practice with these concepts."
    else:
        return "Consider reviewing the material more thoroughly before attempting similar quizzes."

def generate_performance_analysis(evaluation_results: Dict) -> Dict[str, Any]:
    """Generate detailed performance analysis"""
    question_results = evaluation_results["question_results"]
    
    # Analyze by difficulty
    difficulty_performance = {}
    concept_performance = {}
    
    for result in question_results:
        # This would require question difficulty info
        difficulty = "medium"  # Default
        concept = result.get("concept", "general")
        
        if difficulty not in difficulty_performance:
            difficulty_performance[difficulty] = {"correct": 0, "total": 0}
        if concept not in concept_performance:
            concept_performance[concept] = {"correct": 0, "total": 0}
        
        is_correct = result["evaluation"].get("is_correct", False)
        difficulty_performance[difficulty]["total"] += 1
        concept_performance[concept]["total"] += 1
        
        if is_correct:
            difficulty_performance[difficulty]["correct"] += 1
            concept_performance[concept]["correct"] += 1
    
    return {
        "difficulty_breakdown": difficulty_performance,
        "concept_breakdown": concept_performance,
        "strengths": identify_strengths(question_results),
        "areas_for_improvement": identify_improvement_areas(question_results)
    }

def identify_strengths(question_results: List[Dict]) -> List[str]:
    """Identify student strengths from quiz results"""
    strengths = []
    for result in question_results:
        if result["evaluation"].get("is_correct") and result["evaluation"].get("score", 0) >= 80:
            strengths.extend(result["evaluation"].get("strengths", []))
    
    # Remove duplicates and return top strengths
    return list(set(strengths))[:3]

def identify_improvement_areas(question_results: List[Dict]) -> List[str]:
    """Identify areas needing improvement"""
    areas = []
    for result in question_results:
        if not result["evaluation"].get("is_correct") or result["evaluation"].get("score", 0) < 70:
            areas.extend(result["evaluation"].get("areas_for_improvement", []))
    
    # Remove duplicates and return top areas
    return list(set(areas))[:3]

def generate_learning_recommendations(evaluation_results: Dict, quiz_data: Dict) -> List[str]:
    """Generate personalized learning recommendations"""
    recommendations = []
    
    # Analyze performance
    question_results = evaluation_results["question_results"]
    weak_areas = identify_improvement_areas(question_results)
    
    if weak_areas:
        recommendations.append(f"Focus on reviewing: {', '.join(weak_areas)}")
    
    # General recommendations
    recommendations.extend([
        "Practice similar questions to reinforce learning",
        "Review explanations for questions you missed",
        "Consider creating flashcards for key concepts"
    ])
    
    return recommendations[:5]

async def get_document_content(document_id: str, user_id: str) -> str:
    """Get content from uploaded document"""
    try:
        db = await get_database()
        from bson import ObjectId
        
        document = await db.documents.find_one({
            "_id": ObjectId(document_id),
            "user_id": user_id
        })
        
        if document:
            return document["content"]["text"]
        return ""
        
    except Exception as e:
        logger.error(f"Document content retrieval error: {str(e)}")
        return ""

def parse_quiz_response(response: str, quiz_id: str, request: QuizRequest) -> Dict[str, Any]:
    """Parse quiz response from LLaMA"""
    try:
        import json
        quiz_data = json.loads(response)
        
        # Ensure required fields
        if "title" not in quiz_data:
            quiz_data["title"] = f"{request.topic} Quiz"
        if "questions" not in quiz_data:
            quiz_data["questions"] = []
        
        # Add metadata
        quiz_data["metadata"] = {
            "quiz_id": quiz_id,
            "generated_at": datetime.utcnow().isoformat(),
            "ai_generated": True,
            "topic": request.topic,
            "subject": request.subject,
            "difficulty": request.difficulty
        }
        
        return quiz_data
        
    except json.JSONDecodeError:
        # Fallback to structured parsing if JSON fails
        return create_fallback_quiz(quiz_id, request)

def create_fallback_quiz(quiz_id: str, request: QuizRequest) -> Dict[str, Any]:
    """Create a basic fallback quiz when AI generation fails"""
    return {
        "title": f"{request.topic} Practice Quiz",
        "description": f"Practice quiz covering {request.topic} concepts",
        "questions": [
            {
                "id": f"q{i}",
                "type": "multiple_choice",
                "question": f"Question {i} about {request.topic}",
                "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
                "correct_answer": "A",
                "explanation": "This is a placeholder question generated due to AI processing error.",
                "difficulty": request.difficulty,
                "points": 10,
                "concept": request.topic
            }
            for i in range(1, min(request.num_questions + 1, 6))  # Max 5 fallback questions
        ],
        "metadata": {
            "quiz_id": quiz_id,
            "generated_at": datetime.utcnow().isoformat(),
            "ai_generated": False,
            "fallback": True,
            "topic": request.topic,
            "subject": request.subject,
            "difficulty": request.difficulty
        }
    }