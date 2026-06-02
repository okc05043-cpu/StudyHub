const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// POST /api/likes/:postId  — 좋아요 토글
router.post('/:postId', auth, async (req, res) => {
  try {
    const [[row]] = await db.query(
      'SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?',
      [req.user.id, req.params.postId]
    );

    if (row) {
      await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.postId]);
    } else {
      await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.postId]);
    }

    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [req.params.postId]
    );
    res.json({ liked: !row, count });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// GET /api/likes/:postId?userId=
router.get('/:postId', auth, async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [req.params.postId]
    );
    const [[row]] = await db.query(
      'SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?',
      [req.user.id, req.params.postId]
    );
    res.json({ count, liked: !!row });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
