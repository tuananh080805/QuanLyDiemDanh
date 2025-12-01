import { useState, useEffect } from 'react';
import axios from 'axios';

function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // THAY ĐỔI 1: Mặc định là rỗng ('') để không hiện gì cả lúc đầu
  const [selectedClassId, setSelectedClassId] = useState(''); 
  const [searchText, setSearchText] = useState(''); 
  const [filterCommune, setFilterCommune] = useState('');
  
  const [checkedState, setCheckedState] = useState({});

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    try {
      const [resSt, resCl] = await Promise.all([
        axios.get(`https://quanlydiemdanh.onrender.com/students?date=${date}`),
        axios.get('https://quanlydiemdanh.onrender.com/classes')
      ]);

      setStudents(resSt.data);
      setClasses(resCl.data);

      const newCheckedState = {};
      resSt.data.forEach(st => {
        if (st.Attendances && st.Attendances.length > 0 && st.Attendances[0].isPresent) {
            newCheckedState[st.id] = true;
        } else {
            newCheckedState[st.id] = false;
        }
      });
      setCheckedState(newCheckedState);

    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  // THAY ĐỔI 2: Logic lọc mới
  const filteredStudents = students.filter(st => {
    // Nếu chưa chọn lớp thì KHÔNG hiện ai cả
    if (!selectedClassId) return false; 

    const matchClass = st.ClassId == selectedClassId;
    const matchName = st.name.toLowerCase().includes(searchText.toLowerCase());
    
    const stCommune = st.commune ? st.commune.toLowerCase() : '';
    const matchCommune = stCommune.includes(filterCommune.toLowerCase());

    return matchClass && matchName && matchCommune;
  });

  const isAllChecked = filteredStudents.length > 0 && filteredStudents.every(st => checkedState[st.id]);

  const handleCheck = async (studentId, isChecked) => {
    setCheckedState(prev => ({ ...prev, [studentId]: isChecked }));
    try {
      await axios.post('https://quanlydiemdanh.onrender.com/attendance', {
        studentId, date, isPresent: isChecked
      });
    } catch (err) { console.error(err); }
  };

  const toggleSelectAll = async () => {
    const newValue = !isAllChecked;
    const newState = { ...checkedState };
    filteredStudents.forEach(st => newState[st.id] = newValue);
    setCheckedState(newState);

    for (const st of filteredStudents) {
      await axios.post('https://quanlydiemdanh.onrender.com/attendance', {
        studentId: st.id, date, isPresent: newValue
      });
    }
  };

  const handleExport = () => {
    if(!selectedClassId) return alert("Vui lòng chọn lớp cần xuất Excel!");
    const url = `https://quanlydiemdanh.onrender.com/export-tuition?startDate=${date}&endDate=${date}&classId=${selectedClassId}`;
    window.open(url, '_blank');
  };

  return (
    <div className="page-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <h2 style={{margin:0}}>📅 ĐIỂM DANH HÀNG NGÀY</h2>
        <button 
            onClick={handleExport}
            style={{background: '#059669', color:'white', border:'none', padding:'10px 20px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px'}}
        >
            📥 Xuất Excel
        </button>
      </div>

      <div className="toolbar">
        <div className="toolbar-item">
            <label>Ngày:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{width: '135px'}} />
        </div>

        {/* THAY ĐỔI 3: Dropdown bắt buộc chọn */}
        <div className="toolbar-item" style={{flex: 1, minWidth: '150px'}}>
            <select 
                value={selectedClassId} 
                onChange={e => setSelectedClassId(e.target.value)} 
                style={{width: '100%', border: !selectedClassId ? '2px solid #ef4444' : '1px solid #ddd'}}
            >
                {/* Value rỗng */}
                <option value="">-- Chọn lớp để điểm danh --</option>
                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
            </select>
        </div>

        <div className="toolbar-item" style={{flex: 1, minWidth: '150px'}}>
             <input placeholder="🏠 Lọc theo xã..." value={filterCommune} onChange={e => setFilterCommune(e.target.value)} style={{width:'100%'}}/>
        </div>

        <div className="toolbar-item" style={{flex: 1, minWidth: '150px'}}>
             <input placeholder="🔍 Tìm tên..." value={searchText} onChange={e => setSearchText(e.target.value)} style={{width:'100%'}}/>
        </div>
      </div>

      <div className="right-panel" style={{minHeight: '400px'}}>
        {/* THAY ĐỔI 4: Hiện thông báo nếu chưa chọn lớp */}
        {!selectedClassId ? (
            <div style={{textAlign: 'center', padding: '50px', color: '#64748b'}}>
                <h3 style={{margin:0}}>👈 Vui lòng chọn Lớp học ở trên để bắt đầu điểm danh</h3>
                <p>Hệ thống đang ẩn danh sách để tối ưu hiển thị.</p>
            </div>
        ) : (
            <table>
                <thead>
                    <tr>
                        <th style={{width: '15%'}}>Lớp</th>
                        <th style={{width: '30%'}}>Họ và Tên</th>
                        <th style={{width: '30%'}}>Xã / Địa chỉ</th>
                        <th style={{width: '15%', textAlign: 'center'}}>
                            <div 
                                onClick={toggleSelectAll}
                                style={{cursor:'pointer', userSelect:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', color: isAllChecked ? '#059669' : '#64748b'}}
                            >
                                <input type="checkbox" checked={isAllChecked} readOnly style={{width:'16px', height:'16px', margin:0, cursor:'pointer'}} />
                                <span>{isAllChecked ? 'Bỏ chọn' : 'Chọn hết'}</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.map(st => (
                        <tr key={st.id} style={{background: checkedState[st.id] ? '#f0fdf4' : 'transparent'}}>
                            <td style={{color:'#64748b', fontWeight:'bold'}}>{st.Class?.name}</td>
                            <td style={{fontWeight:'600', fontSize:'1.05rem'}}>{st.name}</td>
                            <td style={{color:'#4b5563'}}>{st.commune || '-'}</td>
                            <td style={{textAlign: 'center'}}>
                                <input 
                                    type="checkbox" 
                                    checked={!!checkedState[st.id]} 
                                    onChange={e => handleCheck(st.id, e.target.checked)}
                                    style={{width:'22px', height:'22px', cursor:'pointer', accentColor: '#16a34a'}}
                                />
                            </td>
                        </tr>
                    ))}
                    
                    {filteredStudents.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{textAlign:'center', padding:'30px', color:'#9ca3af'}}>
                                Lớp này chưa có học sinh nào.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}

export default AttendancePage;