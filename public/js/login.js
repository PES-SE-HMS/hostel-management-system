document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.className = 'msg';
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  if (!username || !password) { msg.textContent = 'Please enter username and password.'; msg.classList.add('err'); return; }
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
  const data = await res.json();
  if (res.ok) { msg.textContent = 'Login successful. Redirecting...'; msg.classList.add('ok'); location.href = '/dashboard.html'; }
  else { msg.textContent = data.error || 'Login failed'; msg.classList.add('err'); }
});
