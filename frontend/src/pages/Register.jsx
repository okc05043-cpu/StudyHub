import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

export default function Register() {
  const [form, setForm]   = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const { login }         = useAuth();
  const navigate          = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.nickname);
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="이메일" required
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-indigo-400" />
        <input type="password" placeholder="비밀번호" required
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-indigo-400" />
        <input type="text" placeholder="닉네임" required
          value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-indigo-400" />
        <button type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700">
          가입하기
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        이미 계정이 있으신가요? <Link to="/login" className="text-indigo-600 hover:underline">로그인</Link>
      </p>
    </div>
  );
}
