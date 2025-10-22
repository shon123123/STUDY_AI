import asyncio
import httpx

async def test_gemini_api():
    api_key = "AIzaSyAGUxdVfPBKPrHbYYeOc6BfxDQ4wtFB-Vw"
    
    # Test different model names
    models_to_test = [
        "gemini-pro",
        "gemini-1.5-pro",
        "gemini-1.0-pro"  
    ]
    
    for model_name in models_to_test:
        try:
            print(f"\n🧪 Testing model: {model_name}")
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": "Hello, how are you?"
                                }
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 100,
                    }
                }
                
                headers = {
                    "Content-Type": "application/json",
                }
                
                params = {
                    "key": api_key
                }
                
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                    params=params
                )
                
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        text = result["candidates"][0]["content"]["parts"][0]["text"]
                        print(f"✅ SUCCESS! Response: {text[:100]}...")
                        return model_name
                    else:
                        print("❌ No candidates in response")
                else:
                    print(f"❌ Error: {response.text}")
                    
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    return None

if __name__ == "__main__":
    working_model = asyncio.run(test_gemini_api())
    if working_model:
        print(f"\n🎉 Working model found: {working_model}")
    else:
        print("\n💥 No working models found")