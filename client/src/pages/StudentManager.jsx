import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentManager() {
  const API_URL = 'https://quanlydiemdanh.onrender.com'; 

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // State Form Thêm Lẻ
  const [name, setName] = useState('');
  const [commune, setCommune] = useState(''); 
  const [classId, setClassId] = useState('');
  
  // State Form Lớp Mới
  const [isNewClass, setIsNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(0);

  // --- STATE MỚI CHO NHẬP NHANH ---
  const [isBulkMode, setIsBulkMode] = useState(false); // Chế độ nhập nhiều
  const [bulkText, setBulkText] = useState(''); // Nội dung dán vào

  // Filter
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterCommune, setFilterCommune] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resSt, resCl] = await Promise.all([
        axios.get(`${API_URL}/students`),
        axios.get(`${API_URL}/classes`)
      ]);
      setStudents(resSt.data);
      setClasses(resCl.data);
      if(resCl.data.length > 0 && !classId) setClassId(resCl.data[0].id);
    } catch(err) { console.error(err); }
  };

  // --- HÀM THÊM LẺ (Cũ) ---
  const handleAddOne = async () => {
    // ... (Giữ nguyên logic cũ của bạn)
    if(!name) return alert("Chưa nhập tên!");
    const payload = { name, commune };
    if (isNewClass) {
        payload.newClassName = newClassName;
        payload.newClassFee = newClassFee;
    } else { payload.classId = classId; }

    try {
        await axios.post(`${API_URL}/students`, payload);
        alert("Thêm thành công!");
        setName(''); setCommune(''); setIsNewClass(false); fetchData();
    } catch (err) { alert(err.message); }
  };

  // --- HÀM NHẬP NHIỀU (MỚI) ---
  const handleBulkImport = async () => {
    if (!bulkText.trim()) return alert("Vui lòng dán danh sách tên vào!");
    
    // Tách dòng thành mảng (cắt bỏ dòng trống)
    const namesArray = bulkText.split('\n').filter(line => line.trim() !== '');

    try {
        await axios.post(`${API_URL}/students/import`, {
            names: namesArray,
            classId: classId,  // Lớp đang chọn
            commune: commune   // Xã đang nhập (nếu có)
        });
        alert(`Đã nhập xong ${namesArray.length} học sinh!`);
        setBulkText('');
        setIsBulkMode(false); // Tắt chế độ nhập nhiều
        fetchData();
    } catch (err) {
        alert("Lỗi nhập: " + err.message);
    }
  };

  // ... (Các hàm xóa giữ nguyên) ...
  const handleDelete = async (id) => { if(confirm("Xóa?")) { await axios.delete(`${API_URL}/students/${id}`); fetchData(); } };
  const handleDeleteClass = async () => { /* ...code cũ... */ };

  const visibleStudents = students.filter(st => {
    /* ...logic lọc cũ... */
    return (filterClassId === 'all' || st.ClassId == filterClassId) &&
           (st.commune || '').toLowerCase().includes(filterCommune.toLowerCase());
  });

  return (
    <div className="page-container">
      <div className="desktop-grid">
        
        {/* --- CỘT TRÁI --- */}
        <div className="left-panel">
          <h3 style={{marginTop:0}}>🛠️ Công cụ</h3>
          
          <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            
            {/* CHUYỂN ĐỔI CHẾ ĐỘ NHẬP */}
            <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                <button 
                    onClick={() => setIsBulkMode(false)}
                    style={{flex:1, padding:'8px', border:'none', borderRadius:'4px', cursor:'pointer', background: !isBulkMode ? '#4338ca' : '#c7d2fe', color: !isBulkMode ? 'white' : '#333', fontWeight:'bold'}}
                >
                    Thêm Lẻ
                </button>
                <button 
                    onClick={() => setIsBulkMode(true)}
                    style={{flex:1, padding:'8px', border:'none', borderRadius:'4px', cursor:'pointer', background: isBulkMode ? '#4338ca' : '#c7d2fe', color: isBulkMode ? 'white' : '#333', fontWeight:'bold'}}
                >
                    📋 Copy/Paste
                </button>
            </div>

            {/* PHẦN CHỌN LỚP CHUNG CHO CẢ 2 CHẾ ĐỘ */}
            {!isNewClass && (
                <div className="form-group">
                  <label>Chọn Lớp cần thêm vào:</label>
                  <select value={classId} onChange={e => setClassId(e.target.value)} style={{fontWeight:'bold', border:'2px solid #6366f1'}}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
            )}

            {/* --- CHẾ ĐỘ 1: THÊM LẺ --- */}
            {!isBulkMode && (
                <>
                    <div className="form-group">
                        <label>Tên Học Sinh:</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên..." />
                    </div>
                    
                    {/* Checkbox tạo lớp mới chỉ hiện ở chế độ thêm lẻ */}
                    <div className="form-group" style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
                        <input type="checkbox" checked={isNewClass} onChange={e => setIsNewClass(e.target.checked)} style={{width:'auto'}} />
                        <label onClick={() => setIsNewClass(!isNewClass)}>Tạo lớp học mới?</label>
                    </div>

                    {isNewClass && (
                        <div style={{background:'white', padding:'10px', borderRadius:'6px', border:'1px dashed #6366f1', marginBottom:'10px'}}>
                            <input value={newClassName} onChange={e => setNewClassName(e.target.value)} placeholder="Tên Lớp Mới..." style={{marginBottom:'5px'}} />
                            <input type="number" value={newClassFee} onChange={e => setNewClassFee(e.target.value)} placeholder="Học phí..." />
                        </div>
                    )}
                </>
            )}

            {/* --- CHẾ ĐỘ 2: NHẬP NHANH (COPY PASTE) --- */}
            {isBulkMode && (
                <div className="form-group">
                    <label>Dán danh sách tên vào đây:</label>
                    <textarea 
                        rows="8"
                        placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Văn C\n..."}
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                        style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ccc', fontFamily:'inherit'}}
                    />
                    <small style={{color:'#666'}}>* Mỗi dòng là 1 tên học sinh</small>
                </div>
            )}

            {/* Ô NHẬP XÃ (Dùng chung) */}
            <div className="form-group">
              <label>Xã / Địa chỉ (Áp dụng hết):</label>
              <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="VD: Tân Hội..." />
            </div>

            <button 
                onClick={isBulkMode ? handleBulkImport : handleAddOne} 
                className="btn-primary"
            >
                {isBulkMode ? `Lưu Danh Sách (${bulkText.split('\n').filter(x=>x.trim()).length} em)` : 'Lưu Học Sinh'}
            </button>
          </div>

          <hr style={{margin: '20px 0', borderTop:'1px solid #ddd'}}/>
          
          {/* ... (Phần bộ lọc bên dưới giữ nguyên) ... */}
          <h4>🔍 Bộ lọc tìm kiếm</h4>
           <div className="form-group">
             <select value={filterClassId} onChange={e => setFilterClassId(e.target.value)}>
                <option value="all">-- Tất cả lớp --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div className="form-group">
             <input value={filterCommune} onChange={e => setFilterCommune(e.target.value)} placeholder="Lọc theo xã..." />
          </div>
        </div>

        {/* --- CỘT PHẢI --- */}
        <div className="right-panel">
          <h3>📋 Danh sách học sinh ({visibleStudents.length})</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Lớp</th>
                <th>Tên</th>
                <th>Xã</th>
                <th style={{textAlign:'right'}}>Xóa</th>
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
                    <button onClick={() => handleDelete(st.id)} style={{background:'white', border:'1px solid red', color:'red', borderRadius:'4px', cursor:'pointer'}}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StudentManager;