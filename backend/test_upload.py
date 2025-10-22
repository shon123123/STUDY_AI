import asyncio
import traceback
from services.document_processor import DocumentProcessor
from io import BytesIO
from fastapi import UploadFile

async def test_document_upload():
    """Test actual document upload to reproduce the error"""
    
    print("🧪 Testing document upload process...")
    
    try:
        # Create a simple text file for testing
        test_content = b"Photosynthesis is the process by which plants convert sunlight into energy. This process occurs in chloroplasts and involves converting carbon dioxide and water into glucose using light energy."
        
        # Create a mock UploadFile
        test_file = UploadFile(
            filename="test_document.txt",
            file=BytesIO(test_content)
        )
        
        # Initialize document processor
        doc_processor = DocumentProcessor()
        
        # Process the document
        print("📄 Processing document...")
        result = await doc_processor.process_document(test_file, "test_user")
        
        print("✅ Document processed successfully!")
        print(f"📊 Result keys: {list(result.keys())}")
        
        if 'study_materials' in result:
            materials = result['study_materials']
            print(f"📚 Study materials keys: {list(materials.keys())}")
            
            if 'flashcards' in materials:
                flashcards = materials['flashcards']
                print(f"🃏 Generated {len(flashcards)} flashcards")
                if flashcards:
                    print(f"📝 First flashcard: {flashcards[0]}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("🔍 Full traceback:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_document_upload())