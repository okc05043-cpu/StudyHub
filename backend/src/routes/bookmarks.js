const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET /api/bookmarks  — 내 북마크 목록
router.get('/', auth, async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.id, p.title, p.download_count, p.created_at,
              u.nickname, c.name AS category, s.name AS subject
       FROM bookmarks b
       JOIN posts p      ON b.post_id = p.id
       JOIN users u      ON p.user_id = u.id
       JOIN categories c ON p.category_id = c.id
       JOIN subjects s   ON p.subject_id = s.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/bookmarks/:postId  — 북마크 토글
router.post('/:postId', auth, async (req, res) => {
  try {
    const [[row]] = await db.query(
      'SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [req.user.id, req.params.postId]
    );

    if (row) {
      await db.query('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.postId]);
    } else {
      await db.query('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.postId]);
    }

    res.json({ bookmarked: !row });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
