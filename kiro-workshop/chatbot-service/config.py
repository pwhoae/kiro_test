"""Configuration management for the chatbot service."""
import os
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class Config:
    """Configuration class for chatbot service."""
    
    def __init__(self):
        """Initialize configuration from environment variables."""
        # AWS Credentials (Required)
        self.aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
        self.aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        self.aws_session_token = os.getenv('AWS_SESSION_TOKEN')  # Optional
        self.aws_region = os.getenv('AWS_REGION', 'us-west-2')
        
        # E-commerce Backend Configuration (Required)
        self.ecommerce_api_url = os.getenv('ECOMMERCE_API_URL', 'http://localhost:5000')
        
        # Chatbot Service Configuration (Optional)
        self.chatbot_port = int(os.getenv('CHATBOT_PORT', '5001'))
        self.log_level = os.getenv('LOG_LEVEL', 'INFO')
        self.session_timeout_minutes = int(os.getenv('SESSION_TIMEOUT_MINUTES', '30'))
        
        # Bedrock Model Configuration
        self.model_id = 'us.amazon.nova-pro-v1:0'
        self.temperature = 0.7
        self.max_tokens = 2048
        
        # Validate required configuration
        self._validate()
        
    def _validate(self):
        """Validate that required configuration is present."""
        missing = []
        
        if not self.aws_access_key_id:
            missing.append('AWS_ACCESS_KEY_ID')
        if not self.aws_secret_access_key:
            missing.append('AWS_SECRET_ACCESS_KEY')
        if not self.ecommerce_api_url:
            missing.append('ECOMMERCE_API_URL')
            
        if missing:
            error_msg = f"Missing required environment variables: {', '.join(missing)}"
            logger.error(error_msg)
            raise ValueError(error_msg)
            
        logger.info("Configuration validated successfully")
        
    def get_boto_session_config(self):
        """Get configuration for boto3 session."""
        config = {
            'aws_access_key_id': self.aws_access_key_id,
            'aws_secret_access_key': self.aws_secret_access_key,
            'region_name': self.aws_region
        }
        
        if self.aws_session_token:
            config['aws_session_token'] = self.aws_session_token
            
        return config
    
    def log_config(self):
        """Log configuration details (without sensitive data)."""
        logger.info("=== Chatbot Service Configuration ===")
        logger.info(f"AWS Region: {self.aws_region}")
        logger.info(f"Model ID: {self.model_id}")
        logger.info(f"E-commerce API URL: {self.ecommerce_api_url}")
        logger.info(f"Chatbot Port: {self.chatbot_port}")
        logger.info(f"Log Level: {self.log_level}")
        logger.info(f"Session Timeout: {self.session_timeout_minutes} minutes")
        logger.info(f"AWS Access Key ID: {'*' * 16}{self.aws_access_key_id[-4:] if self.aws_access_key_id else 'NOT SET'}")
        logger.info("=====================================")


def setup_logging(log_level: str = 'INFO'):
    """Set up logging configuration."""
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
