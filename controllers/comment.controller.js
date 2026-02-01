const commentService = require("../services/comment.service");

exports.deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    await commentService.deleteComment(commentId, userId);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
};
