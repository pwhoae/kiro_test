"""Simple test to verify frontend can reach the chatbot service."""
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "shopping-assistant-chatbot-test",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "note": "This is a test server - AWS credentials not required"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Mock chat endpoint for testing."""
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('sessionId', 'test-session')
        
        # Simulate processing delay
        time.sleep(1)
        
        # Generate mock response based on message
        if 'product' in message.lower() or 'show' in message.lower():
            reply = """I found some great products for you! 🛍️

📱 Smartphone (ID: 1)
   Category: Electronics
   Price: $699.99
   High-performance smartphone with amazing camera

💻 Laptop (ID: 2)
   Category: Electronics
   Price: $1299.99
   Powerful laptop for work and gaming

🎧 Wireless Headphones (ID: 3)
   Category: Electronics
   Price: $199.99
   Premium sound quality with noise cancellation

Note: This is a TEST response. Connect to AWS Bedrock for real AI responses!"""
        
        elif 'cart' in message.lower() and 'add' in message.lower():
            reply = "✅ Added 1x 📱 Smartphone to your cart!\nPrice: $699.99 each\nSubtotal: $699.99\n\n(TEST MODE - No actual cart modification)"
        
        elif 'cart' in message.lower() and ('view' in message.lower() or 'show' in message.lower()):
            reply = """🛒 Your Shopping Cart:

📱 Smartphone (ID: 1)
   Quantity: 1
   Price: $699.99 each
   Subtotal: $699.99

💰 Total: $699.99

(TEST MODE - Showing mock data)"""
        
        elif 'recommend' in message.lower():
            reply = """Based on your interests, here are my recommendations:

🎮 Gaming Console (ID: 10)
   Category: Electronics
   Price: $499.99
   Latest generation gaming console

📷 Digital Camera (ID: 15)
   Category: Electronics
   Price: $899.99
   Professional-grade camera

(TEST MODE - Mock recommendations)"""
        
        else:
            reply = f"""Hello! I'm your shopping assistant (TEST MODE). 

I can help you:
• Browse products - try "show me products"
• Add to cart - try "add product 1 to cart"
• View cart - try "show my cart"
• Get recommendations - try "recommend products"

You said: "{message}"

⚠️ This is TEST MODE. To get real AI responses, configure AWS credentials in .env file and run: python main.py"""
        
        return jsonify({
            "reply": reply,
            "sessionId": session_id,
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            "error": {
                "code": "PROCESSING_ERROR",
                "message": f"Test server error: {str(e)}"
            }
        }), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🧪 CHATBOT TEST SERVER")
    print("=" * 60)
    print("This is a TEST server that doesn't require AWS credentials.")
    print("It will respond with mock data to test the frontend integration.")
    print("")
    print("Server running on: http://localhost:5001")
    print("Frontend should be on: http://localhost:3000")
    print("")
    print("To use the REAL chatbot with AI:")
    print("1. Configure AWS credentials in .env file")
    print("2. Run: python main.py")
    print("=" * 60)
    print("")
    
    app.run(host='0.0.0.0', port=5001, debug=False)
