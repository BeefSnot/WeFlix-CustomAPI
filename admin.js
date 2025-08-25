import { requireAuth, authFetch, logout } from './web-auth.js';

// Hide until verified
const user = requireAuth();
if (!user || user.role !== 'admin') { window.location.replace('/'); throw new Error('Forbidden'); }
document.getElementById('whoami').textContent = `${user.username} (${user.role})`;
document.getElementById('logout-btn').addEventListener('click', logout);

const listEl = document.getElementById('movies-list');
const form = document.getElementById('movie-form');

async function loadMovies() {
  try {
    listEl.innerHTML = '<div class="text-gray-400">Loading...</div>';
    const res = await fetch('/api/movies');
    if (!res.ok) throw new Error(`Movies list failed: ${res.status}`);
    const data = await res.json();
    listEl.innerHTML = '';
    for (const m of data.data) {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between bg-black/40 border border-white/10 rounded px-3 py-2';
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <img src="${m.posterUrl || 'https://placehold.co/60x90/0c0a09/f0abfc?text=No+Poster'}" class="w-10 h-14 object-cover rounded border border-white/10" />
          <div>
            <div class="font-semibold">${m.title}</div>
            <div class="text-xs text-gray-400">ID ${m.id} • ${m.year || ''} ${m.genre ? '• ' + m.genre : ''}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="cyber-button px-3 py-1 rounded edit">Edit</button>
          ${user.role === 'admin' ? '<button class="cyber-button px-3 py-1 rounded delete">Delete</button>' : ''}
        </div>`;

      row.querySelector('.edit').addEventListener('click', () => fillForm(m));
      if (user.role === 'admin') {
        row.querySelector('.delete').addEventListener('click', async () => {
          if (!confirm(`Delete "${m.title}"?`)) return;
          const res = await authFetch(`/api/movies/${m.id}`, { method: 'DELETE' });
          if (res.status === 204) loadMovies();
          else alert('Delete failed');
        });
      }
      listEl.appendChild(row);
    }
    if (!data.data.length) listEl.innerHTML = '<div class="text-gray-400">No movies.</div>';
  } catch (e) {
    listEl.innerHTML = `<div class="text-red-400">Failed to load movies. ${e.message}</div>`;
  }
}

function fillForm(m) {
  document.getElementById('m-id').value = m.id || '';
  document.getElementById('m-title').value = m.title || '';
  document.getElementById('m-year').value = m.year || '';
  document.getElementById('m-genre').value = m.genre || '';
  document.getElementById('m-rating').value = m.rating || '';
  document.getElementById('m-poster').value = m.posterUrl || '';
  document.getElementById('m-titleimg').value = m.titleImageUrl || '';
  document.getElementById('m-desc').value = m.description || '';
  (async () => {
    try {
      const r = await authFetch(`/api/admin/streams/${m.id}`);
      if (r.ok) {
        const j = await r.json();
        document.getElementById('m-stream').value = j.src || '';
      } else {
        document.getElementById('m-stream').value = '';
      }
    } catch { document.getElementById('m-stream').value = ''; }
  })();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    title: document.getElementById('m-title').value.trim(),
    year: toInt(document.getElementById('m-year').value),
    genre: val(document.getElementById('m-genre').value),
    rating: toFloat(document.getElementById('m-rating').value),
    posterUrl: val(document.getElementById('m-poster').value),
    titleImageUrl: val(document.getElementById('m-titleimg').value),
    description: val(document.getElementById('m-desc').value)
  };
  const id = toInt(document.getElementById('m-id').value);
  const streamSrc = val(document.getElementById('m-stream').value);
  const persistSeed = document.getElementById('persist-seed').checked;

  try {
    let movieId = id;
    if (id) {
      const r = await authFetch(`/api/movies/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(`Update failed (${r.status})`);
    } else {
      const r = await authFetch('/api/movies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error(`Create failed (${r.status})`);
      const body = await r.json().catch(() => ({}));
      movieId = body.id || (body.data && body.data.id) || null;
      if (movieId) document.getElementById('m-id').value = String(movieId);
    }

    // Save stream source if provided
    if (movieId && streamSrc) {
      const r2 = await authFetch(`/api/admin/streams/${movieId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ src: streamSrc })
      });
      if (!(r2.ok || r2.status === 204)) throw new Error('Failed to save stream source');
    }

    // Optionally persist to seeds.extra.json
    if (persistSeed) {
      const seedObj = { ...payload, _src: streamSrc || null };
      await authFetch('/api/admin/seeds', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seedObj)
      }).catch(() => {});
    }

    document.getElementById('reset-btn').click();
    await loadMovies();
    alert('Saved');
  } catch (e2) {
    alert(e2.message || 'Save failed');
  }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  form.reset();
  document.getElementById('m-id').value = '';
  document.getElementById('m-stream').value = '';
});

function toInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
function toFloat(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : null; }
function val(v) { v = String(v || '').trim(); return v || null; }

loadMovies();