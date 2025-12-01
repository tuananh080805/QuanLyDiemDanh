import { useState, useEffect } from 'react';
import axios from 'axios';

function ClassManager() {
  const API_URL = 'https://quanlydiemdanh.onrender.com'; 

  const [classes, setClasses] = useState([]);
  
  // State Form Tạo Mới
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(0);

  // State Form Sửa
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', tuitionFee: 0 });

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  // --- HÀM TẠO LỚP MỚI ---
  const handleAddClass = async () => {
    if (!newClassName) return alert("Vui lòng nhập tên lớp!");

    try {
        await axios.post(`${API_URL}/classes`, {
            name: newClassName,
            tuitionFee: newClassFee
        });
        alert("Tạo lớp thành công!");
        setNewClassName('');
        setNewClassFee(0);
        loadClasses();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
  };

  // --- HÀM SỬA ---
  const startEdit = (cls) => {
    setEditingId(cls.id);
    setEditForm({ name: cls.name, tuitionFee: cls.tuitionFee });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_URL}/classes/${editingId}`, editForm);
      alert("Cập nhật thành công!");
      setEditingId(null);
      loadClasses();
    } catch (err) { alert("Lỗi cập nhật"); }
  };

  // --- HÀM XÓA ---
  const handleDelete = async (id, name) => {
    const confirmMsg = prompt(`⚠️ CẢNH BÁO: XÓA LỚP "${name}"?\nTất cả học sinh trong lớp này sẽ bị xóa theo!\nGõ chữ "XOA" để xác nhận:`);
    if (confirmMsg === "XOA") {
      try {
        await axios.delete(`${API_URL}/classes/${id}`);
        loadClasses();
      } catch (err) { alert("Lỗi xóa: " + err.message); }
    }
  };

  return (
    <div className="page-container">
      <div className="desktop-grid">
        
        {/* --- CỘT TRÁI: FORM TẠO LỚP --- */}
        <div className="left-panel">
          <h3 style={{marginTop:0}}>🛠️ Công cụ</h3>
          <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '8px'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#4338ca'}}>➕ Tạo Lớp Học Mới</h4>
            
            <div className="form-group">
                <label>Tên Lớp:</label>
                <input 
                    value={newClassName} 
                    onChange={e => setNewClassName(e.target.value)} 
                    placeholder="VD: Lớp Tiếng Anh 1..." 
                />
            </div>

            <div className="form-group">
                <label>Học phí (VNĐ/Buổi):</label>
                <input 
                    type="number" 
                    value={newClassFee} 
                    onChange={e => setNewClassFee(e.target.value)} 
                    placeholder="Nhập số tiền..." 
                />
            </div>

            <button onClick={handleAddClass} className="btn-primary">Lưu Lớp Mới</button>
          </div>
        </div>

        {/* --- CỘT PHẢI: DANH SÁCH LỚP --- */}
        <div className="right-panel">
          <h3>📋 Danh sách các lớp ({classes.length})</h3>
          <table>
            <thead>
              <tr>
                <th>Tên Lớp</th>
                <th>Học Phí</th>
                <th style={{textAlign: 'right'}}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(cls => (
                <tr key={cls.id}>
                  <td>
                    {editingId === cls.id ? (
                      <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    ) : <span style={{fontWeight:'bold', color: '#4f46e5'}}>{cls.name}</span>}
                  </td>
                  <td>
                    {editingId === cls.id ? (
                      <input type="number" value={editForm.tuitionFee} onChange={e => setEditForm({...editForm, tuitionFee: e.target.value})} />
                    ) : (
                      <span style={{fontWeight:'bold', color: '#059669'}}>
                        {cls.tuitionFee.toLocaleString()} đ
                      </span>
                    )}
                  </td>
                  <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                    {editingId === cls.id ? (
                      <>
                        <button onClick={saveEdit} style={{marginRight:'5px', background:'#059669', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>💾</button>
                        <button onClick={() => setEditingId(null)} style={{background:'#9ca3af', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>❌</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(cls)} style={{background:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db', padding:'5px 10px', borderRadius:'4px', cursor:'pointer', marginRight: '5px'}}>✏️</button>
                        <button onClick={() => handleDelete(cls.id, cls.name)} style={{background:'white', border:'1px solid red', color:'red', borderRadius:'4px', cursor:'pointer'}}>🗑️</button>
                      </>
                    )}
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

export default ClassManager;