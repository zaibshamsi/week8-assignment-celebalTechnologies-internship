import path from "path";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const API_KEY = process.env.API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const convertxlsxToPdf = async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const filePath = req.file.path;
  const fileName = path.basename(filePath);
  const outputPath = path.join(__dirname, "../../converted", fileName.replace(/\.[^/.]+$/, "") + ".pdf");

  try {
    //  1: Get presigned URL
    const presignRes = await axios.get("https://api.pdf.co/v1/file/upload/get-presigned-url", {
      params: {
        name: fileName,
        contenttype: "application/octet-stream"
      },
      headers: { "x-api-key": API_KEY }
    });

    const { presignedUrl, url: uploadedFileUrl } = presignRes.data;

    //  2: Upload file to PDF.co 
    const fileBuffer = fs.readFileSync(filePath);
    await axios.put(presignedUrl, fileBuffer, {
      headers: { "Content-Type": "application/octet-stream" }
    });

    //  3: Request conversion
    const convertRes = await axios.post("https://api.pdf.co/v1/xls/convert/to/pdf", {
      name: fileName.replace(/\.[^/.]+$/, "") + ".pdf",
      url: uploadedFileUrl
    }, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      }
    });

    // 4: Download PDF
    const pdfDownload = await axios.get(convertRes.data.url, { responseType: "stream" });
    const writer = fs.createWriteStream(outputPath);

    pdfDownload.data.pipe(writer);

    writer.on("finish", () => {
  const downloadUrl = `/api/convert/download/${path.basename(outputPath)}`;
  res.json({ success: true, downloadUrl });
});


    writer.on("error", (err) => {
      console.error("File write error:", err.message);
      res.status(500).json({ error: "Failed to write PDF file." });
    });

  } catch (error) {
    console.error("PDF conversion error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to convert document." });
  }
};
