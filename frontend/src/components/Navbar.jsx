import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = {
  ADMIN:     ['dashboard','admission','fees','attendance','syllabus','performance','reports','analysis','users'],
  PRINCIPAL: ['dashboard','reports','analysis'],
  CLERK:     ['dashboard','admission','fees'],
  TEACHER:   ['dashboard','attendance','syllabus','performance'],
};

const LABELS = {
  dashboard:   'Dashboard',
  admission:   'Admission',
  fees:        'Fee Payment',
  attendance:  'Attendance',
  syllabus:    'Syllabus',
  performance: 'Performance',
  reports:     'Reports',
  analysis:    'Analysis',
  users:       'Users',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = NAV_LINKS[user?.role] || [];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>School Admin</div>
      <div style={styles.links}>
        {links.map(l => (
          <Link key={l} to={`/${l}`} style={styles.link}>{LABELS[l]}</Link>
        ))}
      </div>
      <div style={styles.user}>
        <span style={styles.userInfo}>{user?.name} ({user?.role})</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display:'flex', alignItems:'center', background:'#1a237e', color:'#fff', padding:'0 20px', height:56, gap:16 },
  brand: { fontWeight:'bold', fontSize:18, marginRight:24, whiteSpace:'nowrap' },
  links: { display:'flex', gap:4, flex:1, flexWrap:'wrap' },
  link: { color:'#e8eaf6', textDecoration:'none', padding:'6px 10px', borderRadius:4, fontSize:14, whiteSpace:'nowrap',
          ':hover': { background:'#3949ab' } },
  user: { display:'flex', alignItems:'center', gap:12, whiteSpace:'nowrap' },
  userInfo: { fontSize:13, color:'#c5cae9' },
  logoutBtn: { background:'#c62828', color:'#fff', border:'none', borderRadius:4, padding:'6px 14px', cursor:'pointer', fontSize:13 },
};
