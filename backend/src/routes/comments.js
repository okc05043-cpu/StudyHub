const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET /api/comments/post/:postId
router.get('/post/:postId', async (req, res) => {
  try {
    const [comments] = await db.query(
      `SELECT c.id, c.content, c.created_at, u.nickname
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// POST /api/comments/post/:postId
router.post('/post/:postId', auth, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: '내용을 입력해주세요.' });

  try {
    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.postId, req.user.id, content]
    );
    res.status(201).json({ id: result.insertId, content, nickname: req.user.nickname });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [[comment]] = await db.query('SELECT user_id FROM comments WHERE id = ?', [req.params.id]);
    if (!comment) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ message: '권한이 없습니다.' });

    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
