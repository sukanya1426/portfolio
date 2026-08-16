#!/usr/bin/env python3
"""Local preview server that never caches and auto-reloads on file changes."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
WATCH = ("index.html", "styles.css", "script.js")


class NoCacheHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split("?", 1)[0] == "/__mtime":
            latest = max(os.path.getmtime(os.path.join(ROOT, name)) for name in WATCH)
            body = str(latest).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.headers.get("If-Modified-Since"):
            del self.headers["If-Modified-Since"]
        if self.headers.get("If-None-Match"):
            del self.headers["If-None-Match"]
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, keyword, value):
        if keyword.lower() in ("last-modified", "etag"):
            return
        super().send_header(keyword, value)


if __name__ == "__main__":
    port = 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    print(f"Serving without cache at http://127.0.0.1:{port}/")
    print("The page will reload automatically when you save files.")
    server.serve_forever()
