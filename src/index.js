const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExist = users.find(u => u.username === username);

  if (!userExist) return response.status(404).json({error: "This user not exist."})

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (!name || !username) return response.status(400).json({message: "Invalid arguments!"});

  const userExist = users.find(u => u.username === username);

  if (userExist) return response.status(400).json({error: "This user already exist."})

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const  { title, deadline } = request.body;

  if (!title || !deadline) return response.status(404).json({error: "Invalid arguments!"});

  const userIndex = users.findIndex(u => u.username === username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  users[userIndex].todos.push(newTodo)

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const  { title, deadline } = request.body;

  const userIndex = users.findIndex(u => u.username === username);

  const todo = users[userIndex].todos.filter(td => td.id === id)

  if (todo.length < 1) return response.status(404).json({error: "Todo not exist!"});

  todo[0].title = title ? title : todo[0].title;
  todo[0].deadline = deadline ? new Date(deadline) : todo[0].deadline;

  return response.status(200).json(todo[0])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex(u => u.username === username);

  const todo = users[userIndex].todos.filter(td => td.id === id)

  if (todo.length < 1) return response.status(404).json({error: "Todo not exist!"});

  todo[0].done = true;

  return response.status(200).json(todo[0])

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const userIndex = users.findIndex(u => u.username === username);

  const todo = users[userIndex].todos.filter(td => td.id === id);

  if (todo.length < 1) return response.status(404).json({error: "Todo not exist!"});

  users[userIndex].todos = users[userIndex].todos.filter(td => td.id !== id);

  return response.status(204).json(users[userIndex].todos)

});

module.exports = app;