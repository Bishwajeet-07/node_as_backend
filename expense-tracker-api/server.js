const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const seedDefaultCategories = require('./utils/seedCategories')

const helmet = require("helmet");
const morgan = require("morgan");
const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const expenseRoutes = require("./routes/expense.routes");
const groupRoutes = require("./routes/group.routes");
const groupExpenseRoutes = require("./routes/groupExpense.routes");
const friendRoutes = require("./routes/friend.routes");


const app = express();

// security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// cors middleware
app.use(cors({
    origin: ['http://localhost:1974', 'http://localhost:1975', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));

// body parser middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// logger middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// helth check route
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "API is healthy" });
});

// Routes section mein jodo:
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/group-expenses', groupExpenseRoutes)
app.use('/api/friends', friendRoutes)
//centralized error handler middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: "error",
        message: err.message || "Internal Server Error"
    });
});

// database connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to MongoDB");
        await seedDefaultCategories(); // Seed default categories after successful DB connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }).catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });