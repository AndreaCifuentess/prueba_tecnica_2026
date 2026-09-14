const express = require('express');
const { authenticate } = require('../auth/auth');

const router = express.Router();

// URL de lambda
const LAMBDA_METRICS_URL = process.env.LAMBDA_METRICS_URL || 'http://localhost:3000/metrics';

router.use(authenticate);

router.get('/metrics', async (req, res) => {
  try {
    const response = await fetch(LAMBDA_METRICS_URL);

    if (!response.ok) {
      const body = await response.text();
      return res.status(502).json({ error: 'La función de métricas respondió con error', detail: body });
    }

    const metrics = await response.json();
    return res.json(metrics);
  } catch (err) {
    return res.status(503).json({
      error: 'No se pudo contactar la función Lambda. ¿Está corriendo `sam local start-api`?',
      detail: err.message,
    });
  }
});

module.exports = router;