import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import PostCard from '../components/PostCard';

export default function MyPage() {
  const { nickname }          = useAuth();
  const [tab, setTab]         = useState('my');
  const [myPosts, setMyPosts] = useState([]);
  const [bmPosts, setBmPosts] = useState([]);

  useEffect(() => {
    api.get('/posts', { params: { keyword: '' } }).then(r => {
      // 내가 작성한 글 필터 (nickname 기준)
      setMyPosts(r.data.posts.filter(p => p.nickname === nickname));
    });
    api.get('/bookmarks').then(r => setBmPosts(r.data));
  }, [nickname]);

  const posts = tab === 'my' ? myPosts : bmPosts;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">마이페이지</h1>
      <p className="text-gray-500 mb-6">{nickname}님 안녕하세요</p>

      <div className="flex gap-4 border-b mb-6">
        <button onClick={() => setTab('my')}
          className={`pb-2 text-sm font-medium ${tab === 'my' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
          내가 올린 자료 ({myPosts.length})
        </button>
        <button onClick={() => setTab('bm')}
          className={`pb-2 text-sm font-medium ${tab === 'bm' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
          북마크 ({bmPosts.length})
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          {tab === 'my' ? '아직 올린 자료가 없습니다.' : '북마크한 자료가 없습니다.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  );
}
