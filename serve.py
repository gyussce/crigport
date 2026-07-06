#!/usr/bin/env python3
"""Serve the portfolio locally.

Usage:  python3 serve.py   →  http://localhost:8000/
"""
import http.server
import os
import webbrowser

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))

os.chdir(ROOT)
handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map.update({".js": "application/javascript", ".mjs": "application/javascript"})

with http.server.ThreadingHTTPServer(("", PORT), handler) as httpd:
    url = f"http://localhost:{PORT}/"
    print(f"Serving portfolio at {url}  (Ctrl+C to stop)")
    try:
        webbrowser.open(url)
    except Exception:
        pass
    httpd.serve_forever()
