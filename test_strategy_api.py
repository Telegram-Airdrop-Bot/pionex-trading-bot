#!/usr/bin/env python3
"""
Simple test script for strategy API endpoints
"""

import requests
import json
import time

def test_strategy_endpoints():
    """Test the strategy API endpoints"""
    base_url = "http://127.0.0.1:5000"
    
    print("Testing Strategy API Endpoints...")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    time.sleep(2)
    
    # Test 1: Get current strategy
    print("1. Testing GET /api/strategy")
    try:
        response = requests.get(f"{base_url}/api/strategy", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success: Current strategy = {data.get('data', {}).get('current_strategy', 'Unknown')}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 2: Test strategy
    print("2. Testing POST /api/strategy/test")
    try:
        payload = {"strategy": "RSI_STRATEGY", "symbol": "BTCUSDT"}
        response = requests.post(f"{base_url}/api/strategy/test", json=payload, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Success: Strategy test completed")
                print(f"   Signal: {data.get('data', {}).get('signal', {}).get('action', 'Unknown')}")
            else:
                print(f"❌ Strategy test failed: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 3: Get settings
    print("3. Testing GET /api/settings")
    try:
        response = requests.get(f"{base_url}/api/settings", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Success: Settings loaded")
            else:
                print(f"❌ Failed to load settings: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_strategy_endpoints() 