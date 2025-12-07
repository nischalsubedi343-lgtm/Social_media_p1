// ========== Simple front-end social app using localStorage ==========

// --- Helpers for storage ---
function getStorage(key, defaultVal){ try { return JSON.parse(localStorage.getItem(key)) || defaultVal } catch(e){ return defaultVal } }
function setStorage(key, val){ localStorage.setItem(key, JSON.stringify(val)) }

// Initialize storage if not present
if(!localStorage.getItem('ms_posts')) setStorage('ms_posts', []);
if(!localStorage.getItem('ms_profile')) setStorage('ms_profile', {name:'Your Name', bio:'Hello!', avatar:'https://via.placeholder.com/120'});
if(!localStorage.getItem('ms_friends')) setStorage('ms_friends', []);
if(!localStorage.getItem('ms_stories')) setStorage('ms_stories', []);
if(!localStorage.getItem('ms_chats')) setStorage('ms_chats', {}); // keyed by friendName -> messages array

// ---------------- Dark mode ----------------
(function initDark(){
  const btns = document.querySelectorAll('#darkToggle');
  btns.forEach(b=> b && b.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    b.textContent = document.body.classList.contains('dark')?'Light':'Dark';
  }));
})();

// ---------------- Posts ----------------
function createPost(){
  const text = document.getElementById('postText').value || '';
  let imgData = document.getElementById('previewBox')?.dataset?.img || null;

  if(text.trim() === '' && !imgData){ alert('Write something or choose an image'); return; }

  const posts = getStorage('ms_posts', []);
  posts.unshift({
    id: Date.now(),
    text: text,
    image: imgData,
    likes: 0,
    comments: []
  });
  setStorage('ms_posts', posts);
  document.getElementById('postText').value = '';
  clearPreview();
  renderAll();
}

// preview image for new post
function previewPostImage(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=> {
    const preview = document.getElementById('previewBox');
    preview.innerHTML = `<img src="${reader.result}" alt="preview">`;
    preview.dataset.img = reader.result;
  }
  reader.readAsDataURL(file);
}
function clearPreview(){
  const p = document.getElementById('previewBox');
  if(p){ p.innerHTML=''; delete p.dataset.img; }
}

function renderAll(){
  renderPosts();
  renderProfilePreview();
  renderStories();
  renderFriends();
  renderChatFriends();
}

// Render posts feed
function renderPosts(){
  const feed = document.getElementById('feed');
  if(!feed) return;
  const posts = getStorage('ms_posts', []);
  feed.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'post card';
    div.innerHTML = `
      <div><strong>${getStorage('ms_profile').name}</strong></div>
      <p>${escapeHtml(post.text)}</p>
      ${post.image? `<img class="post-image" src="${post.image}">`: ''}
      <div class="row">
        <button class="like-btn" onclick="likePost(${post.id})">Like (${post.likes})</button>
      </div>
      <div class="comment-row">
        <input placeholder="Write comment..." id="cinput_${post.id}">
        <button class="btn" onclick="addComment(${post.id})">Comment</button>
      </div>
      <div class="comments" id="comments_${post.id}"></div>
    `;
    feed.appendChild(div);
    renderComments(post.id);
  });
}

function likePost(id){
  const posts = getStorage('ms_posts', []);
  const p = posts.find(x=>x.id===id);
  if(p){ p.likes++; setStorage('ms_posts', posts); renderPosts(); }
}

function addComment(id){
  const input = document.getElementById('cinput_'+id);
  if(!input) return;
  const text = input.value.trim();
  if(!text) return;
  const posts = getStorage('ms_posts', []);
  const p = posts.find(x=>x.id===id);
  p.comments.push({text, time: Date.now()});
  setStorage('ms_posts', posts);
  input.value='';
  renderComments(id);
}

function renderComments(id){
  const posts = getStorage('ms_posts', []);
  const p = posts.find(x=>x.id===id);
  const box = document.getElementById('comments_'+id);
  if(!box) return;
  box.innerHTML = '';
  p.comments.forEach(c=>{
    const el = document.createElement('div');
    el.style.fontSize='14px';
    el.style.marginTop='6px';
    el.textContent = `${getStorage('ms_profile').name}: ${c.text}`;
    box.appendChild(el);
  });
}

// ---------------- Profile ----------------
function previewAvatar(e){
  const file = e.target.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = ()=> {
    document.getElementById('avatar').src = r.result;
    document.getElementById('avatar').dataset.preview = r.result;
    renderProfilePreview();
  };
  r.readAsDataURL(file);
}

function loadProfileToForm(){
  const p = getStorage('ms_profile', {});
  document.getElementById('avatar').src = p.avatar || 'https://via.placeholder.com/120';
  document.getElementById('nameInput').value = p.name || '';
  document.getElementById('bioInput').value = p.bio || '';
  renderProfilePreview();
}

function saveProfile(){
  const name = document.getElementById('nameInput').value || 'Your Name';
  const bio = document.getElementById('bioInput').value || '';
  const avatar = document.getElementById('avatar').dataset.preview || document.getElementById('avatar').src;
  setStorage('ms_profile', {name, bio, avatar});
  alert('Profile saved');
  renderAll();
}

function resetProfile(){
  localStorage.removeItem('ms_profile');
  setStorage('ms_profile', {name:'Your Name', bio:'Hello!', avatar:'https://via.placeholder.com/120'});
  loadProfileToForm();
}

// small profile preview used in many pages
function renderProfilePreview(){
  const box = document.getElementById('profilePreview');
  if(!box) return;
  const p = getStorage('ms_profile', {});
  box.innerHTML = `<div style="display:flex;gap:12px;align-items:center">
    <img src="${p.avatar}" style="width:64px;border-radius:8px">
    <div><strong>${escapeHtml(p.name)}</strong><div style="font-size:13px">${escapeHtml(p.bio)}</div></div>
  </div>`;
}

// ---------------- Stories ----------------
function previewStoryImage(e){
  const file = e.target.files[0]; if(!file) return;
  const r = new FileReader();
  r.onload = ()=> document.getElementById('storyImage').dataset.preview = r.result;
  r.readAsDataURL(file);
}
function addStory(){
  const img = document.getElementById('storyImage').dataset.preview;
  const text = document.getElementById('storyText').value || '';
  if(!img){ alert('Choose an image'); return; }
  const s = getStorage('ms_stories', []);
  s.unshift({id:Date.now(), img, text});
  setStorage('ms_stories', s);
  document.getElementById('storyText').value='';
  delete document.getElementById('storyImage').dataset.preview;
  renderStories();
}
function renderStories(){
  const box = document.getElementById('storiesList');
  if(!box) return;
  const s = getStorage('ms_stories', []);
  box.innerHTML = '';
  s.forEach(st => {
    const div = document.createElement('div');
    div.className='story';
    div.innerHTML = `<img src="${st.img}"><div class="story-title">${escapeHtml(st.text)}</div>`;
    div.onclick = ()=> showStory(st);
    box.appendChild(div);
  });
}
function showStory(s){
  const w = window.open('', '_blank', 'width=420,height=720');
  w.document.write(`<img src="${s.img}" style="width:100%"><div style="padding:8px">${escapeHtml(s.text)}</div>`);
}

// ---------------- Friends ----------------
function addFriend(){
  const name = (document.getElementById('friendName')?.value || '').trim();
  if(!name){ alert('Enter name'); return; }
  const f = getStorage('ms_friends', []);
  if(f.find(x=>x===name)){ alert('Already friend'); return; }
  f.push(name);
  setStorage('ms_friends', f);
  document.getElementById('friendName').value='';
  renderFriends();
  renderChatFriends();
}
function renderFriends(){
  const box = document.getElementById('friendsList');
  if(!box) return;
  const f = getStorage('ms_friends', []);
  box.innerHTML = '';
  f.forEach(name => {
    const div = document.createElement('div');
    div.className='friend';
    div.innerHTML = `<div>${escapeHtml(name)}</div>
      <div><button class="btn" onclick="startChat('${escapeJs(name)}')">Chat</button>
      <button class="small-btn" onclick="removeFriend('${escapeJs(name)}')">Remove</button></div>`;
    box.appendChild(div);
  });
}
function removeFriend(name){
  let f = getStorage('ms_friends', []);
  f = f.filter(x=>x!==name);
  setStorage('ms_friends', f);
  renderFriends(); renderChatFriends();
}

// ---------------- Chat ----------------
let currentChat = null;
function renderChatFriends(){
  const box = document.getElementById('chatFriends');
  if(!box) return;
  const f = getStorage('ms_friends', []);
  box.innerHTML = '';
  f.forEach(name=>{
    const d = document.createElement('div');
    d.className = 'friend';
    d.innerHTML = `<div>${escapeHtml(name)}</div><div><button class="btn" onclick="startChat('${escapeJs(name)}')">Open</button></div>`;
    box.appendChild(d);
  });
}
function startChat(name){
  currentChat = name;
  document.getElementById('chatWith').textContent = `Chat with ${name}`;
  renderMessages();
}
function sendMessage(){
  if(!currentChat){ alert('Select friend'); return; }
  const text = document.getElementById('chatInput').value.trim();
  if(!text) return;
  const chats = getStorage('ms_chats', {});
  chats[currentChat] = chats[currentChat] || [];
  chats[currentChat].push({from:'me', text, time:Date.now()});
  setStorage('ms_chats', chats);
  document.getElementById('chatInput').value='';
  renderMessages();
}
function renderMessages(){
  const box = document.getElementById('messages');
  if(!box) return;
  const chats = getStorage('ms_chats', {});
  const arr = chats[currentChat] || [];
  box.innerHTML = '';
  arr.forEach(m=>{
    const el = document.createElement('div');
    el.className = 'message ' + (m.from==='me'?'me':'them');
    el.textContent = m.text;
    box.appendChild(el);
  });
  box.scrollTop = box.scrollHeight;
}

// ---------------- Utilities ----------------
function escapeHtml(str=''){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function escapeJs(s=''){ return s.replace(/'/g,"\\'"); }
