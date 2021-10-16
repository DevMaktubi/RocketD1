const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

// MIDDLEWARES

function checksExistsUserAccount(req, res, next) {
  const {username} = req.headers

  if(!username) {
    return res.status(400).json({error: "No username especified in headers"})
  }
  const user = users.find((u) => u.username === username)

  if(!user) {
    return res.status(400).json({error: "No user found with that username."})
  }
  req.user = user
  return next()
}

function checksExistsTodo(req,res,next) {
  const {user} = req
  const {id} = req.params
  if(!id) {
    return res.status(400).json({error: "Please especify a todo id."})
  }
  const todo = user.todos.find((t)=>t.id === id)
  if(!todo) {
    return res.status(404).json({error: "No todo found with that id for that username."})
  }
  req.todo = todo
  return next()
}
// GET

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req
  return res.status(200).json(user.todos)
});

// POST

app.post('/users', (req, res) => {
  // Complete aqui
  const {name, username} = req.body
  const user = req
  if(!name || !username) {
    return res.status(400).json({error: "Fill both user and username fields."})
  }
  const checkUsernameExists = users.some((u) => u.username === username)
  if(checkUsernameExists) {
    return res.status(400).json({error: "Username already taken"})
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)
  return res.status(201).json(newUser)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {user} = req
  const {title, deadline} = req.body

  if(!title || !deadline) {
    return res.status(400).json({eror: "Please fill all todo fields."})
  }

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)
  return res.status(201).json(newTodo)
});

// PUT
app.put('/todos/:id', checksExistsUserAccount,checksExistsTodo, (req, res) => {
  // Complete aqui
  const {todo} = req
  const {title,deadline} = req.body

  if(!title || !deadline) {
    return res.status(400).json({error: "Please fill all fields to update user todo's."})
  }

  if(todo.title !== title) {
    todo.title = title
  }
  if(todo.deadline !== deadline) {
    todo.deadline = deadline
  }

  return res.status(201).json(todo)
  
});

// PATCH
app.patch('/todos/:id/done', checksExistsUserAccount,checksExistsTodo, (req, res) => {
  const {todo} = req

  if(todo.done === true) {
    return res.status(200).json(todo)
  }

  todo.done = true
  return res.status(200).json(todo)

});

// DELETE
app.delete('/todos/:id', checksExistsUserAccount,checksExistsTodo, (req, res) => {
  const {user,todo} = req
  user.todos.splice(todo, 1)

  return res.status(204).send()
});

module.exports = app;