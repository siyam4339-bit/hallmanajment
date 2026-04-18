const API_URL = 'http://localhost:3000';
let currentUser = null;
let isLoginMode = true;

// --- UTILS ---
function showSection(id) {
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// --- AUTHENTICATION ---
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Login' : 'Register';
    document.getElementById('auth-btn').innerText = isLoginMode ? 'Login' : 'Register';
    document.querySelector('.toggle-link').innerText = isLoginMode ? "Don't have an account? Register" : "Already registered? Login";
    document.getElementById('role').classList.toggle('hidden', isLoginMode);
}

async function handleAuth() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const endpoint = isLoginMode ? '/login' : '/register';
    
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
    });
    
    const data = await res.json();
    if (res.ok) {
        if (isLoginMode) {
            currentUser = data;
            document.getElementById('navbar').classList.remove('hidden');
            document.getElementById('user-display').innerText = currentUser.username;
            if (currentUser.role === 'admin') document.getElementById('admin-card').classList.remove('hidden');
            showSection('dashboard');
        } else {
            alert('Registration successful! Please login.');
            toggleAuthMode();
        }
    } else alert(data.error);
}

function logout() {
    currentUser = null;
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('admin-card').classList.add('hidden');
    showSection('auth-section');
}

// --- STUDENT LOGIC ---
async function submitApplication() {
    const payload = {
        user_id: currentUser.id,
        student_id: document.getElementById('app_student_id').value,
        edu_email: document.getElementById('app_email').value,
        full_name: document.getElementById('app_name').value,
        department: document.getElementById('app_dept').value,
        semester: document.getElementById('app_semester').value,
        mobile_number: document.getElementById('app_mobile').value,
        blood_group: document.getElementById('app_blood').value
    };

    const res = await fetch(`${API_URL}/apply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (res.ok) {
        alert('Application Submitted!');
        showSection('dashboard');
    }
}

async function loadStudentProfile() {
    showSection('student-profile');
    
    // Fetch Profile
    const res = await fetch(`${API_URL}/profile/${currentUser.id}`);
    const profile = await res.json();
    
    const detailsDiv = document.getElementById('profile-details');
    if (!profile) {
        detailsDiv.innerHTML = '<p>No application found. Please apply first.</p>';
    } else {
        detailsDiv.innerHTML = `
            <p><strong>Name:</strong> ${profile.full_name}</p>
            <p><strong>Dept:</strong> ${profile.department}</p>
            <p><strong>Status:</strong> ${profile.status}</p>
            ${profile.room_number ? `<p><strong>Room:</strong> ${profile.room_number} (Hall: ${profile.hall_name})</p>` : ''}
        `;
    }

    // Fetch Complains
    const compRes = await fetch(`${API_URL}/complaints/${currentUser.id}`);
    const complains = await compRes.json();
    document.getElementById('my-complains-list').innerHTML = complains.map(c => 
        `<div class="data-row"><p>${c.complaint_text}</p><small>${new Date(c.created_at).toLocaleDateString()}</small></div>`
    ).join('');
}

async function submitComplain() {
    const text = document.getElementById('complain_text').value;
    await fetch(`${API_URL}/complain`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ user_id: currentUser.id, complaint_text: text })
    });
    document.getElementById('complain_text').value = '';
    loadStudentProfile(); // Refresh
}

// --- ADMIN LOGIC ---
async function loadAdminDashboard() {
    if (currentUser.role !== 'admin') return alert('Access Denied');
    showSection('admin-section');
    
    // Load Pending Apps
    const appRes = await fetch(`${API_URL}/admin/applications`);
    const apps = await appRes.json();
    document.getElementById('admin-applications').innerHTML = apps.map(a => `
        <div class="data-row">
            <div><strong>${a.full_name}</strong> (${a.student_id}) - ${a.department}</div>
            <div class="action-btns">
                <button class="success" onclick="adminAction('approve', ${a.id}, ${a.user_id})">Approve</button>
                <button class="danger" onclick="adminAction('reject', ${a.id}, null)">Reject</button>
            </div>
        </div>`).join('') || '<p>No pending applications.</p>';

    // Load Allocated Students
    const stuRes = await fetch(`${API_URL}/admin/students`);
    const students = await stuRes.json();
    document.getElementById('admin-students').innerHTML = students.map(s => `
        <div class="data-row">
            <div><strong>${s.full_name}</strong> - Room: ${s.room_number} (${s.hall_name})</div>
            <button class="danger action-btns" onclick="deallocateRoom(${s.allocation_id})">Deallocate</button>
        </div>`).join('') || '<p>No students allocated yet.</p>';

    // Load Complains
    const compRes = await fetch(`${API_URL}/admin/complaints`);
    const complains = await compRes.json();
    document.getElementById('admin-complaints').innerHTML = complains.map(c => `
        <div class="data-row">
            <div><strong>${c.username}:</strong> ${c.complaint_text}</div>
            <small>${new Date(c.created_at).toLocaleDateString()}</small>
        </div>`).join('') || '<p>No complains yet.</p>';
}

async function adminAction(action, appId, userId) {
    await fetch(`${API_URL}/admin/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId, user_id: userId })
    });
    loadAdminDashboard(); // Refresh
}

async function deallocateRoom(allocationId) {
    if(!confirm("Are you sure you want to deallocate this room?")) return;
    await fetch(`${API_URL}/admin/deallocate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocation_id: allocationId })
    });
    loadAdminDashboard(); // Refresh
}