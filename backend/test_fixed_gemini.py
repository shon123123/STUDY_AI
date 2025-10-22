import asyncio
import sys
import os

# Add backend to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.gemini_service import GeminiAIService

async def test_gemini_with_correct_model():
    """Test Gemini service with the correct model name"""
    
    print("🧪 Testing Gemini service with correct model...")
    
    try:
        # Initialize service
        gemini_service = GeminiAIService()
        print(f"✅ Service initialized with model: {gemini_service.model_name}")
        
        # Test basic response
        print("\n📝 Testing basic study response...")
        response = await gemini_service.generate_study_response(
            "Explain photosynthesis in simple terms",
            context="Biology study session"
        )
        
        print(f"📋 Response length: {len(response)} characters")
        print(f"📄 Response preview: {response[:200]}...")
        
        # Check if it's a real response (not fallback)
        if "I'm here to help" in response and len(response) < 500:
            print("⚠️  Still getting fallback response")
            return False
        else:
            print("🎉 Getting real Gemini response!")
            return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_gemini_with_correct_model())
    if success:
        print("\n✅ Gemini service is working correctly!")
    else:
        print("\n❌ Gemini service still has issues")