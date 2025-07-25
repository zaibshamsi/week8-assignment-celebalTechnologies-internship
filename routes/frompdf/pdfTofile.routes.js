import { Router } from "express";
import multer from "multer";
import path from "path";
import { convertPdfToPng } from "../../controllers/frompdf/PdfToPng.controller.js";
import { convertPdfToJpeg } from "../../controllers/frompdf/PdfToJpeg.controller.js";
import { convertPdfToHtml } from "../../controllers/frompdf/PdfToHtml.controller.js";
import { convertPdfToXls } from "../../controllers/frompdf/PdfToXls.controller.js";

// mmulter setup 
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null , Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

export const frompdfRoutes = Router();

frompdfRoutes.post("/tojpg", upload.single("file"), convertPdfToJpeg )
frompdfRoutes.post("/topng", upload.single("file"), convertPdfToPng )
frompdfRoutes.post("/tohtml", upload.single("file"), convertPdfToHtml)
frompdfRoutes.post("/toxls", upload.single("file"), convertPdfToXls)