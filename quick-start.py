#!/usr/bin/env python3
"""
Quick start script for Real-Time Detection Services
Runs all 3 services (Node backend, Python Flask AI, Vue frontend) in the same window with logging
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def check_command_exists(command):
    """Check if a command exists in PATH"""
    from shutil import which
    return which(command) is not None

def main():
    project_root = Path(__file__).parent
    
    print_header("Real-Time Detection Quick Start")
    
    # Check prerequisites
    print("Checking prerequisites...")
    
    if not check_command_exists('node'):
        print("❌ ERROR: Node.js is not installed or not in PATH")
        print("   Install from: https://nodejs.org/")
        sys.exit(1)
    print("✓ Node.js found")
    
    if not check_command_exists('python') and not check_command_exists('python3'):
        print("❌ ERROR: Python is not installed or not in PATH")
        print("   Install from: https://www.python.org/")
        sys.exit(1)
    print("✓ Python found")
    
    # Get the python command (python or python3)
    python_cmd = 'python' if check_command_exists('python') else 'python3'
    
    processes = []
    
    try:
        print_header("Starting Services")
        
        # Start Node.js backend
        print("[1/3] Starting Node.js Backend on port 8097...")
        backend_cwd = project_root / "backend-node"
        backend_process = subprocess.Popen(
            ['npm', 'start'],
            cwd=backend_cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        processes.append(('Node.js Backend', backend_process))
        print("✓ Backend started\n")
        time.sleep(2)
        
        # Start Python AI service
        print("[2/3] Starting Python AI Service on port 5000...")
        python_process = subprocess.Popen(
            [python_cmd, 'scripts/ai_service.py'],
            cwd=backend_cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        processes.append(('Python AI Service', python_process))
        print("✓ AI Service started\n")
        time.sleep(2)
        
        # Start Vue frontend
        print("[3/3] Starting Vue Frontend on port 8081...")
        frontend_cwd = project_root / "frontend-vue"
        frontend_process = subprocess.Popen(
            ['npm', 'run', 'serve'],
            cwd=frontend_cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        processes.append(('Vue Frontend', frontend_process))
        print("✓ Frontend started\n")
        
        print_header("All Services Running")
        print("""
Access the application at:
  → http://localhost:8081

Services:
  ✓ Frontend (Vue):     http://localhost:8081
  ✓ Backend (Node):     http://localhost:8097
  ✓ AI Service (Flask): http://localhost:5000

Next steps:
  1. Open http://localhost:8081 in your browser
  2. Click "Real-time Detection" in the header
  3. Wait for the video streams to appear (CONNECTING → LIVE)

To stop all services, press Ctrl+C
        """)
        
        print_header("Service Logs")
        print("(Output from all services appears below)\n")
        
        # Monitor all processes
        while True:
            for name, process in processes:
                # Check if process is still running
                if process.poll() is not None:
                    print(f"\n❌ {name} has stopped unexpectedly!")
                    # Print remaining output
                    try:
                        output, _ = process.communicate(timeout=1)
                        if output:
                            print(f"Last output:\n{output}")
                    except:
                        pass
                    
                    # Ask to restart
                    response = input("\nRestart? (y/n): ")
                    if response.lower() == 'y':
                        main()
                    sys.exit(1)
            
            time.sleep(1)
    
    except KeyboardInterrupt:
        print_header("Shutting Down Services")
        
        for name, process in processes:
            try:
                print(f"Stopping {name}...")
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()
                print(f"✓ {name} stopped")
            except Exception as e:
                print(f"Error stopping {name}: {e}")
        
        print("\nAll services stopped. Goodbye!")
        sys.exit(0)

if __name__ == '__main__':
    main()
