const express = require('express');
const cors = require('cors');
const { sequelize } = require('./model'); // Import từ models/index.js
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/', apiRoutes);

const PORT = 5000;

// force: false => Giữ dữ liệu cũ
// force: true => Xóa hết bảng cũ tạo lại (Dùng khi mới code xong cấu trúc mới)
sequelize.sync({ force: false }).then(() => {
    console.log("Database & Tables synced!");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error("Failed to sync db: " + err.message);
});