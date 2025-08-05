#!/usr/bin/env python3
"""
Pionex Trading Bot GUI - Main Entry Point
Run this file to start the GUI application
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    """Main entry point for the GUI"""
    print("🚀 Starting Pionex Trading Bot GUI...")
    
    # Check if we're in the right directory
    if not Path(__file__).parent.exists():
        print("❌ GUI directory not found. Please run this from the project root.")
        return 1
    
    # Import and run the GUI
    try:
        from gui_app import main as gui_main
        gui_main()
        return 0
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please ensure all dependencies are installed.")
        return 1
    except Exception as e:
        print(f"❌ Error starting GUI: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 