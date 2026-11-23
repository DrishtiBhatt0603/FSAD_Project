import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Syllabus() {
  const { user } = useAuth();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ className: '', subject: '', content: '' });
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);

  const loadList = () => api.get('/syllabus').then(r => setList(r.data));
  useEffect(() => { loadList(); }, []);

  const handleEdit = (item) => {
    setForm({ className: item.className, subject: item.subject, content: item.content });
    setEditing(item.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id, cls, subject) => {
    if (!window.confirm(`Delete syllabus for ${cls} — ${subject}?`)) return;
    try {
      await api.delete(`/syllabus/${id}`);
      loadList();
      if (editing === id) { setForm({ className:'', subject:'', content:'' }); setEditing(null); }
    } catch {
      alert('Delete failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/syllabus', form);
      setMsg('Syllabus saved successfully!');
      loadList();
      setForm({ className: '', subject: '', content: '' });
      setEditing(null);
    } catch {
      setMsg('Failed to save.');
    }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Syllabus Management</h2>
        <div style={styles.grid}>
          <div style={styles.formCard}>
            <h3 style={styles.subheading}>{editing ? 'Edit Syllabus' : 'Add / Update Syllabus'}</h3>
            {msg && <div style={styles.success}>{msg}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Class *</label>
                <input style={styles.input} value={form.className}
                  onChange={e => setForm({...form, className: e.target.value})} placeholder="e.g. 10A" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Subject *</label>
                <input style={styles.input} value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})} placeholder="e.g. Mathematics" required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Content *</label>
                <textarea style={{...styles.input, height:150}} value={form.content}
                  onChange={e => setForm({...form, content: e.target.value})} required />
              </div>
              <button style={styles.btn} type="submit">Save Syllabus</button>
              {editing && <button type="button" style={styles.cancelBtn}
                onClick={() => { setForm({className:'',subject:'',content:''}); setEditing(null); }}>Cancel</button>}
            </form>
          </div>
          <div style={styles.listCard}>
            <h3 style={styles.subheading}>Existing Syllabi</h3>
            {list.map(item => (
              <div key={item.id} style={styles.item}>
                <div style={styles.itemHeader}>
                  <span style={styles.classTag}>{item.className}</span>
                  <strong>{item.subject}</strong>
                  <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                    <button style={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                    {canDelete && (
                      <button style={styles.delBtn} onClick={() => handleDelete(item.id, item.className, item.subject)}>Delete</button>
                    )}
                  </div>
                </div>
                <p style={styles.content}>{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding:'32px 40px', maxWidth:1100, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:24 },
  subheading: { fontSize:15, fontWeight:700, marginBottom:16, color:'#333' },
  grid: { display:'grid', gridTemplateColumns:'380px 1fr', gap:24 },
  formCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  listCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', overflowY:'auto', maxHeight:600 },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  field: { marginBottom:14 },
  label: { display:'block', fontWeight:600, marginBottom:5, fontSize:13 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box', resize:'vertical' },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'10px 28px', fontSize:13, cursor:'pointer' },
  cancelBtn: { background:'#9e9e9e', color:'#fff', border:'none', borderRadius:6, padding:'10px 20px', fontSize:13, cursor:'pointer', marginLeft:10 },
  item: { borderBottom:'1px solid #eee', paddingBottom:12, marginBottom:12 },
  itemHeader: { display:'flex', alignItems:'center', gap:12, marginBottom:6 },
  classTag: { background:'#e8eaf6', color:'#1a237e', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  editBtn: { marginLeft:'auto', background:'#1565c0', color:'#fff', border:'none', borderRadius:4, padding:'4px 12px', fontSize:12, cursor:'pointer' },
  delBtn: { background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:4, padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  content: { fontSize:13, color:'#555', margin:0 },
};
