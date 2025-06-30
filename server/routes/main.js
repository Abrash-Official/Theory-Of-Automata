import express from 'express';
const router = express.Router();

// Main route (example)
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Theory of Automata Node.js backend!' });
});

export default router; 