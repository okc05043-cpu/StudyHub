import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function PostDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isLoggedIn, nickname } = useAuth();

  const [post,       setPost]       = useState(null);
  const [comments,   setComments]   = useState([]);
  const [likeState,  setLikeState]  = useState({ count: 0, liked: false });
  const [bookmarked, setBookmarked] = useState(false);
  const [comment,    setComment]    = useState('');

  // 최근 본 자료 기록 (sessionStorage)
  useEffect(() => {
    const recent = JSON.parse(sessionStorage.getItem('recentPosts') || '[]');
    const updated = [Number(id), ...recent.filter(x => x !== Number(id))].slice(0, 10);
    sessionStorage.setItem('recentPosts', JSON.stringify(updated));
  }, [id]);

  const loadPost = useCallback(async () => {
    const { data } = await api.get(`/posts/${id}`);
    setPost(data);
  }, [id]);

  const loadComments = useCallback(async () => {
    const { data } = await api.get(`/comments/post/${id}`);
    setComments(data);
  }, [id]);

  const loadLike = useCallback(async () => {
    if (!isLoggedIn) return;
    const { data } = await api.get(`/likes/${id}`);
    setLikeState(data);
  }, [id, isLoggedIn]);

  const loadBookmark = useCallback(() => {
    const bm = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setBookmarked(bm.includes(Number(id)));
  }, [id]);

  useEffect(() => {
    loadPost();
    loadComments();
    loadLike();
    loadBookmark();
  }, [loadPost, loadComments, loadLike, loadBookmark]);

  const handleLike = async () => {
    if (!isLoggedIn) return alert('로그인이 필요합니다.');
    const { data } = await api.post(`/likes/${id}`);
    setLikeState({ count: data.count, liked: data.liked });
  };

  const handleBookmark = () => {
    const bm      = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const numId   = Number(id);
    const updated = bm.includes(numId) ? bm.filter(x => x !== numId) : [...bm, numId];
    localStorage.setItem('bookmarks', JSON.stringify(updated));
    setBookmarked(!bookmarked);
    // 서버 동기화 (로그인 상태일 때)
    if (isLoggedIn) api.post(`/bookmarks/${id}`).catch(() => {});
  };

  const handleComment = async e => {
    e.preventDefault();
    if (!comment.trim()) return;
    await api.post(`/comments/post/${id}`, { content: comment });
    setComment('');
    loadComments();
  };

  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까?')) return;
    await api.delete(`/posts/${id}`);
    navigate('/posts');
  };

  if (!post) return <p className="text-center py-20 text-gray-400">로딩 중...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex gap-2 mb-3">
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{post.category}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{post.subject}</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-gray-500 text-sm mb-4">
          {post.nickname} · {new Date(post.created_at).toLocaleDateString()}
        </p>
        {post.description && <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.description}</p>}

        {/* 파일 목록 */}
        {post.files?.length > 0 && (
          <div className="border rounded p-3 mb-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">첨부 파일</p>
            {post.files.map(f => (
              <a key={f.id} href={`/api/posts/${id}/download/${f.id}`}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                📄 {f.original_name} <span className="text-gray-400">({Math.round(f.file_size / 1024)} KB)</span>
              </a>
            ))}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center gap-4">
          <button onClick={handleLike}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded border ${likeState.liked ? 'bg-red-50 border-red-300 text-red-500' : 'hover:bg-gray-50'}`}>
            ♥ {likeState.count}
          </button>
          <button onClick={handleBookmark}
            className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded border ${bookmarked ? 'bg-yellow-50 border-yellow-300 text-yellow-600' : 'hover:bg-gray-50'}`}>
            {bookmarked ? '★ 저장됨' : '☆ 북마크'}
          </button>
          {post.nickname === nickname && (
            <button onClick={handleDelete}
              className="ml-auto text-sm text-red-500 hover:underline">삭제</button>
          )}
        </div>
      </div>

      {/* 댓글 */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">댓글 {comments.length}</h2>
        {isLoggedIn && (
          <form onSubmit={handleComment} className="flex gap-2 mb-4">
            <input value={comment} onChange={e => setComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="flex-1 border rounded px-3 py-1.5 text-sm" />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm">등록</button>
          </form>
        )}
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="border-b pb-3">
              <p className="text-sm font-medium">{c.nickname}</p>
              <p className="text-sm text-gray-700 mt-0.5">{c.content}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-400">첫 댓글을 남겨보세요.</p>}
        </div>
      </div>
    </div>
  );
}
