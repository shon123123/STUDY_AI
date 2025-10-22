import asyncio
import sys
import os

# Add backend to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.gemini_service import GeminiAIService

async def test_official_gemini_library():
    """Test the new Gemini service using the official library"""
    
    print("🧪 Testing Gemini service with official Google library...")
    
    try:
        # Initialize service
        gemini_service = GeminiAIService()
        print(f"✅ Service initialized successfully!")
        
        # Test basic response
        print("\n📝 Testing basic study response...")
        response = await gemini_service.generate_study_response(
            "Explain photosynthesis in simple terms",
            context="Biology study session",
            subject="Biology"
        )
        
        print(f"📋 Response length: {len(response)} characters")
        print(f"📄 Response preview: {response[:200]}...")
        
        # Check if it's a real response
        if len(response) > 100 and "photosynthesis" in response.lower():
            print("🎉 Getting real Gemini response!")
            
            # Test content analysis
            print("\n📊 Testing content analysis...")
            analysis = await gemini_service.analyze_content(
                "Photosynthesis is the process by which plants convert light energy into chemical energy.",
                "test_content.txt"
            )
            
            print(f"📋 Analysis keys: {list(analysis.keys())}")
            print(f"📄 Subject area: {analysis.get('subject_area', 'Unknown')}")
            
            return True
        else:
            print("⚠️  Response seems too short or generic")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_official_gemini_library())
    if success:
        print("\n✅ Official Gemini library is working perfectly!")
    else:
        print("\n❌ Official Gemini library has issues")