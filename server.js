import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
app.use(express.json({ limit: "10mb" }));
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Tabungan Atlit IKS PI Kota Kediri" });
});
const distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath, { maxAge: "1d", index: false }));
app.get("*", (_req, res) => {
  const indexPath = path.resolve(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>Tabungan Atlit IKS PI Kota Kediri</title>
        </head>
        <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <div style="text-align:center;padding:20px;">
            <h1 style="color:#f59e0b;font-size:24px;">Tabungan Atlit IKS PI Cabang Kota Kediri</h1>
            <p style="color:#94a3b8;font-size:14px;">Memuat aplikasi tabungan...</p>
          </div>
        </body>
      </html>
    `);
  }
});
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Tabungan IKS PI Server running on http://0.0.0.0:${PORT}`);
});
server.on("error", (err) => {
  console.error("Server listen error:", err);
});
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});
