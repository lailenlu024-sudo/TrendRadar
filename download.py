#!/usr/bin/env python3
import urllib.request
import json
import base64
import os

BASE = "https://api.github.com/repos/sansan0/TrendRadar/contents"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

headers = {"User-Agent": UA, "Accept": "application/vnd.github.v3+json"}

def fetch_file(path, out_path):
    url = f"{BASE}/{path}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            if "content" in data:
                content = base64.b64decode(data["content"]).decode("utf-8")
                os.makedirs(os.path.dirname(out_path), exist_ok=True)
                with open(out_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"✅ {out_path} ({len(content)} bytes)")
            else:
                print(f"❌ no content: {path}")
    except Exception as e:
        print(f"❌ {path}: {e}")

# 下载所有关键文件
files = [
    ("docker/Dockerfile", "docker/Dockerfile"),
    ("docker/docker-compose.yml", "docker/docker-compose.yml"),
    ("docker/entrypoint.sh", "docker/entrypoint.sh"),
    ("docker/.env", "docker/.env"),
    ("setup-mac.sh", "setup-mac.sh"),
    ("README.md", "README.md"),
    ("requirements.txt", "requirements.txt"),
    ("pyproject.toml", "pyproject.toml"),
    ("config/config.example.yaml", "config/config.example.yaml"),
]

for remote, local in files:
    fetch_file(remote, f"/Users/ailenl/TrendRadar/{local}")
