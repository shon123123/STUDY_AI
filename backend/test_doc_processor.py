import asyncio
from services.document_processor import DocumentProcessor
from services.gemini_service import get_gemini_service

async def test_document_processor():
    """Test document processor with Gemini service"""
    
    print("🧪 Testing document processor integration...")
    
    try:
        # Test service directly
        print("1. Testing Gemini service...")
        gemini_service = get_gemini_service()
        print(f"✅ Gemini service: {type(gemini_service)}")
        
        # Test document processor
        print("2. Testing document processor...")
        doc_processor = DocumentProcessor()
        print(f"✅ Document processor: {type(doc_processor)}")
        
        # Test the generate_summary method that's failing
        print("3. Testing generate_summary...")
        test_text = "Photosynthesis is the process by which plants convert sunlight into energy."
        
        summary = await gemini_service.generate_summary(test_text, "test.txt")
        print(f"✅ Direct summary call: {summary[:100]}...")
        
        print("🎉 All tests passed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_document_processor())