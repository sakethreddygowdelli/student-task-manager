
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'tasks.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]');

function readTasks() {
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

function saveTasks(tasks) {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
}

app.get('/api/tasks', (req, res) => {
  res.json(readTasks());
});

app.post('/api/tasks', (req, res) => {
  const { title, description = '' } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const tasks = readTasks();
  const task = {
    id: Date.now(),
    title: title.trim(),
    description,
    completed: false
  };

  tasks.push(task);
  saveTasks(tasks);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[index] = { ...tasks[index], ...req.body, id: tasks[index].id };
  saveTasks(tasks);
  res.json(tasks[index]);
});

app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const remaining = tasks.filter(t => t.id !== Number(req.params.id));

  if (remaining.length === tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  saveTasks(remaining);
  res.json({ message: 'Task deleted successfully' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3001, () => {
  console.log('Task Manager running at http://localhost:3001');
});
