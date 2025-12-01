import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div style={{marginRight: 'auto', fontSize: '1.5rem', fontWeight: 'bold', color: '#4f46e5'}}>
        🏫 EduManager
      </div>
      <Link to="/" className={isActive('/')}>📅 Điểm danh</Link>
      <Link to="/students" className={isActive('/students')}>👨‍🎓 Học sinh</Link>
      <Link to="/classes" className={isActive('/classes')}>🏫 QL Lớp & Giá</Link> {/* MỚI */}
      <Link to="/tuition" className={isActive('/tuition')}>💰 Tính tiền</Link>    {/* MỚI */}
    </nav>
  );
}
export default Navbar;