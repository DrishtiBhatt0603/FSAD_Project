import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import useClasses from '../hooks/useClasses';

const FEE_TYPES = ['Tuition Fee','Exam Fee','Library Fee','Sports Fee','Lab Fee','Transport Fee'];

export default function FeePayment() {
  const { classes } = useClasses();
  const [students,  setStudents]  = useState([]);
  const [form,      setForm]      = useState({ studentId:'', feeType:'Tuition Fee', amount:'' });
  const [payments,  setPayments]  = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPayments = () => api.get('/fees').then(r => setPayments(r.data));

  useEffect(() => {
    Promise.all([
      api.get('/students').then(r => setStudents(r.data)),
      loadPayments(),
    ]).finally(() => setLoading(false));
  }, []);

  // Load fee history for selected student
  useEffect(() => {
    if (!form.studentId) { setStudentFees([]); return; }
    api.get(`/fees/student/${form.studentId}`).then(r => setStudentFees(r.data));
  }, [form.studentId]);

  const refreshStudentFees = () => {
    if (form.studentId) api.get(`/fees/student/${form.studentId}`).then(r => setStudentFees(r.data));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg(''); setError('');
    try {
      await api.post('/fees', form);
      setMsg('Payment processed successfully! Receipt generated.');
      setForm({ studentId: form.studentId, feeType:'Tuition Fee', amount:'' });
      loadPayments();
      refreshStudentFees();
    } catch {
      setError('Fee processing failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Mark this fee as PAID?')) return;
    try {
      await api.patch(`/fees/${id}/pay`);
      loadPayments();
      refreshStudentFees();
    } catch {
      setError('Could not update fee status.');
    }
  };

  const handlePrint = (p) => {
    const w = window.open('','_blank','width=600,height=500');
    w.document.write(`
      <html><head><title>Fee Receipt</title>
      <style>body{font-family:Arial;padding:40px} h2{color:#1a237e} table{width:100%;border-collapse:collapse}
      td,th{padding:10px;border:1px solid #ccc} .total{font-size:18px;font-weight:bold;color:#1a237e}</style></head>
      <body>
        <h2>School Administration System</h2>
        <h3>Fee Payment Receipt</h3>
        <p><strong>Receipt No:</strong> REC-${p.id} &nbsp;&nbsp; <strong>Date:</strong> ${p.paymentDate}</p>
        <table>
          <tr><th>Student</th><td>${p.student?.name}</td></tr>
          <tr><th>Class</th><td>${p.student?.className}</td></tr>
          <tr><th>Fee Type</th><td>${p.feeType}</td></tr>
          <tr><th>Amount</th><td class="total">₹${p.amount?.toLocaleString()}</td></tr>
          <tr><th>Status</th><td>${p.status}</td></tr>
        </table>
        <p style="margin-top:40px;color:#888;font-size:12px">This is a computer-generated receipt.</p>
        <script>window.print();</script>
      </body></html>`);
    w.document.close();
  };

  const totalPaid    = studentFees.filter(f => f.status === 'PAID').reduce((s,f) => s+f.amount, 0);
  const totalPending = studentFees.filter(f => f.status === 'PENDING').reduce((s,f) => s+f.amount, 0);

  const visiblePayments = [...payments]
    .filter(p => !filterClass || p.student?.className === filterClass)
    .reverse();

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Fee Payment</h2>
        <div style={styles.mainGrid}>

          {/* Left: Form */}
          <div style={styles.formCard}>
            <h3 style={styles.sub}>Process Payment</h3>
            {msg   && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <Field label="Student *">
                <select style={styles.input} value={form.studentId}
                  onChange={e => setForm({...form, studentId: e.target.value})} required>
                  <option value="">— Select Student —</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                  ))}
                </select>
              </Field>

              {/* Student fee summary */}
              {form.studentId && (
                <div style={styles.feeSummary}>
                  <div style={styles.feeSum}>
                    <span>Paid</span>
                    <strong style={{color:'#2e7d32'}}>₹{totalPaid.toLocaleString()}</strong>
                  </div>
                  <div style={styles.feeSum}>
                    <span>Pending</span>
                    <strong style={{color: totalPending > 0 ? '#c62828' : '#2e7d32'}}>
                      ₹{totalPending.toLocaleString()}
                    </strong>
                  </div>
                  <div style={styles.feeSum}>
                    <span>Transactions</span>
                    <strong>{studentFees.length}</strong>
                  </div>
                </div>
              )}

              <Field label="Fee Type *">
                <select style={styles.input} value={form.feeType}
                  onChange={e => setForm({...form, feeType: e.target.value})}>
                  {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Amount (₹) *">
                <input style={styles.input} type="number" value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  required min="1" placeholder="Enter amount" />
              </Field>
              <button style={styles.btn} type="submit" disabled={submitting}>
                {submitting ? 'Processing…' : '✓ Process Payment'}
              </button>
            </form>

            {/* Student fee history */}
            {studentFees.length > 0 && (
              <div style={{marginTop:20}}>
                <h4 style={styles.sub}>Payment History</h4>
                {studentFees.map(f => (
                  <div key={f.id} style={styles.feeItem}>
                    <div>
                      <strong>{f.feeType}</strong>
                      <div style={{fontSize:12, color:'#666'}}>{f.paymentDate}</div>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      <span style={{...styles.statusBadge,
                        background: f.status==='PAID'?'#e8f5e9':'#fff3e0',
                        color: f.status==='PAID'?'#2e7d32':'#e65100'}}>
                        {f.status}
                      </span>
                      <strong>₹{f.amount?.toLocaleString()}</strong>
                      {f.status === 'PENDING'
                        ? <button style={styles.payBtn} onClick={() => handleMarkPaid(f.id)}>Mark Paid</button>
                        : <button style={styles.receiptBtn} onClick={() => handlePrint(f)}>Receipt</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: All recent payments */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.sub}>All Payments ({visiblePayments.length})</h3>
              <select style={styles.filterSel} value={filterClass}
                onChange={e => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead><tr style={styles.head}>
                  <th style={styles.th}>Student</th>
                  <th style={styles.th}>Class</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr></thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={7} style={{...styles.td, textAlign:'center', color:'#999', padding:28}}>Loading payments…</td></tr>
                  )}
                  {!loading && visiblePayments.map(p => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.student?.name}</td>
                      <td style={styles.td}>{p.student?.className}</td>
                      <td style={styles.td}>{p.feeType}</td>
                      <td style={styles.td}>₹{p.amount?.toLocaleString()}</td>
                      <td style={styles.td}>{p.paymentDate}</td>
                      <td style={styles.td}>
                        <span style={{...styles.statusBadge,
                          background: p.status==='PAID'?'#e8f5e9':'#fff3e0',
                          color: p.status==='PAID'?'#2e7d32':'#e65100'}}>
                          {p.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {p.status === 'PENDING'
                          ? <button style={styles.payBtn} onClick={() => handleMarkPaid(p.id)}>Mark Paid</button>
                          : <button style={styles.receiptBtn} onClick={() => handlePrint(p)}>Print</button>}
                      </td>
                    </tr>
                  ))}
                  {!loading && visiblePayments.length === 0 && (
                    <tr><td colSpan={7} style={{...styles.td, textAlign:'center', color:'#999', padding:28}}>No payments{filterClass ? ` for ${filterClass}` : ''}.</td></tr>
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
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:'block', fontWeight:600, marginBottom:5, fontSize:13, color:'#333' }}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { padding:'28px 36px', maxWidth:1200, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:24 },
  sub: { fontSize:15, fontWeight:700, marginBottom:14, color:'#333' },
  mainGrid: { display:'grid', gridTemplateColumns:'380px 1fr', gap:24, alignItems:'start' },
  formCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableCard: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  tableWrap: { maxHeight:600, overflowY:'auto' },
  success: { background:'#e8f5e9', color:'#2e7d32', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  error:   { background:'#ffebee', color:'#c62828', padding:'10px 14px', borderRadius:6, marginBottom:12, fontSize:13 },
  input: { width:'100%', padding:'9px 11px', border:'1px solid #ccc', borderRadius:5, fontSize:13, boxSizing:'border-box' },
  btn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'11px 28px',
         fontSize:14, cursor:'pointer', marginTop:4, width:'100%', fontWeight:600 },
  feeSummary: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:14,
                background:'#f5f5f5', borderRadius:6, padding:'12px' },
  feeSum: { textAlign:'center', fontSize:12, color:'#555', display:'flex', flexDirection:'column', gap:4 },
  feeItem: { display:'flex', justifyContent:'space-between', alignItems:'center',
             padding:'10px 0', borderBottom:'1px solid #eee', fontSize:13 },
  statusBadge: { padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  receiptBtn: { background:'#1565c0', color:'#fff', border:'none', borderRadius:4,
                padding:'4px 10px', fontSize:12, cursor:'pointer' },
  payBtn: { background:'#2e7d32', color:'#fff', border:'none', borderRadius:4,
            padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  tableHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:12 },
  filterSel: { padding:'8px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6', position:'sticky', top:0 },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'9px 12px', borderBottom:'1px solid #eee' },
};
