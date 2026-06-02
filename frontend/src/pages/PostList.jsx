import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import PostCard from '../components/PostCard';

export default function PostList() {
  const [posts,      setPosts]      = useState([]);
  const [meta,       setMeta]       = useState({ categories: [], subjects: [] });
  const [filters,    setFilters]    = useState({ category_id: '', subject_id: '', keyword: '' });
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    api.get('/posts/meta').then(r => setMeta(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/posts', { params: { ...filters, page } })
      .then(r => { setPosts(r.data.posts); setTotalPages(r.data.totalPages); })
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleFilter = e => {
    setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleSearch = e => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">자료 탐색</h1>
        <Link to="/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          + 자료 올리기
        </Link>
      </div>

      {/* 필터 */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <select name="category_id" value={filters.category_id} onChange={handleFilter}
          className="border rounded px-3 py-1.5 text-sm">
          <option value="">전체 카테고리</option>
          {meta.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="subject_id" value={filters.subject_id} onChange={handleFilter}
          className="border rounded px-3 py-1.5 text-sm">
          <option value="">전체 과목</option>
          {meta.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input type="text" name="keyword" placeholder="제목 검색..."
            value={filters.keyword} onChange={handleFilter}
            className="flex-1 border rounded px-3 py-1.5 text-sm" />
          <button type="submit" className="bg-gray-800 text-white px-4 py-1.5 rounded text-sm">검색</button>
        </div>
      </form>

      {/* 목록 */}
      {loading ? (
        <p className="text-center text-gray-400 py-10">로딩 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400 py-10">자료가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)}
              className={`px-3 py-1 rounded text-sm ${n === page ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-100'}`}>
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
