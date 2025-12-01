import { useState, useEffect } from 'react';
import axios from 'axios';

function TuitionPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Thêm state cho Lớp học
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('all');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load danh sách lớp khi vào trang
  useEffect(() => {
    axios.get('http://localhost:5000/classes').then(res => setClasses(res.data));
  }, []);

  const handlePreview = async () => {
    if (!startDate || !endDate) return alert("Vui lòng chọn ngày!");
    setLoading(true);
    try {
      // Gửi kèm classId lên server
      const res = await axios.get(`http://localhost:5000/tuition-preview`, {
        params: { startDate, endDate, classId: selectedClassId }
      });
      setData(res.data);
    } catch (err) { alert("Lỗi tải dữ liệu"); }
    setLoading(false);
  };

  const handleExport = () => {
    // Mở tab mới để tải file, kèm tham số classId
    const url = `http://localhost:5000/export-tuition?startDate=${startDate}&endDate=${endDate}&classId=${selectedClassId}`;
    window.open(url, '_blank');
  };

  const grandTotal = data.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="page-container">
      <h2>💰 TÍNH HỌC PHÍ</h2>
      
      {/* THANH CÔNG CỤ */}
      <div className="card" style={{background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap'}}>
        
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Từ ngày:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        
        <div>
          <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Đến ngày:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        {/* Ô CHỌN LỚP MỚI */}
        <div style={{minWidth: '200px'}}>
            <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Chọn Lớp:</label>
            <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}>
                <option value="all">-- Tất cả các lớp --</option>
                {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
        </div>

        <button onClick={handlePreview} className="btn-primary" style={{width: 'auto', marginBottom:0}}>
          {loading ? 'Đang tính...' : '🔍 Xem Trước'}
        </button>
        
        <button onClick={handleExport} style={{background: '#059669', color:'white', border:'none', padding:'12px 20px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', marginLeft:'auto'}}>
          📥 Xuất Excel
        </button>
      </div>

      {/* BẢNG KẾT QUẢ */}
      <div className="card" style={{background: 'white', padding: '20px', borderRadius: '8px'}}>
        {data.length > 0 ? (
          <>
            <table>
              <thead>
                <tr style={{background:'#f1f5f9'}}>
                  <th>Lớp</th>
                  <th>Học Sinh</th>
                  <th style={{textAlign:'center'}}>Số buổi</th>
                  <th style={{textAlign:'right'}}>Đơn giá</th>
                  <th style={{textAlign:'right'}}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id}>
                    <td style={{color: '#64748b'}}>{item.className}</td>
                    <td style={{fontWeight:'500'}}>{item.name}</td>
                    <td style={{textAlign:'center', fontWeight:'bold'}}>{item.sessions}</td>
                    <td style={{textAlign:'right'}}>{item.price.toLocaleString()}</td>
                    <td style={{textAlign:'right', color:'#d97706', fontWeight:'bold'}}>
                      {item.total.toLocaleString()} đ
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{background:'#fff7ed'}}>
                  <td colSpan="4" style={{textAlign:'right', padding:'15px', fontWeight:'bold', fontSize:'1.1rem'}}>TỔNG CỘNG:</td>
                  <td style={{textAlign:'right', padding:'15px', fontWeight:'bold', fontSize:'1.2rem', color:'#ea580c'}}>
                    {grandTotal.toLocaleString()} đ
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <div style={{textAlign:'center', padding:'40px', color:'#6b7280'}}>
            {loading ? 'Đang tải dữ liệu...' : 'Vui lòng chọn ngày và bấm "Xem Trước"'}
          </div>
        )}
      </div>
    </div>
  );
}

export default TuitionPage;