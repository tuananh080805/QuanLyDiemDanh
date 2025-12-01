// SỬA LẠI ĐÚNG ĐƯỜNG DẪN LÀ '../model' (số ít)
const { Student, Class, Attendance } = require('../model');

// 1. Lấy danh sách HS (Hỗ trợ lọc theo ngày)
exports.getAllStudents = async (req, res) => {
    try {
        const { date } = req.query; 

        const includeOptions = [
            { model: Class }
        ];

        if (date) {
            includeOptions.push({
                model: Attendance,
                required: false, 
                where: { date: date }
            });
        }

        const students = await Student.findAll({
            include: includeOptions,
            order: [['ClassId', 'ASC'], ['name', 'ASC']]
        });
        res.json(students);
    } catch (error) {
        console.error(error); // Log lỗi ra terminal để dễ debug
        res.status(500).json({ error: error.message });
    }
};

// 2. Tạo học sinh (Hỗ trợ tạo lớp mới)
exports.createStudent = async (req, res) => {
    try {
        // Nhận thêm 'commune' từ req.body
        let { name, classId, commune, newClassName, newClassFee } = req.body;

        if (newClassName) {
            const newClass = await Class.create({
                name: newClassName,
                tuitionFee: newClassFee || 0
            });
            classId = newClass.id;
        }

        const newStudent = await Student.create({ 
            name, 
            commune, // LƯU XÃ VÀO DB
            ClassId: classId 
        });
        
        res.json(newStudent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Xóa học sinh
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await Student.destroy({ where: { id } });
        res.json({ message: "Xóa thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Lấy danh sách lớp
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll();
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};