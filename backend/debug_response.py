import asyncio
import httpx
import json

async def debug_gemini_response():
    """Debug the actual Gemini API response structure"""
    
    api_key = "AIzaSyAGUxdVfPBKPrHbYYeOc6BfxDQ4wtFB-Vw"
    model = "gemini-2.5-flash"
    
    try:
        print("🔍 Debugging Gemini API response structure...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            
            payload = {
                "contents": [
                    {
                        "parts": [
                            {
                                "text": "Explain photosynthesis in one sentence."
                            }
                        ]
                    }
                ]
            }
            
            params = {"key": api_key}
            headers = {"Content-Type": "application/json"}
            
            response = await client.post(url, json=payload, headers=headers, params=params)
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("\n📄 Full Response Structure:")
                print(json.dumps(result, indent=2))
                
                # Try to parse step by step
                print("\n🔧 Step-by-step parsing:")
                
                if "candidates" in result:
                    print(f"✅ Found candidates: {len(result['candidates'])}")
                    candidate = result["candidates"][0]
                    print(f"✅ First candidate keys: {list(candidate.keys())}")
                    
                    if "content" in candidate:
                        content = candidate["content"]
                        print(f"✅ Content keys: {list(content.keys())}")
                        
                        if "parts" in content:
                            parts = content["parts"]
                            print(f"✅ Parts: {parts}")
                            
                            if len(parts) > 0 and "text" in parts[0]:
                                text = parts[0]["text"]
                                print(f"🎉 Extracted text: {text}")
                            else:
                                print("❌ No text in first part")
                        else:
                            print("❌ No 'parts' in content")
                    else:
                        print("❌ No 'content' in candidate")
                else:
                    print("❌ No 'candidates' in result")
                    
            else:
                print(f"❌ Error: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    asyncio.run(debug_gemini_response())