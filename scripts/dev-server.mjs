import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const port = process.env.PORT || 3000;

const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

function runRatesCli(date) {
  return new Promise((resolve) => {
    const py = process.env.PYTHON || "python";
    const args = [path.join(root, "scripts", "rates_cli.py")];
    if (date) args.push(date);
    const child = spawn(py, args);
    let out = "";
    let err = "";
    child.stdout.on("data", (c) => (out += c));
    child.stderr.on("data", (c) => (err += c));
    child.on("error", (e) => resolve({ status: 502, body: { error: e.message } }));
    child.on("close", (code) => {
      try {
        resolve({ status: code === 0 ? 200 : 502, body: JSON.parse(out) });
      } catch {
        resolve({ status: 502, body: { error: err || "rates_cli.py failed" } });
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url.startsWith("/api/rates")) {
    const url = new URL(req.url, `http://localhost:${port}`);
    const { status, body } = await runRatesCli(url.searchParams.get("date"));
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
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
