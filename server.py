import http.server
import socketserver

PORT = 3000

handler = http.server.SimpleHTTPRequestHandler
handler.extensions_map['.css'] = 'text/css'
handler.extensions_map['.js'] = 'application/javascript'

with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Serving on http://localhost:{PORT}")
    httpd.serve_forever()