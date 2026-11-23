import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useClasses from '../hooks/useClasses';

const DEFAULT_SUBJECTS = ['Mathematics','Science','English','Hindi','Social Studies','Computer Science'];
const EXAMS    = ['Unit Test 1','Mid Term','Unit Test 2','Final Exam'];

function grade(pct) {
  if (pct >= 90) return { letter:'A+', color:'#1b5e20', bg:'#e8f5e9' };
  if (pct >= 80) return { letter:'A',  color:'#2e7d32', bg:'#f1f8e9' };
  if (pct >= 70) return { letter:'B',  color:'#1565c0', bg:'#e3f2fd' };
  if (pct >= 60) return { letter:'C',  color:'#e65100', bg:'#fff3e0' };
  if (pct >= 45) return { letter:'D',  color:'#b71c1c', bg:'#fce4ec' };
  return                 { letter:'F',  color:'#c62828', bg:'#ffebee' };
}

export default function Performance() {
  const { user } = useAuth();
  const canDelete = user?.role === 'ADMIN' || user?.role === 'TEACHER';
  const { classes } = useClasses();
  const [students,  setStudents]  = useState([]);
  const [records,   setRecords]   = useState([]);
  const [subjects,  setSubjects]  = useState(DEFAULT_SUBJECTS);
  const [form,      setForm]      = useState({ studentId:'', subject:'Mathematics', testName:'Unit Test 1', score:'', maxScore:'100' });
  const [filterClass,   setFilterClass]   = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/students').then(r => setStudents(r.data));
    api.get('/performance').then(r => setRecords(r.data));
    // Build subject list from syllabus so it reflects what the school actually teaches
    api.get('/syllabus').then(r => {
      const fromDb = [...new Set(r.data.map(s => s.subject).filter(Boolean))].sort();
      if (fromDb.length) setSubjects([...new Set([...fromDb, ...DEFAULT_SUBJECTS])]);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/performance', form);
      setMsg('Performance record saved successfully!');
      setForm({ studentId:'', subject:'Mathematics', testName:'Unit Test 1', score:'', maxScore:'100' });
      api.get('/performance').then(r => setRecords(r.data));
    } catch {
      setError('Failed to save record. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this performance record?')) return;
    try {
      await api.delete(`/performance/${id}`);
      api.get('/performance').then(r => setRecords(r.data));
    } catch {
      alert('Delete failed.');
    }
  };

  const filtered = records.filter(r => {
    const cls = r.student?.className || '';
    const sub = r.subject || '';
    const sid = r.student?.id?.toString() || '';
    return (!filterClass   || cls === filterClass)
        && (!filterSubject || sub === filterSubject)
        && (!filterStudent || sid === filterStudent);
  });

  const avg = filtered.length
    ? Math.round(filtered.reduce((s,r) => s + r.score/r.maxScore*100, 0) / filtered.length)
    : 0;

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Student Performance</h2>
        <div style={styles.mainGrid}>

          {/* Left: Form */}
          <div style={styles.formCard}>
            <h3 style={styles.sub}>Record Score</h3>
            {msg   && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <Field label="Student *">
                <select style={styles.input} value={form.studentId}
                  onChange={e => setForm({...form, studentId: e.target.value})} required>
                  <option value="">— Select Student —</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className})</option>)}
                </select>
              </Field>
              <Field label="Subject *">
                <select style={styles.input} value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}>
                  {subjects.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Exam *">
                <select style={styles.input} value={form.testName}
                  onChange={e => setForm({...form, testName: e.target.value})}>
                  {EXAMS.map(x => <option key={x}>{x}</option>)}
                </select>
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="Score *">
                  <input style={styles.input} type="number" value={form.score}
                    onChange={e => setForm({...form, score: e.target.value})} required min="0" placeholder="e.g. 85" />
                </Field>
                <Field label="Max Score *">
                  <input style={styles.input} type="number" value={form.maxScore}
                    onChange={e => setForm({...form, maxScore: e.target.value})} required min="1" />
                </Field>
              </div>
              {form.score && form.maxScore && (
                <div style={styles.gradePreview}>
                  {(() => { const g = grade(form.score/form.maxScore*100);
                    return <span style={{...styles.gradeBadge, background:g.bg, color:g.color}}>
                      Grade: {g.letter} — {Math.round(form.score/form.maxScore*100)}%
                    </span>; })()}
                </div>
              )}
              <button style={styles.btn} type="submit">Save Record</button>
            </form>
          </div>

          {/* Right: Table */}
          <div style={styles.tableCard}>
            <div style={styles.filterRow}>
              <select style={styles.filterSel} value={filterClass}
                onChange={e => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
              <select style={styles.filterSel} value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}>
                <option value="">All Subjects</option>
                {subjects.map(s => <option key={s}>{s}</option>)}
              </select>
              <select style={styles.filterSel} value={filterStudent}
                onChange={e => setFilterStudent(e.target.value)}>
                <option value="">All Students</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <span style={styles.avgBadge}>Avg: {avg}%</span>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead><tr style={styles.head}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Subject</th>
                  <th style={styles.th}>Exam</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>%</th>
                  <th style={styles.th}>Grade</th>
                  {canDelete && <th style={styles.th}>Action</th>}
                </tr></thead>
                <tbody>
                  {filtered.map(r => {
                    const pct = Math.round(r.score / r.maxScore * 100);
                    const g   = grade(pct);
                    return (
                      <tr key={r.id}>
                        <td style={styles.td}>{r.student?.name}</td>
                        <td style={styles.td}>{r.student?.className}</td>
                        <td style={styles.td}>{r.subject}</td>
                        <td style={styles.td}>{r.testName}</td>
                        <td style={styles.td}>{r.score}/{r.maxScore}</td>
                        <td style={styles.td}>{pct}%</td>
                        <td style={styles.td}>
                          <span style={{...styles.gradeBadge, background:g.bg, color:g.color}}>{g.letter}</span>
                        </td>
                        {canDelete && (
                          <td style={styles.td}>
                            <button style={styles.delBtn} onClick={() => handleDelete(r.id)}>Delete</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={canDelete ? 8 : 7} style={{...styles.td, textAlign:'center', color:'#999', padding:32}}>
                      No records found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontWeight:600, marginBottom:5, fontSize:13, color:'#333' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding:'28px 36px', maxWidth:1200, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:24 },
  sub: { fontSize:15, fontWeight:700, marginBottom:16, color:'#333' },
  mainGrid: { display:'grid', gridTemplateColumns:'340px 1fr', gap:24, alignItems:'start' },
  formCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  error:   { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box' },
  gradePreview: { marginBottom:12 },
  gradeBadge: { padding:'3px 12px', borderRadius:12, fontSize:12, fontWeight:700 },
  delBtn: { background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:4, padding:'3px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'11px 28px',
         fontSize:13, cursor:'pointer', marginTop:4, width:'100%' },
  filterRow: { display:'flex', gap:10, marginBottom:14, flexWrap:'wrap', alignItems:'center' },
  filterSel: { padding:'8px 10px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  avgBadge: { marginLeft:'auto', background:'#1a237e', color:'#fff', padding:'6px 14px', borderRadius:6, fontSize:13, fontWeight:600 },
  tableWrap: { maxHeight:580, overflowY:'auto' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6', position:'sticky', top:0 },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'9px 12px', borderBottom:'1px solid #eee' },
};
