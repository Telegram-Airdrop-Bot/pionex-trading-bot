#!/usr/bin/env python3
"""
Test GUI setup and basic functionality
"""

import os
import sys
from dotenv import load_dotenv
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_gui_setup():
    """Test GUI setup and basic functionality"""
    print("🔍 Testing GUI setup...")
    
    try:
        # Test environment variables
        load_dotenv()
        api_key = os.getenv('PIONEX_API_KEY')
        api_secret = os.getenv('PIONEX_SECRET_KEY')
        
        if not api_key or not api_secret:
            print("❌ Missing API credentials. Please set PIONEX_API_KEY and PIONEX_SECRET_KEY in your .env file")
            return False
        
        print("✅ Environment variables check passed")
        
        # Test module imports
        print("Testing module imports...")
        
        try:
            from config_loader import get_config
            print("✅ Config loader imported successfully")
        except Exception as e:
            print(f"❌ Config loader import failed: {e}")
            return False
        
        try:
            from pionex_api import PionexAPI
            print("✅ Pionex API imported successfully")
        except Exception as e:
            print(f"❌ Pionex API import failed: {e}")
            return False
        
        try:
            from gui_app import TradingBotGUI
            print("✅ GUI app imported successfully")
        except Exception as e:
            print(f"❌ GUI app import failed: {e}")
            return False
        
        # Test configuration loading
        print("Testing configuration loading...")
        try:
            config = get_config()
            print("✅ Configuration loaded successfully")
            print(f"   Trading pair: {config.get('trading_pair', 'N/A')}")
            print(f"   Position size: {config.get('position_size', 'N/A')}")
        except Exception as e:
            print(f"❌ Configuration loading failed: {e}")
            return False
        
        # Test API connection
        print("Testing API connection...")
        try:
            api = PionexAPI()
            test_response = api.test_connection()
            if 'error' not in test_response:
                print("✅ API connection successful")
            else:
                print(f"❌ API connection failed: {test_response.get('error', 'Unknown error')}")
                return False
        except Exception as e:
            print(f"❌ API connection test failed: {e}")
            return False
        
        # Test GUI template files
        print("Testing GUI template files...")
        template_dir = Path(__file__).parent / "templates"
        static_dir = Path(__file__).parent / "static"
        
        if template_dir.exists() and (template_dir / "index.html").exists():
            print("✅ Template files found")
        else:
            print("❌ Template files missing")
            return False
        
        if static_dir.exists() and (static_dir / "js" / "app.js").exists():
            print("✅ Static files found")
        else:
            print("❌ Static files missing")
            return False
        
        print("\n🎉 GUI setup test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ GUI setup test failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 50)
    print("Pionex Trading Bot GUI - Setup Test")
    print("=" * 50)
    
    success = test_gui_setup()
    
    if success:
        print("\n✅ All GUI setup tests passed!")
        print("The GUI is ready to use. Run 'python gui/run_gui.py' to start the application.")
    else:
        print("\n❌ Some GUI setup tests failed.")
        print("Please check the error messages above and fix the issues.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 