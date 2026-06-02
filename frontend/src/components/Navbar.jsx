import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, nickname, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/" className="text-xl font-bold tracking-tight">StudyHub</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/posts" className="hover:underline">자료 탐색</Link>
        {isLoggedIn ? (
          <>
            <Link to="/create" className="hover:underline">자료 올리기</Link>
            <Link to="/mypage" className="hover:underline">{nickname}</Link>
            <button onClick={handleLogout} className="hover:underline">로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="hover:underline">로그인</Link>
            <Link to="/register" className="bg-white text-indigo-600 px-3 py-1 rounded font-medium hover:bg-indigo-50">회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}
