import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentManager() {
  // --- CẤU HÌNH API ---
  const API_URL = 'https://quanlydiemdanh.onrender.com'; 

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // State Form Thêm Lẻ (ĐÃ BỎ NOTE)
  const [name, setName] = useState('');
  const [commune, setCommune] = useState(''); 
  
  const [isNewClass, setIsNewClass] = useState(false);
  const [classId, setClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(0);

  // State Nhập Nhiều
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Bộ lọc
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

  // --- THÊM LẺ (ĐÃ BỎ GỬI NOTE) ---
  const handleAddOne = async () => {
    if(!name) return alert("Chưa nhập tên!");
    
    const payload = { name, commune }; // Chỉ gửi Tên và Xã
    
    if (isNewClass) {
        payload.newClassName = newClassName;
        payload.newClassFee = newClassFee;
    } else { payload.classId = classId; }

    try {
        await axios.post(`${API_URL}/students`, payload);
        alert("Thêm thành công!");
        setName(''); setCommune(''); 
        setIsNewClass(false); fetchData();
    } catch (err) { alert(err.message); }
  };

  // --- NHẬP NHIỀU (ĐÃ BỎ GỬI NOTE) ---
  const handleBulkImport = async () => {
    if (!bulkText.trim()) return alert("Vui lòng dán danh sách tên!");
    const namesArray = bulkText.split('\n').filter(line => line.trim() !== '');

    try {
        await axios.post(`${API_URL}/students/import`, {
            names: namesArray,
            classId: classId,
            commune: commune
            // Không gửi note nữa
        });
        alert(`Đã nhập xong ${namesArray.length} học sinh!`);
        setBulkText(''); 
        setIsBulkMode(false); fetchData();
    } catch (err) { alert("Lỗi: " + err.message); }
  };

  const handleDelete = async (id) => { if(confirm("Xóa?")) { await axios.delete(`${API_URL}/students/${id}`); fetchData(); } };
  
  const handleDeleteClass = async () => {
    if (filterClassId === 'all') return;
    const className = classes.find(c => c.id == filterClassId)?.name;
    const confirmMsg = prompt(`⚠️ CẢNH BÁO: XÓA LỚP ${className}?\nGõ chữ "XOA" để xác nhận:`);
    if (confirmMsg === "XOA") {
        try {
            await axios.delete(`${API_URL}/classes/${filterClassId}`);
            alert(`Đã xóa lớp ${className}!`);
            fetchData();
        } catch (err) { alert("Lỗi: " + err.message); }
    }
  };

  const visibleStudents = students.filter(st => {
    return (filterClassId === 'all' || st.ClassId == filterClassId) &&
           (st.commune || '').toLowerCase().includes(filterCommune.toLowerCase());
  });

  return (
    <div className="page-container">
      <div className="desktop-grid">
        <div className="left-panel">
          <h3 style={{marginTop:0}}>🛠️ Công cụ</h3>
          <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            
            <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                <button onClick={() => setIsBulkMode(false)} style={{flex:1, padding:'8px', border:'none', borderRadius:'4px', cursor:'pointer', background: !isBulkMode ? '#4338ca' : '#c7d2fe', color: !isBulkMode ? 'white' : '#333', fontWeight:'bold'}}>Thêm Lẻ</button>
                <button onClick={() => setIsBulkMode(true)} style={{flex:1, padding:'8px', border:'none', borderRadius:'4px', cursor:'pointer', background: isBulkMode ? '#4338ca' : '#c7d2fe', color: isBulkMode ? 'white' : '#333', fontWeight:'bold'}}>📋 Copy/Paste</button>
            </div>

            {!isNewClass && (
                <div className="form-group">
                  <label>Chọn Lớp:</label>
                  <select value={classId} onChange={e => setClassId(e.target.value)} style={{fontWeight:'bold', border:'2px solid #6366f1'}}>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
            )}

            {!isBulkMode && (
                <>
                    <div className="form-group">
                        <label>Tên Học Sinh:</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên..." />
                    </div>
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

            {isBulkMode && (
                <div className="form-group">
                    <label>Dán danh sách tên:</label>
                    <textarea rows="5" value={bulkText} onChange={e => setBulkText(e.target.value)} style={{width:'100%', padding:'10px'}} placeholder="Dán tên vào đây..." />
                </div>
            )}

            <div className="form-group">
              <label>Xã / Địa chỉ:</label>
              <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="VD: Thăng Long..." />
            </div>

            {/* ĐÃ BỎ Ô NHẬP GHI CHÚ */}

            <button onClick={isBulkMode ? handleBulkImport : handleAddOne} className="btn-primary">
                {isBulkMode ? `Lưu Danh Sách` : 'Lưu Học Sinh'}
            </button>
          </div>
          
           <hr style={{margin: '20px 0', borderTop:'1px solid #ddd'}}/>
           <h4>🔍 Bộ lọc</h4>
           <div className="form-group"><select value={filterClassId} onChange={e => setFilterClassId(e.target.value)}><option value="all">-- Tất cả lớp --</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
           
           {filterClassId !== 'all' && (
            <div style={{marginBottom: '15px', padding: '10px', background: '#fee2e2', borderRadius: '6px', border: '1px solid #fca5a5'}}>
                <button onClick={handleDeleteClass} style={{width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>🗑️ Xóa hết HS lớp này</button>
            </div>
           )}

           <div className="form-group"><input value={filterCommune} onChange={e => setFilterCommune(e.target.value)} placeholder="Lọc xã..." /></div>
        </div>

        <div className="right-panel">
          <h3>📋 Danh sách học sinh ({visibleStudents.length})</h3>
          <table>
            <thead>
              <tr>
                {/* ĐÃ BỎ CỘT ID VÀ CỘT GHI CHÚ */}
                <th>Lớp</th>
                <th>Tên</th>
                <th>Xã</th>
                <th style={{textAlign:'right'}}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(st => (
                <tr key={st.id}>
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