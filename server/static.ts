import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const candidates = [
    path.resolve(__dirname, "public"),
    path.resolve(__dirname, "../public"),
    path.resolve(process.cwd(), "public"),
  ];

  const distPath = candidates.find((p) => fs.existsSync(p));

  if (!distPath) {
    console.warn(
      "Could not find a client build directory in expected locations. Static file serving is disabled. Build the client and place it in one of: server/public, ../public, or ./public",
    );
    return;
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
