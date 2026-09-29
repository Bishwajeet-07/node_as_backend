const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todo.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

// Apply the authMiddleware to all routes in this router
router.use(authMiddleware);

router.get("/", todoController.getAllTodos);
router.post("/", todoController.createTodo);
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;