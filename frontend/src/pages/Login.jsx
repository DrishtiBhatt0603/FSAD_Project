import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>School Administration System</h1>
        <h2 style={styles.subtitle}>Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={styles.hint}>
          <strong>Demo credentials:</strong><br />
          admin / admin123 | principal / principal123<br />
          clerk1 / clerk123 | teacher1 / teacher123
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
          background:'linear-gradient(135deg,#1a237e,#283593)' },
  card: { background:'#fff', borderRadius:12, padding:'40px 48px', width:400, boxShadow:'0 8px 32px rgba(0,0,0,0.2)' },
  title: { textAlign:'center', color:'#1a237e', fontSize:20, marginBottom:4 },
  subtitle: { textAlign:'center', color:'#555', fontSize:16, marginBottom:24, fontWeight:'normal' },
  error: { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:16, fontSize:14 },
  field: { marginBottom:16 },
  label: { display:'block', marginBottom:6, fontWeight:600, color:'#333', fontSize:14 },
  input: { width:'100%', padding:'10px 12px', border:'1px solid #ccc', borderRadius:6, fontSize:14, boxSizing:'border-box' },
  btn: { width:'100%', padding:'12px', background:'#1a237e', color:'#fff', border:'none',
         borderRadius:6, fontSize:15, cursor:'pointer', marginTop:8 },
  hint: { marginTop:24, padding:12, background:'#f5f5f5', borderRadius:6, fontSize:12, color:'#666', lineHeight:1.6 },
};
