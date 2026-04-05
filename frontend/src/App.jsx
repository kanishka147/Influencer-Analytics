import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Activity, PlusCircle, LayoutDashboard, LogOut, LogIn, UserPlus, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import axios from 'axios';
import InputForm from './pages/InputForm';
import Dashboard from './pages/Dashboard';
import ReportDisplay from './pages/ReportDisplay';
import InfluencerProfile from './pages/InfluencerProfile';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

// ── Sidebar Nav Item ───────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <div className="tooltip-container">
      <Link to={to} className={`nav-item ${isActive ? 'active' : ''}`}>
        <Icon size={20} style={{ flexShrink: 0 }} />
        {!collapsed && <span>{label}</span>}
      </Link>
      {collapsed && <span className="tooltip">{label}</span>}
    </div>
  );
};

// ── Sidebar ────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #E2D9FB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{ 
            width: 36, height: 36, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Activity size={18} color="white" />
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 800, fontSize: 17, color: '#1E1B4B', letterSpacing: '-0.4px', whiteSpace: 'nowrap' }}>
              Influe<span style={{ color: '#7C3AED' }}>Metrics</span>
            </span>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {token ? (
          <>
            <NavItem to="/" icon={PlusCircle} label="New Analysis" collapsed={collapsed} />
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
            <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
          </>
        ) : (
          <>
            <NavItem to="/login" icon={LogIn} label="Login" collapsed={collapsed} />
            <NavItem to="/register" icon={UserPlus} label="Register" collapsed={collapsed} />
          </>
        )}
      </nav>

      {/* Bottom: user + logout */}
      {token && (
        <div style={{ padding: '12px 10px', borderTop: '1px solid #E2D9FB' }}>
          <div className="tooltip-container">
            <button
              onClick={handleLogout}
              className="nav-item"
              style={{ width: '100%', background: 'none', border: 'none', color: '#EF4444', fontFamily: 'inherit' }}
            >
              <LogOut size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Logout</span>}
            </button>
            {collapsed && <span className="tooltip">Logout</span>}
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute', top: 22, right: -14,
          width: 28, height: 28, borderRadius: '50%',
          background: '#7C3AED', border: '2px solid #FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
          transition: 'transform 0.2s', zIndex: 60,
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

// ── App ────────────────────────────────────────────────────
function App() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const sidebarWidth = collapsed ? 72 : 260;

  return (
    <Router>
      <AuthGate collapsed={collapsed} setCollapsed={setCollapsed} sidebarWidth={sidebarWidth} />
    </Router>
  );
}

// Separate so we can read location inside Router
const AuthGate = ({ collapsed, setCollapsed, sidebarWidth }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F3FF' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ 
        marginLeft: sidebarWidth, 
        flex: 1, 
        padding: '32px', 
        transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><InputForm /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><ReportDisplay /></ProtectedRoute>} />
          <Route path="/influencer/:id" element={<ProtectedRoute><InfluencerProfile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
