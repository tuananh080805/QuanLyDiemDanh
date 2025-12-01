import { useState, useEffect } from 'react';
import axios from 'axios';

function ClassManager() {
  // --- CẤU HÌNH API ---
  const API_URL = 'https://quanlydiemdanh.onrender.com'; 
  // --------------------

  const [classes, setClasses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', tuitionFee: 0 });

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  // --- CHẾ ĐỘ SỬA ---
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

  // --- CHẾ ĐỘ XÓA ---
  const handleDelete = async (id, name) => {
    const confirmMsg = prompt(`⚠️ CẢNH BÁO NGUY HIỂM:\n\nBạn đang yêu cầu XÓA LỚP "${name}".\nToàn bộ học sinh và lịch sử điểm danh của lớp này sẽ BỊ XÓA vĩnh viễn!\n\nĐể xác nhận, hãy gõ chữ "XOA" vào ô bên dưới:`);
    
    if (confirmMsg === "XOA") {
      try {
        await axios.delete(`${API_URL}/classes/${id}`);
        alert("Đã xóa lớp thành công!");
        loadClasses();
      } catch (err) { alert("Lỗi xóa: " + err.message); }
    }
  };

  return (
    <div className="page-container">
      <h2>🏫 QUẢN LÝ LỚP HỌC & GIÁ TIỀN</h2>
      
      <div className="card" style={{background: 'white', padding: '20px', borderRadius: '8px', overflowX: 'auto'}}>
        <table>
          <thead>
            <tr>
              <th>Tên Lớp</th>
              <th>Học Phí (VNĐ/Buổi)</th>
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
                      <button onClick={saveEdit} style={{marginRight:'5px', background:'#4f46e5', color:'white', border:'none', padding:'6px 10px', borderRadius:'4px'}}>Lưu</button>
                      <button onClick={() => setEditingId(null)} style={{background:'#9ca3af', color:'white', border:'none', padding:'6px 10px', borderRadius:'4px'}}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(cls)} style={{background:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db', padding:'6px 10px', borderRadius:'4px', cursor:'pointer', marginRight: '8px'}}>
                        ✏️ Sửa
                      </button>
                      <button onClick={() => handleDelete(cls.id, cls.name)} style={{background:'white', border:'1px solid #ef4444', color:'#ef4444', padding:'6px 10px', borderRadius:'4px', cursor:'pointer'}}>
                        🗑️ Xóa
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassManager;