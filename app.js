// ==========================================
// AutoPulse — app.js
// ==========================================
// Auth guard
const currentUser = localStorage.getItem('autopulse_user');
if (!currentUser) {
  window.location.href = 'auth.html';
}
const user = JSON.parse(currentUser);


// Actualizar avatar con nombre real
document.getElementById('topbar-avatar').src = 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=cccccc&color=222222&rounded=true&size=40`;

// Logout
function handleLogout() {
  localStorage.removeItem('autopulse_user');
  window.location.href = 'auth.html';
}
// ---- STORAGE ----
const STORAGE_KEY = 'autopulse_data';

const DEFAULT_DATA = {
  settings: {
    ownerName: user.name,
    units: 'km',
    currency: 'USD',
    symbol: '$'
  },
  activeVehicleId: null,
  vehicles: [],
  fuelRecords: [],
  maintenanceRecords: []
};

// ---- DATABASE ----
const DB = {
  data: null,

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      this.data = stored ? JSON.parse(stored) : JSON.parse(JSON.stringify(DEFAULT_DATA));
    } catch {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    return this;
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    return this;
  },

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save();
    return this;
  },

  get settings()           { return this.data.settings; },
  get vehicles()           { return this.data.vehicles; },
  get fuelRecords()        { return this.data.fuelRecords; },
  get maintenanceRecords() { return this.data.maintenanceRecords; },

  getActiveVehicle() {
    return this.vehicles.find(v => v.id === this.data.activeVehicleId) || this.vehicles[0] || null;
  },

  setActiveVehicle(id) {
    this.data.activeVehicleId = id;
    this.save();
  },

  getFuelForVehicle(vehicleId) {
    return this.fuelRecords
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  getMaintenanceForVehicle(vehicleId) {
    return this.maintenanceRecords
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  addVehicle(vehicle) {
    vehicle.id = 'v' + Date.now();
    this.data.vehicles.push(vehicle);
    this.save();
    return vehicle;
  },

  updateVehicle(id, updates) {
    const idx = this.vehicles.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.vehicles[idx] = { ...this.vehicles[idx], ...updates };
      this.save();
    }
  },

  deleteVehicle(id) {
    this.data.vehicles        = this.vehicles.filter(v => v.id !== id);
    this.data.fuelRecords     = this.fuelRecords.filter(r => r.vehicleId !== id);
    this.data.maintenanceRecords = this.maintenanceRecords.filter(r => r.vehicleId !== id);
    if (this.data.activeVehicleId === id) {
      this.data.activeVehicleId = this.vehicles[0]?.id || null;
    }
    this.save();
  },

  addFuelRecord(record) {
    record.id = 'f' + Date.now();
    this.data.fuelRecords.push(record);
    const vehicle = this.vehicles.find(v => v.id === record.vehicleId);
    if (vehicle && record.odometer > vehicle.mileage) {
      this.updateVehicle(record.vehicleId, { mileage: record.odometer });
    }
    this.save();
    return record;
  },

  deleteFuelRecord(id) {
    this.data.fuelRecords = this.fuelRecords.filter(r => r.id !== id);
    this.save();
  },

  addMaintenanceRecord(record) {
    record.id = 'm' + Date.now();
    this.data.maintenanceRecords.push(record);
    this.save();
    return record;
  },

  deleteMaintenanceRecord(id) {
    this.data.maintenanceRecords = this.maintenanceRecords.filter(r => r.id !== id);
    this.save();
  },

  saveSettings(settings) {
    this.data.settings = { ...this.data.settings, ...settings };
    this.save();
  }
};

// ---- UTILITIES ----
function fmt(value) {
  return `${DB.settings.symbol}${parseFloat(value).toFixed(2)}`;
}

function emptyState(icon, title, subtitle, actionFn, actionLabel) {
  const btn = actionFn
    ? `<button class="btn primary" style="margin-top:8px;" onclick="${actionFn}">${actionLabel}</button>`
    : '';
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${subtitle}</p>
      ${btn}
    </div>`;
}

function fmtDist(value) {
  return `${parseFloat(value).toLocaleString()} ${DB.settings.units}`;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function typeToImage(type) {
  const map = {
    sedan:    'SEDAN.png',
    hatchback:'HATCH.png',
    suv:      'SUV.png',
    van:      'MINIVAN.png',
    pickup:   'PICKUPTRUCK.png'
  };
  return map[type] || 'SUV.png';
}

function updateAllVehicleImages(type) {
  document.querySelectorAll('.vehicle-preview-img').forEach(img => { img.src = typeToImage(type); });
}

function showNotification(msg, type = 'success') {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed', top: '24px', right: '24px',
    background: type === 'success' ? 'var(--accent)' : '#e74c3c',
    color: '#fff', padding: '12px 24px', borderRadius: '8px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)', zIndex: '5000',
    fontWeight: '600', transition: 'opacity 0.3s'
  });
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2200);
}

// ---- TOPBAR ----
function updateTopbar() {
  const name = DB.settings.ownerName;
  const ownerEl = document.querySelector('.owner p');
  if (ownerEl) ownerEl.textContent = name;

  const avatar = document.querySelector('.owner .avatar');
  if (avatar) {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5b7cfd&color=ffffff&rounded=true&size=40`;
    avatar.alt = name;
  }

  // Update mobile nav elements
  const mobileUser = document.getElementById('mobile-username');
  if (mobileUser) mobileUser.textContent = name;
  const mobileAvatar = document.getElementById('mobile-avatar');
  if (mobileAvatar) {
    mobileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5b7cfd&color=ffffff&rounded=true&size=50`;
    mobileAvatar.alt = name;
  }
}

// ---- MAINTENANCE BADGE ----
function updateMaintenanceBadge() {
  const badge = document.getElementById('maintenance-badge');
  if (!badge) return;

  const v = DB.getActiveVehicle();
  if (!v) { badge.style.display = 'none'; return; }

  const count = DB.getMaintenanceForVehicle(v.id)
    .filter(r => r.nextDate && daysUntil(r.nextDate) <= 30).length;

  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ---- THEME ----
function setTheme(mode) {
  document.body.classList.toggle('light-mode', mode === 'light');
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = mode === 'light' ? '☀️' : '🌙';
  const mobileIcon = document.getElementById('mobile-theme-icon');
  if (mobileIcon) mobileIcon.textContent = mode === 'light' ? '☀️' : '🌙';
  localStorage.setItem('themeMode', mode);
}

// ---- NAVIGATION ----
const SECTIONS = ['dashboard', 'my-vehicles', 'maintenance', 'fuel', 'reports', 'settings'];

function showSection(name) {
  SECTIONS.forEach(s => {
    const el = document.getElementById(`${s}-section`);
    if (el) el.style.display = s === name ? '' : 'none';
  });
  document.querySelectorAll('.sidebar-nav a[data-section], .mobile-nav a[data-section]').forEach(a => {
    a.classList.toggle('active', a.dataset.section === name);
  });
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) mobileNav.style.display = 'none';
  localStorage.setItem('activeSection', name);
  renderSection(name);
}

function renderSection(name) {
  switch (name) {
    case 'dashboard':   renderDashboard();   break;
    case 'my-vehicles': renderMyVehicles();  break;
    case 'maintenance': renderMaintenance(); break;
    case 'fuel':        renderFuel();        break;
    case 'reports':     renderReports();     break;
    case 'settings':    renderSettings();    break;
  }
}

// ---- DASHBOARD ----
async function renderDashboard() {
  const v = window.activeVehicle || DB.getActiveVehicle();
  if (!v) {
    document.getElementById('dash-no-vehicle')?.style.setProperty('display', '');
    return;
  }

  updateAllVehicleImages(v.type);

  const s = DB.settings;
  
  // Fetch fuel from backend
  let fuel = [];
  try {
    const fRes = await fetch(`api/get_fuel.php?vehicle_id=${v.id}&user_id=${user.id}`);
    const fData = await fRes.json();
    if (fData.success) fuel = fData.records;
  } catch (e) {
    console.error(e);
  }

  // Fetch maintenance from backend
  let maint = [];
  try {
    const mRes = await fetch(`api/get_maintenance.php?vehicle_id=${v.id}&user_id=${user.id}`);
    const mData = await mRes.json();
    if (mData.success) maint = mData.records;
  } catch (e) {
    console.error(e);
  }

  setText('dash-welcome',       `Welcome back, ${s.ownerName}! Here is your vehicle summary.`);
  setText('dash-vehicle-title', `${v.make} ${v.model} ${v.year}`);
  setText('dash-plate',         v.plate || '');
  setText('dash-status',        v.status || 'Active');
  setText('dash-mileage',       fmtDist(v.mileage || 0));

  // Monthly fuel spend
  const now     = new Date();
  const month   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthly = fuel.filter(r => r.date.startsWith(month));
  setText('dash-fuel-spend', fmt(monthly.reduce((s, r) => s + r.cost, 0)));
  setText('dash-fuel-count', `${monthly.length} fill-up${monthly.length !== 1 ? 's' : ''}`);

  // Next maintenance
  const upcoming = maint
    .filter(r => (r.next_date || r.nextDate) && daysUntil(r.next_date || r.nextDate) > 0)
    .sort((a, b) => new Date(a.next_date || a.nextDate) - new Date(b.next_date || b.nextDate))[0];

  if (upcoming) {
    const days = daysUntil(upcoming.next_date || upcoming.nextDate);
    const el = document.getElementById('dash-maint-due');
    if (el) { el.textContent = `${days} days`; el.style.color = days <= 14 ? '#e74c3c' : ''; }
    setText('dash-maint-label', upcoming.type);
  } else {
    setText('dash-maint-due',   '—');
    setText('dash-maint-label', 'No upcoming');
  }

  // Alerts badge
  const alerts = maint.filter(r => r.nextDate && daysUntil(r.nextDate) <= 30).length;
  setText('dash-alerts', alerts);

  // Fuel records preview in modal
  const tbody = document.getElementById('dash-fuel-preview');
  if (tbody) {
    tbody.innerHTML = fuel.slice(0, 4).map(r => `
      <tr>
        <td>${r.date}</td>
        <td>${parseFloat(r.amount).toFixed(1)} L</td>
        <td>${fmt(r.cost)}</td>
        <td>${fmtDist(r.odometer)}</td>
        <td>${r.station}</td>
        <td>${r.consumption.toFixed(2)} L/100${s.units}</td>
      </tr>`).join('') || '<tr><td colspan="6" style="color:var(--muted);text-align:center">No records yet</td></tr>';
  }

  // Vehicle selector
  const sel = document.getElementById('dash-vehicle-select');
  if (sel) {
   sel.innerHTML = DB.vehicles.map(v2 =>
  `<option value="${v2.id}">${v2.make} ${v2.model} ${v2.year}</option>`
).join('');
  }
}


// ---- MY VEHICLES ----
async function renderMyVehicles() {
  const container = document.getElementById('vehicles-list-dynamic');
  if (!container) return;

  try {
    const response = await fetch(`api/get_vehicles.php?user_id=${user.id}`);
    const data = await response.json();

    if (!data.success || data.vehicles.length === 0) {
      container.innerHTML = emptyState('🚗', 'No vehicles yet', 'Add your first vehicle to start tracking fuel and maintenance.', 'openAddVehicleModal()', '+ Add Vehicle');
      return;
    }

    container.innerHTML = data.vehicles.map(v => `
  <div class="vehicle-card-large">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
      <div class="vehicle-title">${v.make} ${v.model}</div>
      <div style="display:flex;gap:8px;flex-shrink:0;">
        <button class="btn ghost" style="padding:6px 10px;font-size:0.8rem;" onclick="editVehicle('${v.id}')">Edit</button>
        <button class="btn ghost" style="padding:6px 10px;font-size:0.8rem;border-color:#e74c3c;color:#e74c3c;" onclick="confirmDeleteVehicle('${v.id}')">Delete</button>
      </div>
    </div>
    <div class="vehicle-meta-clean">
      <span><strong>Model:</strong> ${v.model}</span>
      <span><strong>Year:</strong> ${v.year}</span>
      <span><strong>Trim:</strong> ${v.trim || '—'}</span>
      <span><strong>Color:</strong> ${v.color || '—'}</span>
      <span><strong>Mileage:</strong> ${v.mileage ? v.mileage + ' km' : '—'}</span>
      <span><strong>Category:</strong> ${v.category || '—'}</span>
      <span><strong>Status:</strong>
        <span style="color:var(--accent)">Active</span>
      </span>
    </div>
    <div style="margin-top:16px;overflow:hidden;">
      <img src="${typeToImage(v.category)}" alt="${v.make} ${v.model}"
           style="width:100%;max-width:100%;max-height:180px;border-radius:14px;object-fit:cover;" />
    </div>
    <div style="margin-top:14px;">
      <span style="padding:6px 16px;border-radius:999px;background:var(--accent);color:#000;font-size:0.83rem;font-weight:700;">Active vehicle</span>
    </div>
  </div>`).join('');

 // Guardar primer vehículo como activo
    if (data.vehicles.length > 0) {
      window.activeVehicle = data.vehicles[0];
    }

  } catch (error) {
    container.innerHTML = '<p style="color:var(--muted)">❌ Error loading vehicles.</p>';
  }
}

function setActiveVehicle(id) {
  DB.setActiveVehicle(id);
  renderMyVehicles();
  showNotification('Active vehicle updated');
}

async function confirmDeleteVehicle(id) {
  if (!confirm('Delete this vehicle? This also removes all its fuel and maintenance records.')) return;

  try {
    const response = await fetch('api/delete_vehicle.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: id,
        user_id: user.id
      })
    });

    const data = await response.json();

    if (data.success) {
      showNotification('Vehicle deleted');
      await syncDataWithBackend();
      renderMyVehicles();
      renderDashboard();
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    alert('❌ Connection error. Please try again.');
  }
}


function openAddVehicleModal() {
  document.getElementById('vehicle-form').reset();
  document.getElementById('vehicle-form-id').value = '';
  setText('add-vehicle-modal-title', 'Add Vehicle');
  openModal('add-vehicle-modal');
}

function editVehicle(id) {
  const v = DB.vehicles.find(v => String(v.id) === String(id));
  if (!v) return;
  document.getElementById('vehicle-form-id').value   = v.id;
  document.getElementById('vf-name').value           = v.name;
  document.getElementById('vf-model').value          = v.model;
  document.getElementById('vf-year').value           = v.year;
  document.getElementById('vf-trim').value           = v.trim;
  document.getElementById('vf-color').value          = v.color;
  document.getElementById('vf-purchase-year').value  = v.purchaseYear;
  document.getElementById('vf-mileage').value        = v.mileage;
  document.getElementById('vf-plate').value          = v.plate;
  document.getElementById('vf-type').value           = v.type;
  document.getElementById('vf-status').value         = v.status;
  setText('add-vehicle-modal-title', 'Edit Vehicle');
  openModal('add-vehicle-modal');
}


async function saveVehicle(e) {
  e.preventDefault();
  const id = document.getElementById('vehicle-form-id').value;

  const vin      = document.getElementById('vf-vin').value.trim().toUpperCase();
  const name     = document.getElementById('vf-name').value;
  const model    = document.getElementById('vf-model').value;
  const year     = parseInt(document.getElementById('vf-year').value) || 0;
  const trim     = document.getElementById('vf-trim').value;
  const color    = document.getElementById('vf-color').value;
  const mileage  = parseFloat(document.getElementById('vf-mileage').value) || 0;
  const category = document.getElementById('vf-type').value;
  const make     = name.split(' ')[0];

  const endpoint = id ? 'api/edit_vehicle.php' : 'api/add_vehicle.php';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        vehicle_id: id,
        vin, make, model, year, trim, color, mileage, category,
        description: ''
      })
    });

    const data = await response.json();

    if (data.success) {
      showNotification('Vehicle saved successfully!');
      closeModal('add-vehicle-modal');
      await syncDataWithBackend();
      renderMyVehicles();
      renderDashboard();
      updateMaintenanceBadge();
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    alert('❌ Connection error. Please try again.');
  }
}

// ---- FUEL RECORDS ----
async function renderFuel() {
  const v = window.activeVehicle;
  if (!v) return;

  const s = DB.settings;
  setText('fuel-vehicle-title', `${v.make} ${v.model} ${v.year}`);

  try {
    const response = await fetch(`api/get_fuel.php?vehicle_id=${v.id}&user_id=${user.id}`);
    const data = await response.json();

    if (!data.success) return;
    const records = data.records;

    const now     = new Date();
    const month   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthly = records.filter(r => r.date.startsWith(month));
    const totalCost = monthly.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    const avgCons   = records.length ? records.reduce((sum, r) => sum + (r.km > 0 ? (parseFloat(r.amount) / parseFloat(r.km)) * 100 : 0), 0) / records.length : 0;
    const best      = records.length ? Math.min(...records.map(r => r.km > 0 ? (parseFloat(r.amount) / parseFloat(r.km)) * 100 : 0)) : 0;
    const bestRec   = records.find(r => r.km > 0 && (parseFloat(r.amount) / parseFloat(r.km)) * 100 === best);

    setText('fuel-total-cost',      `$${totalCost.toFixed(2)}`);
    setText('fuel-count',           `${monthly.length} fuel-up${monthly.length !== 1 ? 's' : ''}`);
    setText('fuel-avg-consumption', `${avgCons.toFixed(1)} L/100${s.units}`);
    setText('fuel-best-eff',        `${best.toFixed(1)} L/100${s.units}`);
    if (bestRec) {
      const d = new Date(bestRec.date);
      setText('fuel-best-eff-date', d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    const tbody = document.getElementById('fuel-table-body');
    if (tbody) {
      tbody.innerHTML = records.length
        ? records.map(r => `
            <tr>
              <td>${r.date}</td>
              <td>${parseFloat(r.amount).toFixed(1)} L</td>
              <td>$${parseFloat(r.cost).toFixed(2)}</td>
              <td>${r.odometer ? r.odometer + ' km' : '—'}</td>
              <td>${r.station || '—'}</td>
              <td>${r.km > 0 ? ((parseFloat(r.amount) / parseFloat(r.km)) * 100).toFixed(2) : '—'} L/100${s.units}</td>
              <td>
                <button class="btn ghost"
                  style="padding:4px 10px;font-size:0.8rem;border-color:#e74c3c;color:#e74c3c;"
                  onclick="deleteFuelRecord('${r.id}')">Delete</button>
              </td>
            </tr>`).join('')
        : `<tr><td colspan="7">${emptyState('⛽', 'No fuel records yet', 'Add your first fill-up using the button above.', 'openAddFuelModal()', '+ Add Record')}</td></tr>`;
    }

  } catch (error) {
    console.error('Error loading fuel records:', error);
  }
}

function openAddFuelModal() {
  document.getElementById('fuel-record-form').reset();
  document.getElementById('af-date').value = new Date().toISOString().split('T')[0];
  openModal('add-fuel-modal');
}

async function saveFuelRecord(e) {
  e.preventDefault();
  const v = window.activeVehicle;
  if (!v) {
    alert('Please select an active vehicle first.');
    return;
  }

  const amount    = parseFloat(document.getElementById('af-amount').value) || 0;
  const km        = parseFloat(document.getElementById('af-km').value) || 0;
  const cost      = parseFloat(document.getElementById('af-cost').value) || 0;
  const odometer  = parseFloat(document.getElementById('af-odometer').value) || 0;
  const station   = document.getElementById('af-station').value;
  const date      = document.getElementById('af-date').value;

  try {
    const response = await fetch('api/add_fuel.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: v.id,
        user_id: user.id,
        date, amount, cost, km, odometer, station
      })
    });

    const data = await response.json();

    if (data.success) {
      closeModal('add-fuel-modal');
      renderFuel();
      renderDashboard();
      showNotification('Fuel record added');
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    alert('❌ Connection error. Please try again.');
  }
}

async function deleteFuelRecord(id) {
  if (!confirm('Delete this fuel record?')) return;

  try {
    const response = await fetch('api/delete_fuel.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        record_id: id,
        user_id: user.id
      })
    });

    const data = await response.json();

    if (data.success) {
      renderFuel();
      renderDashboard();
      showNotification('Record deleted');
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    alert('❌ Connection error. Please try again.');
  }
}

// ---- FUEL CALCULATOR ----
function initFuelCalculator() {
  const form = document.getElementById('fuel-calc-form');
  if (!form) return;
  form.onsubmit = function (e) {
    e.preventDefault();
    const litros = parseFloat(document.getElementById('fuel-liters').value);
    const km     = parseFloat(document.getElementById('fuel-km').value);
    const result = document.getElementById('fuel-calc-result');
    if (litros > 0 && km > 0) {
      result.textContent = `Consumption: ${((litros / km) * 100).toFixed(2)} L/100${DB.settings.units}`;
    } else {
      showNotification('Enter valid values', 'error');
    }
  };
}

// ---- MAINTENANCE ----
async function renderMaintenance() {
  const v = window.activeVehicle;
  if (!v) return;

  setText('maint-vehicle-title', `${v.make} ${v.model} ${v.year}`);

  try {
    const response = await fetch(`api/get_maintenance.php?vehicle_id=${v.id}&user_id=${user.id}`);
    const data = await response.json();

    if (!data.success) return;
    const records = data.records;

    const upcoming = records
      .filter(r => r.next_date && daysUntil(r.next_date) > 0)
      .sort((a, b) => new Date(a.next_date) - new Date(b.next_date))[0];

    if (upcoming) {
      const days = daysUntil(upcoming.next_date);
      const el = document.getElementById('maint-next-due');
      if (el) { el.textContent = `${days} days`; el.style.color = days <= 14 ? '#e74c3c' : ''; }
      setText('maint-next-label', upcoming.type);
    } else {
      setText('maint-next-due', '—');
      setText('maint-next-label', 'No upcoming service');
    }

    // Timeline
    const timeline = document.getElementById('maintenance-timeline-list');
    if (timeline) {
      timeline.innerHTML = records.length ? records.map(r => {
        const label = new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const status = r.next_date
          ? (daysUntil(r.next_date) <= 0 ? 'overdue' : 'scheduled')
          : 'completed';
        const color = status === 'overdue' ? '#e74c3c' : status === 'scheduled' ? 'var(--accent)' : 'var(--muted)';
        return `<li>
          <strong>${label}:</strong> ${r.type}
          <span style="color:${color};margin-left:6px;">(${status})</span>
          ${r.notes ? `<span style="color:var(--muted);margin-left:6px;">— ${r.notes}</span>` : ''}
          <span style="float:right;color:var(--accent);">${fmt(r.price)}</span>
        </li>`;
      }).join('')
      : `<li>${emptyState('🔧', 'No maintenance records', 'Add your first service record using the button above.', 'openAddMaintenanceModal()', '+ Add Record')}</li>`;
    }

    // Table
    const tbody = document.getElementById('maint-table-body');
    if (tbody) {
      tbody.innerHTML = records.length
        ? records.map(r => `
            <tr>
              <td>${r.date}</td>
              <td>${r.type}</td>
              <td>${fmt(r.price)}</td>
              <td>${r.next_date || '—'}</td>
              <td>
                <button class="btn ghost"
                  style="padding:4px 10px;font-size:0.8rem;border-color:#e74c3c;color:#e74c3c;"
                  onclick="deleteMaintenanceRecord('${r.id}')">Delete</button>
              </td>
            </tr>`).join('')
        : '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">No maintenance records yet.</td></tr>';
    }

  } catch (error) {
    console.error('Error loading maintenance records:', error);
  }
}

function openAddMaintenanceModal() {
  document.getElementById('maint-record-form').reset();
  document.getElementById('mf-date').value = new Date().toISOString().split('T')[0];
  openModal('add-maintenance-modal');
}

async function saveMaintenanceRecord(e) {
  e.preventDefault();
  const v = window.activeVehicle;
  if (!v) {
    alert('Please select an active vehicle first.');
    return;
  }

  const date     = document.getElementById('mf-date').value;
  const type     = document.getElementById('mf-type').value;
  const price    = parseFloat(document.getElementById('mf-price').value) || 0;
  const notes    = document.getElementById('mf-notes').value;
  const nextDate = document.getElementById('mf-next-date').value || null;
  console.log('nextDate::', nextDate);

  try {
    const response = await fetch('api/add_maintenance.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vehicle_id: v.id,
        user_id: user.id,
        date, type, price, notes,
        next_date: nextDate
      })
    });

    const data = await response.json();

    if (data.success) {
      closeModal('add-maintenance-modal');
      renderMaintenance();
      renderDashboard();
      updateMaintenanceBadge();
      showNotification('Maintenance record added');
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    alert('❌ Connection error. Please try again.');
  }
}
async function deleteMaintenanceRecord(id) {
  if (!confirm('Delete this maintenance record?')) return;

  try {
    const response = await fetch('api/delete_maintenance.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        record_id: id,
        user_id: user.id
      })
    });

    const data = await response.json();

    if (data.success) {
      renderMaintenance();
      renderDashboard();
      showNotification('Record deleted');
    } else {
      alert('❌ ' + data.message);
    }
  } catch (error) {
    alert('❌ Connection error. Please try again.');
  }
}

// ---- REPORTS & CHARTS ----
let fuelChart = null;
let costChart = null;

async function renderReports() {
  const v = DB.getActiveVehicle();
  if (!v) return;

  let fuel = [];
  try {
    const fRes = await fetch(`api/get_fuel.php?vehicle_id=${v.id}&user_id=${user.id}`);
    const fData = await fRes.json();
    if (fData.success) fuel = fData.records;
  } catch (e) {
    console.error(e);
  }

  const maint = DB.getMaintenanceForVehicle(v.id);
  const s     = DB.settings;

  setText('report-total-fuel',  fmt(fuel.reduce((sum, r) => sum + r.cost, 0)));
  setText('report-total-maint', fmt(maint.reduce((sum, r) => sum + r.price, 0)));
  setText('report-total-dist',  fmtDist(v.mileage));

  // Maintenance history table
  const tbody = document.getElementById('report-maint-tbody');
  if (tbody) {
    tbody.innerHTML = maint.slice(0, 10).map(r => `
      <tr><td>${r.date}</td><td>${r.type}</td><td>${fmt(r.price)}</td></tr>
    `).join('') || '<tr><td colspan="3" style="color:var(--muted);text-align:center">No records</td></tr>';
  }

  if (typeof Chart === 'undefined') return;

  // Fuel efficiency line chart
  const fuelCtx = document.getElementById('fuel-chart');
  if (fuelCtx) {
    if (fuelChart) fuelChart.destroy();
    const sorted = [...fuel].reverse().slice(-12);
    fuelChart = new Chart(fuelCtx, {
      type: 'line',
      data: {
        labels: sorted.map(r => r.date.slice(5)),
        datasets: [{
          label: `L/100${s.units}`,
          data: sorted.map(r => r.consumption),
          backgroundColor: 'rgba(25,195,255,0.15)',
          borderColor: '#19c3ff',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#19c3ff'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a7b0c3' } },
          x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a7b0c3' } }
        }
      }
    });
  }

  // Monthly cost bar chart
  const costCtx = document.getElementById('cost-chart');
  if (costCtx) {
    if (costChart) costChart.destroy();
    const months = {};
    fuel.forEach(r => {
      const m = r.date.slice(0, 7);
      if (!months[m]) months[m] = { fuel: 0, maint: 0 };
      months[m].fuel += r.cost;
    });
    maint.forEach(r => {
      const m = r.date.slice(0, 7);
      if (!months[m]) months[m] = { fuel: 0, maint: 0 };
      months[m].maint += r.price;
    });
    const keys = Object.keys(months).sort().slice(-8);
    costChart = new Chart(costCtx, {
      type: 'bar',
      data: {
        labels: keys.map(m => m.slice(5)),
        datasets: [
          { label: 'Fuel',        data: keys.map(k => months[k].fuel  || 0), backgroundColor: 'rgba(25,195,255,0.75)' },
          { label: 'Maintenance', data: keys.map(k => months[k].maint || 0), backgroundColor: 'rgba(91,124,253,0.75)' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#a7b0c3' } } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a7b0c3' } },
          x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#a7b0c3' } }
        }
      }
    });
  }
}

// ---- EXPORT CSV ----
function exportCSV(type) {
  const v = DB.getActiveVehicle();
  if (!v) return;

  let csv = '', filename = '';
  const s = DB.settings;

  if (type === 'fuel') {
    csv = `Date,Amount (L),Cost (${s.currency}),Odometer (${s.units}),Station,Consumption (L/100${s.units})\n`;
    csv += DB.getFuelForVehicle(v.id)
      .map(r => `${r.date},${r.amount},${r.cost},${r.odometer},${r.station},${r.consumption}`)
      .join('\n');
    filename = `${v.name.replace(/\s/g,'_')}_fuel_records.csv`;
  } else {
    csv = `Date,Type,Price (${s.currency}),Next Date,Notes\n`;
    csv += DB.getMaintenanceForVehicle(v.id)
      .map(r => `${r.date},"${r.type}",${r.price},${r.nextDate || ''},"${r.notes || ''}"`)
      .join('\n');
    filename = `${v.name.replace(/\s/g,'_')}_maintenance_records.csv`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification('Download started');
}

// ---- SETTINGS ----
function renderSettings() {
  const s = DB.settings;
  setValue('s-owner-name', s.ownerName);
  setValue('s-units',      s.units);
  setValue('s-currency',   s.currency);
  setValue('s-symbol',     s.symbol);

  const sel = document.getElementById('s-active-vehicle');
  if (sel) {
    sel.innerHTML = DB.vehicles.map(v =>
      `<option value="${v.id}" ${DB.data.activeVehicleId === v.id ? 'selected' : ''}>${v.name} ${v.year}</option>`
    ).join('') || '<option value="">No vehicles</option>';
  }
}

function saveSettings(e) {
  e.preventDefault();

  const settings = {
    ownerName: document.getElementById('s-owner-name').value.trim() || 'User',
    units:     document.getElementById('s-units').value,
    currency:  document.getElementById('s-currency').value,
    symbol:    document.getElementById('s-symbol').value.trim() || '$'
  };

  const activeVehicle = document.getElementById('s-active-vehicle')?.value;
  if (activeVehicle) DB.setActiveVehicle(activeVehicle);

  DB.saveSettings(settings);
  updateTopbar();
  showNotification('Settings saved');
  renderDashboard();
}

// Auto-fill currency symbol when currency changes
function onCurrencyChange() {
  const map = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', CRC: '₡', MXN: '$', ARS: '$' };
  const sel = document.getElementById('s-currency');
  const sym = document.getElementById('s-symbol');
  if (sel && sym && map[sel.value]) sym.value = map[sel.value];
}

function resetAllData() {
  if (confirm('Reset ALL data to defaults? This cannot be undone.')) {
    DB.reset();
    renderDashboard();
    showNotification('Data reset to defaults');
  }
}

// ---- SEARCH ----
function initSearch() {
  const inputs = document.querySelectorAll('.search input');
  if (!inputs.length) return;
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      const val = this.value.toLowerCase().trim();
      document.querySelectorAll('.record-card, .vehicle-card-large').forEach(card => {
        card.style.display = !val || card.textContent.toLowerCase().includes(val) ? '' : 'none';
      });
    });
  });
}

// ---- MODAL HELPERS ----
function openModal(id) { 
  document.getElementById(id)?.classList.add('active'); 
  document.body.classList.add('modal-open');
}

function closeModal(id) { 
  document.getElementById(id)?.classList.remove('active'); 
  if (!document.querySelectorAll('.modal-bg.active').length) {
    document.body.classList.remove('modal-open');
  }
}

function initModals() {
  // Close when clicking the backdrop
  document.querySelectorAll('.modal-bg').forEach(modal => {
    modal.addEventListener('click', e => { 
      if (e.target === modal) {
        closeModal(modal.id);
      } 
    });
  });
  // Close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-bg');
      if (modal) closeModal(modal.id);
    });
  });
}

// ---- DOM HELPERS ----
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setValue(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

// ---- MOBILE NAV ----
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;

  const check = () => {
    const isMobile = window.innerWidth <= 1000;
    hamburger.style.display = isMobile ? 'flex' : 'none';
    if (!isMobile) mobileNav.style.display = 'none';
  };
  check();
  window.addEventListener('resize', check);

  hamburger.addEventListener('click', () => {
    mobileNav.style.display = 'flex';
  });

  const closeBtn = document.getElementById('mobile-nav-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileNav.style.display = 'none';
    });
  }

  // Cerrar al hacer clic en un link
  document.querySelectorAll('#mobile-nav a[data-section]').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.style.display = 'none';
    });
  });
}

// ---- INIT ----
async function syncDataWithBackend() {
  try {
    const vRes = await fetch(`api/get_vehicles.php?user_id=${user.id}`);
    const vData = await vRes.json();
    if (vData.success && vData.vehicles.length > 0) {
      // Usar SOLO los datos de MySQL, ignorar localStorage
      DB.data.vehicles = vData.vehicles;
      DB.data.activeVehicleId = vData.vehicles[0].id;
      window.activeVehicle = vData.vehicles[0];
      DB.save();
    } else {
      DB.data.vehicles = [];
      window.activeVehicle = null;
    }
  } catch (e) {
    console.error("Failed to sync backend data", e);
  }
}

  document.addEventListener('DOMContentLoaded', async function () {
  DB.load();
  DB.data.vehicles = []; // Limpiar vehículos viejos de localStorage
  await syncDataWithBackend();
  
  // Theme
  const savedMode = localStorage.getItem('themeMode');
  if (savedMode === 'light') setTheme('light');

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    setTheme(document.body.classList.contains('light-mode') ? 'dark' : 'light');
  });
  document.getElementById('mobile-theme-toggle')?.addEventListener('click', () => {
    setTheme(document.body.classList.contains('light-mode') ? 'dark' : 'light');
    document.getElementById('mobile-nav').style.display = 'none';
  });

  updateTopbar();

  // Navigation
  document.querySelectorAll('[data-section]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showSection(a.dataset.section);
    });
  });

  // Dashboard vehicle selector
  document.getElementById('dash-vehicle-select')?.addEventListener('change', function () {
    DB.setActiveVehicle(this.value);
    renderDashboard();
  });

  // CRUD forms
  document.getElementById('vehicle-form')?.addEventListener('submit', saveVehicle);
  document.getElementById('fuel-record-form')?.addEventListener('submit', saveFuelRecord);
  document.getElementById('maint-record-form')?.addEventListener('submit', saveMaintenanceRecord);
  document.getElementById('settings-form')?.addEventListener('submit', saveSettings);

  // Currency auto-fill
  document.getElementById('s-currency')?.addEventListener('change', onCurrencyChange);

  // Export buttons
  document.getElementById('export-fuel-csv')?.addEventListener('click', () => exportCSV('fuel'));
  document.getElementById('export-maint-csv')?.addEventListener('click', () => exportCSV('maintenance'));

  // Misc
  initFuelCalculator();
  initSearch();
  initMobileNav();
  initModals();

  // Restore last section
  const saved = localStorage.getItem('activeSection');
  showSection(SECTIONS.includes(saved) ? saved : 'dashboard');
  updateMaintenanceBadge();
  await loadNotifications();
});
// ==========================================
// VIN LOOKUP — NHTSA API
// ==========================================
async function lookupVIN() {
  const vin = document.getElementById('vf-vin').value.trim().toUpperCase();
  const msgDiv = document.getElementById('vin-message');
  const btn = document.getElementById('vin-lookup-btn');

  // Validar que el VIN tenga 17 caracteres
  if (vin.length !== 17) {
    msgDiv.style.display = 'block';
    msgDiv.className = 'auth-message error';
    msgDiv.textContent = '⚠️ VIN must be exactly 17 characters.';
    return;
  }

  // Mostrar loading
  btn.textContent = '⏳ Looking up...';
  btn.disabled = true;
  msgDiv.style.display = 'none';

  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    );
    const data = await response.json();
    const results = data.Results;

    // Funcion helper para extraer valores
    const getValue = (variable) => {
      const found = results.find(r => r.Variable === variable);
      return found && found.Value && found.Value !== 'Not Applicable' ? found.Value : '';
    };

    const make  = getValue('Make');
    const model = getValue('Model');
    const year  = getValue('Model Year');
    const trim  = getValue('Trim');
    const engine = getValue('Displacement (L)') 
                   ? `${getValue('Displacement (L)')}L ${getValue('Engine Configuration')}` 
                   : '';
    const fuelType     = getValue('Fuel Type - Primary');
    const transmission = getValue('Transmission Style');

    // Verificar que encontró datos
    if (!make && !model) {
      msgDiv.style.display = 'block';
      msgDiv.className = 'auth-message error';
      msgDiv.textContent = '❌ VIN not found. Please check and try again.';
      return;
    }

    // Llenar el formulario automáticamente
    document.getElementById('vf-name').value  = `${make} ${model}`;
    document.getElementById('vf-model').value = model;
    document.getElementById('vf-year').value  = year;
    document.getElementById('vf-trim').value  = trim;

    // Mostrar éxito
    msgDiv.style.display = 'block';
    msgDiv.className = 'auth-message success';
    msgDiv.textContent = `✅ Found: ${year} ${make} ${model}`;

  } catch (error) {
    msgDiv.style.display = 'block';
    msgDiv.className = 'auth-message error';
    msgDiv.textContent = '❌ Connection error. Please try again.';
  } finally {
    btn.textContent = '🔍 Lookup VIN';
    btn.disabled = false;
  }
}

  // ==========================================
// NOTIFICATIONS
// ==========================================
async function loadNotifications() {
  try {
    const response = await fetch(`api/get_notifications.php?user_id=${user.id}`);
    const data = await response.json();
    if (!data.success) return;

    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (data.unread > 0) {
        badge.style.display = 'block';
        badge.textContent = data.unread > 9 ? '9+' : data.unread;
      } else {
        badge.style.display = 'none';
      }
    }

    const list = document.getElementById('notif-list');
    if (!list) return;

    if (data.notifications.length === 0) {
      list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--muted);">No notifications yet</div>`;
      return;
    }

    list.innerHTML = data.notifications.map(n => `
      <div style="padding:14px 18px;border-bottom:1px solid var(--border);
                  background:${n.is_read == 0 ? 'rgba(25,195,255,0.06)' : 'transparent'};
                  cursor:pointer;"
           onclick="handleNotificationClick('${n.type}')">
        <div style="font-weight:${n.is_read == 0 ? '600' : '400'};font-size:0.95rem;margin-bottom:4px;">${n.title}</div>
        <div style="font-size:0.85rem;color:var(--muted);">${n.message}</div>
        <div style="font-size:0.75rem;color:var(--muted);margin-top:4px;">
          ${new Date(n.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notif-dropdown');
  if (!dropdown) return;
  const isVisible = dropdown.style.display !== 'none';
  dropdown.style.display = isVisible ? 'none' : 'block';
  if (!isVisible) loadNotifications();
}

async function markAllRead() {
  try {
    await fetch('api/mark_notifications_read.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id })
    });
    loadNotifications();
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
}

function handleNotificationClick(type) {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  if (type === 'maintenance') showSection('maintenance');
  else if (type === 'fuel') showSection('fuel');
  else if (type === 'welcome') showSection('my-vehicles');
  markAllRead();
}


