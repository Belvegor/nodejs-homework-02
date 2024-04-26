const express = require('express');
const connectDB = require('./db/connection');
const contactsRoutes = require('./routes/api/contacts');
const usersRoutes = require('./routes/api/user.routes'); 

const app = express();

connectDB();

app.use(express.json());

app.use(express.static('public'));

app.use('/api/contacts', contactsRoutes);
app.use('/api/users', usersRoutes); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
