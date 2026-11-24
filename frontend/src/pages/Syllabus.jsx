import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useClasses from '../hooks/useClasses';

// Distinct accent colors cycled across the class tiles
const TILE_COLORS = ['#1a237e', '#2e7d32', '#e65100', '#6a1b9a', '#00838f', '#c2185b', '#00695c', '#4527a0'];

export default function Syllabus() {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const { classes } = useClasses();
  const [list, setList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [form, setForm] = useState({ subject: '', content: '' });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadList = () => api.get('/syllabus').then(r => setList(r.data));
  useEffect(() => { loadList(); }, []);

  const countFor = (cls) => list.filter(s => s.className === cls).length;
  const subjectsFor = (cls) =>
    list.filter(s => s.className === cls)
        .sort((a, b) => a.subject.localeCompare(b.subject));

  const openClass = (cls) => {
    setSelectedClass(cls);
    setForm({ subject: '', content: '' });
    setEditing(null);
    setMsg(''); setError('');
  };

  const handleEdit = (item) => {
    setForm({ subject: item.subject, content: item.content });
    setEditing(item.id);
    setMsg(''); setError('');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.className} — ${item.subject}?`)) return;
    try {
      await api.delete(`/syllabus/${item.id}`);
      loadList();
      if (editing === item.id) { setForm({ subject: '', content: '' }); setEditing(null); }
    } catch { setError('Delete failed.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/syllabus', { className: selectedClass, subject: form.subject, content: form.content });
      setMsg(editing ? 'Syllabus updated!' : 'Syllabus added!');
      setForm({ subject: '', content: '' });
      setEditing(null);
      loadList();
    } catch { setError('Failed to save.'); }
  };

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        {!selectedClass ? (
          <>
            <h2 style={styles.heading}>Syllabus Management</h2>
            <p style={styles.lead}>Select a class to view and manage its subjects.</p>
            <div style={styles.tileGrid}>
              {classes.map((cls, i) => (
                <ClassTile key={cls} cls={cls} count={countFor(cls)}
                  color={TILE_COLORS[i % TILE_COLORS.length]} onClick={() => openClass(cls)} />
              ))}
              {classes.length === 0 && <p style={{color:'#999'}}>No classes found.</p>}
            </div>
          </>
        ) : (
          <>
            <div style={styles.crumbRow}>
              <button style={styles.backBtn} onClick={() => setSelectedClass(null)}>← All Classes</button>
              <h2 style={{...styles.heading, margin:0}}>Class {selectedClass} — Syllabus</h2>
            </div>

            <div style={styles.grid}>
              {canEdit && (
                <div style={styles.formCard}>
                  <h3 style={styles.subheading}>{editing ? 'Edit Subject' : 'Add Subject'}</h3>
                  {msg && <div style={styles.success}>{msg}</div>}
                  {error && <div style={styles.error}>{error}</div>}
                  <form onSubmit={handleSubmit}>
                    <div style={styles.field}>
                      <label style={styles.label}>Class</label>
                      <input style={{...styles.input, background:'#f5f5f5'}} value={selectedClass} disabled />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Subject *</label>
                      <input style={styles.input} value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                        placeholder="e.g. Physics" required disabled={!!editing} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Content *</label>
                      <textarea style={{ ...styles.input, height: 160 }} value={form.content}
                        onChange={e => setForm({ ...form, content: e.target.value })} required />
                    </div>
                    <button style={styles.btn} type="submit">{editing ? 'Update' : 'Add'} Syllabus</button>
                    {editing && (
                      <button type="button" style={styles.cancelBtn}
                        onClick={() => { setForm({ subject: '', content: '' }); setEditing(null); }}>Cancel</button>
                    )}
                  </form>
                </div>
              )}

              <div style={styles.listCard}>
                <h3 style={styles.subheading}>Subjects ({subjectsFor(selectedClass).length})</h3>
                {subjectsFor(selectedClass).map(item => (
                  <div key={item.id} style={styles.item}>
                    <div style={styles.itemHeader}>
                      <strong style={styles.subjName}>{item.subject}</strong>
                      {canEdit && (
                        <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                          <button style={styles.editBtn} onClick={() => handleEdit(item)}>Edit</button>
                          <button style={styles.delBtn} onClick={() => handleDelete(item)}>Delete</button>
                        </div>
                      )}
                    </div>
                    <p style={styles.content}>{item.content}</p>
                  </div>
                ))}
                {subjectsFor(selectedClass).length === 0 && (
                  <p style={{ color:'#999', padding:'12px 0' }}>No subjects for {selectedClass} yet{canEdit ? ' — add one on the left.' : '.'}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ClassTile({ cls, count, color, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:'#fff', border:'none', borderTop:`6px solid ${color}`, borderRadius:12,
        padding:'34px 26px', textAlign:'left', cursor:'pointer', minHeight:150,
        display:'flex', flexDirection:'column', justifyContent:'center',
        boxShadow: hover ? '0 10px 24px rgba(0,0,0,0.16)' : '0 2px 10px rgba(0,0,0,0.08)',
        transform: hover ? 'translateY(-4px)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}>
      <div style={{ fontSize:44, fontWeight:'bold', color, lineHeight:1 }}>{cls}</div>
      <div style={{ fontSize:14, color:'#666', marginTop:10 }}>{count} subjects</div>
      <div style={{ fontSize:12, color, marginTop:14, fontWeight:600 }}>View syllabus →</div>
    </button>
  );
}

const styles = {
  page: { padding:'32px 40px', maxWidth:1100, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:8 },
  lead: { color:'#666', fontSize:14, marginBottom:24 },
  tileGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px,1fr))', gap:24 },
  crumbRow: { display:'flex', alignItems:'center', gap:16, marginBottom:24, flexWrap:'wrap' },
  backBtn: { background:'#e8eaf6', color:'#1a237e', border:'none', borderRadius:6, padding:'8px 16px', fontSize:13, cursor:'pointer', fontWeight:600 },
  grid: { display:'grid', gridTemplateColumns:'360px 1fr', gap:24, alignItems:'start' },
  formCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  listCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', overflowY:'auto', maxHeight:640 },
  subheading: { fontSize:15, fontWeight:700, marginBottom:16, color:'#333' },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  error: { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  field: { marginBottom:14 },
  label: { display:'block', fontWeight:600, marginBottom:5, fontSize:13 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box', resize:'vertical' },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'10px 28px', fontSize:13, cursor:'pointer', fontWeight:600 },
  cancelBtn: { background:'#9e9e9e', color:'#fff', border:'none', borderRadius:6, padding:'10px 20px', fontSize:13, cursor:'pointer', marginLeft:10 },
  item: { borderBottom:'1px solid #eee', paddingBottom:14, marginBottom:14 },
  itemHeader: { display:'flex', alignItems:'center', gap:12, marginBottom:6 },
  subjName: { fontSize:15, color:'#1a237e' },
  editBtn: { background:'#1565c0', color:'#fff', border:'none', borderRadius:4, padding:'4px 12px', fontSize:12, cursor:'pointer' },
  delBtn: { background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:4, padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  content: { fontSize:13, color:'#555', margin:0, lineHeight:1.5 },
};
