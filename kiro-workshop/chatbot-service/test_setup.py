"""Simple test to verify the chatbot service setup."""
import sys
import os

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    
    try:
        import flask
        print("✓ Flask installed")
    except ImportError:
        print("✗ Flask not installed")
        return False
    
    try:
        import flask_cors
        print("✓ Flask-CORS installed")
    except ImportError:
        print("✗ Flask-CORS not installed")
        return False
    
    try:
        import requests
        print("✓ Requests installed")
    except ImportError:
        print("✗ Requests not installed")
        return False
    
    try:
        import boto3
        print("✓ Boto3 installed")
    except ImportError:
        print("✗ Boto3 not installed")
        return False
    
    try:
        import dotenv
        print("✓ Python-dotenv installed")
    except ImportError:
        print("✗ Python-dotenv not installed")
        return False
    
    try:
        import strands
        print("✓ Strands Agents SDK installed")
    except ImportError:
        print("✗ Strands Agents SDK not installed")
        return False
    
    return True


def test_modules():
    """Test that all custom modules can be imported."""
    print("\nTesting custom modules...")
    
    try:
        import config
        print("✓ config module")
    except Exception as e:
        print(f"✗ config module: {e}")
        return False
    
    try:
        import session_manager
        print("✓ session_manager module")
    except Exception as e:
        print(f"✗ session_manager module: {e}")
        return False
    
    try:
        import tools
        print("✓ tools module")
    except Exception as e:
        print(f"✗ tools module: {e}")
        return False
    
    try:
        import agent
        print("✓ agent module")
    except Exception as e:
        print(f"✗ agent module: {e}")
        return False
    
    try:
        import chatbot_service
        print("✓ chatbot_service module")
    except Exception as e:
        print(f"✗ chatbot_service module: {e}")
        return False
    
    try:
        import server
        print("✓ server module")
    except Exception as e:
        print(f"✗ server module: {e}")
        return False
    
    return True


def test_env_file():
    """Test that .env file exists."""
    print("\nChecking environment configuration...")
    
    if os.path.exists('.env'):
        print("✓ .env file exists")
        return True
    else:
        print("✗ .env file not found")
        print("  Please copy .env.example to .env and configure your credentials")
        return False


def main():
    """Run all tests."""
    print("=" * 50)
    print("Chatbot Service Setup Test")
    print("=" * 50)
    
    all_passed = True
    
    if not test_imports():
        all_passed = False
        print("\n⚠ Some dependencies are missing. Run: pip install -r requirements.txt")
    
    if not test_modules():
        all_passed = False
        print("\n⚠ Some modules have errors. Check the error messages above.")
    
    if not test_env_file():
        all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("✓ All tests passed! The service is ready to run.")
        print("\nTo start the service, run: python main.py")
    else:
        print("✗ Some tests failed. Please fix the issues above.")
        sys.exit(1)
    print("=" * 50)


if __name__ == '__main__':
    main()
