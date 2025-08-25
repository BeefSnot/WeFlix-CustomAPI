import { saveToken } from './web-auth.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const { token } = await res.json();
    saveToken(token);
    window.location.href = '/admin.html';
  } catch (err) {
    alert('Login failed. Check your credentials.');
    console.error(err);
  }
});