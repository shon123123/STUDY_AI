# Gemini AI Service - Fast API-based AI for Study Assistant
# Using Google's official Generative AI library for instant responses

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import google.generativeai as genai
from pydantic import BaseModel
import os
from core.config import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

class GeminiAIService:
    """
    Fast Gemini AI Service for educational responses
    Using official Google Generative AI library
    """
    
    def __init__(self):
        self.api_key = "AIzaSyAGUxdVfPBKPrHbYYeOc6BfxDQ4wtFB-Vw"
        
        # Configure the library with API key
        genai.configure(api_key=self.api_key)
        
        # Initialize the model
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.initialized = True  # API-based, no model loading needed
        
        logger.info("🚀 Gemini AI Service initialized with official library!")
        logger.info(f"✅ Using model: gemini-2.5-flash")
        
    def is_initialized(self) -> bool:
        """Check if the service is ready"""
        return self.initialized
    
    async def generate_study_response(self, question: str, context: str = None, subject: str = None, difficulty: str = "medium", user_id: str = None) -> str:
        """Generate educational response using Gemini API"""
        
        start_time = datetime.now()
        logger.info(f"🚀 Generating Gemini response for: {question[:50]}...")
        
        try:
            # Create educational prompt with difficulty level
            prompt = f"""
You are an AI Study Assistant. Help with this {subject or 'general'} question for a {difficulty} level student:

Question: {question}

{f"Context: {context}" if context else ""}

Provide a clear, educational explanation suitable for {difficulty} level learning. Adjust your language and depth accordingly:
- Beginner: Simple language, basic concepts, step-by-step explanations
- Medium: Moderate complexity, some technical terms with explanations
- Advanced: In-depth analysis, technical terminology, comprehensive details
"""
            
            # Generate response using official library
            response = self.model.generate_content(prompt)
            
            if response.text:
                generation_time = (datetime.now() - start_time).total_seconds()
                logger.info(f"⚡ Gemini response completed in {generation_time:.2f} seconds")
                logger.info(f"📤 Generated response: {response.text[:100]}...")
                
                print(f"🎯 GEMINI RESPONSE: {response.text}")  # Print to terminal for debugging
                
                return response.text.strip()
            else:
                raise Exception("Empty response from Gemini")
                
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise e  # Don't provide fallback, let the error bubble up
    
    async def analyze_content(self, content: str, filename: str) -> Dict[str, Any]:
        """Analyze educational content using Gemini API"""
        
        logger.info(f"📊 Analyzing content from: {filename}")
        
        try:
            prompt = f"""Analyze this educational content and provide a comprehensive analysis in JSON format:

CONTENT TO ANALYZE:
{content[:8000]}

Please analyze and respond with a JSON object containing:
{{
    "subject_area": "What subject/field is this content about?",
    "difficulty_level": "Rate from 1-10 (1=beginner, 10=expert)",
    "key_concepts": ["List", "of", "main", "concepts"],
    "learning_objectives": ["What", "students", "should", "learn"],
    "prerequisite_knowledge": ["What", "students", "need", "to", "know"],
    "content_structure": "How is the information organized?",
    "teaching_approach": "Best way to teach this content",
    "assessment_ideas": ["Question", "types", "for", "testing"]
}}"""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                # Try to parse JSON response
                try:
                    analysis = json.loads(response.text)
                    logger.info(f"✅ Content analysis completed for {filename}")
                    return analysis
                except json.JSONDecodeError:
                    # If not valid JSON, return structured response
                    return {
                        "subject_area": "General",
                        "difficulty_level": "5",
                        "key_concepts": ["Content analysis", "Educational material"],
                        "learning_objectives": ["Understand the content"],
                        "prerequisite_knowledge": ["Basic reading comprehension"],
                        "content_structure": "Document-based learning material",
                        "teaching_approach": "Direct instruction",
                        "assessment_ideas": ["Reading comprehension questions"],
                        "raw_analysis": response.text
                    }
            else:
                raise Exception("Empty analysis from Gemini")
                
        except Exception as e:
            logger.error(f"Content analysis error: {e}")
            return {
                "subject_area": "Unknown",
                "difficulty_level": "5",
                "key_concepts": ["Document content"],
                "learning_objectives": ["Review material"],
                "prerequisite_knowledge": ["Basic knowledge"],
                "content_structure": "Standard document",
                "teaching_approach": "Self-study",
                "assessment_ideas": ["Review questions"],
                "error": str(e)
            }
    
    async def generate_summary(self, content: str, filename: str) -> str:
        """Generate a summary of educational content"""
        
        logger.info(f"📝 Generating summary for: {filename}")
        
        try:
            prompt = f"""Create a comprehensive summary of this educational content:

CONTENT:
{content[:8000]}

Please provide:
1. Main topic and subject area
2. Key points and concepts (bullet points)
3. Important details and examples
4. Conclusion or takeaways

Make it suitable for study notes and review."""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                logger.info(f"✅ Summary generated for {filename}")
                return response.text.strip()
            else:
                return f"Summary of {filename}: Content analysis completed. Please review the original document for detailed information."
                
        except Exception as e:
            logger.error(f"Summary generation error: {e}")
            return f"Unable to generate summary for {filename}. Error: {str(e)}"
    
    async def generate_flashcards(self, content: str, filename: str, num_cards: int = 10) -> List[Dict[str, str]]:
        """Generate flashcards from educational content"""
        
        logger.info(f"🃏 Generating {num_cards} flashcards for: {filename}")
        
        try:
            prompt = f"""Create {num_cards} educational flashcards from this content:

CONTENT:
{content[:8000]}

Generate flashcards in JSON format:
[
    {{"question": "Question 1?", "answer": "Answer 1"}},
    {{"question": "Question 2?", "answer": "Answer 2"}},
    ...
]

Focus on key concepts, definitions, and important facts. Make questions clear and answers concise but complete."""
            
            response = self.model.generate_content(prompt)
            
            if response.text:
                try:
                    # Try to extract JSON from response
                    response_text = response.text.strip()
                    if response_text.startswith('[') and response_text.endswith(']'):
                        flashcards = json.loads(response_text)
                    else:
                        # Try to find JSON in the response
                        import re
                        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                        if json_match:
                            flashcards = json.loads(json_match.group())
                        else:
                            raise ValueError("No JSON found")
                    
                    logger.info(f"✅ Generated {len(flashcards)} flashcards for {filename}")
                    return flashcards
                    
                except (json.JSONDecodeError, ValueError):
                    # Create structured flashcards from text response
                    lines = response.text.strip().split('\n')
                    flashcards = []
                    current_card = {}
                    
                    for line in lines:
                        if 'question' in line.lower() or line.startswith('Q:'):
                            if current_card:
                                flashcards.append(current_card)
                            current_card = {"question": line.replace('Q:', '').replace('Question:', '').strip()}
                        elif 'answer' in line.lower() or line.startswith('A:'):
                            current_card["answer"] = line.replace('A:', '').replace('Answer:', '').strip()
                    
                    if current_card and len(current_card) == 2:
                        flashcards.append(current_card)
                    
                    if flashcards:
                        logger.info(f"✅ Generated {len(flashcards)} flashcards for {filename}")
                        return flashcards
                    else:
                        # Fallback flashcards
                        return [
                            {"question": f"What is the main topic of {filename}?", "answer": "Review the document content for key concepts."},
                            {"question": "What are the key learning objectives?", "answer": "Analyze the content to identify main learning goals."}
                        ]
            else:
                raise Exception("Empty flashcard response from Gemini")
                
        except Exception as e:
            logger.error(f"Flashcard generation error: {e}")
            return [
                {"question": f"What is covered in {filename}?", "answer": "Review the document content."},
                {"question": "What are the main points?", "answer": "Analyze the key concepts presented."}
            ]
    
    def cleanup(self):
        """Cleanup resources (not needed for API service)"""
        logger.info("🧹 Gemini service cleanup completed")
        pass


# Global service instance
gemini_ai_service = None

def get_gemini_service() -> GeminiAIService:
    """Get or create the global Gemini service instance"""
    global gemini_ai_service
    if gemini_ai_service is None:
        gemini_ai_service = GeminiAIService()
    return gemini_ai_service

def cleanup_gemini_service():
    """Cleanup the global service"""
    global gemini_ai_service
    if gemini_ai_service:
        gemini_ai_service.cleanup()
        gemini_ai_service = None