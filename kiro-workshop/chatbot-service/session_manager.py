"""Session management for maintaining conversation context."""
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import uuid4

logger = logging.getLogger(__name__)


class SessionManager:
    """Manages conversation sessions and context."""
    
    def __init__(self, timeout_minutes: int = 30):
        """Initialize session manager with timeout configuration.
        
        Args:
            timeout_minutes: Number of minutes before a session expires
        """
        self.timeout_minutes = timeout_minutes
        self.sessions: Dict[str, dict] = {}
        self._lock = threading.Lock()
        self._cleanup_thread = None
        self._stop_cleanup = threading.Event()
        
        # Start background cleanup task
        self._start_cleanup_task()
        
    def get_or_create_session(self, session_id: Optional[str] = None) -> tuple[str, dict]:
        """Get existing session or create new one.
        
        Args:
            session_id: Optional session ID. If None, creates new session.
            
        Returns:
            Tuple of (session_id, session_data)
        """
        with self._lock:
            # Create new session if no ID provided or session doesn't exist
            if not session_id or session_id not in self.sessions:
                session_id = session_id or str(uuid4())
                self.sessions[session_id] = {
                    'session_id': session_id,
                    'created_at': datetime.now(),
                    'last_activity': datetime.now(),
                    'messages': [],
                    'context': {}
                }
                logger.info(f"Created new session: {session_id}")
            else:
                # Update last activity time
                self.sessions[session_id]['last_activity'] = datetime.now()
                logger.debug(f"Retrieved existing session: {session_id}")
                
            return session_id, self.sessions[session_id]
    
    def update_session(self, session_id: str, messages: List[dict]):
        """Update session with new messages.
        
        Args:
            session_id: The session ID to update
            messages: List of messages in Strands format
        """
        with self._lock:
            if session_id in self.sessions:
                self.sessions[session_id]['messages'] = messages
                self.sessions[session_id]['last_activity'] = datetime.now()
                logger.debug(f"Updated session {session_id} with {len(messages)} messages")
            else:
                logger.warning(f"Attempted to update non-existent session: {session_id}")
    
    def get_session_messages(self, session_id: str) -> List[dict]:
        """Get messages for a session.
        
        Args:
            session_id: The session ID
            
        Returns:
            List of messages or empty list if session doesn't exist
        """
        with self._lock:
            if session_id in self.sessions:
                return self.sessions[session_id]['messages'].copy()
            return []
    
    def cleanup_expired_sessions(self):
        """Remove sessions that have exceeded timeout."""
        with self._lock:
            now = datetime.now()
            timeout_delta = timedelta(minutes=self.timeout_minutes)
            expired_sessions = []
            
            for session_id, session_data in self.sessions.items():
                last_activity = session_data['last_activity']
                if now - last_activity > timeout_delta:
                    expired_sessions.append(session_id)
            
            for session_id in expired_sessions:
                del self.sessions[session_id]
                logger.info(f"Cleaned up expired session: {session_id}")
            
            if expired_sessions:
                logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
    
    def _start_cleanup_task(self):
        """Start background thread for cleaning up expired sessions."""
        def cleanup_loop():
            while not self._stop_cleanup.is_set():
                try:
                    self.cleanup_expired_sessions()
                except Exception as e:
                    logger.error(f"Error in cleanup task: {e}")
                
                # Wait 5 minutes before next cleanup
                self._stop_cleanup.wait(300)
        
        self._cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        self._cleanup_thread.start()
        logger.info("Started session cleanup background task")
    
    def stop(self):
        """Stop the session manager and cleanup thread."""
        self._stop_cleanup.set()
        if self._cleanup_thread:
            self._cleanup_thread.join(timeout=1)
        logger.info("Session manager stopped")
    
    def get_session_count(self) -> int:
        """Get the number of active sessions.
        
        Returns:
            Number of active sessions
        """
        with self._lock:
            return len(self.sessions)
