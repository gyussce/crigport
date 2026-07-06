import http.server
import os

os.chdir("/Users/ganiuyussuf/Downloads/BeautyDemo")
handler = http.server.SimpleHTTPRequestHandler
with http.server.HTTPServer(("", 8092), handler) as httpd:
    print(f"Serving on port 8092")
    httpd.serve_forever()
