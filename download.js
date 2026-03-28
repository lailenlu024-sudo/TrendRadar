#!/usr/local/bin/node
const https = require("https");
const fs = require("fs");
const pathLib = require("path");

const BASE = "https://api.github.com/repos/sansan0/TrendRadar/contents";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36";

const files = [
  ["docker/Dockerfile", "docker/Dockerfile"],
  ["docker/docker-compose.yml", "docker/docker-compose.yml"],
  ["docker/entrypoint.sh", "docker/entrypoint.sh"],
  ["docker/.env", "docker/.env"],
  ["setup-mac.sh", "setup-mac.sh"],
  ["README.md", "README.md"],
  ["requirements.txt", "requirements.txt"],
  ["pyproject.toml", "pyproject.toml"],
  ["config/config.yaml", "config/config.yaml"],
  ["config/frequency_words.txt", "config/frequency_words.txt"],
  ["config/ai_interests.txt", "config/ai_interests.txt"],
  ["config/timeline.yaml", "config/timeline.yaml"],
];

const BASE_DIR = "/Users/ailenl/TrendRadar";

function fetchGitHub(path, outPath) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.github.com",
        path: `/repos/sansan0/TrendRadar/contents/${path}`,
        headers: { "User-Agent": UA, Accept: "application/vnd.github.v3+json" },
        timeout: 15000,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          try {
            const data = JSON.parse(Buffer.concat(chunks).toString());
            if (data.content) {
              const content = Buffer.from(data.content, "base64").toString("utf8");
              const fullPath = pathLib.join(BASE_DIR, outPath);
              fs.mkdirSync(pathLib.dirname(fullPath), { recursive: true });
              fs.writeFileSync(fullPath, content);
              console.log(`✅ ${outPath} (${content.length}b)`);
              resolve(content);
            } else {
              console.log(`❌ no content: ${path}`);
              resolve(null);
            }
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    req.end();
  });
}

(async () => {
  for (const [remote, local] of files) {
    try {
      await fetchGitHub(remote, local);
    } catch (e) {
      console.log(`❌ ${remote}: ${e.message}`);
    }
  }
  console.log("\n下载完成！");
})();
