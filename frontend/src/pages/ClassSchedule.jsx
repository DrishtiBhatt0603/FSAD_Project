import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import useClasses from '../hooks/useClasses';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ClassSchedule() {
  const { classes } = useClasses();
  const [schedule, setSchedule] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ className: '', subject: '', dayOfWeek: 'Monday', period: '1', teacherId: '' });
  const [filterClass, setFilterClass] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSchedule = () => api.get('/schedule').then(r => setSchedule(r.data));

  useEffect(() => {
    Promise.all([
      loadSchedule(),
      api.get('/users/teachers').then(r => setTeachers(r.data)),
    ]).catch(() => setError('Failed to load schedule data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.post('/schedule', form);
      setMsg('Schedule entry added!');
      setForm({ className: '', subject: '', dayOfWeek: 'Monday', period: '1', teacherId: '' });
      loadSchedule();
    } catch {
      setError('Failed to add schedule entry.');
    }
  };

  const handleDelete = async (id, cls, subject) => {
    if (!window.confirm(`Delete ${cls} — ${subject} from the schedule?`)) return;
    try {
      await api.delete(`/schedule/${id}`);
      setSchedule(prev => prev.filter(s => s.id !== id));
    } catch {
      setError('Delete failed. Please try again.');
    }
  };

  const filtered = schedule
    .filter(s => !filterClass || s.className === filterClass)
    .sort((a, b) => a.className.localeCompare(b.className)
      || DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek)
      || a.period - b.period);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Class Scheduling</h2>
        <div style={styles.grid}>
          <div style={styles.formCard}>
            <h3 style={styles.sub}>Add Schedule Entry</h3>
            {msg   && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.field}>
                <label style={styles.label}>Class *</label>
                <input style={styles.input} list="sched-class-options" value={form.className}
                  placeholder="Select or type e.g. 10A"
                  onChange={e => setForm({...form, className: e.target.value})} required />
                <datalist id="sched-class-options">
                  {classes.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Subject *</label>
                <input style={styles.input} value={form.subject} placeholder="e.g. Mathematics"
                  onChange={e => setForm({...form, subject: e.target.value})} required />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Day *</label>
                <select style={styles.input} value={form.dayOfWeek}
                  onChange={e => setForm({...form, dayOfWeek: e.target.value})}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Period *</label>
                <select style={styles.input} value={form.period}
                  onChange={e => setForm({...form, period: e.target.value})}>
                  {PERIODS.map(p => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Teacher *</label>
                <select style={styles.input} value={form.teacherId}
                  onChange={e => setForm({...form, teacherId: e.target.value})} required>
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <button style={styles.btn} type="submit">Add to Schedule</button>
            </form>
          </div>
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.sub}>Current Schedule ({filtered.length})</h3>
              <select style={styles.filterSel} value={filterClass}
                onChange={e => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead><tr style={styles.head}>
                  <th style={styles.th}>Class</th><th style={styles.th}>Subject</th>
                  <th style={styles.th}>Day</th><th style={styles.th}>Period</th>
                  <th style={styles.th}>Teacher</th><th style={styles.th}>Action</th>
                </tr></thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={6} style={styles.empty}>Loading schedule…</td></tr>
                  )}
                  {!loading && filtered.map(s => (
                    <tr key={s.id}>
                      <td style={styles.td}><span style={styles.classTag}>{s.className}</span></td>
                      <td style={styles.td}>{s.subject}</td>
                      <td style={styles.td}>{s.dayOfWeek}</td>
                      <td style={styles.td}>P{s.period}</td>
                      <td style={styles.td}>{s.teacher?.name}</td>
                      <td style={styles.td}>
                        <button style={styles.del} onClick={() => handleDelete(s.id, s.className, s.subject)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={6} style={styles.empty}>No schedule entries{filterClass ? ` for ${filterClass}` : ''}.</td></tr>
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

const styles = {
  page: { padding:'32px 40px', maxWidth:1100, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:24 },
  sub: { fontSize:15, fontWeight:700, margin:0, color:'#333' },
  grid: { display:'grid', gridTemplateColumns:'360px 1fr', gap:24, alignItems:'start' },
  formCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, gap:12 },
  filterSel: { padding:'8px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  error: { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  field: { marginBottom:14 },
  label: { display:'block', fontWeight:600, marginBottom:5, fontSize:13 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box' },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'10px 28px', fontSize:13, cursor:'pointer', fontWeight:600 },
  tableWrap: { maxHeight:560, overflowY:'auto' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6', position:'sticky', top:0 },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'10px 12px', borderBottom:'1px solid #eee' },
  classTag: { background:'#e8eaf6', color:'#1a237e', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  empty: { padding:28, textAlign:'center', color:'#999' },
  del: { background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:4, padding:'4px 12px', fontSize:12, cursor:'pointer', fontWeight:600 },
};
