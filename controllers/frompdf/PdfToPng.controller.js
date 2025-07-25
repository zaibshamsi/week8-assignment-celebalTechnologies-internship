import path from "path"
import fs from "fs"
import axios from "axios"
import dotenv from "dotenv"
import { dirname } from "path"
import { fileURLToPath } from "url"

dotenv.config();

const API_KEY = process.env.API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const convertPdfToPng = async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const filePath = req.file.path;
  const fileName = path.basename(filePath);
  const outputDir = path.join(__dirname, "../../converted");

  try {
    // 1. Get pre-signed URL
    const presignRes = await axios.get("https://api.pdf.co/v1/file/upload/get-presigned-url", {
      params: {
        name: fileName,
        contenttype: "application/octet-stream"
      },
      headers: { "x-api-key": API_KEY }
    });

    const { presignedUrl, url: uploadedFileUrl } = presignRes.data;

    // 2. Upload file to presigned URL
    const fileBuffer = fs.readFileSync(filePath);
    await axios.put(presignedUrl, fileBuffer, {
      headers: { "Content-Type": "application/octet-stream" }
    });

    // 3. Call convert-to-png endpoint
    const convertRes = await axios.post("https://api.pdf.co/v1/pdf/convert/to/png", {
      name: fileName.replace(/\.[^/.]+$/, "") + ".png",
      url: uploadedFileUrl
    }, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      }
    });

    const imageUrls = convertRes.data.urls;

    if (!imageUrls || imageUrls.length === 0) {
      return res.status(500).json({ error: "No image URLs returned from conversion." }); 
    }

    // 4. Download the first PNG (you can extend this to download all pages)
    const firstImageUrl = imageUrls[0];
    const outputFileName = fileName.replace(/\.[^/.]+$/, "") + ".png";
    const outputPath = path.join(outputDir, outputFileName);

    const pngDownload = await axios.get(firstImageUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(outputPath);
    pngDownload.data.pipe(writer);
 
    writer.on("finish", () => {
      res.status(200).json({
        success: true,
        downloadUrl: `/api/convert/download/${outputFileName}`
      });
    });

    writer.on("error", (err) => {
      console.error("File write error:", err.message);
      res.status(500).json({ error: "Failed to write PNG file." });
    });

  } catch (error) {
    console.error("PDF TO PNG conversion error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to convert PDF to PNG." });
  }
};
