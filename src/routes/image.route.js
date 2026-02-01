const express = require("express");
const router = express.Router();
const imageController = require("../../controllers/image.controller");
const authMiddleware = require("../../middlewares/auth.middleware");


router.get("/", imageController.getImages);
router.post("/", authMiddleware, imageController.createImage);
router.get("/:id", imageController.getImageById);
router.delete("/:id", authMiddleware, imageController.deleteImage);
router.get("/:id/saved", authMiddleware, imageController.checkSaved);
router.post("/:id/save", authMiddleware, imageController.saveImage);
router.delete("/:id/save", authMiddleware, imageController.unsaveImage);
router.post("/:id/comments", authMiddleware, imageController.createComment);
module.exports = router;
