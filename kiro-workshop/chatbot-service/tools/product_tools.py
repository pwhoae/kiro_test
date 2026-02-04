"""Product-related tools for the shopping assistant."""
import logging
import requests
from typing import Optional
from strands import tool

logger = logging.getLogger(__name__)


def get_api_url() -> str:
    """Get the e-commerce API URL from config."""
    from config import Config
    config = Config()
    return config.ecommerce_api_url


@tool
async def list_products(category: Optional[str] = None, max_price: Optional[float] = None) -> str:
    """List available products from the e-commerce catalog.
    
    Args:
        category: Filter by product category (e.g., Electronics, Home, Furniture, Accessories, Sports, Books)
        max_price: Maximum price filter in dollars
    """
    logger.info(f"list_products called with category={category}, max_price={max_price}")
    
    try:
        api_url = get_api_url()
        response = requests.get(f"{api_url}/api/products", timeout=5)
        response.raise_for_status()
        
        products = response.json()
        logger.info(f"Retrieved {len(products)} products from backend")
        
        # Apply filters
        if category:
            products = [p for p in products if p.get('category', '').lower() == category.lower()]
            logger.debug(f"Filtered to {len(products)} products in category '{category}'")
        
        if max_price is not None:
            products = [p for p in products if p.get('price', float('inf')) <= max_price]
            logger.debug(f"Filtered to {len(products)} products under ${max_price}")
        
        if not products:
            return "No products found matching your criteria."
        
        # Format products for natural language response
        product_list = []
        for p in products[:10]:  # Limit to 10 products
            name = p.get('name', 'Unknown')
            emoji = p.get('emoji', '')
            price = p.get('price', 0)
            category_name = p.get('category', 'Unknown')
            description = p.get('description', '')
            product_id = p.get('id', '')
            
            product_list.append(
                f"{emoji} {name} (ID: {product_id})\n"
                f"   Category: {category_name}\n"
                f"   Price: ${price:.2f}\n"
                f"   {description}"
            )
        
        result = f"Found {len(products)} products:\n\n" + "\n\n".join(product_list)
        
        if len(products) > 10:
            result += f"\n\n... and {len(products) - 10} more products."
        
        return result
        
    except requests.exceptions.ConnectionError:
        error_msg = "Unable to connect to the product catalog. The service is temporarily unavailable."
        logger.error(f"Connection error to e-commerce backend: {api_url}")
        return error_msg
    except requests.exceptions.Timeout:
        error_msg = "The product catalog is taking too long to respond. Please try again."
        logger.error("Timeout connecting to e-commerce backend")
        return error_msg
    except Exception as e:
        error_msg = "An error occurred while retrieving products. Please try again later."
        logger.error(f"Error in list_products: {e}", exc_info=True)
        return error_msg


@tool
async def get_recommendations(preferences: Optional[str] = None, limit: int = 5) -> str:
    """Get product recommendations based on preferences.
    
    Args:
        preferences: User preferences or interests (e.g., "gaming", "home office", "fitness")
        limit: Maximum number of recommendations (default: 5, max: 10)
    """
    logger.info(f"get_recommendations called with preferences={preferences}, limit={limit}")
    
    # Limit the number of recommendations
    limit = min(limit, 10)
    
    try:
        api_url = get_api_url()
        response = requests.get(f"{api_url}/api/products", timeout=5)
        response.raise_for_status()
        
        products = response.json()
        logger.info(f"Retrieved {len(products)} products for recommendations")
        
        # Simple recommendation logic based on preferences
        if preferences:
            preferences_lower = preferences.lower()
            # Score products based on how well they match preferences
            scored_products = []
            for p in products:
                score = 0
                name = p.get('name', '').lower()
                description = p.get('description', '').lower()
                category = p.get('category', '').lower()
                
                # Check if preferences appear in product details
                if preferences_lower in name:
                    score += 3
                if preferences_lower in description:
                    score += 2
                if preferences_lower in category:
                    score += 1
                
                if score > 0:
                    scored_products.append((score, p))
            
            # Sort by score and take top products
            scored_products.sort(reverse=True, key=lambda x: x[0])
            recommended = [p for _, p in scored_products[:limit]]
            
            if not recommended:
                # If no matches, recommend diverse products from different categories
                logger.debug("No preference matches, recommending diverse products")
                categories_seen = set()
                recommended = []
                for p in products:
                    cat = p.get('category', '')
                    if cat not in categories_seen:
                        recommended.append(p)
                        categories_seen.add(cat)
                        if len(recommended) >= limit:
                            break
        else:
            # No preferences - recommend diverse products from different categories
            logger.debug("No preferences provided, recommending diverse products")
            categories_seen = set()
            recommended = []
            for p in products:
                cat = p.get('category', '')
                if cat not in categories_seen:
                    recommended.append(p)
                    categories_seen.add(cat)
                    if len(recommended) >= limit:
                        break
        
        if not recommended:
            return "I couldn't find any recommendations at the moment. Please try browsing our catalog."
        
        # Format recommendations
        rec_list = []
        for p in recommended:
            name = p.get('name', 'Unknown')
            emoji = p.get('emoji', '')
            price = p.get('price', 0)
            category_name = p.get('category', 'Unknown')
            description = p.get('description', '')
            product_id = p.get('id', '')
            
            rec_list.append(
                f"{emoji} {name} (ID: {product_id})\n"
                f"   Category: {category_name}\n"
                f"   Price: ${price:.2f}\n"
                f"   {description}"
            )
        
        intro = f"Based on your interest in '{preferences}', here are my recommendations:" if preferences else "Here are some products you might like:"
        result = f"{intro}\n\n" + "\n\n".join(rec_list)
        
        return result
        
    except requests.exceptions.ConnectionError:
        error_msg = "Unable to connect to the product catalog. The service is temporarily unavailable."
        logger.error(f"Connection error to e-commerce backend")
        return error_msg
    except requests.exceptions.Timeout:
        error_msg = "The product catalog is taking too long to respond. Please try again."
        logger.error("Timeout connecting to e-commerce backend")
        return error_msg
    except Exception as e:
        error_msg = "An error occurred while generating recommendations. Please try again later."
        logger.error(f"Error in get_recommendations: {e}", exc_info=True)
        return error_msg
