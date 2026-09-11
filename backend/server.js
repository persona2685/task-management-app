const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Task = require("./models/Task");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
// JWT authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token."
        });
    }
}

app.use(express.json());
app.use(cors());
app.use(express.static(".../frontend"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

// Home route
app.get("/", (req, res) => {
    res.send("Task Management Backend is Running!");
});

// GET all tasks
app.get("/api/tasks", authenticateToken, async (req, res) => {
    try {
        const tasks = await Task.find({
    userId: req.userId
}).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE a task
app.post("/api/tasks",authenticateToken, async (req, res) => {
    try {
       const task = new Task({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    dueDate: req.body.dueDate,
    userId: req.userId
});

        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE a task
app.put("/api/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.userId
            },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(updatedTask);

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});

// DELETE a task
app.delete("/api/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!deletedTask) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
});
// REGISTER
app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
// LOGIN
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

       res.json({
    message: "Login successful",
    token,
    user: {
        name: user.name,
        email: user.email
    }
});

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});