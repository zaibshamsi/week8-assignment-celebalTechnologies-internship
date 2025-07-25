import { Router } from "express";
import { downloadConvertedFile } from "../controllers/downloadFile.controller.js";

export const DownloadRoutes = Router();

DownloadRoutes.get("/download/:fileName", downloadConvertedFile)