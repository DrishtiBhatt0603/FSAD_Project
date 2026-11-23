import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import useClasses from '../hooks/useClasses';

export default function Attendance() {
  const { classes } = useClasses();
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents]           = useState([]);
  const [date, setDate]                   = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords]             = useState({});
  const [msg, setMsg]   = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Default to the first class once classes load
  useEffect(() => {
    if (!selectedClass && classes.length > 0) setSelectedClass(classes[0]);
  }, [classes, selectedClass]);

  // Load students for selected class
  useEffect(() => {
    if (!selectedClass) return;
    setLoading(true);
    api.get('/students').then(r => {
      const filtered = r.data.filter(s => s.className === selectedClass);
      setStudents(filtered);
      const init = {};
      filtered.forEach(s => { init[s.id] = true; });
      setRecords(init);
    }).finally(() => setLoading(false));
  }, [selectedClass]);

  // Load existing attendance for the chosen date+class
  useEffect(() => {
    if (!date || students.length === 0) return;
    api.get(`/attendance/date/${date}`).then(r => {
      const classIds = new Set(students.map(s => s.id));
      const m = {};
      r.data.filter(a => classIds.has(a.student?.id)).forEach(a => {
        m[a.student.id] = a.present;
      });
      setRecords(prev => ({ ...prev, ...m }));
    }).catch(() => {});
  }, [date, students]);

  const toggle = id => setRecords(prev => ({ ...prev, [id]: !prev[id] }));

  const markAll = val => {
    const all = {};
    students.forEach(s => { all[s.id] = val; });
    setRecords(all);
  };

  const handleSubmit = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      await api.post('/attendance/bulk', {
        date,
        records: students.map(s => ({ studentId: s.id, present: records[s.id] ?? true }))
      });
      setMsg(`Attendance saved for ${selectedClass} on ${date}!`);
    } catch {
      setError('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const present = Object.values(records).filter(Boolean).length;
  const absent  = students.length - present;

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Attendance</h2>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.toolGroup}>
            <label style={styles.label}>Class</label>
            <select style={styles.select} value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={styles.toolGroup}>
            <label style={styles.label}>Date</label>
            <input type="date" style={styles.dateInput} value={date}
              onChange={e => setDate(e.target.value)} />
          </div>
          <div style={styles.statBadges}>
            <span style={styles.presentBadge}>Present: {present}</span>
            <span style={styles.absentBadge}>Absent: {absent}</span>
            <span style={styles.totalBadge}>Total: {students.length}</span>
          </div>
          <div style={styles.toolGroup}>
            <button style={styles.markAllBtn} onClick={() => markAll(true)}>Mark All Present</button>
            <button style={{...styles.markAllBtn, background:'#c62828'}} onClick={() => markAll(false)}>Mark All Absent</button>
          </div>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>

        {msg   && <div style={styles.success}>{msg}</div>}
        {error && <div style={styles.error}>{error}</div>}

        {/* Progress bar */}
        {students.length > 0 && (
          <div style={styles.progressRow}>
            <span style={styles.progressLabel}>Attendance Rate</span>
            <div style={styles.progressTrack}>
              <div style={{
                ...styles.progressBar,
                width: `${(present / students.length) * 100}%`,
                background: present/students.length >= 0.75 ? '#2e7d32' : present/students.length >= 0.5 ? '#f57c00' : '#c62828'
              }} />
            </div>
            <span style={styles.progressPct}>{students.length ? Math.round(present/students.length*100) : 0}%</span>
          </div>
        )}

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headRow}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Student Name</th>
                <th style={styles.th}>Class</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{...styles.td, textAlign:'center', color:'#999', padding:32}}>
                  Loading students…
                </td></tr>
              )}
              {!loading && students.map((s, i) => (
                <tr key={s.id} style={{ background: records[s.id] ? '#fff' : '#fff8f8' }}>
                  <td style={styles.td}>{i + 1}</td>
                  <td style={styles.td}><strong>{s.name}</strong></td>
                  <td style={styles.td}>{s.className} – {s.section}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge,
                      background: records[s.id] ? '#e8f5e9' : '#ffebee',
                      color:      records[s.id] ? '#2e7d32' : '#c62828' }}>
                      {records[s.id] ? '✓ Present' : '✗ Absent'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={{ ...styles.toggleBtn,
                      background: records[s.id] ? '#c62828' : '#2e7d32' }}
                      onClick={() => toggle(s.id)}>
                      {records[s.id] ? 'Mark Absent' : 'Mark Present'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && students.length === 0 && (
                <tr><td colSpan={5} style={{...styles.td, textAlign:'center', color:'#999', padding:32}}>
                  No students found for class {selectedClass}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding:'28px 36px', maxWidth:1050, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:20 },
  toolbar: { display:'flex', alignItems:'center', gap:16, marginBottom:16, flexWrap:'wrap',
             background:'#fff', padding:'16px 20px', borderRadius:8, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' },
  toolGroup: { display:'flex', alignItems:'center', gap:8 },
  label: { fontWeight:600, fontSize:13, color:'#333', whiteSpace:'nowrap' },
  select: { padding:'8px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13, background:'#fff' },
  dateInput: { padding:'8px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  statBadges: { display:'flex', gap:10 },
  presentBadge: { background:'#e8f5e9', color:'#2e7d32', padding:'5px 12px', borderRadius:20, fontSize:13, fontWeight:600 },
  absentBadge:  { background:'#ffebee', color:'#c62828', padding:'5px 12px', borderRadius:20, fontSize:13, fontWeight:600 },
  totalBadge:   { background:'#e8eaf6', color:'#1a237e', padding:'5px 12px', borderRadius:20, fontSize:13, fontWeight:600 },
  markAllBtn: { background:'#2e7d32', color:'#fff', border:'none', borderRadius:5, padding:'7px 14px', fontSize:12, cursor:'pointer' },
  saveBtn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'10px 24px', fontSize:14, cursor:'pointer', marginLeft:'auto', fontWeight:600 },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  error:   { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  progressRow: { display:'flex', alignItems:'center', gap:12, marginBottom:16 },
  progressLabel: { fontSize:13, fontWeight:600, color:'#555', width:120 },
  progressTrack: { flex:1, height:12, background:'#e0e0e0', borderRadius:6, overflow:'hidden' },
  progressBar: { height:'100%', borderRadius:6, transition:'width 0.4s ease' },
  progressPct: { fontSize:13, fontWeight:600, color:'#333', width:40, textAlign:'right' },
  card: { background:'#fff', borderRadius:8, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:14 },
  headRow: { background:'#e8eaf6' },
  th: { padding:'12px 14px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'11px 14px', borderBottom:'1px solid #eee' },
  badge: { padding:'4px 12px', borderRadius:12, fontSize:12, fontWeight:600 },
  toggleBtn: { color:'#fff', border:'none', borderRadius:4, padding:'6px 14px', fontSize:12, cursor:'pointer', fontWeight:500 },
};
