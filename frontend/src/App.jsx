import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admission from './pages/Admission';
import FeePayment from './pages/FeePayment';
import Attendance from './pages/Attendance';
import Syllabus from './pages/Syllabus';
import Performance from './pages/Performance';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import Users from './pages/Users';

const ALL = ['ADMIN', 'CLERK', 'TEACHER', 'PRINCIPAL'];

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={ALL}><Dashboard /></ProtectedRoute>} />
          <Route path="/admission" element={<ProtectedRoute allowedRoles={['ADMIN','CLERK']}><Admission /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute allowedRoles={['ADMIN','CLERK']}><FeePayment /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute allowedRoles={['ADMIN','TEACHER']}><Attendance /></ProtectedRoute>} />
          <Route path="/syllabus" element={<ProtectedRoute allowedRoles={['ADMIN','TEACHER']}><Syllabus /></ProtectedRoute>} />
          <Route path="/performance" element={<ProtectedRoute allowedRoles={['ADMIN','TEACHER']}><Performance /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN','PRINCIPAL']}><Reports /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute allowedRoles={['ADMIN','PRINCIPAL']}><Analysis /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><Users /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
