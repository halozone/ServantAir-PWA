#!/usr/bin/env python3
"""
Simple HTTP server for previewing Servant Air project
"""
import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers for better browser compatibility
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Change to the project directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create handler
    handler = CustomHTTPRequestHandler
    
    # Start server
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"🚁 Servant Air Preview Server Started!")
        print(f"📍 Local: http://localhost:{PORT}")
        print(f"🌐 Network: http://0.0.0.0:{PORT}")
        print(f"📁 Serving from: {os.getcwd()}")
        print("\n📋 Available Pages:")
        print("   • Login: http://localhost:8000/login.html")
        print("   • Operations: http://localhost:8000/dashboard.html")
        print("   • Flight Line: http://localhost:8000/flight-line.html")
        print("   • Calendar: http://localhost:8000/calendar.html")
        print("   • Aircraft: http://localhost:8000/aircraft.html")
        print("   • Profile: http://localhost:8000/profile.html")
        print("   • Messages: http://localhost:8000/messages.html")
        print("   • Payments: http://localhost:8000/payments.html")
        print("   • Membership: http://localhost:8000/membership.html")
        print("   • Settings: http://localhost:8000/settings.html")
        print("   • Roles: http://localhost:8000/roles.html")
        print("   • Admin Dashboard: http://localhost:8000/dashboard-admin.html")
        print("\n🔄 Press Ctrl+C to stop the server")
        
        # Open the main dashboard in browser
        try:
            webbrowser.open(f'http://localhost:{PORT}/dashboard.html')
        except:
            print("⚠️  Could not open browser automatically. Please navigate manually.")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main() 