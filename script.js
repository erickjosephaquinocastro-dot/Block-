const authSection = document.getElementById('auth-section');
const blogSection = document.getElementById('blog-section');
const welcomeText = document.getElementById('welcome-text');
const logoutBtn = document.getElementById('logoutBtn');
const tabs = document.querySelectorAll('.auth-tab');
const authViews = document.querySelectorAll('.auth-view');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const registerUsername = document.getElementById('registerUsername');
const registerDisplayName = document.getElementById('registerDisplayName');
const registerAvatar = document.getElementById('registerAvatar');
const registerPassword = document.getElementById('registerPassword');
const registerConfirmPassword = document.getElementById('registerConfirmPassword');
const newPostBtn = document.getElementById('newPostBtn');
const postFormSection = document.getElementById('postFormSection');
const postForm = document.getElementById('postForm');
const postTitle = document.getElementById('postTitle');
const postContent = document.getElementById('postContent');
const cancelPostBtn = document.getElementById('cancelPostBtn');
const postDetailSection = document.getElementById('postDetailSection');
const postDetail = document.getElementById('postDetail');
const editPostBtn = document.getElementById('editPostBtn');
const deletePostBtn = document.getElementById('deletePostBtn');
const postList = document.getElementById('postList');
const formTitle = document.getElementById('formTitle');
const profileAvatar = document.getElementById('profileAvatar');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileFormSection = document.getElementById('profileFormSection');
const profileForm = document.getElementById('profileForm');
const profileDisplayName = document.getElementById('profileDisplayName');
const profileAvatarUrl = document.getElementById('profileAvatarUrl');
const profileBioField = document.getElementById('profileBioInput');
const previewAvatar = document.getElementById('previewAvatar');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');

let currentUser = null;
let selectedPostId = null;
let isEditing = false;
let pendingConfirm = null;

const USERS_KEY = 'blog_users';
const CURRENT_USER_KEY = 'blog_current_user';
const POSTS_KEY = 'blog_posts';
const THEME_KEY = 'blog_theme';

function getUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function setCurrentUser(username) {
  localStorage.setItem(CURRENT_USER_KEY, username);
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function getPosts() {
  const stored = localStorage.getItem(POSTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function savePosts(posts) {
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

function getUser(username) {
  return getUsers().find(user => user.username === username);
}

function updateUser(user) {
  const users = getUsers();
  const index = users.findIndex(item => item.username === user.username);
  if (index >= 0) {
    users[index] = user;
    saveUsers(users);
  }
}

function getInitialAvatar(username) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2E6EF7&color=fff&size=128`;
}

function openOverlay() {
  overlay.classList.remove('hidden');
}

function closeOverlay() {
  overlay.classList.add('hidden');
  modalConfirmBtn.classList.add('hidden');
  modalCancelBtn.classList.add('hidden');
  pendingConfirm = null;
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    if (themeToggle) themeToggle.textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    if (themeToggle) themeToggle.textContent = '🌙';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(savedTheme);
}

function showNotification(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2400);
}

function showModal(title, message, options = {}) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  if (options.confirmText) {
    modalConfirmBtn.textContent = options.confirmText;
    modalConfirmBtn.classList.remove('hidden');
    pendingConfirm = options.onConfirm;
  }
  if (options.cancelText) {
    modalCancelBtn.textContent = options.cancelText;
    modalCancelBtn.classList.remove('hidden');
  }
  openOverlay();
}

function verifyImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function setAvatarElement(element, avatarUrl, name) {
  element.innerHTML = '';
  if (verifyImageUrl(avatarUrl)) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.alt = `${name} avatar`;
    element.appendChild(img);
  } else {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0].toUpperCase())
      .join('');
    element.textContent = initials || 'U';
  }
}

function renderProfile() {
  const user = getUser(currentUser);
  if (!user) return;
  profileName.textContent = user.displayName || user.username;
  profileUsername.textContent = `@${user.username}`;
  profileBio.textContent = user.bio || 'Tu perfil está listo. Pulsa editar para cambiarlo.';
  setAvatarElement(profileAvatar, user.avatarUrl || getInitialAvatar(user.username), user.displayName || user.username);
}

function highlightTab(targetId) {
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.target === targetId);
  });
  authViews.forEach(view => {
    view.classList.toggle('hidden', view.id !== targetId);
  });
}

function hashPassword(password) {
  const encoder = new TextEncoder();
  return crypto.subtle.digest('SHA-256', encoder.encode(password)).then(hashBuffer => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  });
}

function updateHeader() {
  if (currentUser) {
    const user = getUser(currentUser);
    welcomeText.textContent = `Hola, ${user.displayName || currentUser}. Administra tu blog aquí.`;
    logoutBtn.classList.remove('hidden');
  } else {
    welcomeText.textContent = 'Inicia sesión o regístrate para comenzar.';
    logoutBtn.classList.add('hidden');
  }
}

function renderPosts() {
  const posts = getPosts().filter(post => post.author === currentUser).sort((a, b) => new Date(b.date) - new Date(a.date));
  postList.innerHTML = '';

  if (!posts.length) {
    postList.innerHTML = '<p class="muted">No hay publicaciones. Crea tu primera entrada.</p>';
    return;
  }

  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    const title = document.createElement('h3');
    title.textContent = post.title;
    const date = document.createElement('small');
    date.textContent = new Date(post.date).toLocaleString();

    card.appendChild(title);
    card.appendChild(date);
    card.addEventListener('click', () => showPostDetail(post.id));
    postList.appendChild(card);
  });
}

function showPostDetail(postId) {
  const posts = getPosts();
  const post = posts.find(item => item.id === postId);
  if (!post) return;

  selectedPostId = post.id;
  postDetail.innerHTML = `
    <h2 class="post-detail-title">${post.title}</h2>
    <small class="muted">${new Date(post.date).toLocaleString()}</small>
    <p class="post-detail-body">${post.content}</p>
  `;
  postDetailSection.classList.remove('hidden');
  postFormSection.classList.add('hidden');
  profileFormSection.classList.add('hidden');
}

function openPostForm(edit = false) {
  postDetailSection.classList.add('hidden');
  profileFormSection.classList.add('hidden');
  postFormSection.classList.remove('hidden');
  formTitle.textContent = edit ? 'Editar publicación' : 'Nueva publicación';

  if (edit && selectedPostId) {
    const post = getPosts().find(item => item.id === selectedPostId);
    if (!post) return;
    postTitle.value = post.title;
    postContent.value = post.content;
    isEditing = true;
  } else {
    postForm.reset();
    isEditing = false;
  }
}

function closePostForm() {
  postFormSection.classList.add('hidden');
  postForm.reset();
  isEditing = false;
}

function openProfileForm() {
  postFormSection.classList.add('hidden');
  postDetailSection.classList.add('hidden');
  profileFormSection.classList.remove('hidden');
  const user = getUser(currentUser);
  if (!user) return;
  profileDisplayName.value = user.displayName || user.username;
  profileAvatarUrl.value = user.avatarUrl || '';
  profileBioField.value = user.bio || '';
  setAvatarElement(previewAvatar, user.avatarUrl || getInitialAvatar(user.username), user.displayName || user.username);
}

function closeProfileForm() {
  profileFormSection.classList.add('hidden');
  profileForm.reset();
}

function loadApp() {
  initTheme();
  currentUser = getCurrentUser();
  updateHeader();

  if (currentUser) {
    authSection.classList.add('hidden');
    blogSection.classList.remove('hidden');
    renderProfile();
    renderPosts();
  } else {
    authSection.classList.remove('hidden');
    blogSection.classList.add('hidden');
  }
}

tabs.forEach(tab => {
  tab.addEventListener('click', event => {
    const targetTab = event.currentTarget;
    highlightTab(targetTab.dataset.target);
  });
});

loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    return showNotification('Completa los datos del inicio de sesión.');
  }

  const hashed = await hashPassword(password);
  const user = getUser(username);

  if (!user || user.passwordHash !== hashed) {
    return showNotification('Credenciales incorrectas. Verifica tu usuario y contraseña.');
  }

  setCurrentUser(username);
  loginForm.reset();
  loadApp();
  showNotification('Bienvenido de nuevo.');
});

registerForm.addEventListener('submit', async event => {
  event.preventDefault();
  const username = registerUsername.value.trim();
  const displayName = registerDisplayName.value.trim();
  const avatarUrl = registerAvatar.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;

  if (!username || !displayName || !password || !confirmPassword) {
    return showNotification('Completa todos los campos del registro.');
  }

  if (password !== confirmPassword) {
    return showNotification('Las contraseñas no coinciden.');
  }

  const users = getUsers();
  if (users.some(user => user.username === username)) {
    return showNotification('Ya existe un usuario con ese nombre. Elige otro.');
  }

  const passwordHash = await hashPassword(password);
  users.push({
    username,
    displayName,
    avatarUrl: avatarUrl || getInitialAvatar(username),
    bio: '',
    passwordHash,
  });
  saveUsers(users);
  setCurrentUser(username);
  registerForm.reset();
  loadApp();
  showNotification('Cuenta creada correctamente.');
});

logoutBtn.addEventListener('click', () => {
  clearCurrentUser();
  currentUser = null;
  selectedPostId = null;
  closeProfileForm();
  closePostForm();
  loadApp();
});

newPostBtn.addEventListener('click', () => {
  openPostForm(false);
});

cancelPostBtn.addEventListener('click', () => {
  closePostForm();
});

editProfileBtn.addEventListener('click', () => {
  openProfileForm();
});

profileAvatarUrl.addEventListener('input', event => {
  const url = event.target.value.trim();
  const user = getUser(currentUser);
  setAvatarElement(previewAvatar, verifyImageUrl(url) ? url : getInitialAvatar(user.username), user.displayName || user.username);
});

profileForm.addEventListener('submit', event => {
  event.preventDefault();
  const displayName = profileDisplayName.value.trim();
  const avatarUrl = profileAvatarUrl.value.trim();
  const bio = profileBioField.value.trim();

  if (!displayName) {
    return showNotification('El nombre visible es obligatorio.');
  }

  const user = getUser(currentUser);
  if (!user) return;

  user.displayName = displayName;
  user.avatarUrl = avatarUrl || getInitialAvatar(user.username);
  user.bio = bio;
  updateUser(user);
  renderProfile();
  closeProfileForm();
  showNotification('Perfil actualizado correctamente.');
});

cancelProfileBtn.addEventListener('click', () => {
  closeProfileForm();
});

postForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = postTitle.value.trim();
  const content = postContent.value.trim();

  if (!title || !content) {
    return showNotification('El título y contenido son obligatorios.');
  }

  const posts = getPosts();
  const now = new Date().toISOString();

  if (isEditing && selectedPostId) {
    const index = posts.findIndex(post => post.id === selectedPostId);
    if (index >= 0) {
      posts[index] = { ...posts[index], title, content, date: now };
      savePosts(posts);
      renderPosts();
      showPostDetail(selectedPostId);
      showNotification('Publicación actualizada con éxito.');
    }
  } else {
    const newPost = {
      id: `post_${Date.now()}`,
      title,
      content,
      date: now,
      author: currentUser,
    };
    posts.push(newPost);
    savePosts(posts);
    renderPosts();
    showPostDetail(newPost.id);
    showNotification('Publicación creada correctamente.');
  }

  postForm.reset();
  postFormSection.classList.add('hidden');
});

editPostBtn.addEventListener('click', () => {
  if (!selectedPostId) return;
  openPostForm(true);
});

deletePostBtn.addEventListener('click', () => {
  if (!selectedPostId) return;
  showModal('Eliminar publicación', '¿Deseas eliminar esta publicación? Esta acción no se puede deshacer.', {
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    onConfirm: () => {
      const posts = getPosts().filter(post => post.id !== selectedPostId);
      savePosts(posts);
      selectedPostId = null;
      renderPosts();
      postDetailSection.classList.add('hidden');
      closeOverlay();
      showNotification('Publicación eliminada.');
    },
  });
});

modalConfirmBtn.addEventListener('click', () => {
  if (pendingConfirm) pendingConfirm();
});

modalCancelBtn.addEventListener('click', () => {
  closeOverlay();
});

closeModalBtn.addEventListener('click', () => {
  closeOverlay();
});

overlay.addEventListener('click', event => {
  if (event.target === overlay) closeOverlay();
});

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  });
}

window.addEventListener('load', loadApp);
