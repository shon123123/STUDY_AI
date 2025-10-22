import asyncio
import httpx

async def list_gemini_models():
    api_key = "AIzaSyAGUxdVfPBKPrHbYYeOc6BfxDQ4wtFB-Vw"
    
    try:
        print("🔍 Listing available Gemini models...")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = "https://generativelanguage.googleapis.com/v1beta/models"
            
            params = {
                "key": api_key
            }
            
            response = await client.get(url, params=params)
            
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print("\n📋 Available models:")
                
                for model in result.get("models", []):
                    name = model.get("name", "Unknown")
                    display_name = model.get("displayName", "Unknown")
                    supported_methods = model.get("supportedGenerationMethods", [])
                    
                    # Clean up the model name (remove models/ prefix)
                    clean_name = name.replace("models/", "") if name.startswith("models/") else name
                    
                    print(f"  • {clean_name}")
                    print(f"    Display Name: {display_name}")
                    print(f"    Supported Methods: {', '.join(supported_methods)}")
                    print()
                    
                # Find models that support generateContent
                content_models = []
                for model in result.get("models", []):
                    if "generateContent" in model.get("supportedGenerationMethods", []):
                        clean_name = model.get("name", "").replace("models/", "")
                        content_models.append(clean_name)
                
                if content_models:
                    print("🎯 Models supporting generateContent:")
                    for model in content_models:
                        print(f"  ✅ {model}")
                    return content_models[0]  # Return the first working model
                else:
                    print("❌ No models support generateContent")
                    
            else:
                print(f"❌ Error: {response.text}")
                
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    return None

if __name__ == "__main__":
    working_model = asyncio.run(list_gemini_models())
    if working_model:
        print(f"\n🎉 Recommended model: {working_model}")
    else:
        print("\n💥 No suitable models found")