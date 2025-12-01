import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentManager() {
  // --- CẤU HÌNH API ---
  // Lưu ý: Không có dấu / ở cuối để tránh lỗi //
  const API_URL = 'https://quanlydiemdanh.onrender.com'; 
  // --------------------

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // State Form Thêm Mới
  const [name, setName] = useState('');
  const [commune, setCommune] = useState(''); // Xã
  const [isNewClass, setIsNewClass] = useState(false);
  const [classId, setClassId] = useState('');
  
  // State Form Lớp Mới
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(0);

  // State Bộ Lọc
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterCommune, setFilterCommune] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resSt, resCl] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/classes`)
      ]);
      setStudents(resSt.data);
      setClasses(resCl.data);
      
      // Mặc định chọn lớp đầu tiên nếu có
      if(resCl.data.length > 0 && !classId) setClassId(resCl.data[0].id);
    } catch(err) { console.error(err); }
  };

  // --- XỬ LÝ THÊM HỌC SINH ---
  const handleAdd = async () => {
    if(!name) return alert("Chưa nhập tên học sinh!");
    
    const payload = { name, commune };

    if (isNewClass) {
        if (!newClassName) return alert("Chưa nhập tên lớp mới!");
        payload.newClassName = newClassName;
        payload.newClassFee = newClassFee;
    } else {
        payload.classId = classId;
    }

    try {
        await axios.post(`${API_URL}/students`, payload);
        alert("Thêm thành công!");
        
        // Reset form
        setName('');
        setCommune(''); 
        setNewClassName('');
        setNewClassFee(0);
        setIsNewClass(false);
        fetchData();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
  };

  // --- XỬ LÝ XÓA 1 HỌC SINH ---
  const handleDelete = async (id) => {
    if(confirm("Xóa học sinh này?")) {
      try {
        await axios.delete(`${API_URL}/students/${id}`);
        fetchData();
      } catch (err) { alert("Lỗi xóa: " + err.message); }
    }
  };

  // --- XỬ LÝ XÓA TOÀN BỘ LỚP ---
  const handleDeleteClass = async () => {
    if (filterClassId === 'all') return;
    
    const className = classes.find(c => c.id == filterClassId)?.name;
    const confirmMsg = prompt(`⚠️ CẢNH BÁO!\nBạn đang yêu cầu XÓA TẤT CẢ học sinh của ${className}.\nDữ liệu điểm danh sẽ mất hết.\n\nGõ chữ "XOA" để xác nhận:`);

    if (confirmMsg === "XOA") {
        try {
            await axios.delete(`${API_URL}/students/class/${filterClassId}`);
            alert(`Đã dọn sạch lớp ${className}!`);
            fetchData();
        } catch (err) {
            alert("Lỗi: " + err.message);
        }
    }
  };

  // --- LOGIC LỌC DANH SÁCH ---
  const visibleStudents = students.filter(st => {
    const matchClass = filterClassId === 'all' || st.ClassId == filterClassId;
    
    const stCommune = st.commune ? st.commune.toLowerCase() : '';
    const matchCommune = stCommune.includes(filterCommune.toLowerCase());
    
    return matchClass && matchCommune;
  });

  return (
    <div className="page-container">
      <div className="desktop-grid">
        
        {/* --- CỘT TRÁI: CÔNG CỤ --- */}
        <div className="left-panel">
          <h3 style={{marginTop:0}}>🛠️ Công cụ</h3>
          
          {/* FORM THÊM MỚI */}
          <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#4338ca'}}>➕ Thêm học sinh</h4>
            
            <div className="form-group">
              <label>Tên Học Sinh:</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên..." />
            </div>

            <div className="form-group">
              <label>Xã / Địa chỉ:</label>
              <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="VD: Minh Tân..." />
            </div>

            {/* Toggle Lớp Mới */}
            <div className="form-group" style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                <input type="checkbox" checked={isNewClass} onChange={e => setIsNewClass(e.target.checked)} style={{width:'auto'}} />
                <label style={{margin:0, cursor:'pointer', color:'#dc2626'}} onClick={() => setIsNewClass(!isNewClass)}>
                    Tạo lớp học mới?
                </label>
            </div>

            {!isNewClass ? (
                <div className="form-group">
                  <label>Chọn Lớp:</label>
                  <select value={classId} onChange={e => setClassId(e.target.value)}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
            ) : (
                <div style={{background: 'white', padding:'10px', borderRadius:'6px', border:'1px dashed #6366f1'}}>
                    <div className="form-group">
                        <label>Tên Lớp Mới:</label>
                        <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="VD: Lớp 9A..." />
                    </div>
                    <div className="form-group">
                        <label>Học phí:</label>
                        <input type="number" value={newClassFee} onChange={e => setNewClassFee(e.target.value)} />
                    </div>
                </div>
            )}

            <button onClick={handleAdd} className="btn-primary">Lưu Dữ Liệu</button>
          </div>

          <hr style={{margin: '20px 0', borderTop:'1px solid #ddd'}}/>
          
          {/* BỘ LỌC TÌM KIẾM */}
          <h4>🔍 Bộ lọc & Tác vụ</h4>
          
          <div className="form-group">
             <label>Lọc theo lớp:</label>
             <select value={filterClassId} onChange={e => setFilterClassId(e.target.value)}>
                <option value="all">-- Tất cả lớp --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>

          {/* NÚT XÓA LỚP (Chỉ hiện khi chọn lớp cụ thể) */}
          {filterClassId !== 'all' && (
            <div style={{marginBottom: '15px', padding: '10px', background: '#fee2e2', borderRadius: '6px', border: '1px solid #fca5a5'}}>
                <button 
                    onClick={handleDeleteClass}
                    style={{width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}
                >
                    🗑️ Xóa hết HS lớp này
                </button>
            </div>
          )}
          
          <div className="form-group">
             <label>Lọc theo xã:</label>
             <input value={filterCommune} onChange={e => setFilterCommune(e.target.value)} placeholder="Nhập tên xã..." />
          </div>
        </div>

        {/* --- CỘT PHẢI: DANH SÁCH --- */}
        <div className="right-panel">
          <h3>📋 Danh sách học sinh ({visibleStudents.length})</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Lớp</th>
                <th>Tên</th>
                <th>Xã</th>
                <th style={{textAlign:'right'}}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(st => (
                <tr key={st.id}>
                  <td>#{st.id}</td>
                  <td><span style={{background:'#dbeafe', color:'#1e40af', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'bold'}}>{st.Class?.name}</span></td>
                  <td style={{fontWeight:'500'}}>{st.name}</td>
                  <td style={{color:'#64748b'}}>{st.commune || '-'}</td>
                  <td style={{textAlign:'right'}}>
                    <button onClick={() => handleDelete(st.id)} style={{background:'white', border:'1px solid red', color:'red', borderRadius:'4px', cursor:'pointer'}}>🗑️ Xóa</button>
                  </td>
                </tr>
              ))}
              {visibleStudents.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentManager;