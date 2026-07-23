/* ── HomeWatcher SPA ──────────────────────────────────────────────────────── */
'use strict';

const THREADFIN_BASE = '/threadfin';
const GATE_BASE      = '/api/gate';

let channels    = [];
let hls         = null;
let gateBlocked = false;

// ── Bootstrap ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await fetchGateStatus();
  await loadChannels();
  setupSearch();
});

// ── Channel loading ───────────────────────────────────────────────────────────
async function loadChannels() {
  try {
    // Threadfin exposes its parsed M3U as JSON on /api/data.json
    const res  = await fetch(`${THREADFIN_BASE}/api/data.json`);
    const data = await res.json();
    channels   = Object.values(data.streams ?? {});
    buildCategoryFilter();
    renderChannels(channels);
    toast('Channels loaded (' + channels.length + ')');
  } catch (e) {
    console.error(e);
    toast('Failed to load channels', true);
  }
}

function buildCategoryFilter() {
  const cats = [...new Set(channels.map(c => c.groupTitle).filter(Boolean))].sort();
  const sel  = document.getElementById('categoryFilter');
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', filterChannels);
}

function filterChannels() {
  const cat   = document.getElementById('categoryFilter').value;
  const query = document.getElementById('search').value.toLowerCase();
  const list  = channels.filter(c =>
    (!cat   || c.groupTitle === cat) &&
    (!query || c.name.toLowerCase().includes(query))
  );
  renderChannels(list);
}

function renderChannels(list) {
  const container = document.getElementById('channelList');
  container.innerHTML = '';
  list.forEach(ch => {
    const el = document.createElement('div');
    el.className = 'channel-item';
    el.innerHTML = `
      <img class="channel-logo" src="${ch.tvg?.logo || ''}" alt="" onerror="this.style.visibility='hidden'" />
      <div>
        <div class="channel-name">${ch.name}</div>
        <div class="channel-cat">${ch.groupTitle || ''}</div>
      </div>`;
    el.addEventListener('click', () => playChannel(ch, el));
    container.appendChild(el);
  });
}

// ── Playback ──────────────────────────────────────────────────────────────────
function playChannel(ch, el) {
  document.querySelectorAll('.channel-item').forEach(e => e.classList.remove('active'));
  el.classList.add('active');

  const url    = ch.url;
  const video  = document.getElementById('player');

  document.getElementById('nowPlaying').textContent = `▶ ${ch.name}`;

  if (hls) { hls.destroy(); hls = null; }

  if (Hls.isSupported()) {
    hls = new Hls({ maxBufferLength: 30, enableWorker: true });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    hls.on(Hls.Events.ERROR, (_, d) => {
      if (d.fatal) toast('Stream error: ' + d.details, true);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.play().catch(() => {});
  } else {
    toast('HLS not supported in this browser', true);
  }

  loadEPG(ch);
  toast('Playing: ' + ch.name);
}

// ── EPG ───────────────────────────────────────────────────────────────────────
async function loadEPG(ch) {
  const panel = document.getElementById('epgContent');
  panel.textContent = 'Loading…';
  try {
    const res  = await fetch(`${THREADFIN_BASE}/api/epg.json`);
    const data = await res.json();
    const tvgId = ch.tvg?.id;
    const progs = (data[tvgId] ?? []).slice(0, 10);
    if (!progs.length) { panel.textContent = 'No EPG data available.'; return; }

    const now = Date.now() / 1000;
    panel.innerHTML = progs.map(p => {
      const isNow = p.start <= now && p.stop >= now;
      const start = new Date(p.start * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      const stop  = new Date(p.stop  * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      return `<div class="epg-entry${isNow ? ' now' : ''}">
        <div class="epg-time">${start} – ${stop}</div>
        <div class="epg-title">${p.title}</div>
      </div>`;
    }).join('');
  } catch {
    panel.textContent = 'Failed to load EPG.';
  }
}

// ── Stream-Gate ───────────────────────────────────────────────────────────────
async function fetchGateStatus() {
  try {
    const res  = await fetch(`${GATE_BASE}/status`);
    const data = await res.json();
    gateBlocked = data.blocked;
    updateGateButton();
  } catch { /* gate may not be up yet */ }
}

async function toggleGate() {
  const endpoint = gateBlocked ? 'unblock' : 'block';
  try {
    const res  = await fetch(`${GATE_BASE}/${endpoint}`, { method: 'POST' });
    const data = await res.json();
    gateBlocked = data.blocked;
    updateGateButton();
    toast(data.message);
  } catch {
    toast('Gate toggle failed', true);
  }
}

function updateGateButton() {
  const btn = document.getElementById('gateBtn');
  if (gateBlocked) {
    btn.textContent = '🔴 Streams OFF';
    btn.className   = 'gate-btn gate-closed';
  } else {
    btn.textContent = '🟢 Streams ON';
    btn.className   = 'gate-btn gate-open';
  }
}

// ── Search ────────────────────────────────────────────────────────────────────
function setupSearch() {
  document.getElementById('search').addEventListener('input', filterChannels);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function toast(msg, isError = false) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = msg;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 4200);
}
