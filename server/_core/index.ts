import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import multer from "multer";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import path from "path";
import fs from "fs";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: ENV.cloudinaryCloudName,
  api_key: ENV.cloudinaryApiKey,
  api_secret: ENV.cloudinaryApiSecret,
});

// Multer Configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
    }
  },
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middlewares
  app.use(compression());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // Static files caching
  const staticCacheOptions = {
    maxAge: "1d",
    immutable: true,
  };

  // Serve uploads directory
  const uploadsPath = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use("/uploads", express.static(uploadsPath, staticCacheOptions));

  registerOAuthRoutes(app);

  // Optimized Image Upload Endpoint
  app.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      console.log("Upload request received");
      if (!req.file) {
        console.log("No image file provided");
        return res.status(400).json({ error: "No image file provided" });
      }

      console.log("Processing image with sharp...");
      // Sharp Processing - ensure transparency and high quality
      const processedBuffer = await sharp(req.file.buffer)
        .ensureAlpha() // Ensure we have an alpha channel
        .resize({
          width: 800,
          height: 600,
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Fully transparent
        })
        .webp({ 
          quality: 90,
          lossless: false,
          force: true 
        })
        .toBuffer();

      console.log("Uploading to Cloudinary...");
      // Cloudinary Upload
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "products",
            resource_type: "image",
            format: "webp",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload success");
              resolve(result);
            }
          }
        );
        uploadStream.end(processedBuffer);
      });

      console.log("Upload complete, returning URL");
      res.json({ url: (uploadResult as any).secure_url });
    } catch (error) {
      console.error("Upload error details:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
