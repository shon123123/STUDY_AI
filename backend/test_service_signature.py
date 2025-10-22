import sys
import inspect
from services.gemini_service import GeminiAIService

print("🔍 Checking GeminiAIService method signature...")

# Get the method signature
method = GeminiAIService.generate_study_response
sig = inspect.signature(method)

print(f"Method signature: {sig}")
print(f"Parameters: {list(sig.parameters.keys())}")

# Check if difficulty parameter exists
if 'difficulty' in sig.parameters:
    print("✅ 'difficulty' parameter found in method signature")
else:
    print("❌ 'difficulty' parameter NOT found in method signature")
    print("Available parameters:", list(sig.parameters.keys()))

# Test instantiation
try:
    service = GeminiAIService()
    print("✅ Service instantiated successfully")
except Exception as e:
    print(f"❌ Service instantiation failed: {e}")