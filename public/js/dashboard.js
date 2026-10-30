const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const api = async (url, opts) => {
  const res = await fetch(url, opts && { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (res.status === 401) { location.href = '/login.html'; throw new Error('auth'); }
  return { ok: res.ok, data: await res.json() };
};
let user;

async function loadRooms() {
  const { data } = await api('/api/rooms/availability');
  $('rmBody').innerHTML = data.map((r) => `<tr><td>${esc(r.room_number)}</td><td>${esc(r.block)}</td><td>${esc(r.floor)}</td><td>${esc(r.bed_number)}</td><td><span class="tag ${esc(r.status)}">${esc(r.status)}</span></td></tr>`).join('');
  if (['admin', 'warden'].includes(user.role)) {
    $('allocBed').innerHTML = data.filter((r) => r.status === 'available').map((r) => `<option value="${r.bed_id}">${esc(r.room_number)} - Bed ${esc(r.bed_number)}</option>`).join('');
  }
}
async function loadStudents() {
  const { data } = await api('/api/students');
  $('stBody').innerHTML = data.map((s) => `<tr><td>${esc(s.srn)}</td><td>${esc(s.name)}</td><td>${esc(s.email)}</td><td>${esc(s.course)}</td><td>${s.room_number ? esc(s.room_number) + '/' + esc(s.bed_number) : '-'}</td></tr>`).join('');
  $('allocStudent').innerHTML = data.map((s) => `<option value="${s.student_id}">${esc(s.srn)} - ${esc(s.name)}</option>`).join('');
}
async function loadMine() {
  const { data } = await api('/api/rooms/mine');
  $('mineBody').textContent = data ? `Room ${data.room_number}, Block ${data.block}, Floor ${data.floor}, Bed ${data.bed_number}` : 'No room allocated yet.';
}

(async () => {
  user = (await api('/api/auth/me')).data.user;
  $('who').textContent = `${user.name} (${user.role}) `;
  $('logout').onclick = async () => { await api('/api/auth/logout', { method: 'POST' }).catch(() => {}); location.href = '/login.html'; };
  if (user.role === 'student') { $('mine').classList.remove('hidden'); $('studentsSec').classList.add('hidden'); loadMine(); }
  if (user.role === 'maintenance') { $('roomsSec').classList.add('hidden'); return; }
  if (['admin', 'warden'].includes(user.role)) { $('studentsSec').classList.remove('hidden'); $('allocForm').classList.remove('hidden'); await loadStudents(); }
  if (user.role === 'admin') $('addForm').classList.remove('hidden');
  await loadRooms();

  $('addBtn').onclick = async () => {
    const body = {}; ['srn', 'name', 'email', 'phone', 'course', 'year'].forEach((k) => (body[k] = $(k).value));
    const r = await api('/api/students', { method: 'POST', body: JSON.stringify(body) });
    $('addMsg').className = 'msg ' + (r.ok ? 'ok' : 'err');
    $('addMsg').textContent = r.ok ? 'Student added' : (r.data.details || [r.data.error]).join(', ');
    if (r.ok) loadStudents();
  };
  $('allocBtn').onclick = async () => {
    const r = await api('/api/rooms/allocations', { method: 'POST', body: JSON.stringify({ student_id: $('allocStudent').value, bed_id: $('allocBed').value }) });
    $('allocMsg').className = 'msg ' + (r.ok ? 'ok' : 'err');
    $('allocMsg').textContent = r.data.message || r.data.error;
    await loadRooms(); await loadStudents();
  };
})();
