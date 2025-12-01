import { useState, useEffect } from 'react';
import axios from 'axios';

function StudentManager() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // State Form
  const [name, setName] = useState('');
  const [commune, setCommune] = useState(''); // STATE MỚI CHO XÃ
  const [isNewClass, setIsNewClass] = useState(false);
  const [classId, setClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassFee, setNewClassFee] = useState(0);

  // Filter
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterCommune, setFilterCommune] = useState(''); // FILTER MỚI

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [resSt, resCl] = await Promise.all([
        axios.get('http://localhost:5000/students'),
        axios.get('http://localhost:5000/classes')
      ]);
      setStudents(resSt.data);
      setClasses(resCl.data);
      if(resCl.data.length > 0 && !classId) setClassId(resCl.data[0].id);
    } catch(err) { console.error(err); }
  };

  const handleAdd = async () => {
    if(!name) return alert("Chưa nhập tên học sinh!");
    
    // Gửi thêm commune lên server
    const payload = { name, commune };

    if (isNewClass) {
        if (!newClassName) return alert("Chưa nhập tên lớp mới!");
        payload.newClassName = newClassName;
        payload.newClassFee = newClassFee;
    } else {
        payload.classId = classId;
    }

    try {
        await axios.post('http://localhost:5000/students', payload);
        alert("Thêm thành công!");
        setName('');
        setCommune(''); // Reset ô nhập xã
        setNewClassName('');
        setNewClassFee(0);
        setIsNewClass(false);
        fetchData();
    } catch (err) {
        alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Xóa học sinh này?")) {
      await axios.delete(`http://localhost:5000/students/${id}`);
      fetchData();
    }
  };

  // Logic lọc: Thêm điều kiện lọc theo xã
  const visibleStudents = students.filter(st => {
    const matchClass = filterClassId === 'all' || st.ClassId == filterClassId;
    // Lấy tên xã của HS (nếu không có thì là chuỗi rỗng)
    const stCommune = st.commune ? st.commune.toLowerCase() : '';
    const matchCommune = stCommune.includes(filterCommune.toLowerCase());
    
    return matchClass && matchCommune; // Phải thỏa mãn cả 2
  });

  return (
    <div className="page-container">
      <div className="desktop-grid">
        
        {/* --- CỘT TRÁI --- */}
        <div className="left-panel">
          <h3 style={{marginTop:0}}>🛠️ Công cụ</h3>
          
          <div style={{background: '#e0e7ff', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#4338ca'}}>➕ Thêm học sinh</h4>
            
            <div className="form-group">
              <label>Tên Học Sinh:</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên..." />
            </div>

            {/* Ô NHẬP XÃ MỚI */}
            <div className="form-group">
              <label>Xã / Địa chỉ:</label>
              <input value={commune} onChange={e => setCommune(e.target.value)} placeholder="VD: Minh Tân..." />
            </div>

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
          
          <h4>🔍 Bộ lọc tìm kiếm</h4>
          <div className="form-group">
             <label>Lọc theo lớp:</label>
             <select value={filterClassId} onChange={e => setFilterClassId(e.target.value)}>
                <option value="all">-- Tất cả lớp --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          {/* LỌC THEO XÃ */}
          <div className="form-group">
             <label>Lọc theo xã:</label>
             <input value={filterCommune} onChange={e => setFilterCommune(e.target.value)} placeholder="Nhập tên xã..." />
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
                <th>Xã</th> {/* CỘT MỚI */}
                <th style={{textAlign:'right'}}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map(st => (
                <tr key={st.id}>
                  <td>#{st.id}</td>
                  <td><span style={{background:'#dbeafe', color:'#1e40af', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8rem', fontWeight:'bold'}}>{st.Class?.name}</span></td>
                  <td style={{fontWeight:'500'}}>{st.name}</td>
                  {/* HIỂN THỊ XÃ */}
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