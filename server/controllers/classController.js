const { Student,Class } = require('../model');

// Lấy danh sách lớp
exports.getAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll({ order: [['name', 'ASC']] });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cập nhật giá tiền lớp học
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, tuitionFee } = req.body;
        
        await Class.update(
            { name, tuitionFee },
            { where: { id } }
        );
        res.json({ message: "Cập nhật thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 1. Xóa tất cả học sinh thuộc lớp này trước
        await Student.destroy({ where: { ClassId: id } });
        
        // 2. Sau đó mới xóa lớp
        await Class.destroy({ where: { id } });

        res.json({ message: "Đã xóa lớp và toàn bộ học sinh!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};