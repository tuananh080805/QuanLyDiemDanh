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
exports.deleteByClass = async (req, res) => {
    try {
        const { classId } = req.params;
        
        // Xóa tất cả học sinh thuộc ClassId này
        // Lưu ý: Do đã cài onCascade: true ở model, nên điểm danh cũng sẽ tự mất theo
        const count = await Student.destroy({ 
            where: { ClassId: classId } 
        });

        res.json({ message: `Đã xóa ${count} học sinh của lớp này` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.importStudents = async (req, res) => {
    try {
        const { names, classId, commune } = req.body;
        // names là mảng các tên: ["Nguyễn Văn A", "Trần Thị B", ...]

        if (!names || !Array.isArray(names) || names.length === 0) {
            return res.status(400).json({ error: "Danh sách tên trống!" });
        }

        // Tạo mảng dữ liệu để lưu vào DB
        const dataToInsert = names.map(name => ({
            name: name.trim(),
            ClassId: classId,
            commune: commune || '' // Nếu có nhập xã thì lưu chung cho cả đám này
        }));

        // Lệnh bulkCreate giúp lưu hàng loạt cực nhanh
        await Student.bulkCreate(dataToInsert);

        res.json({ message: `Đã nhập thành công ${dataToInsert.length} học sinh!` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, commune, classId } = req.body; 

        await Student.update(
            { 
                name: name, 
                commune: commune,
                ClassId: classId // Cập nhật ID lớp mới
            },
            { where: { id } }
        );

        res.json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};