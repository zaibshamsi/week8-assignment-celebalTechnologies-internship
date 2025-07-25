import express from "express";
import cors from "cors";
import path from "path";
import { topdfRoutes } from "./routes/topdf/topdf.routes.js";
import { frompdfRoutes } from "./routes/frompdf/pdfTofile.routes.js";
import {  DownloadRoutes } from "./routes/download.routes.js";


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/convert/topdf", topdfRoutes);
app.use("/api/convert/frompdf", frompdfRoutes);
app.use("/api/convert", DownloadRoutes)

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
