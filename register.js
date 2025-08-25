import { saveToken } from './web-auth.js';

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.message || 'Registration failed');
    }
    const { token } = await res.json();
    saveToken(token);
    window.location.href = '/admin.html';
  } catch (err) {
    alert(err.message || 'Registration failed');
    console.error(err);
  }
});