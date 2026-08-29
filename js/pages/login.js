// ============================================================
// MAPEL - pages/login.js
// Render & logic halaman login. Dipanggil dari app.js khusus
// saat path saat ini adalah /pages/auth/login.html.
// ============================================================

import { auth } from '../core/auth.js';
import { router } from '../core/router.js';
import { roleService, DISPOSISI_CHAIN, ROLE_LABELS } from '../core/role.js';
import { SEED_USERS } from '../../data/users.js';

function renderRouteTrail() {
  return DISPOSISI_CHAIN.map((role) => `
    <li class="auth-route__node">
      <span class="auth-route__dot" aria-hidden="true"></span>
      <span class="auth-route__label">${ROLE_LABELS[role]}</span>
    </li>
  `).join('');
}

function renderDemoAccounts() {
  return SEED_USERS.map((user) => `
    <li>
      <code>${user.username}</code>
      <span>${ROLE_LABELS[user.role]}</span>
    </li>
  `).join('');
}

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="auth-layout">
      <aside class="auth-brand">
        <div class="auth-brand__top">
          <p class="auth-brand__eyebrow eyebrow">Sistem Manajemen Perangkat Lunak</p>
          <div class="auth-brand__logo-row">
            <img class="auth-brand__logo" src="/assets/img/logo.png" alt="Logo MAPEL" width="38" height="38">
            <h1 class="auth-brand__wordmark">MAPEL</h1>
          </div>
          <p class="auth-brand__desc">
            Satu jalur resmi untuk mengajukan, mendisposisikan, dan mereviu
            Proposal &amp; Konsep Perangkat Lunak.
          </p>
        </div>
        <ol class="auth-route" aria-label="Alur disposisi dokumen">
          ${renderRouteTrail()}
        </ol>
      </aside>

      <section class="auth-panel">
        <div class="auth-card">
          <h2 class="auth-card__heading">Masuk</h2>
          <p class="auth-card__subheading">Gunakan akun yang terdaftar sesuai peran Anda.</p>

          <form id="login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" autocomplete="username" required autofocus>
            </div>

            <div class="form-group">
              <label for="password">Kata Sandi</label>
              <div class="auth-password-field">
                <input type="password" id="password" name="password" autocomplete="current-password" required>
                <button type="button" class="auth-password-toggle" id="toggle-password" aria-label="Tampilkan kata sandi">Lihat</button>
              </div>
            </div>

            <p class="auth-error" id="login-error" role="alert" hidden></p>

            <button type="submit" class="btn btn-primary btn-block auth-submit" id="submit-btn">Masuk</button>
          </form>

          <details class="auth-demo">
            <summary>Lihat akun demo</summary>
            <ul class="auth-demo__list">
              ${renderDemoAccounts()}
            </ul>
            <p class="auth-demo__note">Kata sandi semua akun demo: <code>mapel123</code></p>
          </details>
        </div>
      </section>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('submit-btn');
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  toggleBtn.addEventListener('click', () => {
    const willShow = passwordInput.type === 'password';
    passwordInput.type = willShow ? 'text' : 'password';
    toggleBtn.textContent = willShow ? 'Sembunyikan' : 'Lihat';
    toggleBtn.setAttribute('aria-label', willShow ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    hideError();

    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      showError('Username dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    // Delay kecil biar loading state kelihatan -- ini prototype
    // tanpa network beneran, auth.login() sebenarnya instan.
    setTimeout(() => {
      const result = auth.login(username, password);

      if (!result.ok) {
        setLoading(false);
        showError(result.message);
        return;
      }

      router.navigate(roleService.getDefaultRoute(result.user.role));
    }, 250);
  });

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Memproses…' : 'Masuk';
  }
}

export function initLoginPage() {
  render();
}