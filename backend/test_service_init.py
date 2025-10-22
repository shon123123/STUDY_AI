from services.gemini_service import get_gemini_service

try:
    print("🧪 Testing Gemini service initialization...")
    service = get_gemini_service()
    print(f"✅ Service created: {type(service)}")
    print(f"✅ Has generate_summary: {hasattr(service, 'generate_summary')}")
    print(f"✅ Has analyze_content: {hasattr(service, 'analyze_content')}")
    print(f"✅ Has generate_flashcards: {hasattr(service, 'generate_flashcards')}")
    
    if service is None:
        print("❌ Service is None!")
    else:
        print("🎉 Service is properly initialized!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()