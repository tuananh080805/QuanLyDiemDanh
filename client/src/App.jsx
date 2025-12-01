import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AttendancePage from './pages/AttendancePage';
import StudentManager from './pages/StudentManager';
import ClassManager from './pages/ClassManager'; // Import mới
import TuitionPage from './pages/TuitionPage';   // Import mới
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <Routes>
          <Route path="/" element={<AttendancePage />} />
          <Route path="/students" element={<StudentManager />} />
          <Route path="/classes" element={<ClassManager />} /> {/* Route mới */}
          <Route path="/tuition" element={<TuitionPage />} />   {/* Route mới */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;