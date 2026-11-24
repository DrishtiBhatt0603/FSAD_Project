import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import useClasses from '../hooks/useClasses';

export default function FeePayment() {
  const { classes } = useClasses();
  const [students,  setStudents]  = useState([]);
  const [form,      setForm]      = useState({ studentId:'' });
  const [payments,  setPayments]  = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [filterClass, setFilterClass] = useState('');
  const [msg,   setMsg]   = useState('');
  const [error, setError] = useState('');
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

  // Send a bill for an unbilled fee type: creates a BILLED record and emails the student
  const handleSendBill = async (studentId, feeType, amount) => {
    if (!window.confirm(`Send a bill for ${feeType} (₹${amount.toLocaleString()}) to this student?`)) return;
    try {
      const { data } = await api.post('/fees/bill', { studentId, feeType, amount });
      loadPayments();
      if (String(studentId) === String(form.studentId)) refreshStudentFees();
      setError('');
      setMsg(data.detail || 'Bill sent.');
    } catch {
      setError('Could not send the bill.');
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

  // The fee types the school actually charges — derived from real records, not hardcoded
  const schoolFeeTypes = [...new Set(payments.map(p => p.feeType).filter(Boolean))].sort();

  // Standard amount per fee type = the typical (max) amount seen in existing records
  const feeAmountByType = {};
  payments.forEach(p => {
    if (p.feeType && (feeAmountByType[p.feeType] == null || p.amount > feeAmountByType[p.feeType])) {
      feeAmountByType[p.feeType] = p.amount;
    }
  });

  // Lookup: `${studentId}|${feeType}` -> { status, id } (PAID > PENDING > BILLED)
  const rank = { PAID: 3, PENDING: 2, BILLED: 1 };
  const payLookup = {};
  payments.forEach(p => {
    const key = `${p.student?.id}|${p.feeType}`;
    const prev = payLookup[key];
    if (!prev || (rank[p.status] || 0) > (rank[prev.status] || 0)) {
      payLookup[key] = { status: p.status, id: p.id };
    }
  });

  const matrixStudents = students
    .filter(s => !filterClass || s.className === filterClass)
    .sort((a, b) => (a.className || '').localeCompare(b.className || '') || a.name.localeCompare(b.name));

  // For the selected student: resolve each fee type to PAID / PENDING / BILLED / NOT_BILLED
  const feeTypeStatus = schoolFeeTypes.map(type => {
    const recs = studentFees.filter(f => f.feeType === type);
    const paid = recs.find(f => f.status === 'PAID');
    const pending = recs.find(f => f.status === 'PENDING');
    const billed = recs.find(f => f.status === 'BILLED');
    const status = paid ? 'PAID' : pending ? 'PENDING' : billed ? 'BILLED' : 'NOT_BILLED';
    return { type, status, record: paid || pending || billed || null };
  });
  const pendingTypes   = feeTypeStatus.filter(t => t.status === 'PENDING').length;
  const billedTypes    = feeTypeStatus.filter(t => t.status === 'BILLED').length;
  const notBilledTypes = feeTypeStatus.filter(t => t.status === 'NOT_BILLED').length;
  const allCleared = schoolFeeTypes.length > 0 && feeTypeStatus.every(t => t.status === 'PAID');

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Fee Payment</h2>
        <div style={styles.mainGrid}>

          {/* Left: Student fee detail */}
          <div style={styles.formCard}>
            <h3 style={styles.sub}>Student Fee Detail</h3>
            {msg   && <div style={styles.success}>{msg}</div>}
            {error && <div style={styles.error}>{error}</div>}
            <Field label="Select Student">
              <select style={styles.input} value={form.studentId}
                onChange={e => setForm({ studentId: e.target.value })}>
                <option value="">— Select a student —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.className})</option>
                ))}
              </select>
            </Field>

            {!form.studentId && (
              <p style={{ fontSize:13, color:'#888', marginTop:12, lineHeight:1.5 }}>
                Pick a student to see their fee status and payment history. To bill or collect
                fees, use the matrix on the right — click any cell.
              </p>
            )}

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

            {/* Fee status across all fee types — answers "has this student paid everything?" */}
            {form.studentId && schoolFeeTypes.length > 0 && (
              <div style={{marginTop:20}}>
                <div style={styles.statusHead}>
                  <h4 style={{...styles.sub, margin:0}}>Fee Status by Type</h4>
                  {allCleared
                    ? <span style={styles.allClear}>✓ All cleared</span>
                    : <span style={styles.notClear}>
                        {[pendingTypes && `${pendingTypes} pending`,
                          billedTypes && `${billedTypes} billed`,
                          notBilledTypes && `${notBilledTypes} not billed`].filter(Boolean).join(' · ')}
                      </span>}
                </div>
                {feeTypeStatus.map(t => (
                  <div key={t.type} style={styles.feeItem}>
                    <strong>{t.type}</strong>
                    <div style={{display:'flex', alignItems:'center', gap:10}}>
                      {t.status === 'PAID' && (
                        <span style={{...styles.statusBadge, background:'#e8f5e9', color:'#2e7d32'}}>✓ Paid</span>
                      )}
                      {t.status === 'BILLED' && (
                        <>
                          <span style={{...styles.statusBadge, background:'#e3f2fd', color:'#1565c0'}}>Bill Sent</span>
                          <button style={styles.payBtn} onClick={() => handleMarkPaid(t.record.id)}>Mark Paid</button>
                        </>
                      )}
                      {t.status === 'PENDING' && (
                        <>
                          <span style={{...styles.statusBadge, background:'#fff3e0', color:'#e65100'}}>Pending</span>
                          <button style={styles.payBtn} onClick={() => handleMarkPaid(t.record.id)}>Mark Paid</button>
                        </>
                      )}
                      {t.status === 'NOT_BILLED' && (
                        <>
                          <span style={{...styles.statusBadge, background:'#f0f0f0', color:'#888'}}>Not billed</span>
                          <button style={styles.billBtn}
                            onClick={() => handleSendBill(Number(form.studentId), t.type, feeAmountByType[t.type] || 0)}>
                            Send Bill
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

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

          {/* Right: Fee matrix — every student × every fee type */}
          <div style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h3 style={styles.sub}>Fee Status — All Students ({matrixStudents.length})</h3>
              <select style={styles.filterSel} value={filterClass}
                onChange={e => setFilterClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.legend}>
              <span><span style={{...styles.dot, background:'#2e7d32'}} /> Paid</span>
              <span><span style={{...styles.dot, background:'#1565c0'}} /> Bill sent (within grace)</span>
              <span><span style={{...styles.dot, background:'#e65100'}} /> Pending (overdue)</span>
              <span><span style={{...styles.dot, background:'#bbb'}} /> Not billed</span>
            </div>
            <div style={styles.tableWrap}>
              <table style={styles.matrix}>
                <thead><tr style={styles.head}>
                  <th style={{...styles.th, ...styles.stickyCol}}>Student</th>
                  <th style={styles.th}>Class</th>
                  {schoolFeeTypes.map(t => <th key={t} style={{...styles.th, textAlign:'center'}}>{t}</th>)}
                </tr></thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={schoolFeeTypes.length + 2} style={{...styles.td, textAlign:'center', color:'#999', padding:28}}>Loading…</td></tr>
                  )}
                  {!loading && matrixStudents.map(s => (
                    <tr key={s.id}>
                      <td style={{...styles.td, ...styles.stickyCol}}><strong>{s.name}</strong></td>
                      <td style={styles.td}><span style={styles.classBadge}>{s.className}</span></td>
                      {schoolFeeTypes.map(t => {
                        const cell = payLookup[`${s.id}|${t}`];
                        const status = cell?.status;
                        return (
                          <td key={t} style={{...styles.td, textAlign:'center'}}>
                            {status === 'PAID' && (
                              <span style={{...styles.cellBadge, background:'#e8f5e9', color:'#2e7d32'}}>✓ Paid</span>
                            )}
                            {status === 'BILLED' && (
                              <button style={{...styles.cellBtn, background:'#e3f2fd', color:'#1565c0', borderColor:'#90caf9'}}
                                onClick={() => handleMarkPaid(cell.id)} title="Bill sent — click to mark paid">
                                Bill Sent · Pay
                              </button>
                            )}
                            {status === 'PENDING' && (
                              <button style={{...styles.cellBtn, background:'#fff3e0', color:'#e65100', borderColor:'#ffcc80'}}
                                onClick={() => handleMarkPaid(cell.id)} title="Overdue — click to mark paid">
                                Pending · Pay
                              </button>
                            )}
                            {!status && (
                              <button style={{...styles.cellBtn, background:'#f5f5f5', color:'#777', borderColor:'#ddd'}}
                                onClick={() => handleSendBill(s.id, t, feeAmountByType[t] || 0)}
                                title={`Send bill for ₹${(feeAmountByType[t]||0).toLocaleString()} (emails the student)`}>
                                Send Bill
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {!loading && matrixStudents.length === 0 && (
                    <tr><td colSpan={schoolFeeTypes.length + 2} style={{...styles.td, textAlign:'center', color:'#999', padding:28}}>No students{filterClass ? ` in ${filterClass}` : ''}.</td></tr>
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
  billBtn: { background:'#1565c0', color:'#fff', border:'none', borderRadius:4,
             padding:'4px 10px', fontSize:12, cursor:'pointer', fontWeight:600 },
  tableHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:12 },
  filterSel: { padding:'8px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  statusHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  allClear: { background:'#e8f5e9', color:'#2e7d32', padding:'3px 12px', borderRadius:12, fontSize:12, fontWeight:700 },
  notClear: { background:'#fff3e0', color:'#e65100', padding:'3px 12px', borderRadius:12, fontSize:12, fontWeight:700 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6', position:'sticky', top:0 },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'9px 12px', borderBottom:'1px solid #eee' },
  matrix: { width:'100%', borderCollapse:'collapse', fontSize:13, minWidth:620 },
  stickyCol: { position:'sticky', left:0, background:'#fff', zIndex:1 },
  legend: { display:'flex', gap:16, fontSize:12, color:'#666', marginBottom:10, flexWrap:'wrap' },
  dot: { display:'inline-block', width:10, height:10, borderRadius:5, marginRight:5, verticalAlign:'middle' },
  classBadge: { background:'#e8eaf6', color:'#1a237e', padding:'2px 8px', borderRadius:10, fontSize:11, fontWeight:600 },
  cellBadge: { padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:700, whiteSpace:'nowrap' },
  cellBtn: { border:'1px solid', borderRadius:4, padding:'4px 8px', fontSize:11, cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' },
};
