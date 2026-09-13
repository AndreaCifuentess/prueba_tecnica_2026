const { Client } = require('pg');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

exports.handler = async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();

    const totalResult = await client.query('SELECT COUNT(*)::int AS count FROM "Note"');
    const byStatusResult = await client.query(
      'SELECT status, COUNT(*)::int AS count FROM "Note" GROUP BY status'
    );

    const distribution = { PENDIENTE: 0, EN_CURSO: 0, HECHO: 0 };
    for (const row of byStatusResult.rows) {
      distribution[row.status] = row.count;
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({
        total: totalResult.rows[0].count,
        byStatus: distribution,
        generatedAt: new Date().toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify({ error: 'No se pudieron calcular las métricas', detail: err.message }),
    };
  } finally {
    await client.end().catch(() => {});
  }
};