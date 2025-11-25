const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Helper to read db.json
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { vets: [], appointments: [] };
  }
}

// Helper to write db.json
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✓ db.json updated');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// GET /vets
app.get('/vets', (req, res) => {
  const db = readDB();
  res.json(db.vets || []);
});

// GET /appointments
app.get('/appointments', (req, res) => {
  const db = readDB();
  res.json(db.appointments || []);
});

// POST /appointments - Add new appointment
app.post('/appointments', (req, res) => {
  try {
    const db = readDB();
    const newAppointment = {
      id: db.appointments.length + 1,
      ...req.body
    };
    
    if (!db.appointments) {
      db.appointments = [];
    }
    db.appointments.push(newAppointment);
    writeDB(db);
    
    res.status(201).json(newAppointment);
  } catch (err) {
    console.error('Error adding appointment:', err);
    res.status(500).json({ error: 'Failed to add appointment' });
  }
});

// POST /vets - Add new vet
app.post('/vets', (req, res) => {
  try {
    const db = readDB();
    const newVet = {
      id: String(db.vets.length + 1),
      ...req.body
    };
    
    if (!db.vets) {
      db.vets = [];
    }
    db.vets.push(newVet);
    writeDB(db);
    
    res.status(201).json(newVet);
  } catch (err) {
    console.error('Error adding vet:', err);
    res.status(500).json({ error: 'Failed to add vet' });
  }
});

app.listen(PORT, () => {
  console.log(`\n✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Watching db.json for changes\n`);
});
