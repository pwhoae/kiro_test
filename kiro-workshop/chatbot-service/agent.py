"""Strands Agent configuration and initialization."""
import logging
import boto3
from strands import Agent
from strands.models import BedrockModel
from config import Config
from tools import list_products, get_recommendations, add_to_cart, remove_from_cart, view_cart

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """You are a helpful shopping assistant for an e-commerce store. Your role is to help customers:

1. **Browse Products**: Help customers find products by listing available items, filtering by category or price
2. **Manage Cart**: Add items to cart, remove items, and view cart contents
3. **Provide Recommendations**: Suggest products based on customer preferences and interests

**Guidelines:**
- Be friendly, helpful, and conversational
- When customers ask about products, use the list_products tool to show them what's available
- When customers want to add items to cart, use the add_to_cart tool with the product ID
- When customers want to see their cart, use the view_cart tool
- When customers want recommendations, use the get_recommendations tool
- Always mention product IDs when showing products so customers can easily reference them
- If a customer asks about a specific product category, filter the results appropriately
- Be proactive in suggesting related products or alternatives
- Keep responses concise but informative
- If you encounter errors, explain them in a user-friendly way

**Important:**
- Product IDs are required for cart operations - always include them when showing products
- Prices are in USD
- Available categories include: Electronics, Home, Furniture, Accessories, Sports, Books

Remember: Your goal is to make shopping easy and enjoyable for customers!"""


def create_agent(config: Config) -> Agent:
    """Create and configure the Strands Agent with Bedrock Nova Pro.
    
    Args:
        config: Configuration object with AWS credentials and settings
        
    Returns:
        Configured Strands Agent
    """
    logger.info("Creating Strands Agent with Bedrock Nova Pro")
    
    try:
        # Create boto3 session with credentials
        boto_session = boto3.Session(**config.get_boto_session_config())
        
        # Create Bedrock model
        bedrock_model = BedrockModel(
            model_id=config.model_id,
            boto_session=boto_session,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            streaming=True
        )
        
        logger.info(f"Initialized BedrockModel with model_id={config.model_id}")
        
        # Create agent with tools
        agent = Agent(
            model=bedrock_model,
            system_prompt=SYSTEM_PROMPT,
            tools=[
                list_products,
                get_recommendations,
                add_to_cart,
                remove_from_cart,
                view_cart
            ],
            name="ShoppingAssistant"
        )
        
        logger.info("Successfully created Strands Agent with 5 tools")
        logger.info("Registered tools: list_products, get_recommendations, add_to_cart, remove_from_cart, view_cart")
        
        return agent
        
    except Exception as e:
        logger.error(f"Failed to create agent: {e}", exc_info=True)
        raise
