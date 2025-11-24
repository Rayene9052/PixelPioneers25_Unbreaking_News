require('dotenv').config();
const express = require('express');
const cors = require('cors'); // AJOUTER
const imageRoutes = require('./routes/image.routes');
const articleRoutes = require('./routes/article.routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// CORS Configuration
const allowedOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/images', imageRoutes);
app.use('/api/articles', articleRoutes);
app.use(errorHandler);

module.exports = app;
