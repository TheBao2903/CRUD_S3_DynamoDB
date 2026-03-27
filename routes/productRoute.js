import express from "express";
import * as productController from "../controller/productController.js";
import upload from "../uploads.js";

const router = express.Router();

router.get("/", productController.index);
router.get("/create", productController.create);
router.post("/create", upload.single("image"), productController.store);
router.get("/:id/edit", productController.edit);
router.post("/:id/edit", upload.single("image"), productController.update);
router.post("/:id/delete", productController.remove);
router.get("/:id", productController.show);

export default router;
