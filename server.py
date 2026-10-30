"""Box Up 本機伺服器：提供網頁，並把過關解法自動存到 solution/ 目錄。

用法：python server.py [port]   （預設 8765，然後開啟 http://localhost:8765）
"""
import json
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
SOLUTION_DIR = os.path.join(ROOT, 'solution')


def safe_filename(name):
    name = re.sub(r'[\\/:*?"<>|\x00-\x1f]', '_', str(name)).strip(' .')
    if not name.lower().endswith('.txt'):
        name += '.txt'
    return name[:150]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        # 開發中檔案常改，避免瀏覽器用到舊的快取
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/ping':
            return self._json(200, {'ok': True, 'dir': 'solution'})
        return super().do_GET()

    def do_POST(self):
        if self.path != '/api/solution':
            return self._json(404, {'ok': False, 'error': 'not found'})
        try:
            length = int(self.headers.get('Content-Length', 0))
            if length > 1_000_000:
                return self._json(413, {'ok': False, 'error': 'too large'})
            data = json.loads(self.rfile.read(length).decode('utf-8'))
            filename = safe_filename(data['filename'])
            os.makedirs(SOLUTION_DIR, exist_ok=True)
            with open(os.path.join(SOLUTION_DIR, filename), 'w', encoding='utf-8', newline='\r\n') as f:
                f.write(str(data['content']))
            return self._json(200, {'ok': True, 'file': 'solution/' + filename})
        except Exception as e:  # noqa: BLE001
            return self._json(400, {'ok': False, 'error': str(e)})


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f'Box Up: http://localhost:{port}  (解法存到 {SOLUTION_DIR})')
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
