import { requireAuth, authFetch, logout } from './web-auth.js';

const user = requireAuth();
document.getElementById('whoami').textContent = `${user.username} (${user.role})`;
document.getElementById('logout-btn').addEventListener('click', logout);

const listEl = document.getElementById('movies-list');
const form = document.getElementById('movie-form');

async function loadMovies() {
  listEl.innerHTML = '<div class="text-gray-400">Loading...</div>';
  const res = await fetch('/api/movies');
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
  try {
    if (id) {
      const res = await authFetch(`/api/movies/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Update failed');
    } else {
      const res = await authFetch('/api/movies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Create failed');
    }
    (document.getElementById('reset-btn')).click();
    await loadMovies();
    alert('Saved');
  } catch (e2) {
    alert(e2.message || 'Save failed');
  }
});

document.getElementById('reset-btn').addEventListener('click', () => {
  form.reset();
  document.getElementById('m-id').value = '';
});

function toInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }
function toFloat(v) { const n = parseFloat(v); return Number.isFinite(n) ? n : null; }
function val(v) { v = String(v || '').trim(); return v || null; }

loadMovies();