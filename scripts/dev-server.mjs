import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import claudeHandler from "../api/claude.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const port = process.env.PORT || 3000;

try {
  const envFile = await fs.readFile(path.join(root, ".env"), "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
} catch {
  // no .env file — that's fine, ANTHROPIC_API_KEY just won't be set
}

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

function makeRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(obj));
  };
  return res;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/claude") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch {
        req.body = {};
      }
      await claudeHandler(req, makeRes(res));
    });
    return;
  }

  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(publicDir, decodeURIComponent(urlPath.split("?")[0]));
  try {
    const data = await fs.readFile(filePath);
    res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
