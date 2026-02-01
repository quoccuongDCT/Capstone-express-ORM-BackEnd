const imageService = require("../services/image.service");
const commentService = require("../services/comment.service");

exports.getImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await imageService.getImages(page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const image = await imageService.createImage(req.body, userId);
    res.status(201).json(image);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getImageById = async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await imageService.getImageById(imageId);
    res.json(image);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.id;

    await imageService.deleteImage(imageId, userId);
    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

exports.checkSaved = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.id;

    const saved = await imageService.checkSaved(imageId, userId);
    res.json({ saved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.saveImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.id;

    await imageService.saveImage(imageId, userId);
    res.json({ message: "Image saved" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.unsaveImage = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.id;

    await imageService.unsaveImage(imageId, userId);
    res.json({ message: "Image unsaved" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.createComment = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    const comment = await commentService.createComment(
      imageId,
      userId,
      content
    );

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
