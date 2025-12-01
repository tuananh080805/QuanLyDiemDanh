const express = require('express');
const router = express.Router();

// Import Controllers
const studentController = require('../controllers/studentController');
const attendanceController = require('../controllers/attendanceController');
const reportController = require('../controllers/reportController');
const classController = require('../controllers/classController'); // Đừng quên dòng này

// --- Định nghĩa Routes ---

// Routes Học sinh & Lớp
router.get('/students', studentController.getAllStudents);
router.post('/students', studentController.createStudent);
router.delete('/students/:id', studentController.deleteStudent);

router.get('/classes', classController.getAllClasses);     // Route lấy lớp
router.put('/classes/:id', classController.updateClass);   // Route sửa lớp
router.get('/init-data', studentController.initData || ((req, res) => res.send('OK'))); 

// Routes Điểm danh
router.post('/attendance', attendanceController.markAttendance);

// Routes Báo cáo & Tính tiền
router.get('/tuition-preview', reportController.getTuitionPreview);
router.get('/export-tuition', reportController.exportTuition);

router.delete('/students/:id', studentController.deleteStudent); // Xóa 1 em
router.delete('/students/class/:classId', studentController.deleteByClass);
router.delete('/classes/:id', classController.deleteClass);
module.exports = router;