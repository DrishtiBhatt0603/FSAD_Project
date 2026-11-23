import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import useClasses from '../hooks/useClasses';

const INIT = { name:'', parentName:'', address:'', className:'', section:'A',
               previousClassPerformance:'', email:'', phone:'' };

// Extract the numeric grade from a class name like "10A" → 10, "9B" → 9
function prevClassLabel(className) {
  const num = parseInt(className);
  return isNaN(num) ? '' : `${num - 1}th`;
}

// Build the full previousClassPerformance string from className + percentage input
function buildPrevPerf(className, pct) {
  if (!pct) return '';
  return `${prevClassLabel(className)} - ${pct}%`;
}

export default function Admission() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { classes } = useClasses();
  const [tab,         setTab]         = useState('new');
  const [form,        setForm]        = useState(INIT);
  const [prevPct,     setPrevPct]     = useState('');   // just the % number user types
  const [admissions,  setAdmissions]  = useState([]);
  const [search,      setSearch]      = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadAdmissions = () => api.get('/admissions').then(r => setAdmissions(r.data));
  useEffect(() => { loadAdmissions(); }, []);
  // Refresh list whenever the list tab becomes active
  useEffect(() => { if (tab === 'list') loadAdmissions(); }, [tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prevPct && (Number(prevPct) < 0 || Number(prevPct) > 100)) {
      setError('Previous class percentage must be between 0 and 100.');
      return;
    }
    setLoading(true); setMsg(''); setError('');
    const payload = { ...form, previousClassPerformance: buildPrevPerf(form.className, prevPct) };
    try {
      const { data } = await api.post('/admissions', payload);
      setMsg(`Admission successful! Student: ${data.student.name} | ID: ${data.student.id}`);
      setForm(INIT);
      setPrevPct('');
      loadAdmissions();
      setTimeout(() => setTab('list'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Admission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admissionId, studentName) => {
    if (!window.confirm(`Delete admission for ${studentName}? This will also delete all their attendance, performance and fee records.`)) return;
    try {
      await api.delete(`/admissions/${admissionId}`);
      loadAdmissions();
    } catch {
      alert('Delete failed. Please try again.');
    }
  };

  const filtered = admissions.filter(a => {
    const name = a.student?.name?.toLowerCase() || '';
    const cls  = a.student?.className || '';
    return name.includes(search.toLowerCase()) && (!filterClass || cls === filterClass);
  });

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Student Admission</h2>
          <div style={styles.tabRow}>
            <button style={{...styles.tabBtn, ...(tab==='new'  ? styles.activeTab : {})}} onClick={() => setTab('new')}>
              + New Admission
            </button>
            <button style={{...styles.tabBtn, ...(tab==='list' ? styles.activeTab : {})}} onClick={() => setTab('list')}>
              All Admissions ({admissions.length})
            </button>
          </div>
        </div>

        {/* ── NEW ADMISSION FORM ── */}
        {tab === 'new' && (
          <div style={styles.formCard}>
            <h3 style={styles.sub}>New Student Admission Form</h3>
            {msg   && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div style={styles.grid}>
                <Field label="Student Full Name *">
                  <input style={styles.input} value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. Aarav Sharma" />
                </Field>
                <Field label="Parent / Guardian Name *">
                  <input style={styles.input} value={form.parentName}
                    onChange={e => setForm({...form, parentName: e.target.value})} required placeholder="e.g. Rajesh Sharma" />
                </Field>
                <Field label="Email">
                  <input style={styles.input} type="email" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} placeholder="student@example.com" />
                </Field>
                <Field label="Phone">
                  <input style={styles.input} value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})} placeholder="10-digit mobile number" />
                </Field>
                <Field label="Class *">
                  <input style={styles.input} list="class-options" value={form.className}
                    onChange={e => { setForm({...form, className: e.target.value}); setPrevPct(''); }}
                    required placeholder="Select or type a new class e.g. 10A" />
                  <datalist id="class-options">
                    {classes.map(c => <option key={c} value={c} />)}
                  </datalist>
                </Field>
                <Field label="Section">
                  <select style={styles.input} value={form.section}
                    onChange={e => setForm({...form, section: e.target.value})}>
                    <option>A</option><option>B</option><option>C</option>
                  </select>
                </Field>
                <Field label={`Previous Class Performance (${prevClassLabel(form.className)})`}>
                  <div style={styles.prevPerfRow}>
                    <span style={styles.prevPerfLabel}>{prevClassLabel(form.className)} —</span>
                    <input
                      style={{...styles.input, flex:1}}
                      type="number" min="0" max="100" step="0.1"
                      value={prevPct}
                      onChange={e => setPrevPct(e.target.value)}
                      placeholder="Enter % (e.g. 85)"
                    />
                    <span style={styles.prevPerfSuffix}>%</span>
                  </div>
                  {prevPct && (
                    <div style={styles.prevPerfPreview}>
                      Will be saved as: <strong>{buildPrevPerf(form.className, prevPct)}</strong>
                    </div>
                  )}
                </Field>
              </div>
              <Field label="Address *">
                <textarea style={{...styles.input, height:72, resize:'vertical'}} value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})} required
                  placeholder="Full residential address" />
              </Field>
              <div style={{display:'flex', gap:12, marginTop:8}}>
                <button style={styles.btn} type="submit" disabled={loading}>
                  {loading ? 'Submitting…' : '✓ Submit Admission'}
                </button>
                <button type="button" style={styles.resetBtn}
                  onClick={() => { setForm(INIT); setPrevPct(''); setMsg(''); setError(''); }}>
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ADMISSIONS LIST ── */}
        {tab === 'list' && (
          <div style={styles.tableCard}>
            <div style={styles.filterRow}>
              <input style={styles.searchInput} placeholder="Search student name…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <select style={styles.filterSelect} value={filterClass}
                onChange={e => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
              <span style={styles.resultCount}>{filtered.length} records</span>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.head}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Class</th>
                    <th style={styles.th}>Parent</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Admission Date</th>
                    <th style={styles.th}>Prev. Performance</th>
                    <th style={styles.th}>Status</th>
                    {isAdmin && <th style={styles.th}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => (
                    <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={styles.td}><strong>{a.student?.name}</strong></td>
                      <td style={styles.td}>
                        <span style={styles.classBadge}>{a.student?.className}</span>
                      </td>
                      <td style={styles.td}>{a.student?.parentName}</td>
                      <td style={styles.td}>{a.student?.email || a.student?.phone || '—'}</td>
                      <td style={styles.td}>{a.admissionDate}</td>
                      <td style={styles.td}>{a.student?.previousClassPerformance || '—'}</td>
                      <td style={styles.td}>
                        <span style={styles.approvedBadge}>{a.status}</span>
                      </td>
                      {isAdmin && (
                        <td style={styles.td}>
                          <button style={styles.delBtn}
                            onClick={() => handleDelete(a.id, a.student?.name)}>
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={isAdmin ? 9 : 8} style={{...styles.td, textAlign:'center', color:'#999', padding:32}}>
                      No admissions found
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display:'block', fontWeight:600, marginBottom:5, fontSize:13, color:'#333' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding:'28px 36px', maxWidth:1100, margin:'0 auto' },
  headerRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 },
  heading: { fontSize:22, color:'#1a237e', margin:0 },
  tabRow: { display:'flex', gap:0 },
  tabBtn: { padding:'9px 22px', border:'2px solid #1a237e', background:'#fff', color:'#1a237e',
            fontSize:13, cursor:'pointer', fontWeight:600 },
  activeTab: { background:'#1a237e', color:'#fff' },
  formCard: { background:'#fff', borderRadius:8, padding:'28px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  sub: { fontSize:15, fontWeight:700, marginBottom:20, color:'#333' },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'12px 16px', borderRadius:6, marginBottom:16, fontSize:13 },
  error:   { background:'#ffebee', color:'#c62828', padding:'12px 16px', borderRadius:6, marginBottom:16, fontSize:13 },
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:4 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box' },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'11px 32px',
         fontSize:14, cursor:'pointer', fontWeight:600 },
  resetBtn: { background:'#9e9e9e', color:'#fff', border:'none', borderRadius:6, padding:'11px 24px',
              fontSize:13, cursor:'pointer' },
  filterRow: { display:'flex', gap:12, marginBottom:16, alignItems:'center', flexWrap:'wrap' },
  searchInput: { flex:1, minWidth:200, padding:'9px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  filterSelect: { padding:'9px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  resultCount: { fontSize:13, color:'#666', whiteSpace:'nowrap' },
  tableWrap: { maxHeight:580, overflowY:'auto' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6', position:'sticky', top:0 },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'9px 12px', borderBottom:'1px solid #eee' },
  classBadge: { background:'#e8eaf6', color:'#1a237e', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  approvedBadge: { background:'#e8f5e9', color:'#2e7d32', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  delBtn: { background:'#ffebee', color:'#c62828', border:'1px solid #ef9a9a', borderRadius:4, padding:'3px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  prevPerfRow: { display:'flex', alignItems:'center', gap:8 },
  prevPerfLabel: { whiteSpace:'nowrap', fontSize:13, fontWeight:600, color:'#1a237e', background:'#e8eaf6', padding:'9px 12px', borderRadius:5, border:'1px solid #c5cae9' },
  prevPerfSuffix: { fontSize:14, fontWeight:700, color:'#555' },
  prevPerfPreview: { marginTop:6, fontSize:12, color:'#555', background:'#f5f5f5', padding:'5px 10px', borderRadius:4 },
};
