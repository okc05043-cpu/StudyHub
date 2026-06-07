const router = require('express').Router();
const multer = require('multer');
const path   = require('path');
const { v4: uuidv4 } = require('uuid');
const db     = require('../db');
const auth   = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename:    (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`),
});
const ALLOWED_EXT = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED_EXT.includes(ext) ? cb(null, true) : cb(new Error('지원하지 않는 파일 형식입니다.'));
  },
});

// GET /api/posts?category_id=&subject_id=&keyword=&page=
router.get('/', async (req, res) => {
  const { category_id, subject_id, keyword, page = 1 } = req.query;
  const limit  = 12;
  const offset = (parseInt(page) - 1) * limit;
  const params = [];

  let where = 'WHERE 1=1';
  if (category_id) { where += ' AND p.category_id = ?'; params.push(category_id); }
  if (subject_id)  { where += ' AND p.subject_id = ?';  params.push(subject_id); }
  if (keyword)     { where += ' AND p.title LIKE ?';     params.push(`%${keyword}%`); }

  try {
    const [posts] = await db.query(
      `SELECT p.id, p.title, p.description, p.download_count, p.created_at,
              u.nickname, c.name AS category, s.name AS subject,
              COUNT(DISTINCT l.user_id) AS like_count,
              COUNT(DISTINCT f.id) AS file_count
       FROM posts p
       JOIN users u      ON p.user_id = u.id
       JOIN categories c ON p.category_id = c.id
       JOIN subjects s   ON p.subject_id = s.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN files f ON p.id = f.post_id
       ${where}
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT p.id) AS total FROM posts p ${where}`,
      params
    );

    res.json({ posts, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/posts/meta  — 카테고리·과목 목록
router.get('/meta', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories');
    const [subjects]   = await db.query('SELECT * FROM subjects');
    res.json({ categories, subjects });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const [[post]] = await db.query(
      `SELECT p.*, u.nickname, c.name AS category, s.name AS subject,
              COUNT(DISTINCT l.user_id) AS like_count
       FROM posts p
       JOIN users u      ON p.user_id = u.id
       JOIN categories c ON p.category_id = c.id
       JOIN subjects s   ON p.subject_id = s.id
       LEFT JOIN likes l ON p.id = l.post_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );
    if (!post) return res.status(404).json({ message: '자료를 찾을 수 없습니다.' });

    const [files] = await db.query('SELECT * FROM files WHERE post_id = ?', [req.params.id]);
    res.json({ ...post, files });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/posts  (인증 필요)
router.post('/', auth, upload.array('files', 5), async (req, res) => {
  const { title, description, category_id, subject_id } = req.body;
  if (!title || !category_id || !subject_id)
    return res.status(400).json({ message: '제목, 카테고리, 과목은 필수입니다.' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO posts (user_id, category_id, subject_id, title, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, category_id, subject_id, title, description || null]
    );
    const postId = result.insertId;

    if (req.files && req.files.length) {
      const fileRows = req.files.map(f => [postId, f.originalname, f.filename, f.size, f.mimetype]);
      await conn.query(
        'INSERT INTO files (post_id, original_name, stored_name, file_size, file_type) VALUES ?',
        [fileRows]
      );
    }

    await conn.commit();
    res.status(201).json({ id: postId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: '서버 오류', error: err.message });
  } finally {
    conn.release();
  }
});

// DELETE /api/posts/:id  (작성자만)
router.delete('/:id', auth, async (req, res) => {
  try {
    const [[post]] = await db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ message: '자료를 찾을 수 없습니다.' });
    if (post.user_id !== req.user.id) return res.status(403).json({ message: '권한이 없습니다.' });

    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/posts/:id/download/:fileId
router.get('/:id/download/:fileId', async (req, res) => {
  try {
    const [[file]] = await db.query(
      'SELECT * FROM files WHERE id = ? AND post_id = ?',
      [req.params.fileId, req.params.id]
    );
    if (!file) return res.status(404).json({ message: '파일을 찾을 수 없습니다.' });

    await db.query('UPDATE posts SET download_count = download_count + 1 WHERE id = ?', [req.params.id]);

    const filePath = path.join(__dirname, '../../uploads', file.stored_name);
    res.download(filePath, file.original_name);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
