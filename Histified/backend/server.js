const app = require('./src/app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📸 Test endpoint: POST http://localhost:${PORT}/api/images/verify`);
});
