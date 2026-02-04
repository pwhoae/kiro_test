"""Main chatbot service orchestration."""
import logging
import time
from typing import Optional, Tuple
from strands import Agent
from session_manager import SessionManager

logger = logging.getLogger(__name__)


class ChatbotService:
    """Main service class for the shopping assistant chatbot."""
    
    def __init__(self, agent: Agent, session_manager: SessionManager):
        """Initialize the chatbot service.
        
        Args:
            agent: Configured Strands Agent
            session_manager: Session manager instance
        """
        self.agent = agent
        self.session_manager = session_manager
        logger.info("ChatbotService initialized")
    
    def process_message(self, message: str, session_id: Optional[str] = None) -> Tuple[str, str]:
        """Process a user message and return the agent's response.
        
        Args:
            message: User's message
            session_id: Optional session ID
            
        Returns:
            Tuple of (reply, session_id)
        """
        start_time = time.time()
        
        try:
            # Get or create session
            session_id, session_data = self.session_manager.get_or_create_session(session_id)
            
            # Log message receipt
            logger.info(f"Received message from session {session_id} at {time.strftime('%Y-%m-%d %H:%M:%S')}")
            logger.debug(f"Message content: {message[:100]}...")  # Log first 100 chars
            
            # Get conversation history
            messages = session_data['messages']
            
            # Add user message to history
            messages.append({
                "role": "user",
                "content": [{"text": message}]
            })
            
            # Invoke agent
            logger.info(f"Invoking agent for session {session_id}")
            try:
                response = self.agent(messages=messages)
                
                # Extract reply text
                reply = ""
                if hasattr(response, 'content'):
                    for content_block in response.content:
                        if hasattr(content_block, 'text'):
                            reply += content_block.text
                elif isinstance(response, str):
                    reply = response
                else:
                    reply = str(response)
                
                # Add assistant response to history
                messages.append({
                    "role": "assistant",
                    "content": [{"text": reply}]
                })
                
                # Update session
                self.session_manager.update_session(session_id, messages)
                
                # Calculate response time
                response_time = time.time() - start_time
                logger.info(f"Successfully processed message for session {session_id} in {response_time:.2f}s")
                
                return reply, session_id
                
            except Exception as e:
                logger.error(f"Error invoking agent: {e}", exc_info=True)
                
                # Return user-friendly error message
                error_reply = (
                    "I apologize, but I'm having trouble processing your request right now. "
                    "Please try again in a moment."
                )
                return error_reply, session_id
                
        except Exception as e:
            logger.error(f"Error in process_message: {e}", exc_info=True)
            
            # Create new session if there was an error
            if not session_id:
                session_id, _ = self.session_manager.get_or_create_session()
            
            error_reply = (
                "I apologize, but something went wrong. "
                "Please try again or start a new conversation."
            )
            return error_reply, session_id
