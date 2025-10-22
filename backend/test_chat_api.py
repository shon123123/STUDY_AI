import asyncio
import httpx

async def test_chat_api():
    """Test the chat API endpoint"""
    
    print("💬 Testing chat API...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Test chat endpoint
            chat_payload = {
                "message": "Explain photosynthesis briefly",
                "subject": "Biology",
                "difficulty": "beginner"
            }
            
            response = await client.post(
                "http://localhost:8000/api/tutoring/chat",
                json=chat_payload
            )
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Chat response: {result.get('response', '')[:200]}...")
                return True
            else:
                print(f"❌ Error: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_chat_api())
    if success:
        print("\n🎉 Chat API is working!")
    else:
        print("\n💥 Chat API has issues")