# Shopping Assistant Chatbot Service

A conversational AI service powered by Strands Agents SDK and AWS Bedrock Nova Pro that integrates with the e-commerce application.

## Features

- Natural language product browsing
- Shopping cart management through conversation
- Personalized product recommendations
- Session-based conversation context
- RESTful HTTP API for frontend integration

## Prerequisites

- Python 3.9 or higher
- AWS account with Bedrock access
- Access to AWS Bedrock Nova Pro model
- Running e-commerce backend service

## Setup

### 1. Create Virtual Environment

```bash
cd chatbot-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_SESSION_TOKEN`: (Optional) For temporary credentials
- `ECOMMERCE_API_URL`: URL of the e-commerce backend (default: http://localhost:5000)

Optional variables:
- `CHATBOT_PORT`: Port for the chatbot service (default: 5001)
- `AWS_REGION`: AWS region (default: us-west-2)
- `LOG_LEVEL`: Logging level (default: INFO)
- `SESSION_TIMEOUT_MINUTES`: Session timeout in minutes (default: 30)

### 4. Request Bedrock Model Access

1. Sign in to AWS Console
2. Navigate to Amazon Bedrock
3. Go to Model access
4. Request access to Nova Pro model
5. Wait for approval (usually immediate)

## Running the Service

```bash
python main.py
```

The service will start on `http://localhost:5001` (or your configured port).

## API Endpoints

### POST /api/chat

Send a message to the chatbot.

**Request:**
```json
{
  "message": "Show me laptops under $1000",
  "sessionId": "uuid-string"
}
```

**Response:**
```json
{
  "reply": "I found 3 laptops under $1000...",
  "sessionId": "uuid-string",
  "timestamp": "2025-11-28T10:30:00Z"
}
```

### GET /api/health

Check service health.

**Response:**
```json
{
  "status": "healthy",
  "service": "shopping-assistant-chatbot",
  "version": "1.0.0"
}
```

## Architecture

```
Frontend (React) → HTTP Server (Flask) → Strands Agent → AWS Bedrock Nova Pro
                                       ↓
                                  Custom Tools → E-commerce Backend API
```

## Development

### Project Structure

```
chatbot-service/
├── __init__.py
├── main.py              # Entry point
├── config.py            # Configuration management
├── session_manager.py   # Session management
├── chatbot_service.py   # Main service orchestration
├── tools/               # Custom tools
│   ├── __init__.py
│   ├── product_tools.py
│   └── cart_tools.py
├── server.py            # Flask HTTP server
├── requirements.txt     # Python dependencies
├── .env.example         # Example environment variables
└── README.md           # This file
```

## Troubleshooting

### AWS Credentials Error

If you see "Unable to locate credentials", ensure:
1. Environment variables are set correctly in `.env`
2. Virtual environment is activated
3. `.env` file is in the correct directory

### Bedrock Access Denied

If you see "Access denied" for Bedrock:
1. Verify you've requested model access in AWS Console
2. Check your IAM permissions include `bedrock:InvokeModel`
3. Ensure you're using the correct AWS region

### Connection to E-commerce Backend Failed

If tools can't reach the backend:
1. Verify the e-commerce backend is running on port 5000
2. Check `ECOMMERCE_API_URL` in `.env`
3. Ensure no firewall is blocking the connection

## License

MIT
