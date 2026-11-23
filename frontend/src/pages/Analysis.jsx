import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function Analysis() {
  const [overview, setOverview] = useState(null);
  const [perfByClass, setPerfByClass] = useState([]);
  const [attByStudent, setAttByStudent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/analysis/overview').then(r => setOverview(r.data)),
      api.get('/analysis/performance-by-class').then(r => setPerfByClass(r.data)),
      api.get('/analysis/attendance-by-student').then(r => setAttByStudent(r.data)),
    ]).catch(() => setError('Failed to load analytics. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.page}>
          <h2 style={styles.heading}>Analysis &amp; Insights</h2>
          <div style={styles.card}>Loading analytics…</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Analysis & Insights</h2>

        {error && <div style={{...styles.card, color:'#c62828'}}>{error}</div>}

        {overview && (
          <div style={styles.stats}>
            <StatCard title="Total Students" value={overview.totalStudents} color="#1a237e" />
            <StatCard title="Attendance Rate" value={`${overview.attendanceRate}%`} color="#2e7d32" />
            <StatCard title="Avg Score" value={`${overview.averageScore}%`} color="#e65100" />
            <StatCard title="Fees Collected" value={`₹${overview.totalFeesCollected?.toLocaleString()}`} color="#6a1b9a" />
          </div>
        )}

        {overview?.classDistribution && (
          <div style={styles.card}>
            <h3 style={styles.sub}>Students by Class</h3>
            <div style={styles.barContainer}>
              {Object.entries(overview.classDistribution).map(([cls, count]) => (
                <div key={cls} style={styles.barRow}>
                  <span style={styles.barLabel}>{cls}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.bar, width: `${(count / overview.totalStudents) * 100}%` }} />
                  </div>
                  <span style={styles.barCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.twoCol}>
          <div style={styles.card}>
            <h3 style={styles.sub}>Performance by Class</h3>
            <table style={styles.table}>
              <thead><tr style={styles.head}>
                <th style={styles.th}>Class</th><th style={styles.th}>Avg Score (%)</th>
              </tr></thead>
              <tbody>
                {perfByClass.map(r => (
                  <tr key={r.className}>
                    <td style={styles.td}>{r.className}</td>
                    <td style={styles.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={styles.miniTrack}>
                          <div style={{ ...styles.miniBar,
                            width:`${r.avgScore}%`,
                            background: r.avgScore >= 75 ? '#2e7d32' : r.avgScore >= 50 ? '#f57c00' : '#c62828'
                          }} />
                        </div>
                        <strong>{r.avgScore}%</strong>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            <h3 style={styles.sub}>Attendance by Student</h3>
            <table style={styles.table}>
              <thead><tr style={styles.head}>
                <th style={styles.th}>Student</th>
                <th style={styles.th}>Present</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Rate</th>
              </tr></thead>
              <tbody>
                {attByStudent.map(r => (
                  <tr key={r.studentId}>
                    <td style={styles.td}>{r.name}</td>
                    <td style={styles.td}>{r.presentDays}</td>
                    <td style={styles.td}>{r.totalDays}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge,
                        background: r.attendanceRate >= 75 ? '#e8f5e9':'#ffebee',
                        color: r.attendanceRate >= 75 ? '#2e7d32':'#c62828' }}>
                        {r.attendanceRate}%
                      </span>
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

function StatCard({ title, value, color }) {
  return (
    <div style={{ background:'#fff', borderRadius:8, padding:'20px 24px',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.08)', borderTop:`4px solid ${color}` }}>
      <div style={{ fontSize:26, fontWeight:'bold', color, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:13, color:'#666' }}>{title}</div>
    </div>
  );
}

const styles = {
  page: { padding:'32px 40px', maxWidth:1100, margin:'0 auto' },
  heading: { fontSize:22, color:'#1a237e', marginBottom:24 },
  stats: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  card: { background:'#fff', borderRadius:8, padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:24 },
  sub: { fontSize:15, fontWeight:700, marginBottom:16, color:'#333' },
  twoCol: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 },
  barContainer: { display:'flex', flexDirection:'column', gap:12 },
  barRow: { display:'flex', alignItems:'center', gap:12 },
  barLabel: { width:60, fontSize:13, fontWeight:600, color:'#333' },
  barTrack: { flex:1, height:20, background:'#e8eaf6', borderRadius:10, overflow:'hidden' },
  bar: { height:'100%', background:'#1a237e', borderRadius:10 },
  barCount: { width:24, fontSize:13, color:'#555' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  head: { background:'#e8eaf6' },
  th: { padding:'10px 12px', fontWeight:600, color:'#1a237e', textAlign:'left', borderBottom:'2px solid #c5cae9' },
  td: { padding:'10px 12px', borderBottom:'1px solid #eee' },
  miniTrack: { flex:1, height:10, background:'#eee', borderRadius:5, overflow:'hidden', minWidth:80 },
  miniBar: { height:'100%', borderRadius:5 },
  badge: { padding:'2px 10px', borderRadius:12, fontSize:12, fontWeight:600 },
};
