import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-4xl font-bold text-indigo-600 mb-4">StudyHub</h1>
      <p className="text-gray-600 text-lg mb-8 max-w-md">
        강의 자료, 족보, 스터디 정리본을 공유하는 학습 커뮤니티
      </p>
      <div className="flex gap-4">
        <Link to="/posts"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">
          자료 탐색하기
        </Link>
        {!isLoggedIn && (
          <Link to="/register"
            className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50">
            회원가입
          </Link>
        )}
      </div>
    </div>
  );
}
