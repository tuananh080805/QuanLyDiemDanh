const { Attendance } = require('../model');

// Xử lý điểm danh
exports.markAttendance = async (req, res) => {
    const { studentId, date, isPresent } = req.body;
    try {
        let att = await Attendance.findOne({ where: { StudentId: studentId, date } });
        
        if (att) {
            att.isPresent = isPresent;
            await att.save();
        } else {
            await Attendance.create({ StudentId: studentId, date, isPresent });
        }
        res.json({ success: true, message: "Đã cập nhật điểm danh" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};