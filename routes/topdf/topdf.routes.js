import { Router } from "express";
import multer from "multer";
import path from "path";
import { convertImgToPdf } from "../../controllers/topdf/ImgToPdf.controller.js";
import { convertDocxToPdf } from "../../controllers/topdf/docxToPdf.controller.js";
import { downloadConvertedFile } from "../../controllers/downloadFile.controller.js";
import { convertxlsxToPdf } from "../../controllers/topdf/XlsxToPdf.controller.js";
import { convertHtmlToPdf } from "../../controllers/topdf/HtmlToPdf.controller.js";
export const topdfRoutes = Router();
 
// mmulter setup 
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null , Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// routes
topdfRoutes.post("/docx", upload.single("file"), convertDocxToPdf);  // only doc to pdf possible
topdfRoutes.post("/jpeg", upload.single("file"), convertImgToPdf);   // jpeg to pdf 
topdfRoutes.post("/png", upload.single("file"), convertImgToPdf);    // png to pdf  
topdfRoutes.post("/xlsx", upload.single("file"), convertxlsxToPdf);  // xlsx to pdf
topdfRoutes.post("/html", upload.single("file"), convertHtmlToPdf);  // html to pdf


// topdfRoutes.get("/download/:fileName", downloadConvertedFile);
 