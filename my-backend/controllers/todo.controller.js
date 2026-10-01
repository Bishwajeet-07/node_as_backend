const Todo = require('../models/todo.model.js');

const getAllTodos = async (req, res, next) => {
    try {
        const todos = await Todo.find({ user: req.user.userId }); // Filter todos by the authenticated user's ID
        res.status(200).json(todos);
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
};

const createTodo = async (req, res, next) => {

    if (!req.body.title || req.body.title.trim() === '') {
        return res.status(400).json({ message: 'Title is required' });
    }

    try {
        const todo = await Todo.create({ ...req.body, user: req.user.userId }); // Associate the todo with the authenticated user's ID
        res.status(201).json({ success: true, message: 'Todo created successfully', data: todo });
    } catch (error) {
        next(error); // Pass the error to the error-handling middleware
    }
};

const updateTodo = async (req, res, next) => {
    try {
        const todo = await Todo.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },  // Query Object
            {
                ...(req.body.title && { title: req.body.title.trim() }),
                ...(req.body.completed !== undefined && { completed: req.body.completed })
            },
            { new: true } // Updated data wapas do
        );
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json(todo);
    } catch (error) {
        next(error);
    } // Pass the error to the error-handling middleware
};

const deleteTodo = async (req, res, next) => {
    try {
        const todo = await Todo.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.status(200).json({ message: 'Todo deleted' });
    } catch (error) {
        next(error);
    }
};

exports.getAllTodos = getAllTodos;
exports.createTodo = createTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;