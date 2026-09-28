export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://juanmanuelpm.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const payload = {
      kind: 'stt_benchmark',
      session_id: String(body.session_id || '').slice(0, 80),
      test_index: Number(body.test_index ?? -1),
      test_id: String(body.test_id || '').slice(0, 80),
      reference: String(body.reference || '').slice(0, 2500),
      duration_ms: Number(body.duration_ms || 0),
      results: Array.isArray(body.results) ? body.results.slice(0, 10).map((x) => ({
        id: String(x.id || '').slice(0, 80),
        text: String(x.text || '').slice(0, 5000),
        wer: Number.isFinite(Number(x.wer)) ? Number(x.wer) : null,
        cer: Number.isFinite(Number(x.cer)) ? Number(x.cer) : null,
        first_ms: Number.isFinite(Number(x.first_ms)) ? Number(x.first_ms) : null
      })) : []
    };

    console.log('STT_BENCHMARK', JSON.stringify(payload));
    return res.status(200).json({ ok: true, receipt: payload.session_id + '-' + payload.test_index + '-' + Date.now().toString(36) });
  } catch (error) {
    console.error('STT_BENCHMARK_ERROR', String(error));
    return res.status(400).json({ ok: false });
  }
}
