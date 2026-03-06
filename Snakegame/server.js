import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;
const port = 3000;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function resolvePath(requestUrl) {
  const parsedUrl = new URL(requestUrl, `http://localhost:${port}`);
  const relativePath = parsedUrl.pathname === "/" ? "index.html" : parsedUrl.pathname.slice(1);
  const normalizedPath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");

  return path.join(rootDir, normalizedPath);
}

const server = http.createServer(async (request, response) => {
  const filePath = resolvePath(request.url ?? "/");

  try {
    await access(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] ?? "application/octet-stream"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Snake running at http://localhost:${port}`);
});
