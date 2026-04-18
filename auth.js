function switchTab(tab) {
  const loginForm = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');

  if (tab === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabSignup.classList.add('active');
  }
}

async function handleSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errorDiv = document.getElementById('signup-error');
  const successDiv = document.getElementById('signup-success');

  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  if (!name || !email || !password) {
    errorDiv.textContent = 'All fields are required.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('api/signup.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      successDiv.textContent = '✅ Account created! You can now sign in.';
      successDiv.style.display = 'block';
      setTimeout(() => switchTab('login'), 2000);
    } else {
      errorDiv.textContent = data.message;
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Connection error. Please try again.';
    errorDiv.style.display = 'block';
  }
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');

  errorDiv.style.display = 'none';

  if (!email || !password) {
    errorDiv.textContent = 'All fields are required.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('api/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('autopulse_user', JSON.stringify(data.user));
      window.location.href = 'index.html';
    } else {
      errorDiv.textContent = data.message;
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    errorDiv.textContent = 'Connection error. Please try again.';
    errorDiv.style.display = 'block';
  }
}