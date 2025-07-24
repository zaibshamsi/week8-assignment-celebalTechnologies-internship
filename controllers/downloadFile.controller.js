import fs from 'fs';
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const downloadConvertedFile = (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, "../converted", fileName);
  const baseName = fileName.split(".")[0]; // safer for names like "file.test.pdf"

  const uploadDir = path.join(__dirname, "../uploads");
  const possibleExtensions = [".jpeg", ".jpg", ".docx", ".png", ".xlsx", ".html", ".pdf"];
  let uploadedFilePath;

  // Find matching uploaded file
  for (let ext of possibleExtensions) {
    const tryPath = path.join(uploadDir, baseName + ext);
    if (fs.existsSync(tryPath)) {
      uploadedFilePath = tryPath;
      break;
    }
  }

  // Check if converted file exists before sending
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Download error: File does not exist", filePath);
      return res.status(404).send("Converted file not found");
    }

    // Send the file
    res.download(filePath, (err) => {
      if (err) {
        console.error("Download failed:", err.message);
        return res.status(500).send("Error downloading file");
      }

      // Delete converted file
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting converted file:", err.message);
      });

      // Delete uploaded file if found
      if (uploadedFilePath) {
        fs.unlink(uploadedFilePath, (err) => {
          if (err) console.error("Error deleting uploaded file:", err.message);
        });
      }
    });
  });
};
