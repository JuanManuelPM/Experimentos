import fs from "node:fs/promises";
import path from "node:path";

const outDir = path.resolve("worker-lab/zero-friction/out");
await fs.mkdir(outDir, { recursive: true });

const startedAt = Date.now();
const events = [];
const results = [];
const tasks = [
  { id: "T01", level: "L0", prompt: "Return exactly this token and nothing else: WORKER_LAB_OK", expected: "WORKER_LAB_OK" },
  { id: "T02", level: "L1", prompt: "Compute 17 * 23. Return only the integer.", expected: "391" },
  { id: "T03", level: "L0", prompt: "Classify BANANA as FRUIT or VEHICLE. Return only FRUIT or VEHICLE.", expected: "FRUIT" },
  { id: "T04", level: "L1", prompt: "Extract only the ticket ID from this text: 'Please investigate ticket ZX-4821 before noon.'", expected: "ZX-4821" },
  { id: "T05", level: "L2", prompt: "All bloops are razzies. Kiki is a bloop. Is Kiki a razzy? Return only YES or NO.", expected: "YES" }
];

function emit(type, detail = "", data = {}) {
  const e = { ts: new Date().toISOString(), type, detail, ...data };
  events.push(e);
  console.log(`[${type}] ${detail}`);
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!]+$/g, "")
    .trim()
    .toUpperCase();
}

async function fetchJson(url, options = {}, timeoutMs = 90000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text }; }
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function runOllamaModel(model) {
  const modelStarted = Date.now();
  const row = {
    engine: "github-actions-ollama",
    provider: "LOCAL_ON_GITHUB_RUNNER",
    model,
    human_actions: 0,
    account_required: false,
    api_key_required: false,
    cost_usd: 0,
    status: "RUNNING",
    tests: []
  };

  emit("model_start", model, { model });

  for (const task of tasks) {
    const t0 = Date.now();
    try {
      const body = await fetchJson("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          stream: false,
          messages: [
            { role: "system", content: "Follow the user's output-format instruction exactly. Be concise." },
            { role: "user", content: task.prompt }
          ],
          options: { temperature: 0, num_predict: 64 }
        })
      }, 120000);

      const output = body?.message?.content ?? "";
      const pass = normalize(output) === normalize(task.expected);
      row.tests.push({
        ...task,
        status: pass ? "PASS" : "FAIL",
        output,
        latency_ms: Date.now() - t0,
        eval_count: body?.eval_count ?? null,
        prompt_eval_count: body?.prompt_eval_count ?? null
      });
      emit("task_result", `${model} ${task.id} ${pass ? "PASS" : "FAIL"}`, { model, task_id: task.id });
    } catch (err) {
      row.tests.push({
        ...task,
        status: "ERROR",
        output: "",
        error: String(err?.message || err),
        latency_ms: Date.now() - t0
      });
      emit("task_error", `${model} ${task.id}: ${err?.message || err}`, { model, task_id: task.id });
    }
  }

  const passCount = row.tests.filter(t => t.status === "PASS").length;
  row.score = passCount / row.tests.length;
  row.passed = passCount;
  row.total = row.tests.length;
  row.duration_ms = Date.now() - modelStarted;
  row.status = row.tests.some(t => t.status === "ERROR") ? "PARTIAL" : "DONE";
  results.push(row);
  emit("model_done", `${model}: ${passCount}/${row.tests.length}`, { model });
}

async function runAIHordeAnonymous() {
  const row = {
    engine: "ai-horde-anonymous",
    provider: "AI_HORDE",
    model: null,
    human_actions: 0,
    account_required: false,
    api_key_required: false,
    credential: "anonymous public key",
    cost_usd: 0,
    status: "DISCOVERING",
    tests: []
  };
  const t0 = Date.now();

  try {
    emit("horde_discover", "Discovering active anonymous text models");
    const active = await fetchJson("https://aihorde.net/api/v2/status/models?type=text&min_count=1", {}, 30000);
    const list = Array.isArray(active) ? active : [];
    const candidates = list
      .filter(x => x && x.name)
      .sort((a, b) => (b.count || 0) - (a.count || 0));

    if (!candidates.length) throw new Error("No active AI Horde text model reported.");

    const chosen = candidates[0];
    row.model = chosen.name;
    row.active_threads = chosen.count ?? null;
    row.status = "QUEUED";
    emit("horde_model", `${chosen.name} · threads=${chosen.count ?? "?"}`);

    const submit = await fetchJson("https://aihorde.net/api/v2/generate/text/async", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apikey": "0000000000",
        "Client-Agent": "worker-lab:0.1:https://github.com/JuanManuelPM/Experimentos"
      },
      body: JSON.stringify({
        prompt: "### Instruction:\nReturn exactly WORKER_LAB_OK and nothing else.\n### Response:\n",
        params: {
          n: 1,
          max_length: 24,
          max_context_length: 1024,
          temperature: 0.1,
          top_p: 0.9,
          rep_pen: 1.0
        },
        models: [chosen.name],
        slow_workers: true,
        trusted_workers: false,
        validated_backends: false
      })
    }, 30000);

    if (!submit?.id) throw new Error(`AI Horde did not return request id: ${JSON.stringify(submit).slice(0, 300)}`);
    row.request_id = submit.id;
    emit("horde_submit", submit.id);

    const deadline = Date.now() + 120000;
    let final = null;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 5000));
      const status = await fetchJson(`https://aihorde.net/api/v2/generate/text/status/${submit.id}`, {}, 30000);
      row.queue_position = status?.queue_position ?? row.queue_position ?? null;
      row.wait_time = status?.wait_time ?? row.wait_time ?? null;
      emit("horde_poll", `done=${Boolean(status?.done)} queue=${status?.queue_position ?? "?"}`);
      if (status?.done) {
        final = status;
        break;
      }
    }

    if (!final) {
      row.status = "TIMEOUT";
      row.duration_ms = Date.now() - t0;
      row.note = "Anonymous queue did not finish inside 120s. This is a capacity signal, not a harness failure.";
      results.push(row);
      emit("horde_timeout", row.note);
      return;
    }

    const generation = Array.isArray(final.generations) ? final.generations[0] : null;
    const output = generation?.text ?? generation?.generation ?? "";
    const pass = normalize(output) === "WORKER_LAB_OK";
    row.tests.push({
      id: "H01",
      level: "L0",
      expected: "WORKER_LAB_OK",
      output,
      status: pass ? "PASS" : "FAIL"
    });
    row.model = generation?.model || row.model;
    row.status = "DONE";
    row.score = pass ? 1 : 0;
    row.passed = pass ? 1 : 0;
    row.total = 1;
    row.duration_ms = Date.now() - t0;
    results.push(row);
    emit("horde_done", `${row.model} · ${pass ? "PASS" : "FAIL"}`);
  } catch (err) {
    row.status = "UNAVAILABLE";
    row.error = String(err?.message || err);
    row.duration_ms = Date.now() - t0;
    results.push(row);
    emit("horde_error", row.error);
  }
}

for (const model of [
  "qwen2.5:0.5b-instruct",
  "gemma3:270m",
  "llama3.2:1b"
]) {
  await runOllamaModel(model);
}

await runAIHordeAnonymous();

const finishedAt = Date.now();
const localRows = results.filter(r => r.engine === "github-actions-ollama");
const fullyZeroFriction = results.every(r => r.human_actions === 0 && r.cost_usd === 0);
const best = [...localRows].sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.duration_ms - b.duration_ms)[0] ?? null;

const report = {
  schema: "worker-lab.zero-friction/v1",
  run_id: `zf-${process.env.GITHUB_RUN_ID || Date.now()}`,
  started_at: new Date(startedAt).toISOString(),
  finished_at: new Date(finishedAt).toISOString(),
  duration_ms: finishedAt - startedAt,
  human_actions: 0,
  cost_usd: 0,
  fully_zero_friction: fullyZeroFriction,
  infrastructure: {
    runner: "GitHub Actions standard public-repo runner",
    inference: ["Ollama local models on runner CPU", "AI Horde anonymous community inference"],
    secrets_used: 0,
    accounts_created: 0
  },
  summary: {
    engines: results.length,
    local_models: localRows.length,
    best_local_model: best?.model ?? null,
    best_local_score: best?.score ?? null,
    horde_status: results.find(r => r.engine === "ai-horde-anonymous")?.status ?? null
  },
  tasks,
  results,
  events
};

await fs.writeFile(path.join(outDir, "latest.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
