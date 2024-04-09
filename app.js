const express = require('express');
const connectDB = require('./db/connection');
const contactsRoutes = require('./routes/api/contacts');

const app = express();

connectDB();

app.use(express.json());

app.use('/api/contacts', contactsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;