import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function PostCreate() {
  const navigate = useNavigate();
  const [meta,  setMeta]  = useState({ categories: [], subjects: [] });
  const [form,  setForm]  = useState({ title: '', description: '', category_id: '', subject_id: '' });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { api.get('/posts/meta').then(r => setMeta(r.data)); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.category_id || !form.subject_id)
      return setError('카테고리와 과목을 선택해주세요.');

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    Array.from(files).forEach(f => fd.append('files', f));

    try {
      const { data } = await api.post('/posts', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/posts/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || '업로드에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">자료 올리기</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">제목 *</label>
          <input required value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm" placeholder="자료 제목" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">카테고리 *</label>
            <select required value={form.category_id}
              onChange={e => setForm({ ...form, category_id: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm">
              <option value="">선택</option>
              {meta.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">과목 *</label>
            <select required value={form.subject_id}
              onChange={e => setForm({ ...form, subject_id: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm">
              <option value="">선택</option>
              {meta.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">설명</label>
          <textarea value={form.description} rows={4}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm resize-none" placeholder="자료에 대한 설명을 입력하세요" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">파일 첨부 (최대 5개, 50MB)</label>
          <input type="file" multiple accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
            onChange={e => setFiles(e.target.files)}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700" />
        </div>
        <button type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700">
          업로드
        </button>
      </form>
    </div>
  );
}
