"""Main entry point for the chatbot service."""
import logging
import sys
from config import Config, setup_logging
from agent import create_agent
from session_manager import SessionManager
from chatbot_service import ChatbotService
from server import create_app, run_server

logger = logging.getLogger(__name__)


def main():
    """Main function to start the chatbot service."""
    try:
        # Load configuration
        config = Config()
        
        # Setup logging
        setup_logging(config.log_level)
        
        logger.info("=" * 50)
        logger.info("Starting Shopping Assistant Chatbot Service")
        logger.info("=" * 50)
        
        # Log configuration
        config.log_config()
        
        # Create session manager
        session_manager = SessionManager(timeout_minutes=config.session_timeout_minutes)
        logger.info(f"Session manager initialized with {config.session_timeout_minutes} minute timeout")
        
        # Create agent
        agent = create_agent(config)
        
        # Create chatbot service
        chatbot_service = ChatbotService(agent, session_manager)
        
        # Create Flask app
        app = create_app(chatbot_service)
        
        # Run server
        logger.info("=" * 50)
        logger.info(f"Chatbot service ready on http://localhost:{config.chatbot_port}")
        logger.info("=" * 50)
        
        run_server(app, host='0.0.0.0', port=config.chatbot_port)
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        logger.error("Please check your .env file and ensure all required variables are set")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to start chatbot service: {e}", exc_info=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
