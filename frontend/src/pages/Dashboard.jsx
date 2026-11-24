import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [overview,     setOverview]     = useState(null);
  const [recentAdm,    setRecentAdm]    = useState([]);
  const [totalAdm,     setTotalAdm]     = useState(0);
  const [recentFees,   setRecentFees]   = useState([]);
  const [totalFees,    setTotalFees]    = useState(0);
  const [todayAttend,  setTodayAttend]  = useState({ present:0, total:0 });
  const [recentPerf,   setRecentPerf]   = useState([]);

  useEffect(() => {
    const role = user?.role;
    if (role === 'ADMIN' || role === 'PRINCIPAL') {
      api.get('/analysis/overview').then(r => setOverview(r.data)).catch(() => {});
    }
    if (role === 'ADMIN' || role === 'CLERK') {
      api.get('/admissions').then(r => {
        setTotalAdm(r.data.length);
        setRecentAdm(r.data.slice(-5).reverse());
      }).catch(() => {});
      api.get('/fees').then(r => {
        setTotalFees(r.data.length);
        setRecentFees(r.data.slice(-5).reverse());
      }).catch(() => {});
    }
    if (role === 'ADMIN' || role === 'TEACHER') {
      const today = new Date().toISOString().split('T')[0];
      api.get(`/attendance/date/${today}`).then(r => {
        const data = r.data;
        setTodayAttend({ present: data.filter(a => a.present).length, total: data.length });
      }).catch(() => {});
      api.get('/performance').then(r => setRecentPerf(r.data.slice(-5).reverse())).catch(() => {});
    }
  }, [user]);

  return (
    <div>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.welcome}>
          <div>
            <h2 style={styles.heading}>Welcome back, {user?.name}!</h2>
            <p style={styles.sub}>Role: <strong>{user?.role}</strong></p>
          </div>
          <div style={styles.dateBadge}>{new Date().toDateString()}</div>
        </div>

        {/* ADMIN / PRINCIPAL: KPI cards */}
        {overview && (
          <div style={styles.kpiGrid}>
            <KpiCard title="Total Students"    value={overview.totalStudents}                             icon="👨‍🎓" color="#1a237e"
              hint="View all students" onClick={() => navigate('/reports?tab=admissions')} />
            <KpiCard title="Attendance Rate"   value={`${overview.attendanceRate}%`}                     icon="✅" color="#2e7d32"
              hint="View attendance" onClick={() => navigate('/analysis')} />
            <KpiCard title="Avg Score"         value={`${overview.averageScore}%`}                       icon="📊" color="#e65100"
              hint="View performance" onClick={() => navigate('/analysis')} />
            <KpiCard title="Fees Collected"    value={`₹${overview.totalFeesCollected?.toLocaleString()}`} icon="💰" color="#6a1b9a"
              hint="View fee collection" onClick={() => navigate('/reports?tab=fees')} />
          </div>
        )}

        {/* TEACHER: today's summary */}
        {user?.role === 'TEACHER' && (
          <div style={styles.kpiGrid}>
            <KpiCard title="Present Today"
              value={todayAttend.present} icon="✅" color="#2e7d32"
              hint="Go to attendance" onClick={() => navigate('/attendance')} />
            <KpiCard title="Absent Today"
              value={todayAttend.total - todayAttend.present} icon="❌" color="#c62828"
              hint="Go to attendance" onClick={() => navigate('/attendance')} />
            <KpiCard title="Attendance %"
              value={todayAttend.total ? `${Math.round(todayAttend.present/todayAttend.total*100)}%` : 'N/A'}
              icon="📋" color="#1a237e"
              hint="Go to attendance" onClick={() => navigate('/attendance')} />
          </div>
        )}

        {/* CLERK: today's summary */}
        {user?.role === 'CLERK' && (
          <div style={styles.kpiGrid}>
            <KpiCard title="Total Admissions" value={totalAdm} icon="📋" color="#1a237e"
              hint="View admissions" onClick={() => navigate('/admission')} />
            <KpiCard title="Total Fee Records" value={totalFees} icon="💳" color="#2e7d32"
              hint="Go to fee payment" onClick={() => navigate('/fees')} />
          </div>
        )}

        <div style={styles.cardRow}>
          {/* Quick Guide */}
          <div style={styles.guideCard}>
            <h3 style={styles.cardTitle}>Quick Guide</h3>
            {user?.role === 'ADMIN' && (
              <ul style={styles.list}>
                <li>Go to <strong>Users</strong> to create staff accounts</li>
                <li>Use <strong>Admission</strong> to enroll new students</li>
                <li>Check <strong>Analysis</strong> for school-wide KPIs</li>
                <li>Use <strong>Reports</strong> for exportable data</li>
              </ul>
            )}
            {user?.role === 'CLERK' && (
              <ul style={styles.list}>
                <li>Use <strong>Admission → New Admission</strong> to enroll a student</li>
                <li>Switch to <strong>All Admissions</strong> tab to search existing records</li>
                <li>Go to <strong>Fee Payment</strong> to process fees</li>
                <li>Select a student in Fee Payment to view their payment history</li>
                <li>Print a receipt after each payment using the Receipt button</li>
              </ul>
            )}
            {user?.role === 'TEACHER' && (
              <ul style={styles.list}>
                <li>Use <strong>Attendance</strong> — select a class and mark daily attendance</li>
                <li>Click <em>Mark All Present</em> then toggle only the absent students</li>
                <li>Go to <strong>Performance</strong> to record exam scores — grade is auto-calculated</li>
                <li>Use <strong>Syllabus</strong> to update topic coverage per class</li>
              </ul>
            )}
            {user?.role === 'PRINCIPAL' && (
              <ul style={styles.list}>
                <li>View <strong>Analysis</strong> for attendance trends and performance charts</li>
                <li>Open <strong>Class Schedule</strong> to manage the weekly timetable</li>
                <li>Use <strong>Reports</strong> and hit <em>Print</em> to export any report</li>
              </ul>
            )}
          </div>

          {/* Recent Admissions (ADMIN / CLERK) */}
          {(user?.role === 'ADMIN' || user?.role === 'CLERK') && recentAdm.length > 0 && (
            <div style={styles.recentCard}>
              <h3 style={styles.cardTitle}>Recent Admissions</h3>
              {recentAdm.map(a => (
                <div key={a.id} style={styles.recentRow}>
                  <div>
                    <strong>{a.student?.name}</strong>
                    <span style={styles.classPill}>{a.student?.className}</span>
                  </div>
                  <span style={styles.recentDate}>{a.admissionDate}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recent Performance (TEACHER) */}
          {user?.role === 'TEACHER' && recentPerf.length > 0 && (
            <div style={styles.recentCard}>
              <h3 style={styles.cardTitle}>Recent Scores Entered</h3>
              {recentPerf.map(p => {
                const pct = Math.round(p.score / p.maxScore * 100);
                return (
                  <div key={p.id} style={styles.recentRow}>
                    <div>
                      <strong>{p.student?.name}</strong>
                      <span style={styles.classPill}>{p.subject}</span>
                    </div>
                    <span style={{ fontWeight:700, color: pct>=75?'#2e7d32':'#c62828' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Class distribution (ADMIN / PRINCIPAL) */}
          {overview?.classDistribution && (
            <div style={styles.recentCard}>
              <h3 style={styles.cardTitle}>Students by Class</h3>
              {Object.entries(overview.classDistribution).sort().map(([cls, cnt]) => (
                <div key={cls} style={styles.barRow}>
                  <span style={styles.barLabel}>{cls}</span>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill,
                      width:`${(cnt/overview.totalStudents)*100}%` }} />
                  </div>
                  <span style={styles.barCount}>{cnt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color, hint, onClick }) {
  const [hover, setHover] = useState(false);
  const clickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      style={{
        background:'#fff', borderRadius:10, padding:'20px 22px',
        boxShadow: hover && clickable ? '0 6px 18px rgba(0,0,0,0.14)' : '0 2px 8px rgba(0,0,0,0.08)',
        borderTop:`4px solid ${color}`,
        cursor: clickable ? 'pointer' : 'default',
        transform: hover && clickable ? 'translateY(-3px)' : 'none',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontSize:28, marginBottom:4 }}>{icon}</div>
        {clickable && <span style={{ fontSize:16, color: hover ? color : '#bbb' }}>›</span>}
      </div>
      <div style={{ fontSize:26, fontWeight:'bold', color, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:13, color:'#666' }}>{title}</div>
      {clickable && (
        <div style={{ fontSize:11, color: hover ? color : '#aaa', marginTop:8, fontWeight:600 }}>
          {hint} →
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding:'28px 36px', maxWidth:1100, margin:'0 auto' },
  welcome: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28, flexWrap:'wrap', gap:12 },
  heading: { fontSize:24, color:'#1a237e', margin:0 },
  sub: { color:'#666', margin:'4px 0 0', fontSize:14 },
  dateBadge: { background:'#e8eaf6', color:'#1a237e', padding:'8px 18px', borderRadius:20, fontSize:14, fontWeight:600 },
  kpiGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px,1fr))', gap:16, marginBottom:24 },
  cardRow: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px,1fr))', gap:20, alignItems:'start' },
  guideCard: { background:'#fff', borderRadius:8, padding:'20px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  recentCard: { background:'#fff', borderRadius:8, padding:'20px 24px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize:14, fontWeight:700, color:'#1a237e', marginBottom:14, margin:'0 0 14px' },
  list: { paddingLeft:18, margin:0, lineHeight:2, fontSize:13, color:'#444' },
  recentRow: { display:'flex', justifyContent:'space-between', alignItems:'center',
               padding:'8px 0', borderBottom:'1px solid #eee', fontSize:13 },
  classPill: { background:'#e8eaf6', color:'#1a237e', padding:'1px 8px', borderRadius:10,
               fontSize:11, fontWeight:600, marginLeft:8 },
  recentDate: { fontSize:12, color:'#999' },
  barRow: { display:'flex', alignItems:'center', gap:10, marginBottom:8 },
  barLabel: { width:40, fontSize:12, fontWeight:600, color:'#333' },
  barTrack: { flex:1, height:14, background:'#e8eaf6', borderRadius:7, overflow:'hidden' },
  barFill: { height:'100%', background:'#1a237e', borderRadius:7 },
  barCount: { width:24, fontSize:12, color:'#555', textAlign:'right' },
};
