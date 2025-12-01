// server/controllers/reportController.js
const { Student, Class, Attendance } = require('../model'); // Đảm bảo đúng đường dẫn '../model'
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');

// Hàm tính toán chung (Đã nâng cấp để lọc theo ClassId)
const calculateTuitionData = async (startDate, endDate, classId) => {
    // Tạo điều kiện lọc
    const whereCondition = {};
    
    // Nếu có chọn lớp cụ thể (khác 'all') thì thêm điều kiện lọc
    if (classId && classId !== 'all') {
        whereCondition.ClassId = classId;
    }

    const students = await Student.findAll({
        where: whereCondition, // Áp dụng lọc lớp ở đây
        include: [
            { model: Class },
            { 
                model: Attendance, 
                required: false, 
                where: { 
                    isPresent: true,
                    date: { [Op.between]: [startDate, endDate] }
                } 
            }
        ],
        order: [['ClassId', 'ASC'], ['name', 'ASC']]
    });

    // Map dữ liệu trả về
    return students.map(st => {
        const price = st.Class ? st.Class.tuitionFee : 0;
        const sessions = st.Attendances.length;
        return {
            id: st.id,
            name: st.name,
            className: st.Class ? st.Class.name : 'N/A',
            price: price,
            sessions: sessions,
            total: sessions * price
        };
    });
};

// API Xem trước (Thêm classId vào tham số)
exports.getTuitionPreview = async (req, res) => {
    try {
        const { startDate, endDate, classId } = req.query;
        if (!startDate || !endDate) return res.status(400).send("Thiếu ngày");
        
        const data = await calculateTuitionData(startDate, endDate, classId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// API Xuất Excel (Thêm classId vào tham số)
exports.exportTuition = async (req, res) => {
    try {
        const { startDate, endDate, classId } = req.query;
        const data = await calculateTuitionData(startDate, endDate, classId);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Hoc Phi');

        worksheet.columns = [
            { header: 'Lớp', key: 'className', width: 15 },
            { header: 'Học Sinh', key: 'name', width: 25 },
            { header: 'Số Buổi', key: 'sessions', width: 10 },
            { header: 'Đơn Giá', key: 'price', width: 15 },
            { header: 'Thành Tiền', key: 'total', width: 20 },
        ];

        let grandTotal = 0;
        data.forEach(item => {
            grandTotal += item.total;
            worksheet.addRow(item);
        });

        // Dòng tổng cộng
        worksheet.addRow({});
        const totalRow = worksheet.addRow({ className: 'TỔNG CỘNG', total: grandTotal });
        totalRow.font = { bold: true, color: { argb: 'FFFF0000' } };

        // Thêm tiêu đề báo cáo
        let title = `BẢNG HỌC PHÍ TỪ ${startDate} ĐẾN ${endDate}`;
        worksheet.insertRow(1, [title]);
        worksheet.mergeCells('A1:E1');
        worksheet.getRow(1).font = { bold: true, size: 14 };
        worksheet.getRow(1).alignment = { horizontal: 'center' };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=BangHocPhi.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).send("Lỗi xuất file");
    }
};