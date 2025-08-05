#!/usr/bin/env python3
"""
Test GUI functionality
"""

import os
import sys
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_gui_functionality():
    """Test GUI functionality"""
    print("🔍 Testing GUI functionality...")
    
    try:
        from gui_app import TradingBotGUI
        
        # Initialize the trading bot
        trading_bot = TradingBotGUI()
        
        # Test account balance
        print("Testing account balance...")
        balance_result = trading_bot.get_account_balance()
        if balance_result['success']:
            print("✅ Account balance retrieved successfully")
            print(f"   Total: ${balance_result['data'].get('total', 0):.2f}")
            print(f"   Available: ${balance_result['data'].get('available', 0):.2f}")
        else:
            print(f"❌ Account balance failed: {balance_result.get('error', 'Unknown error')}")
        
        # Test positions
        print("\nTesting positions...")
        positions_result = trading_bot.get_positions()
        if positions_result['success']:
            print("✅ Positions retrieved successfully")
            print(f"   Found {len(positions_result['data'])} positions")
        else:
            print(f"❌ Positions failed: {positions_result.get('error', 'Unknown error')}")
        
        # Test trading history
        print("\nTesting trading history...")
        history_result = trading_bot.get_trading_history()
        if history_result['success']:
            print("✅ Trading history retrieved successfully")
            print(f"   Found {len(history_result['data'])} trades")
        else:
            print(f"❌ Trading history failed: {history_result.get('error', 'Unknown error')}")
        
        # Test settings
        print("\nTesting settings...")
        settings_result = trading_bot.get_settings()
        if settings_result['success']:
            print("✅ Settings retrieved successfully")
            print(f"   Trading pair: {settings_result['data'].get('trading_pair', 'N/A')}")
            print(f"   Position size: {settings_result['data'].get('position_size', 'N/A')}")
        else:
            print(f"❌ Settings failed: {settings_result.get('error', 'Unknown error')}")
        
        # Test trading pairs to understand correct symbol format
        print("\nTesting available trading pairs...")
        try:
            pairs_response = trading_bot.api.get_trading_pairs()
            if 'data' in pairs_response and 'symbols' in pairs_response['data']:
                symbols = pairs_response['data']['symbols']
                print(f"✅ Found {len(symbols)} trading pairs")
                # Show first 5 symbols to understand format
                for i, symbol in enumerate(symbols[:5]):
                    print(f"   {i+1}. {symbol}")
            else:
                print("❌ Could not retrieve trading pairs")
        except Exception as e:
            print(f"❌ Error getting trading pairs: {e}")
        
        # Test ticker endpoint with different symbols
        print("\nTesting ticker endpoint with different symbols...")
        test_symbols = ['ETHUSDT', 'ETH_USDT', 'USDT', 'BTC', 'ETH']
        
        for symbol in test_symbols:
            try:
                ticker_response = trading_bot.api.get_ticker_price(symbol)
                if 'data' in ticker_response and 'price' in ticker_response['data']:
                    print(f"✅ Ticker price for {symbol}: ${ticker_response['data']['price']}")
                    working_symbol = symbol
                    break
                else:
                    print(f"❌ Ticker failed for {symbol}: {ticker_response.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"❌ Error getting ticker for {symbol}: {e}")
        else:
            print("❌ No working symbols found for ticker")
            working_symbol = None
        
        # Test technical analysis (with different symbol formats)
        print("\nTesting technical analysis with different symbol formats...")
        
        test_symbols = ['BTC_USDT', 'ETH_USDT', 'ETHUSDT', 'DOTUSDT', 'DOT_USDT', 'BTCUSDT']
        
        for symbol in test_symbols:
            print(f"Testing symbol: {symbol}")
            analysis_result = trading_bot.get_technical_analysis(symbol)
            if analysis_result['success']:
                print(f"✅ Technical analysis for {symbol} retrieved successfully")
                data = analysis_result['data']
                print(f"   RSI: {data.get('rsi', 0):.2f}")
                print(f"   Current price: ${data.get('current_price', 0):.2f}")
                if 'note' in data:
                    print(f"   Note: {data['note']}")
                break
            else:
                print(f"❌ Technical analysis for {symbol} failed: {analysis_result.get('error', 'Unknown error')}")
        else:
            print("❌ All symbol formats failed for technical analysis")
        
        print("\n🎉 GUI functionality test completed!")
        return True
        
    except Exception as e:
        print(f"❌ GUI functionality test failed: {e}")
        return False

def main():
    """Main test function"""
    print("=" * 50)
    print("Pionex Trading Bot GUI - Functionality Test")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv()
    
    # Check if API credentials are set
    if not os.getenv('PIONEX_API_KEY') or not os.getenv('PIONEX_SECRET_KEY'):
        print("❌ Missing API credentials. Please set PIONEX_API_KEY and PIONEX_SECRET_KEY in your .env file")
        return False
    
    # Run functionality test
    success = test_gui_functionality()
    
    if success:
        print("\n✅ All GUI functionality tests passed!")
        print("The GUI is ready to use. Run 'python gui/run_gui.py' to start the application.")
    else:
        print("\n❌ Some GUI functionality tests failed.")
        print("Please check the error messages above and fix the issues.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 