import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import useClasses from '../hooks/useClasses';

export default function Reports() {
  const { classes } = useClasses();
  const [searchParams] = useSearchParams();
  const initialTab = ['admissions','syllabus','fees'].includes(searchParams.get('tab'))
    ? searchParams.get('tab') : 'admissions';
  const [tab,         setTab]        = useState(initialTab);
  const [admissions,  setAdmissions] = useState([]);
  const [syllabus,    setSyllabus]   = useState([]);
  const [fees,        setFees]       = useState([]);
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    api.get('/admissions').then(r => setAdmissions(r.data));
    api.get('/syllabus').then(r => setSyllabus(r.data));
    api.get('/fees').then(r => setFees(r.data));
  }, []);

  const filteredAdm = admissions.filter(a =>
    !filterClass || a.student?.className === filterClass
  );
  const filteredFees = fees.filter(f =>
    !filterClass || f.student?.className === filterClass
  );
  const totalFees   = filteredFees.reduce((s, f) => s + (f.amount || 0), 0);
  const paidFees    = filteredFees.filter(f => f.status === 'PAID').reduce((s, f) => s + (f.amount || 0), 0);
  const pendingFees = filteredFees.filter(f => f.status === 'PENDING').reduce((s, f) => s + (f.amount || 0), 0);
  const feesByType  = filteredFees.reduce((acc, f) => {
    acc[f.feeType] = (acc[f.feeType] || 0) + f.amount;
    return acc;
  }, {});

  const handlePrint = () => window.print();

  return (
    <div>
      <Navbar />

      {/* Print-only header */}
      <div className="print-header" style={{ display:'none' }}>
        <h2>School Administration System — Report</h2>
        <p>Generated on {new Date().toLocaleString()}</p>
        <hr />
      </div>

      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          .print-header { display: block !important; }
          body { font-size: 12px; }
        }
      `}</style>

      <div style={styles.page}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>Reports</h2>
          <div style={styles.headerActions} className="no-print">
            <select style={styles.filterSel} value={filterClass}
              onChange={e => setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c}>{c}</option>)}
            </select>
            <button style={styles.printBtn} onClick={handlePrint}>🖨 Print Report</button>
          </div>
        </div>

        <div style={styles.tabBar} className="no-print">
          {['admissions','syllabus','fees'].map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.active : {}) }}
              onClick={() => setTab(t)}>
              {t === 'admissions' ? `Student Admissions (${filteredAdm.length})`
               : t === 'syllabus' ? `Syllabus (${syllabus.length})`
               : `Fee Collection`}
            </button>
          ))}
        </div>

        <div style={styles.card}>
          {/* ── ADMISSIONS ── */}
          {tab === 'admissions' && (
            <>
              <div style={styles.subRow}>
                <h3 style={styles.sub}>Admissions Report — {filteredAdm.length} students</h3>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr style={styles.head}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Class</th>
                    <th style={styles.th}>Section</th>
                    <th style={styles.th}>Parent</th>
                    <th style={styles.th}>Admission Date</th>
                    <th style={styles.th}>Prev. Performance</th>
                    <th style={styles.th}>Status</th>
                  </tr></thead>
                  <tbody>
                    {filteredAdm.map((a, i) => (
                      <tr key={a.id}>
                        <td style={styles.td}>{i + 1}</td>
                        <td style={styles.td}><strong>{a.student?.name}</strong></td>
                        <td style={styles.td}><span style={styles.classBadge}>{a.student?.className}</span></td>
                        <td style={styles.td}>{a.student?.section}</td>
                        <td style={styles.td}>{a.student?.parentName}</td>
                        <td style={styles.td}>{a.admissionDate}</td>
                        <td style={styles.td}>{a.student?.previousClassPerformance || '—'}</td>
                        <td style={styles.td}><span style={styles.greenBadge}>{a.status}</span></td>
                      </tr>
                    ))}
                    {filteredAdm.length === 0 && (
                      <tr><td colSpan={8} style={{...styles.td, textAlign:'center', color:'#999', padding:28}}>No records</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── SYLLABUS ── */}
          {tab === 'syllabus' && (
            <>
              <h3 style={styles.sub}>Syllabus Coverage Report — {syllabus.length} entries</h3>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr style={styles.head}>
                    <th style={styles.th}>Class</th>
                    <th style={styles.th}>Subject</th>
                    <th style={styles.th}>Topics Covered</th>
                    <th style={styles.th}>Last Updated</th>
                    <th style={styles.th}>Updated By</th>
                  </tr></thead>
                  <tbody>
                    {syllabus.map(s => (
                      <tr key={s.id}>
                        <td style={styles.td}><span style={styles.classBadge}>{s.className}</span></td>
                        <td style={styles.td}><strong>{s.subject}</strong></td>
                        <td style={styles.td}>{s.content}</td>
                        <td style={styles.td}>{s.updatedAt?.split('T')[0]}</td>
                        <td style={styles.td}>{s.updatedBy?.name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ── FEES ── */}
          {tab === 'fees' && (
            <>
              <h3 style={styles.sub}>Fee Collection Summary</h3>
              <div style={styles.feeKpis}>
                <div style={{...styles.feeKpi, borderColor:'#1a237e'}}>
                  <div style={{...styles.feeKpiAmt, color:'#1a237e'}}>₹{totalFees.toLocaleString()}</div>
                  <div style={styles.feeKpiLbl}>Total Billed</div>
                </div>
                <div style={{...styles.feeKpi, borderColor:'#2e7d32'}}>
                  <div style={{...styles.feeKpiAmt, color:'#2e7d32'}}>₹{paidFees.toLocaleString()}</div>
                  <div style={styles.feeKpiLbl}>Collected (PAID)</div>
                </div>
                <div style={{...styles.feeKpi, borderColor:'#c62828'}}>
                  <div style={{...styles.feeKpiAmt, color:'#c62828'}}>₹{pendingFees.toLocaleString()}</div>
                  <div style={styles.feeKpiLbl}>Outstanding (PENDING)</div>
                </div>
                <div style={{...styles.feeKpi, borderColor:'#e65100'}}>
                  <div style={{...styles.feeKpiAmt, color:'#e65100'}}>{filteredFees.length}</div>
                  <div style={styles.feeKpiLbl}>Transactions</div>
                </div>
              </div>
              <div style={styles.byType}>
                {Object.entries(feesByType).map(([type, amt]) => (
                  <div key={type} style={styles.typeCard}>
                    <div style={styles.typeAmt}>₹{amt.toLocaleString()}</div>
                    <div style={styles.typeLbl}>{type}</div>
                  </div>
                ))}
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr style={styles.head}>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Class</th>
                    <th style={styles.th}>Fee Type</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                  </tr></thead>
                  <tbody>
                    {filteredFees.map((f, i) => (
                      <tr key={f.id}>
                        <td style={styles.td}>{i + 1}</td>
                        <td style={styles.td}><strong>{f.student?.name}</strong></td>
                        <td style={styles.td}><span style={styles.classBadge}>{f.student?.className}</span></td>
                        <td style={styles.td}>{f.feeType}</td>
                        <td style={styles.td}>₹{f.amount?.toLocaleString()}</td>
                        <td style={styles.td}>{f.paymentDate}</td>
                        <td style={styles.td}>
                          <span style={f.status==='PAID' ? styles.greenBadge : styles.redBadge}>
                            {f.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredFees.length === 0 && (
                      <tr><td colSpan={7} style={{...styles.td, textAlign:'center', color:'#999', padding:28}}>No records</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding:'28px 36px', maxWidth:1200, margin:'0 auto' },
  headerRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 },
  heading: { fontSize:22, color:'#1a237e', margin:0 },
  headerActions: { display:'flex', gap:10, alignItems:'center' },
  filterSel: { padding:'8px 12px', border:'1px solid #ccc', borderRadius:5, fontSize:13 },
  printBtn: { background:'#1a237e', color:'#fff', border:'none', borderRadius:6, padding:'9px 20px', fontSize:13, cursor:'pointer', fontWeight:600 },
  tabBar: { display:'flex', borderBottom:'2px solid #e8eaf6', marginBottom:0 },
  tab: { padding:'10px 24px', background:'none', border:'none', fontSize:13, cursor:'pointer', color:'#555', borderBottom:'2px solid transparent', marginBottom:-2, fontWeight:500 },
  active: { color:'#1a237e', fontWeight:700, borderBottom:'2px solid #1a237e' },
  card: { background:'#fff', borderRadius:'0 0 8px 8px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'24px' },
  subRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 },
  sub: { fontSize:15, fontWeight:700, color:'#333', margin:'0 0 16px' },
  tableWrap: { maxHeight:520, overflowY:'auto' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6', position:'sticky', top:0 },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'9px 12px', borderBottom:'1px solid #eee', maxWidth:280, wordBreak:'break-word' },
  classBadge: { background:'#e8eaf6', color:'#1a237e', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  greenBadge: { background:'#e8f5e9', color:'#2e7d32', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  redBadge:   { background:'#ffebee', color:'#c62828', padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
  feeKpis: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 },
  feeKpi: { background:'#fff', border:'2px solid', borderRadius:8, padding:'16px 20px', textAlign:'center' },
  feeKpiAmt: { fontSize:22, fontWeight:'bold', marginBottom:4 },
  feeKpiLbl: { fontSize:12, color:'#666' },
  byType: { display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' },
  typeCard: { background:'#f5f5f5', borderRadius:6, padding:'10px 16px', textAlign:'center', minWidth:120 },
  typeAmt: { fontSize:16, fontWeight:'bold', color:'#1a237e' },
  typeLbl: { fontSize:11, color:'#666', marginTop:3 },
};
