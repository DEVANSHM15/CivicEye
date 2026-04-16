const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err.message);
  });

const complaintRoutes = require('./routes/complaintRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/complaints', complaintRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('CivicEye API is running..');
});
