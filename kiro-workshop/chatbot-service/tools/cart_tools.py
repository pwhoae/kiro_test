"""Shopping cart tools for the shopping assistant."""
import logging
import requests
from strands import tool

logger = logging.getLogger(__name__)


def get_api_url() -> str:
    """Get the e-commerce API URL from config."""
    from config import Config
    config = Config()
    return config.ecommerce_api_url


@tool
async def add_to_cart(product_id: int, quantity: int = 1) -> str:
    """Add a product to the shopping cart.
    
    Args:
        product_id: The ID of the product to add
        quantity: Number of items to add (default: 1)
    """
    logger.info(f"add_to_cart called with product_id={product_id}, quantity={quantity}")
    
    if quantity < 1:
        return "Quantity must be at least 1."
    
    try:
        api_url = get_api_url()
        
        # First, verify the product exists
        product_response = requests.get(f"{api_url}/api/products/{product_id}", timeout=5)
        if product_response.status_code == 404:
            return f"Product with ID {product_id} not found."
        product_response.raise_for_status()
        product = product_response.json()
        
        # Add to cart
        response = requests.post(
            f"{api_url}/api/cart",
            json={"productId": product_id, "quantity": quantity},
            timeout=5
        )
        response.raise_for_status()
        
        product_name = product.get('name', 'Unknown Product')
        product_emoji = product.get('emoji', '')
        product_price = product.get('price', 0)
        
        logger.info(f"Successfully added {quantity}x {product_name} to cart")
        
        return (
            f"✅ Added {quantity}x {product_emoji} {product_name} to your cart!\n"
            f"Price: ${product_price:.2f} each\n"
            f"Subtotal: ${product_price * quantity:.2f}"
        )
        
    except requests.exceptions.ConnectionError:
        error_msg = "Unable to connect to the shopping cart service. Please try again later."
        logger.error("Connection error to e-commerce backend")
        return error_msg
    except requests.exceptions.Timeout:
        error_msg = "The shopping cart service is taking too long to respond. Please try again."
        logger.error("Timeout connecting to e-commerce backend")
        return error_msg
    except Exception as e:
        error_msg = "An error occurred while adding the product to your cart. Please try again."
        logger.error(f"Error in add_to_cart: {e}", exc_info=True)
        return error_msg


@tool
async def remove_from_cart(product_id: int) -> str:
    """Remove a product from the shopping cart.
    
    Args:
        product_id: The ID of the product to remove
    """
    logger.info(f"remove_from_cart called with product_id={product_id}")
    
    try:
        api_url = get_api_url()
        
        # Get product name before removing
        try:
            product_response = requests.get(f"{api_url}/api/products/{product_id}", timeout=5)
            product_response.raise_for_status()
            product = product_response.json()
            product_name = product.get('name', 'Unknown Product')
            product_emoji = product.get('emoji', '')
        except:
            product_name = f"Product {product_id}"
            product_emoji = ''
        
        # Remove from cart
        response = requests.delete(f"{api_url}/api/cart/{product_id}", timeout=5)
        
        if response.status_code == 404:
            return f"Product {product_id} is not in your cart."
        
        response.raise_for_status()
        
        logger.info(f"Successfully removed {product_name} from cart")
        
        return f"✅ Removed {product_emoji} {product_name} from your cart."
        
    except requests.exceptions.ConnectionError:
        error_msg = "Unable to connect to the shopping cart service. Please try again later."
        logger.error("Connection error to e-commerce backend")
        return error_msg
    except requests.exceptions.Timeout:
        error_msg = "The shopping cart service is taking too long to respond. Please try again."
        logger.error("Timeout connecting to e-commerce backend")
        return error_msg
    except Exception as e:
        error_msg = "An error occurred while removing the product from your cart. Please try again."
        logger.error(f"Error in remove_from_cart: {e}", exc_info=True)
        return error_msg


@tool
async def view_cart() -> str:
    """View the current contents of the shopping cart."""
    logger.info("view_cart called")
    
    try:
        api_url = get_api_url()
        response = requests.get(f"{api_url}/api/cart", timeout=5)
        response.raise_for_status()
        
        cart_items = response.json()
        logger.info(f"Retrieved {len(cart_items)} items from cart")
        
        if not cart_items:
            return "🛒 Your shopping cart is empty."
        
        # Format cart contents
        cart_lines = ["🛒 Your Shopping Cart:\n"]
        total = 0.0
        
        for item in cart_items:
            product = item.get('product', {})
            quantity = item.get('quantity', 0)
            name = product.get('name', 'Unknown')
            emoji = product.get('emoji', '')
            price = product.get('price', 0)
            product_id = product.get('id', '')
            subtotal = price * quantity
            total += subtotal
            
            cart_lines.append(
                f"{emoji} {name} (ID: {product_id})\n"
                f"   Quantity: {quantity}\n"
                f"   Price: ${price:.2f} each\n"
                f"   Subtotal: ${subtotal:.2f}"
            )
        
        cart_lines.append(f"\n💰 Total: ${total:.2f}")
        
        return "\n\n".join(cart_lines)
        
    except requests.exceptions.ConnectionError:
        error_msg = "Unable to connect to the shopping cart service. Please try again later."
        logger.error("Connection error to e-commerce backend")
        return error_msg
    except requests.exceptions.Timeout:
        error_msg = "The shopping cart service is taking too long to respond. Please try again."
        logger.error("Timeout connecting to e-commerce backend")
        return error_msg
    except Exception as e:
        error_msg = "An error occurred while retrieving your cart. Please try again."
        logger.error(f"Error in view_cart: {e}", exc_info=True)
        return error_msg
