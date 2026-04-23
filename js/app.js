// ==================== NAVIGATION ====================
function navigateTo(page, projectId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  window.scrollTo(0, 0);

  if (page === 'home') {
    document.getElementById('page-home').classList.add('active');
    initReveal();
  } else if (page === 'detail') {
    renderDetail(projectId);
    document.getElementById('page-detail').classList.add('active');
  } else if (page === 'create') {
    document.getElementById('page-create').classList.add('active');
  } else if (page === 'dashboard') {
    document.getElementById('page-dashboard').classList.add('active');
    renderBadges();
  } else if (page === 'profile') {
    renderProfile(projectId);
    document.getElementById('page-profile').classList.add('active');
  } else if (page === 'leaderboard') {
    renderLeaderboard('xp');
    document.getElementById('page-leaderboard').classList.add('active');
  } else if (page === 'settings') {
    document.getElementById('page-settings').classList.add('active');
  } else if (page === 'showcase') {
    renderShowcase();
    document.getElementById('page-showcase').classList.add('active');
  } else if (page === 'login') {
    document.getElementById('page-login').classList.add('active');
  } else if (page === 'register') {
    document.getElementById('page-register').classList.add('active');
  }
}

// ==================== RENDER PROJECTS ====================
// ==================== SEARCH & FILTER ====================
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';
let currentSearchQuery = '';

function handleSearch() {
  currentSearchQuery = document.getElementById('search-input').value.trim().toLowerCase();
  applyFilters();
}

function filterByCategory(cat, btn) {
  document.querySelectorAll('.search-filter-chip').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  currentCategoryFilter = cat;
  applyFilters();
}

function filterProjects(status, btn) {
  if (btn) {
    document.querySelectorAll('.search-filter-chip').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  currentStatusFilter = status;
  applyFilters();
}

function applyFilters() {
  let filtered = projects;

  if (currentCategoryFilter !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategoryFilter);
  }

  if (currentStatusFilter !== 'all') {
    filtered = filtered.filter(p => p.status === currentStatusFilter);
  }

  if (currentSearchQuery) {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(currentSearchQuery) ||
      p.desc.toLowerCase().includes(currentSearchQuery) ||
      p.roles.some(r => r.name.toLowerCase().includes(currentSearchQuery))
    );
  }

  const grid = document.getElementById('projects-grid');
  const noResults = document.getElementById('no-results');
  const info = document.getElementById('search-results-info');

  if (filtered.length === 0) {
    grid.style.display = 'none';
    noResults.style.display = 'block';
    info.textContent = '';
  } else {
    grid.style.display = '';
    noResults.style.display = 'none';
    info.textContent = `找到 ${filtered.length} 个项目`;
  }

  const statusMap = { open: '招募中', progress: '进行中', done: '已完成' };
  const tagClass = { open: 'tag-open', progress: 'tag-progress', done: 'tag-done' };

  grid.innerHTML = filtered.map(p => {
    const allMembers = p.roles.flatMap(r => r.members);
    const avatarHtml = allMembers.slice(0, 3).map(m =>
      `<div class="member-avatar" style="background:${m.color};">${m.name[0]}</div>`
    ).join('') + (allMembers.length > 3 ? `<div class="member-avatar" style="background:var(--warm-gray);">+${allMembers.length - 3}</div>` : '');
    const rolesHtml = p.roles.map(r =>
      `<span class="role-badge ${r.filled >= r.needed ? 'filled' : 'open'}"><span class="role-dot ${r.filled >= r.needed ? 'green' : 'red'}"></span>${r.name}</span>`
    ).join('');
    const btnText = p.status === 'done' ? '查看成果 →' : '查看详情 →';
    return `
      <div class="project-card reveal visible" onclick="navigateTo('detail', ${p.id})">
        <span class="card-tag ${tagClass[p.status]}">${statusMap[p.status]}</span>
        <h3>${p.title}</h3>
        <p class="desc">${p.desc}</p>
        <div class="roles">${rolesHtml}</div>
        <div class="card-footer">
          <div class="members">${avatarHtml}</div>
          <span class="join-btn">${btnText}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderProjects(filter) {
  currentStatusFilter = filter || 'all';
  applyFilters();
}

// ==================== RENDER DETAIL ====================
function renderDetail(id) {
  const p = projects[id];
  if (!p) return;

  const statusMap = { open: '招募中', progress: '进行中', done: '已完成' };
  const tagClass = { open: 'tag-open', progress: 'tag-progress', done: 'tag-done' };

  const milestonesHtml = p.milestones.map(ms => {
    const iconClass = ms.status === 'done' ? 'done' : ms.status === 'current' ? 'current' : 'pending';
    const icon = ms.status === 'done' ? '✓' : ms.status === 'current' ? '→' : ms.milestones ? '○' : '○';
    const tasksHtml = ms.tasks.map(t =>
      `<span class="ms-task ${ms.status === 'done' ? 'done' : ''}">${t}</span>`
    ).join('');
    return `
      <div class="milestone">
        <div class="milestone-icon ${iconClass}">${icon}</div>
        <div class="milestone-content">
          <h3>${ms.title}</h3>
          <div class="ms-date">${ms.date}</div>
          <div class="ms-tasks">${tasksHtml}</div>
        </div>
      </div>
    `;
  }).join('');

  const teamHtml = p.roles.map(r => {
    const filledHtml = r.members.map(m =>
      `<div class="team-member">
        <div class="tm-avatar" style="background:${m.color};cursor:pointer;" onclick="navigateTo('profile','${m.name}')">${m.name[0]}</div>
        <div class="tm-info"><h4 style="cursor:pointer;" onclick="navigateTo('profile','${m.name}')">${m.name}</h4><p>${r.name}</p></div>
        <span class="tm-status active">活跃</span>
      </div>`
    ).join('');
    const openSlots = r.needed - r.filled;
    const openHtml = openSlots > 0 ? Array(openSlots).fill(0).map(() =>
      `<div class="team-member" onclick="openJoinModal(${p.id}, '${r.name}')">
        <div class="tm-avatar" style="background:var(--cream);color:var(--warm-gray);border:1px dashed var(--border);">?</div>
        <div class="tm-info"><h4>等待加入</h4><p>${r.name}</p></div>
        <span class="tm-status open-slot">申请</span>
      </div>`
    ).join('') : '';
    return filledHtml + openHtml;
  }).join('');

  const roleSlotsHtml = p.roles.map(r => {
    const openSlots = r.needed - r.filled;
    if (openSlots > 0) {
      return `
        <div class="role-slot open">
          <div class="slot-left"><span>${r.emoji}</span><span>${r.name}</span></div>
          <button class="slot-btn" onclick="openJoinModal(${p.id}, '${r.name}')">申请</button>
        </div>
      `;
    } else {
      return `
        <div class="role-slot filled">
          <div class="slot-left"><span>${r.emoji}</span><span>${r.name}</span></div>
          <span style="font-size:0.7rem;color:var(--success);font-weight:700;">已满</span>
        </div>
      `;
    }
  }).join('');

  const content = `
    <div class="detail-hero">
      <div class="detail-hero-inner">
        <div class="detail-breadcrumb">
          <span onclick="navigateTo('home')">首页</span> / <span onclick="navigateTo('home');setTimeout(()=>document.getElementById('projects').scrollIntoView({behavior:'smooth'}),100)">探索项目</span> / <strong>${p.title}</strong>
        </div>
        <div class="detail-title-row">
          <h1><span class="card-tag ${tagClass[p.status]}" style="margin-right:0.8rem;">${statusMap[p.status]}</span>${p.title}</h1>
          <div class="detail-actions">
            ${p.status === 'done' ? '<button class="btn-secondary" onclick="showToast(\'已 Fork 该项目\',\'success\')">🍴 Fork 项目</button>' : '<button class="btn-secondary" onclick="showToast(\'已收藏该项目\',\'info\')">♡ 收藏</button>'}
            ${p.status !== 'done' ? `<button class="btn-primary" onclick="openJoinModal(${p.id})">🤝 加入项目</button>` : ''}
          </div>
        </div>
        <div class="detail-meta">
          <div class="detail-meta-item">👤 发起人：<strong style="cursor:pointer;color:var(--red);" onclick="navigateTo('profile','${p.author}')">${p.author}</strong></div>
          <div class="detail-meta-item">📅 创建于：<strong>${p.createdAt}</strong></div>
          ${p.completedAt ? `<div class="detail-meta-item">🎉 上线于：<strong>${p.completedAt}</strong></div>` : ''}
          <div class="detail-meta-item">⏱ ${p.completedAt ? '总用时' : '预计周期'}：<strong>${p.totalHours ? p.totalHours + ' 小时' : p.duration}</strong></div>
          <div class="detail-meta-item">📜 协议：<strong>${p.license}</strong></div>
          <div class="detail-meta-item">👥 团队：<strong>${p.roles.reduce((a,r)=>a+r.members.length,0)} / ${p.roles.reduce((a,r)=>a+r.needed,0)} 人</strong></div>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <div class="detail-main">
        <div class="detail-section">
          <h2>项目描述</h2>
          <p>${p.desc}</p>
        </div>

        ${p.status === 'done' && p.contributors ? `
        <div class="detail-section contrib-ranking">
          <h2>🏆 贡献者排行</h2>
          <div class="contrib-summary">
            <div class="contrib-summary-item"><div class="csi-num">${p.totalHours || 0}</div><div class="csi-label">总用时（小时）</div></div>
            <div class="contrib-summary-item"><div class="csi-num">${p.totalCommits || 0}</div><div class="csi-label">总提交次数</div></div>
            <div class="contrib-summary-item"><div class="csi-num">${p.contributors.length}</div><div class="csi-label">贡献者人数</div></div>
            <div class="contrib-summary-item"><div class="csi-num">100%</div><div class="csi-label">完成度</div></div>
          </div>
          <div class="contrib-list">
            ${p.contributors.map((c, i) => {
              const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
              const barClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'normal';
              return `
                <div class="contrib-item">
                  <div class="contrib-rank ${rankClass}">${i + 1}</div>
                  <div class="contrib-avatar" style="background:${c.color};" onclick="navigateTo('profile','${c.name}')">${c.name[0]}</div>
                  <div class="contrib-info">
                    <div class="ci-top">
                      <span class="ci-name" onclick="navigateTo('profile','${c.name}')">${c.name}</span>
                      <span class="ci-role">${c.role}</span>
                    </div>
                    <div class="ci-stats">
                      <span>⭐ ${c.xp} XP</span>
                      <span>⏱ ${c.hours}h</span>
                      <span>📝 ${c.commits}次提交</span>
                    </div>
                    <div style="font-size:0.65rem;color:var(--warm-gray);margin-top:0.15rem;">${c.details}</div>
                  </div>
                  <div class="contrib-bar-wrap">
                    <div class="contrib-bar-label"><span>贡献占比</span><span class="cb-value">${c.pct}%</span></div>
                    <div class="contrib-bar"><div class="contrib-bar-fill ${barClass}" style="width:${c.pct}%"></div></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : ''}

        ${p.status === 'done' && p.deliverables ? `
        <div class="detail-section">
          <h2>📦 交付物</h2>
          <div class="deliverables">
            ${p.deliverables.map(d => `
              <div class="deliverable-item">
                <div class="dl-icon" style="background:${d.bg};">${d.icon}</div>
                <div class="dl-info"><h4>${d.name}</h4><p>${d.desc}</p></div>
                <span class="dl-arrow">→</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="detail-section">
          <h2>📋 任务看板</h2>
          ${renderTaskBoard(p)}
        </div>

        <div class="detail-section">
          <h2>💬 协作空间</h2>
          ${renderCollabSpace(p)}
        </div>

        <div class="detail-section">
          <h2>📍 里程碑</h2>
          <div class="milestone-list">${milestonesHtml}</div>
        </div>

        ${p.activities ? `
        <div class="detail-section">
          <h2>📋 项目动态</h2>
          <div class="activity-feed">
            ${p.activities.map(a => `
              <div class="activity-item">
                <div class="act-avatar" style="background:${a.color};">${a.user[0]}</div>
                <div><strong onclick="navigateTo('profile','${a.user}')">${a.user}</strong> ${a.text}<span class="act-time">${a.time}</span></div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="detail-section">
          <h2>团队成员</h2>
          <div class="team-list">${teamHtml}</div>
        </div>
      </div>
      <div class="detail-sidebar">
        ${p.status === 'done' ? `
        <div class="sidebar-card" style="border-color:var(--gold);background:linear-gradient(135deg,rgba(212,168,67,0.05),white);">
          <h3>🏆 项目成就</h3>
          <div style="font-size:0.85rem;line-height:1.8;color:var(--ink-light);">
            ${p.contributors ? p.contributors.slice(0,2).map(c => `<div style="margin-bottom:0.3rem;">${c.name} 解锁了「${c.role === '产品经理' ? '领航者' : c.role === '前端开发' ? '代码之力' : '设计之眼'}」徽章</div>`).join('') : ''}
            <div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);font-size:0.75rem;color:var(--warm-gray);">所有成员获得「造物参与者」纪念徽章</div>
          </div>
        </div>
        ` : ''}
        <div class="sidebar-card">
          <h3>角色招募</h3>
          <div class="role-slots">${roleSlotsHtml}</div>
        </div>
        <div class="sidebar-card">
          <h3>项目信息</h3>
          <div class="info-row"><span class="label">类别</span><span class="value">${p.category}</span></div>
          <div class="info-row"><span class="label">周期</span><span class="value">${p.duration}</span></div>
          <div class="info-row"><span class="label">协议</span><span class="value">${p.license}</span></div>
          <div class="info-row"><span class="label">创建</span><span class="value">${p.createdAt}</span></div>
        </div>
        <div class="sidebar-card">
          <h3>贡献记录</h3>
          <div class="info-row"><span class="label">总提交</span><span class="value">${p.totalCommits || 47}</span></div>
          <div class="info-row"><span class="label">本周活跃</span><span class="value">${p.status === 'done' ? '—' : '8 次'}</span></div>
          <div class="info-row"><span class="label">完成度</span><span class="value" style="color:var(--red);">${p.status === 'done' ? '100%' : p.status === 'progress' ? '45%' : '15%'}</span></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('detail-content').innerHTML = content;
}

// ==================== JOIN MODAL ====================
let currentJoinProject = null;

function openJoinModal(projectId, preselectedRole) {
  currentJoinProject = projectId;
  const p = projects[projectId];
  const select = document.getElementById('join-role-select');
  const openRoles = p.roles.filter(r => r.filled < r.needed);
  select.innerHTML = openRoles.map(r => `<option value="${r.name}">${r.emoji} ${r.name}</option>`).join('');
  if (preselectedRole) {
    select.value = preselectedRole;
  }
  document.getElementById('join-modal-desc').textContent = `申请加入「${p.title}」`;
  document.getElementById('join-intro').value = '';
  document.getElementById('join-modal').classList.add('active');
}

function closeJoinModal() {
  document.getElementById('join-modal').classList.remove('active');
}

function submitJoin() {
  const role = document.getElementById('join-role-select').value;
  const intro = document.getElementById('join-intro').value.trim();
  if (!intro) {
    showToast('请填写自我介绍', 'info');
    return;
  }
  closeJoinModal();
  showToast(`已申请「${role}」角色，等待审核`, 'success');
  document.getElementById('notif-badge').textContent = parseInt(document.getElementById('notif-badge').textContent) + 1;
}

// ==================== CREATE PROJECT ====================
function changeRoleCount(btn, delta) {
  const countEl = btn.parentElement.querySelector('span');
  let val = parseInt(countEl.textContent) + delta;
  if (val < 0) val = 0;
  if (val > 5) val = 5;
  countEl.textContent = val;
}

function submitProject() {
  const name = document.getElementById('create-name').value.trim();
  const tagline = document.getElementById('create-tagline').value.trim();
  const desc = document.getElementById('create-desc').value.trim();

  if (!name || !tagline || !desc) {
    showToast('请填写所有必填项', 'info');
    return;
  }

  showToast('🎉 项目发布成功！等待队友加入...', 'success');

  setTimeout(() => {
    navigateTo('dashboard');
  }, 1500);
}

// ==================== NOTIFICATIONS ====================
function toggleNotif() {
  const overlay = document.getElementById('notif-overlay');
  const panel = document.getElementById('notif-panel');
  const isActive = panel.classList.contains('active');

  if (isActive) {
    overlay.classList.remove('active');
    panel.classList.remove('active');
  } else {
    overlay.classList.add('active');
    panel.classList.add('active');
    document.getElementById('notif-badge').textContent = '0';
  }
}

// ==================== TOAST ====================
function showToast(msg, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type || ''}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ==================== SCROLL REVEAL ====================
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

// ==================== TASK BOARD RENDERING ====================
function renderTaskBoard(p) {
  const ms = p.milestones;
  if (!ms || !ms[0].tasks || typeof ms[0].tasks[0] === 'string') {
    return '<p style="font-size:0.85rem;color:var(--warm-gray);">该项目尚未创建详细任务。</p>';
  }

  const allTasks = ms.flatMap(m => m.tasks.map(t => ({ ...t, msStatus: m.status })));
  const openTasks = allTasks.filter(t => t.status === 'open');
  const progressTasks = allTasks.filter(t => t.status === 'progress');
  const doneTasks = allTasks.filter(t => t.status === 'done');

  function taskCardHtml(t) {
    const isDone = t.status === 'done';
    const assigneeHtml = t.assignee
      ? `<span class="tc-assignee"><span class="ta-avatar" style="background:${users[t.assignee]?.color || '#999'};">${t.assignee[0]}</span>${t.assignee}</span>`
      : `<span class="tc-assignee" style="color:var(--red);">待认领</span>`;
    const claimBtn = !t.assignee && !isDone
      ? `<button class="tc-claim-btn" onclick="event.stopPropagation();claimTask(this, '${t.name}', ${t.xp})">认领此任务 · +${t.xp} XP</button>`
      : '';
    return `
      <div class="task-card ${isDone ? 'done-card' : ''}" onclick="event.stopPropagation()">
        <div class="tc-name">${t.name}</div>
        <div class="tc-meta">
          ${assigneeHtml}
          <span class="tc-xp">+${t.xp} XP</span>
        </div>
        ${claimBtn}
      </div>
    `;
  }

  return `
    <div class="task-board">
      <div class="task-board-columns">
        <div class="task-column open-col">
          <div class="task-column-header">待认领 <span class="tch-count">${openTasks.length}</span></div>
          <div class="task-column-body">${openTasks.map(taskCardHtml).join('')}</div>
        </div>
        <div class="task-column progress-col">
          <div class="task-column-header">进行中 <span class="tch-count">${progressTasks.length}</span></div>
          <div class="task-column-body">${progressTasks.map(taskCardHtml).join('')}</div>
        </div>
        <div class="task-column done-col">
          <div class="task-column-header">已完成 <span class="tch-count">${doneTasks.length}</span></div>
          <div class="task-column-body">${doneTasks.map(taskCardHtml).join('')}</div>
        </div>
      </div>
    </div>
  `;
}

function claimTask(btn, taskName, xp) {
  btn.textContent = '✓ 已认领';
  btn.classList.add('claimed');
  showToast(`已认领「${taskName}」· +${xp} XP`, 'success');
}

// ==================== COLLABORATION SPACE RENDERING ====================
function renderCollabSpace(p) {
  const hasComments = p.comments && p.comments.length > 0;
  const hasFiles = p.files && p.files.length > 0;

  return `
    <div class="collab-tabs">
      <button class="collab-tab active" onclick="switchCollabTab(this, 'comments-${p.id}')">💬 讨论 ${hasComments ? '(' + p.comments.length + ')' : ''}</button>
      <button class="collab-tab" onclick="switchCollabTab(this, 'files-${p.id}')">📂 文件 ${hasFiles ? '(' + p.files.length + ')' : ''}</button>
      <button class="collab-tab" onclick="switchCollabTab(this, 'log-${p.id}')">📋 项目日志</button>
    </div>

    <div class="collab-panel active" id="comments-${p.id}">
      ${hasComments ? `
        <div class="comment-list">
          ${p.comments.map(c => `
            <div class="comment-item">
              <div class="cm-avatar" style="background:${c.color};" onclick="navigateTo('profile','${c.user}')">${c.user[0]}</div>
              <div class="cm-body">
                <div class="cm-header">
                  <span class="cm-name" onclick="navigateTo('profile','${c.user}')">${c.user}</span>
                  <span class="cm-time">${c.time}</span>
                </div>
                <div class="cm-text">${c.text}</div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="font-size:0.85rem;color:var(--warm-gray);">还没有讨论，来说点什么吧。</p>'}
      <div class="comment-input-wrap">
        <div class="ci-avatar">你</div>
        <textarea class="comment-input" rows="2" placeholder="写下你的想法…" id="comment-input-${p.id}"></textarea>
        <button class="comment-submit" onclick="submitComment(${p.id})">发送</button>
      </div>
    </div>

    <div class="collab-panel" id="files-${p.id}">
      ${hasFiles ? `
        <div class="file-list">
          ${p.files.map(f => `
            <div class="file-item">
              <span class="fi-icon">${f.icon}</span>
              <div class="fi-info"><h4>${f.name}</h4><p>${f.uploader} · ${f.time}</p></div>
              <span class="fi-arrow">↓</span>
            </div>
          `).join('')}
        </div>
      ` : '<p style="font-size:0.85rem;color:var(--warm-gray);">还没有共享文件。</p>'}
    </div>

    <div class="collab-panel" id="log-${p.id}">
      ${p.activities ? `
        <div class="activity-feed">
          ${p.activities.map(a => `
            <div class="activity-item">
              <div class="act-avatar" style="background:${a.color};">${a.user[0]}</div>
              <div><strong onclick="navigateTo('profile','${a.user}')">${a.user}</strong> ${a.text}<span class="act-time">${a.time}</span></div>
            </div>
          `).join('')}
        </div>
      ` : '<p style="font-size:0.85rem;color:var(--warm-gray);">暂无项目动态。</p>'}
    </div>
  `;
}

function switchCollabTab(btn, panelId) {
  const parent = btn.closest('.detail-section');
  parent.querySelectorAll('.collab-tab').forEach(t => t.classList.remove('active'));
  parent.querySelectorAll('.collab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(panelId).classList.add('active');
}

function submitComment(projectId) {
  const input = document.getElementById(`comment-input-${projectId}`);
  const text = input.value.trim();
  if (!text) { showToast('请输入评论内容', 'info'); return; }
  input.value = '';
  showToast('评论已发送', 'success');
}

// ==================== SHOWCASE RENDERING ====================
function renderShowcase() {
  const doneProjects = projects.filter(p => p.status === 'done');
  const featured = doneProjects[0];
  const rest = doneProjects.slice(1);

  document.getElementById('showcase-content').innerHTML = `
    <div class="showcase-inner">
      <div class="showcase-header">
        <h1>🏆 成果展厅</h1>
        <p>每一个完成的项目，都是一群人共同的荣耀</p>
      </div>

      ${featured ? `
      <div class="showcase-featured" onclick="navigateTo('detail', ${featured.id})">
        <h2>${featured.title}</h2>
        <p class="sf-desc">${featured.desc}</p>
        <div class="sf-meta">
          <span>👤 发起人：<strong>${featured.author}</strong></span>
          <span>👥 团队：<strong>${featured.contributors ? featured.contributors.length : featured.roles.reduce((a,r)=>a+r.members.length,0)} 人</strong></span>
          <span>⏱ 总用时：<strong>${featured.totalHours || 0} 小时</strong></span>
          <span>📅 上线：<strong>${featured.completedAt || ''}</strong></span>
        </div>
        <button class="btn-primary" style="font-size:0.85rem;padding:0.6rem 1.5rem;">查看完整项目 →</button>
      </div>
      ` : ''}

      ${rest.length > 0 ? `
      <div class="showcase-grid">
        ${rest.map(p => `
          <div class="showcase-card" onclick="navigateTo('detail', ${p.id})">
            <span class="sc-badge">✅ 已完成</span>
            <h3>${p.title}</h3>
            <p class="sc-desc">${p.desc.substring(0, 80)}…</p>
            <div class="sc-stats">
              <span>发起人：<strong>${p.author}</strong></span>
              <span>用时：<strong>${p.totalHours || '?'}h</strong></span>
              <span>提交：<strong>${p.totalCommits || '?'}次</strong></span>
            </div>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${doneProjects.length === 0 ? '<p style="text-align:center;color:var(--warm-gray);padding:4rem;">暂无已完成的项目。成为第一个完成项目的人吧！</p>' : ''}
    </div>
  `;
}

function selectAuthRole(el) {
  el.classList.toggle('active');
}

// ==================== LEADERBOARD RENDERING ====================
function renderLeaderboard(tab) {
  const allUsers = Object.values(users).sort((a, b) => b.xp - a.xp);
  const top3 = allUsers.slice(0, 3);
  const rest = allUsers.slice(3);

  const tabLabels = { xp: '贡献值总榜', weekly: '本周活跃', monthly: '月度新星', badges: '徽章收集' };
  const tabValues = { xp: 'xp', weekly: 'xp', monthly: 'xp', badges: 'badges' };

  const podiumHtml = top3.map((u, i) => {
    const isFirst = i === 0;
    const medals = ['🥇', '🥈', '🥉'];
    return `
      <div class="lb-podium-item ${isFirst ? 'first' : ''}" onclick="navigateTo('profile','${u.name}')">
        <div class="podium-rank">${medals[i]}</div>
        <div class="podium-avatar" style="background:${u.color};">${u.name[0]}</div>
        <div class="podium-name">${u.name}</div>
        <div class="podium-role">${u.role} · ${u.levelName}</div>
        <div class="podium-value">${tab === 'badges' ? u.badges : u.xp.toLocaleString()}</div>
        <div class="podium-label">${tab === 'badges' ? '枚徽章' : '贡献值'}</div>
      </div>
    `;
  }).join('');

  const listHtml = rest.map((u, i) => `
    <div class="lb-list-item" onclick="navigateTo('profile','${u.name}')">
      <div class="lb-rank">${i + 4}</div>
      <div class="lb-avatar" style="background:${u.color};">${u.name[0]}</div>
      <div class="lb-info">
        <h4>${u.name}</h4>
        <p>${u.role} · ${u.levelName} · Lv.${u.level}</p>
      </div>
      <div class="lb-value">${tab === 'badges' ? u.badges + ' 🏅' : u.xp.toLocaleString()}</div>
    </div>
  `).join('');

  document.getElementById('leaderboard-content').innerHTML = `
    <div class="lb-inner">
      <div class="lb-header">
        <h1>🏆 排行榜</h1>
        <p>致敬每一位为公社贡献力量的创客</p>
      </div>
      <div class="lb-tabs">
        <button class="lb-tab ${tab === 'xp' ? 'active' : ''}" onclick="renderLeaderboard('xp')">贡献值总榜</button>
        <button class="lb-tab ${tab === 'weekly' ? 'active' : ''}" onclick="renderLeaderboard('weekly')">本周活跃</button>
        <button class="lb-tab ${tab === 'monthly' ? 'active' : ''}" onclick="renderLeaderboard('monthly')">月度新星</button>
        <button class="lb-tab ${tab === 'badges' ? 'active' : ''}" onclick="renderLeaderboard('badges')">徽章收集</button>
      </div>
      <div class="lb-podium">${podiumHtml}</div>
      <div class="lb-list">${listHtml}</div>
    </div>
  `;
}

// ==================== PROFILE RENDERING ====================
function renderProfile(userName) {
  const u = users[userName];
  if (!u) {
    document.getElementById('profile-content').innerHTML = '<div style="text-align:center;padding:5rem;"><h2>用户不存在</h2><p style="color:var(--warm-gray);margin-top:1rem;"><button class="btn-secondary" onclick="navigateTo(\'home\')" style="margin-top:1rem;">返回首页</button></p></div>';
    return;
  }

  // Find user's projects
  const userProjects = projects.filter(p => p.roles.some(r => r.members.some(m => m.name === userName)));

  const projectListHtml = userProjects.map(p => {
    const statusMap = { open: '招募中', progress: '进行中', done: '已完成' };
    const tagClass = { open: 'tag-open', progress: 'tag-progress', done: 'tag-done' };
    const role = p.roles.find(r => r.members.some(m => m.name === userName));
    return `
      <div class="dash-list-item" onclick="navigateTo('detail', ${p.id})">
        <div class="dli-icon" style="background:rgba(${parseInt(u.color.slice(1,3),16)},${parseInt(u.color.slice(3,5),16)},${parseInt(u.color.slice(5,7),16)},0.1);">${role ? role.emoji : '📋'}</div>
        <div class="dli-info">
          <h4>${p.title}</h4>
          <p>${role ? role.name : '成员'} · ${statusMap[p.status]}</p>
        </div>
        <span class="dli-status" style="background:${p.status === 'done' ? 'rgba(34,139,34,0.1)' : p.status === 'progress' ? 'rgba(212,168,67,0.15)' : 'rgba(212,33,61,0.1)'};color:${p.status === 'done' ? 'var(--success)' : p.status === 'progress' ? '#8B6914' : 'var(--red)'};">${statusMap[p.status]}</span>
      </div>
    `;
  }).join('');

  const badgeWallHtml = badges.map(b => {
    const isEarned = u.earnedBadges && u.earnedBadges.includes(b.id);
    return `
      <div class="profile-badge-item ${isEarned ? 'earned' : 'locked'}" onclick="showBadgeDetail(${b.id})">
        <div class="pbi-icon">${b.icon}</div>
        <div class="pbi-name">${b.name}</div>
      </div>
    `;
  }).join('');

  const skillsHtml = u.skills.map(s => `
    <div class="profile-skill-row">
      <span class="psr-label">${s.name}</span>
      <div class="psr-bar"><div class="psr-bar-fill" style="width:${s.pct}%"></div></div>
      <span class="psr-val">${s.pct}%</span>
    </div>
  `).join('');

  const levelColors = { 1: 'var(--warm-gray)', 2: '#4A90D9', 3: 'var(--success)', 4: '#8B5CF6', 5: 'var(--gold)', 6: 'var(--red)' };
  const nextLevelXp = [0, 100, 500, 1500, 4000, 10000, 99999];

  document.getElementById('profile-content').innerHTML = `
    <div class="profile-inner">
      <div class="detail-breadcrumb" style="margin-bottom:2rem;">
        <span onclick="navigateTo('home')" style="cursor:pointer;">首页</span> / <strong>${u.name} 的主页</strong>
      </div>

      <div class="profile-hero">
        <div class="ph-avatar" style="background:${u.color};">${u.name[0]}</div>
        <div class="ph-info">
          <h1>${u.name}</h1>
          <div class="ph-meta">
            <span>${u.role}</span>
            <span>·</span>
            <span style="color:${levelColors[u.level] || 'var(--red)'};font-weight:700;">${u.levelName} · Lv.${u.level}</span>
            <span>·</span>
            <span>加入于 ${u.joined}</span>
          </div>
          <p class="ph-bio">${u.bio}</p>
        </div>
        <div class="ph-stats">
          <div class="ph-stat"><div class="num">${u.xp.toLocaleString()}</div><div class="label">贡献值</div></div>
          <div class="ph-stat"><div class="num">${u.projects}</div><div class="label">项目</div></div>
          <div class="ph-stat"><div class="num">${u.badges}</div><div class="label">徽章</div></div>
        </div>
      </div>

      <div class="profile-body">
        <div>
          <div class="profile-section">
            <div class="profile-section-header">
              <h3>📋 参与项目</h3>
              <span class="count">${userProjects.length}</span>
            </div>
            <ul class="dash-list">${projectListHtml}</ul>
          </div>
        </div>

        <div>
          <div class="profile-sidebar-section">
            <h3>🏅 徽章 (${u.badges}/${badges.length})</h3>
            <div class="profile-badge-wall">${badgeWallHtml}</div>
          </div>

          <div class="profile-sidebar-section">
            <h3>📊 技能</h3>
            <div class="profile-skill-list">${skillsHtml}</div>
          </div>

          <div class="profile-sidebar-section">
            <h3>📈 等级进度</h3>
            <div class="xp-bar-label">
              <span>${u.xp.toLocaleString()} / ${nextLevelXp[u.level].toLocaleString()}</span>
              <span>Lv.${u.level + 1}</span>
            </div>
            <div class="xp-bar"><div class="xp-bar-fill" style="width:${Math.min(100, (u.xp / nextLevelXp[u.level]) * 100)}%"></div></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==================== BADGE RENDERING ====================
function renderBadges() {
  const wall = document.getElementById('badge-wall');
  if (!wall) return;
  wall.innerHTML = badges.map(b => `
    <div class="badge-item ${b.earned ? 'earned' : 'locked'}" onclick="showBadgeDetail(${b.id})">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>
  `).join('');
}

function showBadgeDetail(id) {
  const b = badges[id];
  document.getElementById('badge-modal-icon').textContent = b.icon;
  document.getElementById('badge-modal-series').textContent = b.series;
  document.getElementById('badge-modal-name').textContent = b.name;
  document.getElementById('badge-modal-desc').textContent = b.desc;
  document.getElementById('badge-modal-condition').innerHTML = `获得条件：<strong>${b.condition}</strong>`;
  document.getElementById('badge-modal-date').textContent = b.earned ? `✅ 已于 ${b.date} 解锁` : `🔒 尚未解锁 — 继续努力！`;
  document.getElementById('badge-modal').classList.add('active');
}

function closeBadgeModal() {
  document.getElementById('badge-modal').classList.remove('active');
}

// ==================== INIT ====================
function initApp() {
  renderProjects('all');
  renderBadges();
  initReveal();

  // Close modals on overlay click
  document.getElementById('join-modal').addEventListener('click', function(e) {
    if (e.target === this) closeJoinModal();
  });
  document.getElementById('badge-modal').addEventListener('click', function(e) {
    if (e.target === this) closeBadgeModal();
  });
}
