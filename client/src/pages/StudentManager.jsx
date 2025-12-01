import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentManager() {
  const API_URL = 'https://quanlydiemdanh.onrender.com'; 

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // State Form Thêm
  const [name, setName] = useState('');
  const [commune, setCommune] = useState(''); 
  const [isNewClass, setIsNewClass] = useState(false);
  const [classId, setClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(0);

  // State Nhập Nhiều
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // --- BỘ LỌC (Sẽ để ở bên phải) ---
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterCommune, setFilterCommune] = useState('');
  const [filterName, setFilterName] = useState(''); // MỚI: Lọc theo tên

  // State Sửa
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', commune: '', classId: '' });

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

  const handleAddOne = async () => {
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

  const handleBulkImport = async () => {
    if (!bulkText.trim()) return alert("Vui lòng dán danh sách tên!");
    const namesArray = bulkText.split('\n').filter(line => line.trim() !== '');
    try {
        await axios.post(`${API_URL}/students/import`, {
            names: namesArray, classId: classId, commune: commune
        });
        alert(`Đã nhập xong ${namesArray.length} học sinh!`);
        setBulkText(''); setIsBulkMode(false); fetchData();
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
            setFilterClassId('all'); // Reset bộ lọc về tất cả
            fetchData();
        } catch (err) { alert("Lỗi: " + err.message); }
    }
  };

  // --- LOGIC SỬA ---
  const startEdit = (st) => {
    setEditingId(st.id);
    setEditForm({ name: st.name, commune: st.commune || '', classId: st.ClassId });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({ name: '', commune: '', classId: '' }); };
  const saveEdit = async () => {
    try {
        await axios.put(`${API_URL}/students/${editingId}`, editForm);
        alert("Cập nhật thành công!");
        setEditingId(null);
        fetchData();
    } catch (err) { alert("Lỗi cập nhật: " + err.message); }
  };

  // --- LOGIC LỌC & SẮP XẾP TÊN ---
  const visibleStudents = students
    .filter(st => {
        const matchClass = filterClassId === 'all' || st.ClassId == filterClassId;
        const matchCommune = (st.commune || '').toLowerCase().includes(filterCommune.toLowerCase());
        const matchName = st.name.toLowerCase().includes(filterName.toLowerCase()); // Lọc tên
        return matchClass && matchCommune && matchName;
    })
    .sort((a, b) => {
        const nameA = a.name.trim().split(' ').pop();
        const nameB = b.name.trim().split(' ').pop();
        const compare = nameA.localeCompare(nameB);
        return compare !== 0 ? compare : a.name.localeCompare(b.name);
    });

  return (
    <div className="page-container">
      <div className="desktop-grid">
        
        {/* --- CỘT TRÁI: CHỈ CÒN CÔNG CỤ NHẬP LIỆU --- */}
        <div className="left-panel">
          <h3 style={{marginTop:0}}>🛠️ Nhập Liệu</h3>
          <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                <button onClick={() => setIsBulkMode(false)} style={{flex:1, padding:'8px', border:'none', borderRadius:'4px', cursor:'pointer', background: !isBulkMode ? '#4338ca' : '#c7d2fe', color: !isBulkMode ? 'white' : '#333', fontWeight:'bold'}}>Thêm Lẻ</button>
                <button onClick={() => setIsBulkMode(true)} style={{flex:1, padding:'8px', border:'none', borderRadius:'4px', cursor:'pointer', background: isBulkMode ? '#4338ca' : '#c7d2fe', color: isBulkMode ? 'white' : '#333', fontWeight:'bold'}}>📋 Copy/Paste</button>
            </div>

            {!isNewClass && (
                <div className="form-group">
                  <label>Thêm vào Lớp:</label>
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
              <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="VD: Tân Hội..." />
            </div>

            <button onClick={isBulkMode ? handleBulkImport : handleAddOne} className="btn-primary">
                {isBulkMode ? `Lưu Danh Sách` : 'Lưu Học Sinh'}
            </button>
          </div>
        </div>

        {/* --- CỘT PHẢI: BỘ LỌC + DANH SÁCH --- */}
        <div className="right-panel">
          
          {/* 1. THANH BỘ LỌC (MỚI) */}
          <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e2e8f0'}}>
            <h4 style={{marginTop:0, marginBottom: '10px', color: '#64748b'}}>🔍 Bộ lọc & Tìm kiếm</h4>
            
            <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end'}}>
                
                {/* Lọc Lớp */}
                <div style={{flex: 1, minWidth: '150px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'500'}}>Lớp:</label>
                    <select 
                        value={filterClassId} 
                        onChange={e => setFilterClassId(e.target.value)}
                        style={{width: '100%', border: '1px solid #94a3b8'}}
                    >
                        <option value="all">-- Tất cả lớp --</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {/* Tìm Tên (MỚI) */}
                <div style={{flex: 1, minWidth: '150px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'500'}}>Tên học sinh:</label>
                    <input 
                        value={filterName} 
                        onChange={e => setFilterName(e.target.value)} 
                        placeholder="Nhập tên để tìm..." 
                        style={{width: '100%'}}
                    />
                </div>

                {/* Lọc Xã */}
                <div style={{flex: 1, minWidth: '150px'}}>
                    <label style={{display:'block', marginBottom:'5px', fontWeight:'500'}}>Xã / Địa chỉ:</label>
                    <input 
                        value={filterCommune} 
                        onChange={e => setFilterCommune(e.target.value)} 
                        placeholder="Lọc theo xã..." 
                        style={{width: '100%'}}
                    />
                </div>

                {/* Nút Xóa Lớp (Chỉ hiện khi chọn lớp) */}
                {filterClassId !== 'all' && (
                    <button 
                        onClick={handleDeleteClass}
                        style={{background: '#ef4444', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', height: '42px'}}
                    >
                        🗑️ Xóa lớp này
                    </button>
                )}
            </div>
            
            <div style={{marginTop: '10px', fontSize: '0.9rem', color: '#64748b'}}>
                Hiển thị: <strong>{visibleStudents.length}</strong> học sinh
            </div>
          </div>

          {/* 2. BẢNG DANH SÁCH */}
          <h3>📋 Danh sách học sinh</h3>
          <table>
            <thead>
              <tr>
                <th>Lớp</th>
                <th>Tên</th>
                <th>Xã</th>
                <th style={{textAlign:'right'}}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(st => (
                <tr key={st.id}>
                  {editingId === st.id ? (
                    <>
                        <td>
                            <select value={editForm.classId} onChange={e => setEditForm({...editForm, classId: e.target.value})} style={{padding: '5px', fontSize: '0.9rem'}}>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </td>
                        <td><input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{padding: '5px'}}/></td>
                        <td><input value={editForm.commune} onChange={e => setEditForm({...editForm, commune: e.target.value})} style={{padding: '5px'}} /></td>
                        <td style={{textAlign:'right', whiteSpace: 'nowrap'}}>
                            <button onClick={saveEdit} style={{marginRight:'5px', background:'#059669', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>💾 Lưu</button>
                            <button onClick={cancelEdit} style={{background:'#9ca3af', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>❌ Hủy</button>
                        </td>
                    </>
                  ) : (
                    <>
                        <td><span style={{background:'#dbeafe', color:'#1e40af', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'bold'}}>{st.Class?.name}</span></td>
                        <td style={{fontWeight:'500'}}>{st.name}</td>
                        <td style={{color:'#64748b'}}>{st.commune || '-'}</td>
                        <td style={{textAlign:'right', whiteSpace: 'nowrap'}}>
                            <button onClick={() => startEdit(st)} style={{background:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', marginRight: '5px'}}>✏️ Sửa</button>
                            <button onClick={() => handleDelete(st.id)} style={{background:'white', border:'1px solid red', color:'red', borderRadius:'4px', cursor:'pointer'}}>🗑️</button>
                        </td>
                    </>
                  )}
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