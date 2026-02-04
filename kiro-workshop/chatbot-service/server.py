"""Flask HTTP server for the chatbot service."""
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Optional

logger = logging.getLogger(__name__)


def create_app(chatbot_service) -> Flask:
    """Create and configure Flask application.
    
    Args:
        chatbot_service: ChatbotService instance
        
    Returns:
        Configured Flask app
    """
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:3000", "http://localhost:3001"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    logger.info("Configured CORS for origins: http://localhost:3000, http://localhost:3001")
    
    # Request logging middleware
    @app.before_request
    def log_request():
        logger.info(f"{request.method} {request.path} from {request.remote_addr}")
        if request.method == "POST" and request.is_json:
            logger.debug(f"Request body: {request.get_json()}")
    
    # Response logging middleware
    @app.after_request
    def log_response(response):
        logger.info(f"Response status: {response.status_code}")
        return response
    
    # Error handling middleware
    @app.errorhandler(400)
    def bad_request(error):
        logger.warning(f"Bad request: {error}")
        return jsonify({
            "error": {
                "code": "BAD_REQUEST",
                "message": "Invalid request format or missing required fields"
            }
        }), 400
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        logger.warning(f"Method not allowed: {error}")
        return jsonify({
            "error": {
                "code": "METHOD_NOT_ALLOWED",
                "message": "HTTP method not allowed for this endpoint"
            }
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Internal server error: {error}", exc_info=True)
        return jsonify({
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred. Please try again later."
            }
        }), 500
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint."""
        return jsonify({
            "status": "healthy",
            "service": "shopping-assistant-chatbot",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat()
        })
    
    # Chat endpoint
    @app.route('/api/chat', methods=['POST'])
    def chat():
        """Process chat messages."""
        try:
            # Validate request
            if not request.is_json:
                logger.warning("Request is not JSON")
                return jsonify({
                    "error": {
                        "code": "INVALID_FORMAT",
                        "message": "Request must be JSON"
                    }
                }), 400
            
            data = request.get_json()
            
            # Validate required fields
            if 'message' not in data:
                logger.warning("Missing 'message' field in request")
                return jsonify({
                    "error": {
                        "code": "MISSING_FIELD",
                        "message": "Missing required field: message"
                    }
                }), 400
            
            message = data['message']
            session_id = data.get('sessionId')
            
            # Validate message
            if not message or not isinstance(message, str):
                logger.warning("Invalid message field")
                return jsonify({
                    "error": {
                        "code": "INVALID_MESSAGE",
                        "message": "Message must be a non-empty string"
                    }
                }), 400
            
            if len(message) > 2000:
                logger.warning(f"Message too long: {len(message)} characters")
                return jsonify({
                    "error": {
                        "code": "MESSAGE_TOO_LONG",
                        "message": "Message must be 2000 characters or less"
                    }
                }), 400
            
            logger.info(f"Processing message for session: {session_id or 'new'}")
            
            # Process message
            reply, session_id = chatbot_service.process_message(message, session_id)
            
            # Return response
            response = {
                "reply": reply,
                "sessionId": session_id,
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"Successfully processed message for session: {session_id}")
            return jsonify(response)
            
        except Exception as e:
            logger.error(f"Error processing chat request: {e}", exc_info=True)
            return jsonify({
                "error": {
                    "code": "PROCESSING_ERROR",
                    "message": "An error occurred while processing your message. Please try again."
                }
            }), 500
    
    return app


def run_server(app: Flask, host: str = '0.0.0.0', port: int = 5001):
    """Run the Flask server.
    
    Args:
        app: Flask application
        host: Host to bind to
        port: Port to listen on
    """
    logger.info(f"Starting HTTP server on {host}:{port}")
    app.run(host=host, port=port, debug=False)
