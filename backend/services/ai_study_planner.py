# AI Study Planner Service
# Intelligent study scheduling, personalized learning paths, and progress optimization

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from enum import Enum
import math
from dataclasses import dataclass
from services.gemini_service import get_gemini_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StudyDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    VERY_HARD = "very_hard"

class StudyType(str, Enum):
    READING = "reading"
    FLASHCARDS = "flashcards"
    PRACTICE = "practice"
    REVIEW = "review"
    QUIZ = "quiz"
    PROJECT = "project"

@dataclass
class StudySession:
    """Represents a single study session"""
    id: str
    subject: str
    topic: str
    duration_minutes: int
    difficulty: StudyDifficulty
    study_type: StudyType
    scheduled_time: datetime
    completed: bool = False
    effectiveness_score: Optional[float] = None
    notes: Optional[str] = None

@dataclass
class LearningGoal:
    """Represents a learning objective"""
    id: str
    title: str
    description: str
    target_completion: datetime
    priority: int  # 1-5, 5 being highest
    progress: float  # 0.0 to 1.0
    estimated_hours: float
    subject_area: str

class AIStudyPlanner:
    """
    Advanced AI-powered study planner that creates personalized learning schedules
    """
    
    def __init__(self):
        self.gemini_service = get_gemini_service()
        self.initialized = True
        logger.info("🧠 AI Study Planner initialized")
    
    async def create_personalized_study_plan(self, 
                                           user_id: str,
                                           available_hours_per_day: float,
                                           learning_goals: List[Dict[str, Any]],
                                           current_knowledge: List[Dict[str, Any]],
                                           learning_style: str = "balanced",
                                           study_preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a comprehensive personalized study plan using AI analysis
        """
        logger.info(f"🎯 Creating personalized study plan for user {user_id}")
        
        try:
            # Analyze learning goals and create optimal schedule
            plan_analysis = await self._analyze_learning_requirements(
                learning_goals, current_knowledge, available_hours_per_day
            )
            
            # Generate AI-powered study schedule
            study_schedule = await self._generate_optimal_schedule(
                plan_analysis, learning_style, study_preferences
            )
            
            # Create learning path recommendations
            learning_paths = await self._generate_learning_paths(
                learning_goals, current_knowledge
            )
            
            # Generate study tips and strategies
            study_strategies = await self._generate_study_strategies(
                learning_style, plan_analysis
            )
            
            return {
                "user_id": user_id,
                "plan_created": datetime.now().isoformat(),
                "analysis": plan_analysis,
                "schedule": study_schedule,
                "learning_paths": learning_paths,
                "study_strategies": study_strategies,
                "estimated_completion": self._calculate_completion_date(
                    available_hours_per_day, plan_analysis["total_estimated_hours"]
                ),
                "success_probability": plan_analysis.get("success_probability", 0.85)
            }
            
        except Exception as e:
            logger.error(f"Error creating study plan: {e}")
            return self._generate_fallback_plan(user_id, available_hours_per_day)
    
    async def _analyze_learning_requirements(self, 
                                           learning_goals: List[Dict[str, Any]], 
                                           current_knowledge: List[Dict[str, Any]],
                                           available_hours: float) -> Dict[str, Any]:
        """Analyze learning requirements using AI"""
        
        goals_text = json.dumps(learning_goals, indent=2)
        knowledge_text = json.dumps(current_knowledge, indent=2)
        
        prompt = f"""Analyze these learning goals and current knowledge to create an optimal study plan:

LEARNING GOALS:
{goals_text}

CURRENT KNOWLEDGE:
{knowledge_text}

AVAILABLE STUDY TIME: {available_hours} hours per day

Please analyze and provide:
1. Total estimated study hours needed
2. Priority ordering of goals
3. Knowledge gaps identification
4. Difficulty assessment for each goal
5. Recommended study sequence
6. Success probability estimation

Format response as JSON:
{{
    "total_estimated_hours": number,
    "priority_goals": [list of goals ordered by priority],
    "knowledge_gaps": [list of identified gaps],
    "difficulty_breakdown": {{"easy": hours, "medium": hours, "hard": hours}},
    "study_sequence": [recommended order],
    "success_probability": 0.0-1.0,
    "key_insights": [important observations]
}}"""

        try:
            response = await self.gemini_service.generate_study_response(
                question=prompt,
                context="Study Plan Analysis",
                difficulty="medium"
            )
            
            # Try to parse JSON response
            analysis = self._parse_ai_response(response, {
                "total_estimated_hours": available_hours * 30,  # 30 days default
                "priority_goals": learning_goals,
                "knowledge_gaps": ["General review needed"],
                "difficulty_breakdown": {"easy": 0.3, "medium": 0.5, "hard": 0.2},
                "study_sequence": [goal.get("title", f"Goal {i}") for i, goal in enumerate(learning_goals)],
                "success_probability": 0.75,
                "key_insights": ["Consistent daily study is key to success"]
            })
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error in learning analysis: {e}")
            return self._get_default_analysis(learning_goals, available_hours)
    
    async def _generate_optimal_schedule(self, 
                                       analysis: Dict[str, Any],
                                       learning_style: str,
                                       preferences: Dict[str, Any] = None) -> Dict[str, Any]:
        """Generate optimal study schedule using AI recommendations"""
        
        schedule_prompt = f"""Create an optimal daily study schedule based on this analysis:

ANALYSIS: {json.dumps(analysis, indent=2)}
LEARNING STYLE: {learning_style}
PREFERENCES: {json.dumps(preferences or {}, indent=2)}

Create a 7-day weekly schedule with:
1. Daily study sessions (time, subject, duration, type)
2. Breaks and rest periods
3. Review sessions
4. Progress checkpoints
5. Flexibility for adjustments

Format as JSON:
{{
    "weekly_schedule": {{
        "monday": [list of sessions],
        "tuesday": [list of sessions],
        ...
    }},
    "session_template": {{
        "time": "HH:MM",
        "subject": "topic",
        "duration_minutes": number,
        "type": "reading|practice|review|quiz",
        "difficulty": "easy|medium|hard",
        "break_after": number
    }},
    "optimization_tips": [helpful tips]
}}"""

        try:
            response = await self.gemini_service.generate_study_response(
                question=schedule_prompt,
                context="Schedule Optimization",
                difficulty="medium"
            )
            
            schedule = self._parse_ai_response(response, self._get_default_schedule())
            return schedule
            
        except Exception as e:
            logger.error(f"Error generating schedule: {e}")
            return self._get_default_schedule()
    
    async def _generate_learning_paths(self, 
                                     goals: List[Dict[str, Any]], 
                                     knowledge: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate personalized learning paths"""
        
        paths_prompt = f"""Create personalized learning paths for these goals:

GOALS: {json.dumps(goals, indent=2)}
CURRENT KNOWLEDGE: {json.dumps(knowledge, indent=2)}

Create 3-5 learning paths with:
1. Prerequisites
2. Step-by-step progression
3. Estimated timeline
4. Key milestones
5. Assessment checkpoints

Format as JSON array of paths."""

        try:
            response = await self.gemini_service.generate_study_response(
                question=paths_prompt,
                context="Learning Path Generation",
                difficulty="medium"
            )
            
            paths = self._parse_ai_response(response, self._get_default_paths())
            return paths if isinstance(paths, list) else [paths]
            
        except Exception as e:
            logger.error(f"Error generating learning paths: {e}")
            return self._get_default_paths()
    
    async def _generate_study_strategies(self, 
                                       learning_style: str, 
                                       analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized study strategies and tips"""
        
        strategies_prompt = f"""Create personalized study strategies for:

LEARNING STYLE: {learning_style}
ANALYSIS: {json.dumps(analysis, indent=2)}

Provide:
1. Study techniques tailored to learning style
2. Memory enhancement strategies
3. Time management tips
4. Motivation techniques
5. Progress tracking methods
6. Stress management advice

Format as JSON with categorized strategies."""

        try:
            response = await self.gemini_service.generate_study_response(
                question=strategies_prompt,
                context="Study Strategy Generation",
                difficulty="medium"
            )
            
            strategies = self._parse_ai_response(response, self._get_default_strategies())
            return strategies
            
        except Exception as e:
            logger.error(f"Error generating strategies: {e}")
            return self._get_default_strategies()
    
    async def optimize_study_session(self, 
                                   user_id: str,
                                   current_energy: int,  # 1-10 scale
                                   available_time: int,  # minutes
                                   subject_preferences: List[str] = None) -> Dict[str, Any]:
        """Optimize current study session based on real-time factors"""
        
        optimization_prompt = f"""Optimize this study session:

USER ENERGY LEVEL: {current_energy}/10
AVAILABLE TIME: {available_time} minutes
SUBJECT PREFERENCES: {subject_preferences or ['Any']}

Recommend:
1. Best study activity type
2. Optimal session structure
3. Break timing
4. Difficulty level to target
5. Focus techniques

Provide as JSON with specific recommendations."""

        try:
            response = await self.gemini_service.generate_study_response(
                question=optimization_prompt,
                context="Session Optimization",
                difficulty="medium"
            )
            
            optimization = self._parse_ai_response(response, {
                "recommended_activity": "review",
                "session_structure": ["5min warmup", "20min focus", "5min break", "repeat"],
                "break_timing": "every 25 minutes",
                "target_difficulty": "medium",
                "focus_techniques": ["Pomodoro technique", "Active recall"]
            })
            
            return optimization
            
        except Exception as e:
            logger.error(f"Error optimizing session: {e}")
            return self._get_default_optimization()
    
    async def track_progress_and_adapt(self, 
                                     user_id: str,
                                     completed_sessions: List[Dict[str, Any]],
                                     performance_data: Dict[str, Any]) -> Dict[str, Any]:
        """Track progress and adapt study plan based on performance"""
        
        progress_prompt = f"""Analyze study progress and adapt plan:

COMPLETED SESSIONS: {json.dumps(completed_sessions[-10:], indent=2)}  # Last 10 sessions
PERFORMANCE DATA: {json.dumps(performance_data, indent=2)}

Analyze and provide:
1. Progress assessment
2. Learning velocity calculation
3. Difficulty adjustment recommendations
4. Schedule modifications
5. New learning strategies if needed
6. Achievement recognition

Format as JSON with actionable insights."""

        try:
            response = await self.gemini_service.generate_study_response(
                question=progress_prompt,
                context="Progress Analysis",
                difficulty="medium"
            )
            
            progress_analysis = self._parse_ai_response(response, {
                "progress_score": 0.7,
                "learning_velocity": "good",
                "recommendations": ["Continue current pace", "Add more practice sessions"],
                "achievements": ["Consistent daily study"],
                "areas_for_improvement": ["Time management"]
            })
            
            return progress_analysis
            
        except Exception as e:
            logger.error(f"Error tracking progress: {e}")
            return self._get_default_progress()
    
    def _parse_ai_response(self, response: str, fallback: Any) -> Any:
        """Parse AI response, return fallback if parsing fails"""
        try:
            # Try to find JSON in response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            
            # Try array format
            array_match = re.search(r'\[.*\]', response, re.DOTALL)
            if array_match:
                return json.loads(array_match.group())
                
            return fallback
        except:
            return fallback
    
    def _calculate_completion_date(self, hours_per_day: float, total_hours: float) -> str:
        """Calculate estimated completion date"""
        days_needed = math.ceil(total_hours / hours_per_day)
        completion_date = datetime.now() + timedelta(days=days_needed)
        return completion_date.isoformat()
    
    def _generate_fallback_plan(self, user_id: str, available_hours: float) -> Dict[str, Any]:
        """Generate basic fallback study plan"""
        return {
            "user_id": user_id,
            "plan_created": datetime.now().isoformat(),
            "analysis": self._get_default_analysis([], available_hours),
            "schedule": self._get_default_schedule(),
            "learning_paths": self._get_default_paths(),
            "study_strategies": self._get_default_strategies(),
            "estimated_completion": self._calculate_completion_date(available_hours, 40),
            "success_probability": 0.75
        }
    
    def _get_default_analysis(self, goals: List, hours: float) -> Dict[str, Any]:
        """Default analysis fallback"""
        return {
            "total_estimated_hours": hours * 14,  # 2 weeks
            "priority_goals": goals[:3] if goals else [{"title": "General Study"}],
            "knowledge_gaps": ["Foundational concepts", "Practice exercises"],
            "difficulty_breakdown": {"easy": 0.3, "medium": 0.5, "hard": 0.2},
            "study_sequence": ["Foundation", "Core concepts", "Advanced topics", "Practice"],
            "success_probability": 0.78,
            "key_insights": ["Consistent practice is key", "Focus on fundamentals first"]
        }
    
    def _get_default_schedule(self) -> Dict[str, Any]:
        """Default schedule fallback"""
        return {
            "weekly_schedule": {
                "monday": [
                    {"time": "09:00", "subject": "Morning Review", "duration_minutes": 30, "type": "review", "difficulty": "easy"},
                    {"time": "14:00", "subject": "Core Learning", "duration_minutes": 60, "type": "reading", "difficulty": "medium"},
                    {"time": "19:00", "subject": "Practice", "duration_minutes": 45, "type": "practice", "difficulty": "medium"}
                ],
                "tuesday": [
                    {"time": "09:00", "subject": "Flashcard Review", "duration_minutes": 25, "type": "flashcards", "difficulty": "easy"},
                    {"time": "14:00", "subject": "New Concepts", "duration_minutes": 50, "type": "reading", "difficulty": "medium"},
                    {"time": "19:00", "subject": "Quiz Practice", "duration_minutes": 30, "type": "quiz", "difficulty": "medium"}
                ]
                # Continue for other days...
            },
            "optimization_tips": [
                "Take 5-10 minute breaks between sessions",
                "Study harder subjects when energy is highest",
                "Review previous day's material each morning"
            ]
        }
    
    def _get_default_paths(self) -> List[Dict[str, Any]]:
        """Default learning paths"""
        return [
            {
                "name": "Foundation Building",
                "description": "Build strong fundamentals",
                "steps": ["Basic concepts", "Core principles", "Application practice"],
                "estimated_weeks": 2,
                "difficulty": "beginner"
            },
            {
                "name": "Skill Development",
                "description": "Develop practical skills",
                "steps": ["Guided practice", "Independent work", "Project application"],
                "estimated_weeks": 3,
                "difficulty": "intermediate"
            }
        ]
    
    def _get_default_strategies(self) -> Dict[str, Any]:
        """Default study strategies"""
        return {
            "memory_techniques": ["Spaced repetition", "Active recall", "Visualization"],
            "time_management": ["Pomodoro technique", "Time blocking", "Priority matrix"],
            "motivation": ["Goal setting", "Progress tracking", "Reward systems"],
            "focus_techniques": ["Eliminate distractions", "Single-tasking", "Mindfulness"],
            "stress_management": ["Regular breaks", "Exercise", "Adequate sleep"]
        }
    
    def _get_default_optimization(self) -> Dict[str, Any]:
        """Default session optimization"""
        return {
            "recommended_activity": "active_reading",
            "session_structure": ["5min setup", "25min focused work", "5min break"],
            "break_timing": "every 25-30 minutes",
            "target_difficulty": "medium",
            "focus_techniques": ["Remove distractions", "Set clear goals"]
        }
    
    def _get_default_progress(self) -> Dict[str, Any]:
        """Default progress tracking"""
        return {
            "progress_score": 0.75,
            "learning_velocity": "steady",
            "recommendations": ["Maintain current pace", "Focus on weak areas"],
            "achievements": ["Consistent study habits"],
            "areas_for_improvement": ["Time management", "Active recall practice"]
        }


# Global service instance
ai_study_planner = None

def get_ai_study_planner() -> AIStudyPlanner:
    """Get or create the global AI study planner instance"""
    global ai_study_planner
    if ai_study_planner is None:
        ai_study_planner = AIStudyPlanner()
    return ai_study_planner