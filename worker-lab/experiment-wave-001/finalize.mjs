import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('worker-lab/experiment-wave-001');
const out=path.join(root,'out');
const browser=JSON.parse(await fs.readFile(path.join(out,'browser-result.json'),'utf8'));
const video=JSON.parse(await fs.readFile(path.join(out,'video-probe.json'),'utf8'));
const streams=video.streams||[];
const fmt=video.format||{};
const report={
  experiment:'EXPERIMENT_WAVE_001',
  generated_at:new Date().toISOString(),
  verdict:(browser.technical_status==='PASS' && Number(fmt.duration)>1 && streams.some(x=>x.codec_type==='video') && streams.some(x=>x.codec_type==='audio'))?'TECHNICAL_PASS':'CHECK',
  auto_verified:{
    page_load:browser.browser_load,
    worker_done_event:browser.interactions.doneClicks===1,
    worker_blocked_event:browser.interactions.blockedClicks===1,
    browser_notification_path:browser.interactions.notifyAttempts===1 && browser.capabilities.notification,
    audio_assets:browser.media,
    console_errors:browser.console_errors,
    video:{duration:Number(fmt.duration||0),size:Number(fmt.size||0),streams}
  },
  human_checks:[
    '¿El bell es útil o molesto?',
    '¿Alguna de las 3 voces es aceptable para TV?',
    '¿El video se ve y se escucha bien en tu dispositivo?',
    '¿Querés que BLOCKED hable y DONE sólo haga sonido, o al revés?'
  ],
  intentionally_not_tested:[
    'Prometeo real: todos los eventos son sintéticos.',
    'Telegram/WhatsApp: no conectados.',
    'Provider tournament: las keys siguen sólo en el navegador del usuario.'
  ]
};
await fs.writeFile(path.join(out,'latest.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));