import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const ROLES = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'CLERK'];
const INIT = { name: '', username: '', password: '', role: 'TEACHER' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(INIT);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/users', form);
      setMsg(`User "${form.username}" created successfully!`);
      setForm(INIT);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch {
      setError('Failed to delete user.');
    }
  };

  const roleBadge = (role) => {
    const colors = { ADMIN:'#1a237e', PRINCIPAL:'#1b5e20', TEACHER:'#e65100', CLERK:'#6a1b9a' };
    return { background: colors[role] + '22', color: colors[role], padding:'2px 10px',
             borderRadius:12, fontSize:12, fontWeight:600 };
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>User Management</h2>
        <div style={styles.grid}>
          <div style={styles.formCard}>
            <h3 style={styles.sub}>Create New User</h3>
            {msg && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <Field label="Full Name *">
                <input style={styles.input} value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Priya Singh" />
              </Field>
              <Field label="Username *">
                <input style={styles.input} value={form.username}
                  onChange={e => setForm({...form, username: e.target.value})} required placeholder="e.g. teacher4" />
              </Field>
              <Field label="Password *">
                <input style={styles.input} type="password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min 6 characters" minLength={6} />
              </Field>
              <Field label="Role *">
                <select style={styles.input} value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              <button style={styles.btn} type="submit">Create User</button>
            </form>
          </div>

          <div style={styles.tableCard}>
            <h3 style={styles.sub}>All Users ({users.length})</h3>
            <table style={styles.table}>
              <thead><tr style={styles.head}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Action</th>
              </tr></thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={styles.td}>{i + 1}</td>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}><code style={styles.code}>{u.username}</code></td>
                    <td style={styles.td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                    <td style={styles.td}>
                      <button style={styles.del} onClick={() => handleDelete(u.id, u.username)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:'block', fontWeight:600, marginBottom:5, fontSize:13, color:'#333' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding:'32px 40px', maxWidth:1100, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:24 },
  sub: { fontSize:15, fontWeight:700, marginBottom:16, color:'#333' },
  grid: { display:'grid', gridTemplateColumns:'360px 1fr', gap:24 },
  formCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', overflow:'auto' },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  error: { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box' },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'10px 28px', fontSize:13, cursor:'pointer', marginTop:4 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6' },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'10px 12px', borderBottom:'1px solid #eee' },
  code: { background:'#f5f5f5', padding:'2px 6px', borderRadius:3, fontFamily:'monospace', fontSize:12 },
  del: { background:'#c62828', color:'#fff', border:'none', borderRadius:4, padding:'4px 12px', fontSize:12, cursor:'pointer' },
};
