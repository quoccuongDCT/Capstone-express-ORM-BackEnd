const pool = require("../configs/db");

exports.getImages = async (page, limit) => {
  const offset = (page - 1) * limit;

  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM images"
  );

  const [rows] = await pool.query(
    `
    SELECT 
      images.id,
      images.title,
      images.image_url,
      images.created_at,
      users.id AS user_id,
      users.name AS user_name,
      users.avatar_url
    FROM images
    JOIN users ON images.user_id = users.id
    ORDER BY images.created_at DESC
    LIMIT ? OFFSET ?
    `,
    [limit, offset]
  );

  const data = rows.map(row => ({
    id: row.id,
    title: row.title,
    image_url: row.image_url,
    created_at: row.created_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      avatar_url: row.avatar_url
    }
  }));

  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data
  };
};

exports.createImage = async ({ title, description, image_url }, userId) => {
  if (!title || !image_url) {
    throw new Error("Title and image_url are required");
  }

  const [result] = await pool.query(
    `
    INSERT INTO images (title, description, image_url, user_id)
    VALUES (?, ?, ?, ?)
    `,
    [title, description || null, image_url, userId]
  );

  return {
    id: result.insertId,
    title,
    description,
    image_url,
    user_id: userId
  };
};

exports.getImageById = async (imageId) => {
  // 1. Lấy ảnh
  const [images] = await pool.query(
    `
    SELECT 
      images.id,
      images.title,
      images.description,
      images.image_url,
      images.created_at,
      users.id AS user_id,
      users.name AS user_name,
      users.avatar_url
    FROM images
    JOIN users ON images.user_id = users.id
    WHERE images.id = ?
    `,
    [imageId]
  );

  if (!images.length) {
    throw new Error("Image not found");
  }

  const image = images[0];

  // 2. Lấy comment
  const [comments] = await pool.query(
    `
    SELECT
      comments.id,
      comments.content,
      comments.created_at,
      users.id AS user_id,
      users.name AS user_name,
      users.avatar_url
    FROM comments
    JOIN users ON comments.user_id = users.id
    WHERE comments.image_id = ?
    ORDER BY comments.created_at ASC
    `,
    [imageId]
  );

  return {
    id: image.id,
    title: image.title,
    description: image.description,
    image_url: image.image_url,
    created_at: image.created_at,
    user: {
      id: image.user_id,
      name: image.user_name,
      avatar_url: image.avatar_url
    },
    comments: comments.map(c => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user: {
        id: c.user_id,
        name: c.user_name,
        avatar_url: c.avatar_url
      }
    }))
  };
};

exports.deleteImage = async (imageId, userId) => {
  const [rows] = await pool.query(
    "SELECT user_id FROM images WHERE id = ?",
    [imageId]
  );

  if (!rows.length) {
    const error = new Error("Image not found");
    error.status = 404;
    throw error;
  }

  const image = rows[0];

  // 2. Check owner
  if (image.user_id !== userId) {
    const error = new Error("You are not allowed to delete this image");
    error.status = 403;
    throw error;
  }

  // 3. Delete
  await pool.query(
    "DELETE FROM images WHERE id = ?",
    [imageId]
  );
};

exports.checkSaved = async (imageId, userId) => {
  const [rows] = await pool.query(
    "SELECT id FROM image_saves WHERE image_id = ? AND user_id = ?",
    [imageId, userId]
  );

  return rows.length > 0;
};
exports.saveImage = async (imageId, userId) => {
  try {
    await pool.query(
      "INSERT INTO image_saves (image_id, user_id) VALUES (?, ?)",
      [imageId, userId]
    );
  } catch (err) {
    // duplicate save
    if (err.code === "ER_DUP_ENTRY") {
      throw new Error("Image already saved");
    }
    throw err;
  }
};
exports.unsaveImage = async (imageId, userId) => {
  const [result] = await pool.query(
    "DELETE FROM image_saves WHERE image_id = ? AND user_id = ?",
    [imageId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Image not saved yet");
  }
};
