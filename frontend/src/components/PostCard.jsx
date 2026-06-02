import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <Link to={`/posts/${post.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
      <div className="flex gap-2 mb-2">
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{post.category}</span>
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{post.subject}</span>
      </div>
      <h3 className="font-semibold text-gray-800 truncate">{post.title}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.description || '설명 없음'}</p>
      <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
        <span>{post.nickname}</span>
        <div className="flex gap-3">
          <span>♥ {post.like_count}</span>
          <span>↓ {post.download_count}</span>
          <span>📄 {post.file_count}</span>
        </div>
      </div>
    </Link>
  );
}
