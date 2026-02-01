const pool = require("../configs/db");

exports.createComment = async (imageId, userId, content) => {
  if (!content) {
    throw new Error("Content is required");
  }

  const [result] = await pool.query(
    `
    INSERT INTO comments (content, user_id, image_id)
    VALUES (?, ?, ?)
    `,
    [content, userId, imageId]
  );

  return {
    id: result.insertId,
    content,
    user_id: userId,
    image_id: imageId
  };
};

exports.deleteComment = async (commentId, userId) => {
  const [rows] = await pool.query(
    "SELECT user_id FROM comments WHERE id = ?",
    [commentId]
  );

  if (!rows.length) {
    const err = new Error("Comment not found");
    err.status = 404;
    throw err;
  }

  if (rows[0].user_id !== userId) {
    const err = new Error("You are not allowed to delete this comment");
    err.status = 403;
    throw err;
  }

  await pool.query(
    "DELETE FROM comments WHERE id = ?",
    [commentId]
  );
};
