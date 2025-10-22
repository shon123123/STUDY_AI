# Gemini AI Service - Fast API-based AI for Study Assistant
# Using Google's Gemini API for instant responses

import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import httpx
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
    Replaces slow local LLaMA 3.2 with instant API calls
    """
    
    def __init__(self):
        self.api_key = "AIzaSyAGUxdVfPBKPrHbYYeOc6BfxDQ4wtFB-Vw"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        self.model_name = "gemini-1.5-flash"  # Stable model without thinking tokens overhead
        self.initialized = True  # API-based, no model loading needed
        
    async def initialize(self):
        """No initialization needed for API-based service"""
        logger.info("✅ Gemini API service ready - no model loading required!")
        return True
    
    async def generate_study_response(
        self,
        question: str,
        context: Optional[str] = None,
        subject: Optional[str] = None,
        difficulty: str = "intermediate",
        user_id: Optional[str] = None
    ) -> str:
        """Generate educational response using Gemini API (FAST!)"""
        
        try:
            logger.info(f"🚀 Generating Gemini response for: {question[:50]}...")
            start_time = datetime.now()
            
            # Build concise educational prompt for Gemini
            system_prompt = f"""You are a study assistant. Answer this question clearly for {difficulty} level students:

{question}

Context: {context or 'General study'}"""

            # Make API call to Gemini
            async with httpx.AsyncClient(timeout=30.0) as client:
                url = f"{self.base_url}/{self.model_name}:generateContent"
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": system_prompt
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1000,
                    }
                }
                
                headers = {
                    "Content-Type": "application/json",
                }
                
                params = {
                    "key": self.api_key
                }
                
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params=params
                )
                
                if response.status_code != 200:
                    logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                    raise Exception(f"Gemini API error: {response.status_code}")
                
                result = response.json()
                
                # Debug: Print the actual response structure
                import json
                logger.info(f"🔍 Full API response: {json.dumps(result, indent=2)}")
                
                # Extract the generated text with robust error handling
                if "candidates" in result and len(result["candidates"]) > 0:
                    candidate = result["candidates"][0]
                    
                    # Check for MAX_TOKENS finish reason
                    if candidate.get("finishReason") == "MAX_TOKENS":
                        logger.warning("Response truncated due to MAX_TOKENS limit")
                    
                    # Navigate through the response structure safely
                    if "content" in candidate and "parts" in candidate["content"] and len(candidate["content"]["parts"]) > 0:
                        if "text" in candidate["content"]["parts"][0]:
                            generated_text = candidate["content"]["parts"][0]["text"]
                            
                            generation_time = (datetime.now() - start_time).total_seconds()
                            logger.info(f"⚡ Gemini response completed in {generation_time:.2f} seconds")
                            logger.info(f"📤 Generated response: {generated_text[:100]}...")
                            
                            print(f"🎯 GEMINI RESPONSE: {generated_text}")  # Print to terminal for debugging
                            
                            return generated_text.strip()
                        else:
                            raise Exception("No text found in response parts")
                    else:
                        # Handle case where content exists but no parts (MAX_TOKENS issue)
                        if candidate.get("finishReason") == "MAX_TOKENS":
                            raise Exception("Response was truncated due to token limit - try a shorter question")
                        else:
                            raise Exception("Invalid response structure: missing content or parts")
                else:
                    raise Exception("No candidates found in response")
                    
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            # Simple fallback response
            fallback = f"I'm here to help you learn about '{question}'. Let me provide some guidance on this topic. Could you provide more specific details about what you'd like to understand?"
            print(f"🎯 FALLBACK RESPONSE: {fallback}")
            return fallback
    
    async def analyze_content(self, content: str, filename: str) -> Dict[str, Any]:
        """Analyze educational content using Gemini API"""
        
        analysis_prompt = f"""Analyze this educational content and provide a comprehensive analysis in JSON format:

CONTENT TO ANALYZE:
{content[:8000]}  # More content for Gemini API

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
}}

Respond ONLY with valid JSON."""

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                url = f"{self.base_url}/{self.model_name}:generateContent"
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": analysis_prompt
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.3,  # Lower for more structured output
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1000,
                    }
                }
                
                headers = {
                    "Content-Type": "application/json",
                }
                
                params = {
                    "key": self.api_key
                }
                
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        analysis_text = result["candidates"][0]["content"]["parts"][0]["text"]
                        
                        # Try to parse JSON
                        try:
                            analysis = json.loads(analysis_text.strip())
                            
                            # Add metadata
                            analysis['processing_metadata'] = {
                                'filename': filename,
                                'processed_at': datetime.utcnow().isoformat(),
                                'content_length': len(content),
                                'ai_model': 'gemini-1.5-flash',
                                'processing_time': datetime.utcnow().isoformat()
                            }
                            
                            return analysis
                            
                        except json.JSONDecodeError:
                            logger.warning("Gemini didn't return valid JSON, using fallback")
                            
        except Exception as e:
            logger.error(f"Gemini content analysis error: {e}")
        
        # Fallback analysis
        return {
            'subject_area': 'General',
            'difficulty_level': 5,
            'key_concepts': self._extract_keywords(content),
            'learning_objectives': ['Understand the main concepts presented'],
            'prerequisite_knowledge': ['Basic understanding of the subject'],
            'content_structure': 'Sequential presentation',
            'teaching_approach': 'Step-by-step explanation',
            'assessment_ideas': ['Multiple choice questions', 'Short answer questions'],
            'processing_metadata': {
                'filename': filename,
                'processed_at': datetime.utcnow().isoformat(),
                'content_length': len(content),
                'ai_model': 'gemini-fallback',
                'fallback_analysis': True
            }
        }
    
    async def generate_summary(self, content: str) -> str:
        """Generate content summary using Gemini API"""
        
        summary_prompt = f"""Create a comprehensive yet concise summary of this educational content. Focus on the key points and main ideas that students should understand:

CONTENT:
{content[:6000]}

Please provide a clear, well-structured summary that:
- Captures the main points and key information
- Is suitable for study and review purposes  
- Uses clear, educational language
- Organizes information logically
- Highlights the most important concepts

Summary:"""

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                url = f"{self.base_url}/{self.model_name}:generateContent"
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": summary_prompt
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.4,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 800,
                    }
                }
                
                headers = {
                    "Content-Type": "application/json",
                }
                
                params = {
                    "key": self.api_key
                }
                
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
                        
        except Exception as e:
            logger.error(f"Gemini summary error: {e}")
        
        return "Summary: This content covers important educational material. Please review the original document for detailed information."
    
    async def generate_flashcards(self, content: str, num_cards: int = 10) -> str:
        """Generate flashcards using Gemini API"""
        
        flashcard_prompt = f"""Create {num_cards} educational flashcards from this content. Focus on key concepts, important facts, and testable information:

CONTENT:
{content[:5000]}

Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]

Focus on:
- Key concepts and definitions
- Important facts and figures  
- Cause and effect relationships
- Problem-solving steps
- Critical thinking questions

Generate {num_cards} flashcards:"""

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                url = f"{self.base_url}/{self.model_name}:generateContent"
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": flashcard_prompt
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.6,
                        "topK": 40,
                        "topP": 0.95,
                        "maxOutputTokens": 1200,
                    }
                }
                
                headers = {
                    "Content-Type": "application/json",
                }
                
                params = {
                    "key": self.api_key
                }
                
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
                        
        except Exception as e:
            logger.error(f"Gemini flashcard error: {e}")
        
        return """Q: What is the main topic of this content?
A: Please review the original document for specific details.

Q: What are the key concepts covered?
A: Refer to the content for important concepts and ideas."""
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Simple keyword extraction fallback"""
        words = text.lower().split()
        # Filter out common words and get unique keywords
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'}
        keywords = [word for word in set(words) if len(word) > 3 and word not in common_words]
        return keywords[:15]  # Top 15 keywords
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get current service status"""
        return {
            "service_name": "Gemini AI Service",
            "model_name": self.model_name,
            "api_based": True,
            "initialized": self.initialized,
            "fast_responses": True,
            "cost_per_request": "~$0.001",
            "response_time": "1-3 seconds"
        }

# Create singleton instance
gemini_ai_service = GeminiAIService()