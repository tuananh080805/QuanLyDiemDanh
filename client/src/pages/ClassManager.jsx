import { useState, useEffect } from 'react';
import axios from 'axios';

function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [editingId, setEditingId] = useState(null); // ID lớp đang sửa
  const [editForm, setEditForm] = useState({ name: '', tuitionFee: 0 });

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    const res = await axios.get('https://quanlydiemdanh.onrender.com/classes');
    setClasses(res.data);
  };

  const startEdit = (cls) => {
    setEditingId(cls.id);
    setEditForm({ name: cls.name, tuitionFee: cls.tuitionFee });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`https://quanlydiemdanh.onrender.com/classes/${editingId}`, editForm);
      alert("Cập nhật thành công!");
      setEditingId(null);
      loadClasses();
    } catch (err) { alert("Lỗi cập nhật"); }
  };

  return (
    <div className="page-container">
      <h2>🏫 QUẢN LÝ LỚP HỌC & HỌC PHÍ</h2>
      <div className="card" style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Lớp</th>
              <th>Học Phí (VNĐ/Buổi)</th>
              <th style={{textAlign: 'right'}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.id}>
                <td>{cls.id}</td>
                <td>
                  {editingId === cls.id ? (
                    <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  ) : cls.name}
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
                <td style={{textAlign: 'right'}}>
                  {editingId === cls.id ? (
                    <>
                      <button onClick={saveEdit} style={{marginRight:'5px', background:'#4f46e5', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px'}}>Lưu</button>
                      <button onClick={() => setEditingId(null)} style={{background:'#9ca3af', color:'white', border:'none', padding:'5px 10px', borderRadius:'4px'}}>Hủy</button>
                    </>
                  ) : (
                    <button onClick={() => startEdit(cls)} style={{background:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db', padding:'5px 10px', borderRadius:'4px', cursor:'pointer'}}>
                      ✏️ Sửa
                    </button>
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