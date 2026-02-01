const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/auth.middleware");
const commentController = require("../../controllers/comment.controller");

router.delete("/:id", authMiddleware, commentController.deleteComment);

module.exports = router;
