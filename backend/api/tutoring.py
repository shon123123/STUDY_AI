# AI Tutoring API Routes
# Human-like AI tutoring system using LLaMA 3.2

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import json
import logging
import uuid

from services.llama_service import llama_ai_service
from models.tutoring import TutoringRequest, TutoringResponse, TutoringSession

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tutoring", tags=["AI Tutoring"])

# Active tutoring sessions
active_sessions: Dict[str, Dict] = {}

@router.post("/start-session", response_model=TutoringResponse)
async def start_tutoring_session(
    request: TutoringRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Start a new AI tutoring session
    
    This creates a personalized tutoring experience using LLaMA 3.2
    """
    try:
        session_id = str(uuid.uuid4())
        
        # Create session record
        session = {
            "session_id": session_id,
            "user_id": current_user.id,
            "topic": request.topic,
            "subject": request.subject,
            "difficulty": request.difficulty,
            "learning_goals": request.learning_goals,
            "document_context": request.document_context,
            "started_at": datetime.utcnow(),
            "status": "active",
            "conversation_history": []
        }
        
        # Save to database
        db = await get_database()
        await db.tutoring_sessions.insert_one(session)
        
        # Store in active sessions
        active_sessions[session_id] = session
        
        # Generate welcome message using LLaMA
        welcome_prompt = f"""
        You are starting a tutoring session with a student. Create a warm, encouraging welcome message.
        
        Topic: {request.topic}
        Subject: {request.subject}
        Student Level: {request.difficulty}
        Learning Goals: {', '.join(request.learning_goals)}
        
        Your welcome should:
        - Be encouraging and supportive
        - Outline what you'll cover together
        - Ask how the student would like to begin
        - Set a positive, learning-focused tone
        """
        
        welcome_message = await llama_ai_service.tutor_conversation(
            user_message="Start tutoring session",
            user_id=current_user.id,
            session_id=session_id,
            content_context=request.document_context or ""
        )
        
        return TutoringResponse(
            session_id=session_id,
            message=welcome_message,
            session_status="active",
            next_steps=["Ask a specific question", "Request an explanation", "Start with basics"],
            learning_progress=0.0
        )
        
    except Exception as e:
        logger.error(f"Tutoring session start error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start tutoring session: {str(e)}"
        )

@router.post("/ask/{session_id}")
async def ask_tutor_question(
    session_id: str,
    question: str,
    current_user: User = Depends(get_current_user)
):
    """
    Ask the AI tutor a question in an active session
    """
    try:
        # Verify session exists and belongs to user
        if session_id not in active_sessions:
            db = await get_database()
            session = await db.tutoring_sessions.find_one({
                "session_id": session_id,
                "user_id": current_user.id
            })
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            active_sessions[session_id] = session
        
        session = active_sessions[session_id]
        
        # Get document context if available
        document_context = session.get("document_context", "")
        
        # Generate tutor response
        response = await llama_ai_service.tutor_conversation(
            user_message=question,
            user_id=current_user.id,
            session_id=session_id,
            content_context=document_context
        )
        
        # Update session history
        session["conversation_history"].append({
            "student_question": question,
            "tutor_response": response,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Update in database
        db = await get_database()
        await db.tutoring_sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"conversation_history": session["conversation_history"][-1]},
                "$set": {"last_activity": datetime.utcnow()}
            }
        )
        
        # Generate follow-up suggestions
        follow_ups = await generate_follow_up_questions(question, response, session["topic"])
        
        return {
            "session_id": session_id,
            "response": response,
            "follow_up_questions": follow_ups,
            "session_length": len(session["conversation_history"]),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tutor question error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process question: {str(e)}"
        )

@router.post("/explain/{session_id}")
async def request_concept_explanation(
    session_id: str,
    concept: str,
    explanation_type: str = "detailed",  # "simple", "detailed", "examples"
    current_user: User = Depends(get_current_user)
):
    """
    Request detailed explanation of a specific concept
    """
    try:
        # Verify session
        if session_id not in active_sessions:
            db = await get_database()
            session = await db.tutoring_sessions.find_one({
                "session_id": session_id,
                "user_id": current_user.id
            })
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            active_sessions[session_id] = session
        
        session = active_sessions[session_id]
        
        # Build explanation prompt based on type
        explanation_prompts = {
            "simple": f"Explain {concept} in {session['subject']} in the simplest terms possible for a {session['difficulty']} level student.",
            "detailed": f"Provide a comprehensive explanation of {concept} in {session['subject']} with step-by-step breakdown for a {session['difficulty']} level student.",
            "examples": f"Explain {concept} in {session['subject']} using practical examples and real-world applications for a {session['difficulty']} level student."
        }
        
        prompt = explanation_prompts.get(explanation_type, explanation_prompts["detailed"])
        
        # Generate explanation using LLaMA
        explanation = await llama_ai_service.tutor_conversation(
            user_message=prompt,
            user_id=current_user.id,
            session_id=session_id,
            content_context=session.get("document_context", "")
        )
        
        # Update session
        session["conversation_history"].append({
            "concept_request": concept,
            "explanation_type": explanation_type,
            "tutor_explanation": explanation,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Save to database
        db = await get_database()
        await db.tutoring_sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"conversation_history": session["conversation_history"][-1]},
                "$set": {"last_activity": datetime.utcnow()}
            }
        )
        
        return {
            "session_id": session_id,
            "concept": concept,
            "explanation": explanation,
            "explanation_type": explanation_type,
            "related_concepts": await get_related_concepts(concept, session["subject"]),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Concept explanation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )

@router.post("/practice/{session_id}")
async def generate_practice_problems(
    session_id: str,
    topic: str,
    num_problems: int = 3,
    current_user: User = Depends(get_current_user)
):
    """
    Generate practice problems for the student
    """
    try:
        # Verify session
        if session_id not in active_sessions:
            db = await get_database()
            session = await db.tutoring_sessions.find_one({
                "session_id": session_id,
                "user_id": current_user.id
            })
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            active_sessions[session_id] = session
        
        session = active_sessions[session_id]
        
        # Generate practice problems using LLaMA
        practice_prompt = f"""
        Create {num_problems} practice problems for {topic} in {session['subject']} 
        suitable for a {session['difficulty']} level student.
        
        For each problem, provide:
        1. The problem statement
        2. Any necessary context or setup
        3. The solution approach (but not the full answer)
        4. A hint to help the student
        
        Format as:
        Problem 1: [problem statement]
        Context: [any setup needed]
        Approach: [how to solve it]
        Hint: [helpful hint]
        """
        
        problems_response = await llama_ai_service.tutor_conversation(
            user_message=practice_prompt,
            user_id=current_user.id,
            session_id=session_id,
            content_context=session.get("document_context", "")
        )
        
        # Parse the response into structured problems
        problems = parse_practice_problems(problems_response)
        
        # Update session
        session["conversation_history"].append({
            "practice_request": topic,
            "num_problems": num_problems,
            "generated_problems": problems,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Save to database
        db = await get_database()
        await db.tutoring_sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"conversation_history": session["conversation_history"][-1]},
                "$set": {"last_activity": datetime.utcnow()}
            }
        )
        
        return {
            "session_id": session_id,
            "topic": topic,
            "problems": problems,
            "instructions": "Try solving these problems step by step. Ask for help if you get stuck!",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Practice problems error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate practice problems: {str(e)}"
        )

@router.post("/check-answer/{session_id}")
async def check_student_answer(
    session_id: str,
    problem_id: str,
    student_answer: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check and evaluate a student's answer with detailed feedback
    """
    try:
        # Verify session
        if session_id not in active_sessions:
            db = await get_database()
            session = await db.tutoring_sessions.find_one({
                "session_id": session_id,
                "user_id": current_user.id
            })
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")
            active_sessions[session_id] = session
        
        session = active_sessions[session_id]
        
        # Find the problem in session history
        problem = None
        for entry in reversed(session["conversation_history"]):
            if "generated_problems" in entry:
                for p in entry["generated_problems"]:
                    if p.get("id") == problem_id:
                        problem = p
                        break
                if problem:
                    break
        
        if not problem:
            raise HTTPException(status_code=404, detail="Problem not found in session")
        
        # Evaluate the answer using LLaMA
        evaluation = await llama_ai_service.evaluate_answer(
            question=problem["statement"],
            student_answer=student_answer,
            correct_answer=problem.get("solution", ""),
            content_context=session.get("document_context", "")
        )
        
        # Update session with evaluation
        session["conversation_history"].append({
            "answer_check": {
                "problem_id": problem_id,
                "student_answer": student_answer,
                "evaluation": evaluation,
                "timestamp": datetime.utcnow().isoformat()
            }
        })
        
        # Save to database
        db = await get_database()
        await db.tutoring_sessions.update_one(
            {"session_id": session_id},
            {
                "$push": {"conversation_history": session["conversation_history"][-1]},
                "$set": {"last_activity": datetime.utcnow()}
            }
        )
        
        return {
            "session_id": session_id,
            "problem_id": problem_id,
            "evaluation": evaluation,
            "next_steps": generate_next_steps(evaluation),
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Answer checking error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check answer: {str(e)}"
        )

@router.get("/sessions")
async def get_user_tutoring_sessions(
    current_user: User = Depends(get_current_user),
    limit: int = 10,
    skip: int = 0
):
    """
    Get user's tutoring sessions history
    """
    try:
        db = await get_database()
        
        sessions = await db.tutoring_sessions.find(
            {"user_id": current_user.id}
        ).sort("started_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Format sessions for response
        formatted_sessions = []
        for session in sessions:
            formatted_sessions.append({
                "session_id": session["session_id"],
                "topic": session["topic"],
                "subject": session["subject"],
                "difficulty": session["difficulty"],
                "started_at": session["started_at"],
                "status": session["status"],
                "conversation_length": len(session.get("conversation_history", [])),
                "learning_goals": session.get("learning_goals", [])
            })
        
        total = await db.tutoring_sessions.count_documents({"user_id": current_user.id})
        
        return {
            "sessions": formatted_sessions,
            "total": total,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        logger.error(f"Sessions retrieval error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve sessions"
        )

@router.get("/session/{session_id}")
async def get_session_details(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed information about a specific tutoring session
    """
    try:
        db = await get_database()
        
        session = await db.tutoring_sessions.find_one({
            "session_id": session_id,
            "user_id": current_user.id
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session["session_id"],
            "topic": session["topic"],
            "subject": session["subject"],
            "difficulty": session["difficulty"],
            "learning_goals": session["learning_goals"],
            "started_at": session["started_at"],
            "status": session["status"],
            "conversation_history": session.get("conversation_history", []),
            "document_context": session.get("document_context"),
            "total_interactions": len(session.get("conversation_history", []))
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session details error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve session details"
        )

@router.post("/end-session/{session_id}")
async def end_tutoring_session(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    End an active tutoring session
    """
    try:
        db = await get_database()
        
        # Update session status
        result = await db.tutoring_sessions.update_one(
            {"session_id": session_id, "user_id": current_user.id},
            {
                "$set": {
                    "status": "completed",
                    "ended_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Remove from active sessions
        if session_id in active_sessions:
            del active_sessions[session_id]
        
        return {
            "message": "Tutoring session ended successfully",
            "session_id": session_id,
            "ended_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session end error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to end session"
        )

# Helper functions

async def generate_follow_up_questions(question: str, response: str, topic: str) -> List[str]:
    """Generate contextual follow-up questions"""
    follow_ups = [
        f"Can you explain more about {topic}?",
        "Can you give me another example?",
        "How does this apply in real life?",
        "What should I study next?",
        "Can you create a practice problem for me?"
    ]
    return follow_ups[:3]

async def get_related_concepts(concept: str, subject: str) -> List[str]:
    """Get related concepts for a given concept"""
    # This would ideally use the embedding model from LLaMA service
    related = ["practice problems", "additional resources", "similar concepts"]
    return related

def parse_practice_problems(response: str) -> List[Dict[str, str]]:
    """Parse practice problems from LLaMA response"""
    problems = []
    lines = response.split('\n')
    current_problem = {}
    problem_id = 1
    
    for line in lines:
        line = line.strip()
        if line.startswith('Problem'):
            if current_problem:
                current_problem['id'] = str(problem_id - 1)
                problems.append(current_problem)
            current_problem = {'statement': line, 'id': str(problem_id)}
            problem_id += 1
        elif line.startswith('Context:'):
            current_problem['context'] = line[8:].strip()
        elif line.startswith('Approach:'):
            current_problem['approach'] = line[9:].strip()
        elif line.startswith('Hint:'):
            current_problem['hint'] = line[5:].strip()
    
    # Add the last problem
    if current_problem:
        current_problem['id'] = str(problem_id - 1)
        problems.append(current_problem)
    
    return problems

def generate_next_steps(evaluation: Dict[str, Any]) -> List[str]:
    """Generate next steps based on answer evaluation"""
    score = evaluation.get("score", 0)
    
    if score >= 90:
        return [
            "Excellent work! Try a more challenging problem",
            "Move on to the next concept",
            "Help explain this to others to reinforce your understanding"
        ]
    elif score >= 70:
        return [
            "Good understanding! Practice similar problems",
            "Review the areas for improvement mentioned",
            "Try explaining your reasoning step by step"
        ]
    else:
        return [
            "Let's review the concept together",
            "Try breaking the problem into smaller steps",
            "Ask for a simpler explanation of the key concepts"
        ]

# WebSocket support for real-time tutoring
@router.websocket("/ws/{session_id}")
async def tutoring_websocket(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time tutoring chat
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process the tutoring request
            if message_data.get("type") == "question":
                response = await llama_ai_service.tutor_conversation(
                    user_message=message_data["message"],
                    user_id=message_data["user_id"],
                    session_id=session_id,
                    content_context=""
                )
                
                # Send response back
                await websocket.send_text(json.dumps({
                    "type": "response",
                    "message": response,
                    "timestamp": datetime.utcnow().isoformat()
                }))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close()