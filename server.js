import express from 'express';
import Database from 'better-sqlite3';
import fileUpload from 'express-fileupload';
import { nanoid } from 'nanoid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const db = new Database('timeline.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));

// Get all timeline nodes
app.get('/api/nodes', (req, res) => {
  const nodes = db.prepare('SELECT * FROM nodes ORDER BY date').all();
  res.json(nodes);
});

// Add new node
app.post('/api/nodes', (req, res) => {
  const { date, type, content } = req.body;
  const id = nanoid();
  
  try {
    const stmt = db.prepare('INSERT INTO nodes (id, date, type, content) VALUES (?, ?, ?, ?)');
    stmt.run(id, date, type, content);
    res.json({ id, date, type, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
app.post('/api/upload', (req, res) => {
  if (!req.files || !req.files.image) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const image = req.files.image;
  const fileName = `${nanoid()}-${image.name}`;
  const uploadPath = join(__dirname, 'uploads', fileName);

  image.mv(uploadPath, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ url: `/uploads/${fileName}` });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});