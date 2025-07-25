import path from "path"
import fs from "fs"
import axios from "axios"
import dotenv from "dotenv"
import { dirname } from "path"
import { fileURLToPath } from "url"
import { url } from "inspector"

dotenv.config();

const API_KEY = process.env.API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const convertHtmlToPdf = async ( req, res ) => {
    if(!req.file) return res.status(400).send("No file uploaded");

    const filePath = req.file.path;
    const fileName = path.basename(filePath)
    const outputFileName = fileName.replace(/\.[^/.]+$/, "") + ".pdf";
    const outputPath = path.join(__dirname, "../../converted", fileName.replace(/\.[^/.]+$/, "") + ".pdf");
  
    try {
        // getting presigned url
        const presignRes = await axios.get("https://api.pdf.co/v1/file/upload/get-presigned-url", {
      params: {
        name: fileName,
        contenttype: "application/octet-stream"
      },
      headers: { "x-api-key": API_KEY }
    }); 

    const { presignedUrl, url: uploadedFileUrl } = presignRes.data;

    const htmlContent = fs.readFileSync(filePath, "utf8");

    // upload the html file
    const fileBuffer = fs.readFileSync(filePath);
    await axios.put(presignedUrl, fileBuffer, {
      headers: { "Content-Type": "application/octet-stream" }
    });

    // convert to html
    const convertRes = await axios.post("https://api.pdf.co/v1/pdf/convert/from/html", {
      name: outputFileName,
      html: htmlContent,
      url: uploadedFileUrl      
    }, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      }
    })
  
    // Download PDF to local server
    const pdfDownload = await axios.get(convertRes.data.url, {responseType: "stream"});
    const writer = fs.createWriteStream(outputPath);
    pdfDownload.data.pipe(writer);

    writer.on("finish", () => {
      res.status(200).json({
        success: true,
        downloadUrl: `/api/convert/download/${outputFileName}`
      })
    })

     writer.on("error", (err) => {
      console.error("File write error:", err.message);
      res.status(500).json({ error: "Failed to write PDF file." });
    });


    } catch (error) {
        console.error("HTML to PDF conversion error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to convert HTML to PDF." });
    }
} 