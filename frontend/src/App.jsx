import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar      from './components/Navbar';
import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import PostList    from './pages/PostList';
import PostDetail  from './pages/PostDetail';
import PostCreate  from './pages/PostCreate';
import MyPage      from './pages/MyPage';

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/"        element={<Home />} />
        <Route path="/login"   element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/posts"   element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/create"  element={<PrivateRoute><PostCreate /></PrivateRoute>} />
        <Route path="/mypage"  element={<PrivateRoute><MyPage /></PrivateRoute>} />
      </Routes>
    </div>
  );
}
