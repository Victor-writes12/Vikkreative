(() => {
  const C = window.SITE_CONFIG, D = window.SITE, LOGOS = window.LOGOS || {}
  const $ = (s) => document.querySelector(s)
  const esc = (s = '') => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const app = $('#app')
  const slugify = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const isUrl = (u) => /^https?:\/\//.test(u || '')
  const imgSrc = (u) => (!u ? '' : /^(https?:)?\/\//.test(u) ? u : '../' + u.replace(/^\//, ''))
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
  const msg = (e) => {
    const m = e?.message || String(e)
    if (/row-level security|permission denied/i.test(m)) return 'Not allowed. Sign in with the admin email you set in supabase/setup.sql.'
    if (/relation .* does not exist|schema cache/i.test(m)) return 'The database tables are missing. Run supabase/setup.sql first.'
    return m
  }
  let tt
  const toast = (m, bad) => { const t = $('#toast'); t.textContent = m; t.className = 'on' + (bad ? ' bad' : ''); clearTimeout(tt); tt = setTimeout(() => (t.className = ''), bad ? 6000 : 2600) }

  // ---------- Setup check ----------
  if (!C.supabaseUrl || !C.supabaseAnonKey || !window.supabase) {
    app.innerHTML = `<div class="ad-login"><div class="ad-card"><h1>Almost there</h1><p class="ad-mut">${!window.supabase ? 'The Supabase library did not load. Check your internet connection and reload.' : 'Add your Supabase Project URL and anon key to <b>js/content.js</b> (supabaseUrl and supabaseAnonKey), then reload this page. The steps are in README.md.'}</p></div></div>`
    return
  }
  const sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey)

  const S = { user: null, view: 'overview', projects: [], site: {}, edit: null, lists: null, imgs: null, loading: false }
  const NAV = [['overview', 'Overview', 'fa-gauge'], ['projects', 'Projects', 'fa-layer-group'], ['about', 'About', 'fa-user'], ['content', 'Content', 'fa-sliders']]
  const LISTS = {
    tools: { title: 'Tools (the moving strip)', note: 'Pick a logo for each tool. Letters only shows the first two letters of the name instead.', add: 'Add tool', blank: () => ({ name: '', logo: 'none' }), fields: [['name', 'Name', 'input'], ['logo', 'Logo', 'logo']], label: (x) => x.name },
    services: { title: 'Services', add: 'Add service', blank: () => ({ title: '', text: '' }), fields: [['title', 'Title', 'input'], ['text', 'Description', 'textarea']], label: (x) => x.title },
    process: { title: 'How I work (steps)', add: 'Add step', blank: () => ({ title: '', text: '' }), fields: [['title', 'Title', 'input'], ['text', 'Description', 'textarea']], label: (x) => x.title },
    testimonials: { title: 'Testimonials', note: 'The section stays hidden on the site until there is at least one.', add: 'Add testimonial', blank: () => ({ quote: '', name: '', role: '' }), fields: [['quote', 'Quote', 'textarea'], ['name', 'Name', 'input'], ['role', 'Role and company', 'input']], label: (x) => x.name || x.quote },
  }
  const autoLogo = (name = '') => { const k = name.toLowerCase().replace(/[^a-z]/g, ''); return LOGOS[k] ? k : '' }

  // ---------- Data ----------
  async function loadProjects() {
    const r = await sb.from('projects').select('*').order('sort_order', { ascending: true })
    if (r.error) throw r.error
    S.projects = r.data || []
  }
  async function boot() {
    S.loading = true; paint()
    try {
      await loadProjects()
      const s = await sb.from('site_settings').select('data').eq('id', 1).maybeSingle()
      if (s.error) throw s.error
      S.site = s.data?.data || {}
    } catch (e) { toast(msg(e), true) }
    S.loading = false; S.lists = null; S.imgs = null; paint()
  }
  async function saveSite(patch) {
    const data = { ...S.site, ...patch }
    const r = await sb.from('site_settings').upsert({ id: 1, data, updated_at: new Date().toISOString() })
    if (r.error) throw r.error
    S.site = data
  }
  async function toWebp(file, maxW = 1800) {
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new Error('Use a PNG, JPG or WebP image.')
    if (file.size > 15 * 1024 * 1024) throw new Error('That image is over 15 MB. Choose a smaller one.')
    try {
      const bmp = await createImageBitmap(file), k = Math.min(1, maxW / bmp.width)
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k)
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height)
      const b = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86))
      return b && b.type === 'image/webp' ? b : file
    } catch { return file }
  }
  async function upload(file, folder) {
    const blob = await toWebp(file), ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const r = await sb.storage.from('portfolio').upload(path, blob, { contentType: blob.type, cacheControl: '31536000' })
    if (r.error) throw r.error
    return sb.storage.from('portfolio').getPublicUrl(path).data.publicUrl
  }

  // ---------- Views ----------
  const field = (label, inner, hint) => `<label class="af">${label}${inner}${hint ? `<small>${hint}</small>` : ''}</label>`
  const input = (name, val = '', extra = '') => `<input name="${name}" value="${esc(val)}" ${extra}>`
  const area = (name, val = '', rows = 4, extra = '') => `<textarea name="${name}" rows="${rows}" ${extra}>${esc(val)}</textarea>`
  const prev = (u) => (u ? `<div class="pv"><img src="${esc(imgSrc(u))}" alt=""></div>` : '<span class="ad-none">No image yet</span>')
  const uploader = (label, id, target, multiple) => `<div class="ad-up"><b>${label}</b><div class="ad-prev" id="${id}"></div><label class="ad-file"><i class="fa-solid fa-arrow-up-from-bracket" aria-hidden="true"></i> ${multiple ? 'Add images' : 'Choose image'}<input type="file" accept="image/png,image/jpeg,image/webp" data-up="${target}" ${multiple ? 'multiple' : ''}></label></div>`

  function login() {
    return `<div class="lg">
<aside class="lg-side"><img class="lg-bg" src="../images/hero.webp" alt=""><div class="lg-shade"></div>
<div class="lg-in"><a class="lg-brand" href="../index.html">${esc(D.brand)}</a>
<div><h2 class="lg-h">Manage your portfolio, your way.</h2><p class="lg-p">Add projects, update your story and keep your site fresh in minutes.</p>
<ul class="lg-list"><li><i class="fa-solid fa-layer-group" aria-hidden="true"></i>Add and edit your projects</li><li><i class="fa-solid fa-user" aria-hidden="true"></i>Update your about page</li><li><i class="fa-solid fa-bolt" aria-hidden="true"></i>Changes go live instantly</li></ul></div>
<p class="lg-foot">&copy; ${new Date().getFullYear()} ${esc(D.brand)}</p></div></aside>
<main class="lg-main"><div class="lg-card">
<a class="lg-mbrand" href="../index.html">${esc(D.brand)}</a>
<span class="lg-tag"><i class="fa-solid fa-lock" aria-hidden="true"></i> Admin area</span>
<h1 class="lg-title">Welcome back</h1><p class="lg-sub">Sign in to manage your website.</p>
<form id="lf" novalidate>
<label class="lg-f"><span>Email</span><div class="lg-inp"><i class="fa-regular fa-envelope" aria-hidden="true"></i><input name="email" type="email" required autocomplete="username" inputmode="email" placeholder="you@example.com"></div></label>
<label class="lg-f"><span>Password</span><div class="lg-inp"><i class="fa-solid fa-lock" aria-hidden="true"></i><input name="password" type="password" required autocomplete="current-password" placeholder="Enter your password"><button type="button" class="lg-eye" data-act="pw" aria-label="Show password"><i class="fa-regular fa-eye" aria-hidden="true"></i></button></div></label>
<button class="lg-btn" type="submit"><span>Sign in</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button>
<p class="ad-err" id="lerr" role="alert"></p></form>
<a class="lg-back" href="../index.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Back to website</a>
</div></main></div>`
  }
  function shell(inner) {
    return `<header class="ad-top"><a class="ad-brand" href="../index.html">${esc(D.brand)}<span>Admin</span></a><div class="ad-acts"><a class="ab" href="../index.html" target="_blank" rel="noreferrer" aria-label="View site"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i><span>View site</span></a><button class="ab" data-act="logout" aria-label="Sign out"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Sign out</span></button></div></header>
<div class="ad-body"><nav class="ad-nav" aria-label="Admin">${NAV.map(([v, l, i]) => `<button data-act="nav" data-v="${v}"${S.view === v ? ' aria-current="page"' : ''}><i class="fa-solid ${i}" aria-hidden="true"></i>${l}</button>`).join('')}</nav><main class="ad-main">${inner}</main></div>`
  }
  function overview() {
    const pub = S.projects.filter((p) => p.published).length
    return `<div class="ad-bar"><h1 class="ad-h">Overview</h1></div>
<div class="ad-stats"><div class="ad-stat"><b>${S.projects.length}</b><span>Projects</span></div><div class="ad-stat"><b>${pub}</b><span>Published</span></div><div class="ad-stat"><b>${S.projects.length - pub}</b><span>Drafts</span></div></div>
<div class="ad-card"><h2 class="ad-h2">Quick actions</h2><div class="ad-actions"><button class="ab pri" data-act="new"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add project</button><button class="ab" data-act="nav" data-v="about"><i class="fa-solid fa-user" aria-hidden="true"></i> Edit about</button><button class="ab" data-act="sitemap"><i class="fa-solid fa-sitemap" aria-hidden="true"></i> Download sitemap.xml</button></div></div>
<div class="ad-card"><h2 class="ad-h2">Good to know</h2><p class="ad-mut">Changes go live on the website as soon as you save, no rebuild needed. After adding or removing projects, download a fresh sitemap.xml and replace the one in the website folder so search engines see the new pages.</p></div>`
  }
  function projects() {
    if (S.edit) return projectForm()
    const list = S.projects.length
      ? `<ul class="ad-list">${S.projects.map((p, i) => `<li class="ad-item"><img class="ad-th" src="${esc(imgSrc(p.cover_url))}" alt=""><div class="ad-meta"><b>${esc(p.title)}</b><span>${esc([p.category, p.delivery_time].filter(Boolean).join(', '))}</span>${p.published ? '' : '<em class="badge">Draft</em>'}</div><div class="ad-ctl"><button class="ab icon sm" data-act="up" data-i="${i}" aria-label="Move up"${i === 0 ? ' disabled' : ''}><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button><button class="ab icon sm" data-act="down" data-i="${i}" aria-label="Move down"${i === S.projects.length - 1 ? ' disabled' : ''}><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button><button class="ab sm" data-act="edit" data-id="${esc(p.id)}"><i class="fa-solid fa-pen" aria-hidden="true"></i> Edit</button><button class="ab dan icon sm" data-act="del" data-id="${esc(p.id)}" aria-label="Delete ${esc(p.title)}"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div></li>`).join('')}</ul>`
      : `<div class="ad-empty"><p class="ad-mut">No projects in the database yet. The website is currently showing the ${D.projects.length} starter projects from js/content.js.</p><button class="ab pri" data-act="import">Import the ${D.projects.length} current projects</button><button class="ab" data-act="new">Add a new project instead</button></div>`
    return `<div class="ad-bar"><h1 class="ad-h">Projects</h1><button class="ab pri" data-act="new"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add project</button></div>${list}`
  }
  function projectForm() {
    const e = S.edit, cats = [...new Set(['Brand identity', 'Web design', 'Mobile app', 'E-commerce', 'Product design', ...S.projects.map((p) => p.category).filter(Boolean)])]
    return `<div class="ad-bar"><h1 class="ad-h">${e.id ? 'Edit project' : 'New project'}</h1><button class="ab" data-act="cancel">Back to projects</button></div>
<form id="pf" class="ad-card" novalidate>
${field('Title', input('title', e.title, 'required maxlength="80"'))}
${field('Page address', input('slug', e.slug, 'maxlength="60" autocapitalize="off"'), 'Used in the link: project.html?p=this-part. Changing it later breaks old links.')}
<div class="ad-2">${field('Category', input('category', e.category, 'list="cats" maxlength="40"') + `<datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>`)}${field('Delivery time', input('delivery_time', e.delivery_time, 'maxlength="40" placeholder="e.g. 3 to 4 weeks"'), 'Shown on the card and the project page.')}</div>
${field('Short summary', area('summary', e.summary, 2, 'maxlength="220"'), 'One or two sentences. Shown on the project card.')}
${field('Full description', area('description', e.description, 9), 'Leave a blank line between paragraphs.')}
<div class="ad-3">${field('Client', input('client', e.client, 'maxlength="60"'))}${field('Your role', input('role', e.role, 'maxlength="60"'))}${field('Year', input('year', e.year, 'maxlength="9"'))}</div>
${field('Tools used', input('tools', (e.tools || []).join(', ')), 'Separate with commas, for example: Figma, Photoshop')}
${field('Case study link (optional)', input('link', e.link, 'type="url" placeholder="https://"'), 'Shows a View case study button, for example a Behance link.')}
${uploader('Cover image', 'prev-cover', 'cover')}<p class="ad-mut" style="margin:-.5rem 0 1.1rem">Landscape, about 4:3, works best. Images are compressed automatically.</p>
${uploader('Gallery images (optional)', 'prev-gal', 'gallery', true)}
<label class="ad-sw"><input type="checkbox" name="published"${e.published ? ' checked' : ''}> Published (untick to keep it as a draft)</label>
<div class="ad-foot"><button class="ab pri" type="submit">Save project</button><button class="ab" type="button" data-act="cancel">Cancel</button></div></form>`
  }
  function about() {
    const g = (k) => S.site[k] || D[k] || ''
    if (!S.imgs) S.imgs = { portraitSrc: g('portraitSrc'), heroSrc: g('heroSrc'), servicesSrc: g('servicesSrc'), contactSrc: g('contactSrc') }
    return `<div class="ad-bar"><h1 class="ad-h">About and hero</h1></div>
<form id="af" class="ad-card" novalidate>
<div class="ad-2">${field('Full name', input('name', g('name')))}${field('Brand name', input('brand', g('brand')))}</div>
<div class="ad-2">${field('Role', input('role', g('role')))}${field('Public email', input('email', g('email'), 'type="email"'))}</div>
${field('Hero headline', input('heroTitle', g('heroTitle')))}
${field('Hero text', area('heroText', g('heroText'), 3))}
${field('About (short, shown on the home page)', area('about', g('about'), 5))}
${field('About page story', area('aboutLong', g('aboutLong'), 10), 'Leave a blank line between paragraphs.')}
${uploader('Portrait', 'prev-portraitSrc', 'portraitSrc')}${uploader('Hero background', 'prev-heroSrc', 'heroSrc')}${uploader('Services background', 'prev-servicesSrc', 'servicesSrc')}${uploader('Contact background', 'prev-contactSrc', 'contactSrc')}
<div class="ad-foot"><button class="ab pri" type="submit">Save changes</button></div></form>`
  }
  function content() {
    if (!S.lists) {
      S.lists = {}
      for (const k of Object.keys(LISTS)) S.lists[k] = (Array.isArray(S.site[k]) ? S.site[k] : D[k] || []).map((x) => ({ ...x }))
      S.lists.tools.forEach((t) => { if (!t.logo) t.logo = autoLogo(t.name) || 'none' })
    }
    const logoSel = (l, i, v) => `<select data-l="${l}" data-i="${i}" data-k="logo"><option value="none"${v === 'none' ? ' selected' : ''}>Letters only</option>${Object.keys(LOGOS).map((k) => `<option value="${k}"${v === k ? ' selected' : ''}>${cap(k)}</option>`).join('')}</select>`
    return `<div class="ad-bar"><h1 class="ad-h">Content</h1></div>` + Object.entries(LISTS).map(([l, cfg], n) => `<details class="ad-det"${n === 0 ? ' open' : ''}><summary>${cfg.title}<i class="fa-solid fa-chevron-down" aria-hidden="true"></i></summary><div>${cfg.note ? `<p class="ad-mut" style="margin-bottom:1rem">${cfg.note}</p>` : ''}${S.lists[l].map((x, i) => `<div class="ad-rep">${cfg.fields.map(([k, lab, t]) => field(lab, t === 'textarea' ? `<textarea rows="3" data-l="${l}" data-i="${i}" data-k="${k}">${esc(x[k])}</textarea>` : t === 'logo' ? logoSel(l, i, x[k] || 'none') : `<input data-l="${l}" data-i="${i}" data-k="${k}" value="${esc(x[k])}">`)).join('')}<div class="ad-repctl"><button class="ab icon sm" type="button" data-act="l-up" data-l="${l}" data-i="${i}" aria-label="Move up"${i === 0 ? ' disabled' : ''}><i class="fa-solid fa-arrow-up" aria-hidden="true"></i></button><button class="ab icon sm" type="button" data-act="l-down" data-l="${l}" data-i="${i}" aria-label="Move down"${i === S.lists[l].length - 1 ? ' disabled' : ''}><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button><button class="ab dan icon sm" type="button" data-act="l-del" data-l="${l}" data-i="${i}" aria-label="Remove"><i class="fa-solid fa-trash" aria-hidden="true"></i></button></div></div>`).join('')}<button class="ab sm" type="button" data-act="l-add" data-l="${l}"><i class="fa-solid fa-plus" aria-hidden="true"></i> ${cfg.add}</button></div></details>`).join('') + `<div class="ad-foot"><button class="ab pri" data-act="save-content">Save content</button></div>`
  }

  function paint() {
    if (!S.user) { app.innerHTML = login(); return }
    const view = S.loading ? '<p class="ad-mut">Loading...</p>' : S.view === 'projects' ? projects() : S.view === 'about' ? about() : S.view === 'content' ? content() : overview()
    app.innerHTML = shell(view)
    if (S.view === 'projects' && S.edit) { setCover(); setGallery() }
    if (S.view === 'about' && S.imgs) Object.keys(S.imgs).forEach(setSiteImg)
  }
  const setCover = () => { const e = $('#prev-cover'); if (e) e.innerHTML = prev(S.edit.cover_url) }
  const setGallery = () => { const e = $('#prev-gal'); if (e) e.innerHTML = S.edit.gallery.length ? S.edit.gallery.map((u, i) => `<div class="pv"><img src="${esc(imgSrc(u))}" alt=""><button type="button" data-act="rm-gal" data-i="${i}" aria-label="Remove image"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></div>`).join('') : '<span class="ad-none">No images</span>' }
  const setSiteImg = (k) => { const e = $('#prev-' + k); if (e) e.innerHTML = prev(S.imgs[k]) }

  // ---------- Actions ----------
  const withBusy = async (btn, fn) => {
    if (btn) btn.disabled = true
    try { await fn() } catch (e) { toast(msg(e), true) } finally { if (btn && btn.isConnected) btn.disabled = false }
  }
  const ACT = {
    nav: (b) => { S.view = b.dataset.v; S.edit = null; paint(); scrollTo(0, 0) },
    logout: () => sb.auth.signOut(),
    pw: (b) => { const i = b.parentElement.querySelector('input'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); b.innerHTML = `<i class="fa-regular ${show ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>` },
    new: () => { S.view = 'projects'; S.edit = { slug: '', title: '', category: '', summary: '', description: '', client: '', role: '', year: '', delivery_time: '', tools: [], link: '', cover_url: '', gallery: [], published: true, fresh: true }; paint(); scrollTo(0, 0) },
    edit: (b) => { const p = S.projects.find((x) => x.id === b.dataset.id); if (p) { S.edit = { ...p, tools: [...(p.tools || [])], gallery: [...(p.gallery || [])] }; paint(); scrollTo(0, 0) } },
    cancel: () => { S.edit = null; paint() },
    'rm-gal': (b) => { S.edit.gallery.splice(+b.dataset.i, 1); setGallery() },
    del: (b) => {
      const p = S.projects.find((x) => x.id === b.dataset.id)
      if (!p || !confirm(`Delete "${p.title}"? This cannot be undone.`)) return
      return withBusy(b, async () => { const r = await sb.from('projects').delete().eq('id', p.id); if (r.error) throw r.error; await loadProjects(); paint(); toast('Project deleted') })
    },
    up: (b) => move(+b.dataset.i, -1), down: (b) => move(+b.dataset.i, 1),
    import: (b) => withBusy(b, async () => {
      const rows = D.projects.map((p, i) => ({ slug: p.slug, title: p.title, category: p.category, summary: p.summary, description: p.description, client: p.client, role: p.role, year: p.year, delivery_time: p.deliveryTime, tools: p.tools, link: p.link, cover_url: p.src, gallery: p.gallery, sort_order: i + 1, published: true }))
      const r = await sb.from('projects').insert(rows); if (r.error) throw r.error
      await loadProjects(); paint(); toast('Projects imported')
    }),
    sitemap: () => sitemap(),
    'l-add': (b) => { const l = b.dataset.l; S.lists[l].push(LISTS[l].blank()); paint() },
    'l-del': (b) => { S.lists[b.dataset.l].splice(+b.dataset.i, 1); paint() },
    'l-up': (b) => lmove(b, -1), 'l-down': (b) => lmove(b, 1),
    'save-content': (b) => withBusy(b, async () => {
      const patch = {}
      for (const [l, cfg] of Object.entries(LISTS)) patch[l] = S.lists[l].filter((x) => (cfg.label(x) || '').trim()).map((x) => Object.fromEntries(Object.entries(x).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])))
      await saveSite(patch); S.lists = null; paint(); toast('Content saved')
    }),
  }
  async function move(i, d) {
    const a = S.projects, j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]
    const changed = []
    a.forEach((p, n) => { if (p.sort_order !== n + 1) { p.sort_order = n + 1; changed.push(p) } })
    paint()
    try {
      const rs = await Promise.all(changed.map((p) => sb.from('projects').update({ sort_order: p.sort_order }).eq('id', p.id)))
      const bad = rs.find((r) => r.error); if (bad) throw bad.error
    } catch (e) { toast(msg(e), true); loadProjects().then(paint) }
  }
  function lmove(b, d) {
    const a = S.lists[b.dataset.l], i = +b.dataset.i, j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]; paint()
  }
  function sitemap() {
    let base = (C.siteUrl || '').replace(/\/+$/, '')
    if (!base) base = (prompt('Enter your live website address, for example https://vikkreative.com') || '').trim().replace(/\/+$/, '')
    if (!isUrl(base)) return toast('A valid website address is needed to make the sitemap.', true)
    const day = new Date().toISOString().slice(0, 10)
    const urls = [['', '1.0'], ['about.html', '0.7'], ...S.projects.filter((p) => p.published).map((p) => [`project.html?p=${encodeURIComponent(p.slug)}`, '0.8'])]
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, pr]) => `  <url><loc>${esc(base + '/' + u)}</loc><lastmod>${day}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([xml], { type: 'application/xml' })); a.download = 'sitemap.xml'; document.body.append(a); a.click(); a.remove()
    toast('sitemap.xml downloaded. Replace the file in your website folder.')
  }
  async function onFile(inp) {
    const t = inp.dataset.up, files = [...inp.files]
    if (!files.length) return
    const box = inp.closest('.ad-up'); box.classList.add('busy')
    try {
      if (t === 'cover') { S.edit.cover_url = await upload(files[0], 'projects'); setCover() }
      else if (t === 'gallery') { for (const f of files) S.edit.gallery.push(await upload(f, 'projects')); setGallery() }
      else { S.imgs[t] = await upload(files[0], 'site'); setSiteImg(t) }
    } catch (e) { toast(msg(e), true) }
    box.classList.remove('busy'); inp.value = ''
  }

  // ---------- Events ----------
  app.addEventListener('click', (e) => { const b = e.target.closest('[data-act]'); if (b && ACT[b.dataset.act]) ACT[b.dataset.act](b) })
  app.addEventListener('change', (e) => { if (e.target.matches('input[type=file]')) onFile(e.target) })
  app.addEventListener('input', (e) => {
    const t = e.target
    if (t.dataset.l) {
      const row = S.lists[t.dataset.l][+t.dataset.i]; row[t.dataset.k] = t.value
      if (t.dataset.l === 'tools' && t.dataset.k === 'name' && (!row.logo || row.logo === 'none') && autoLogo(t.value)) { row.logo = autoLogo(t.value); const sel = t.closest('.ad-rep').querySelector('select'); if (sel) sel.value = row.logo }
    }
    if (t.name === 'title' && S.edit?.fresh) { const s = t.form.elements.slug; if (!s.dataset.touched) s.value = slugify(t.value) }
    if (t.name === 'slug') t.dataset.touched = '1'
  })
  app.addEventListener('submit', (e) => {
    e.preventDefault()
    const f = e.target
    if (f.id === 'lf') return doLogin(f)
    if (f.id === 'pf') return withBusy(f.querySelector('[type=submit]'), () => saveProject(f))
    if (f.id === 'af') return withBusy(f.querySelector('[type=submit]'), () => saveAbout(f))
  })
  async function doLogin(f) {
    const b = f.querySelector('[type=submit]'), er = $('#lerr'), lab = b.querySelector('span')
    if (!f.elements.email.value.trim() || !f.elements.password.value) { er.textContent = 'Enter your email and password.'; return }
    b.disabled = true; lab.textContent = 'Signing in...'; er.textContent = ''
    const r = await sb.auth.signInWithPassword({ email: f.elements.email.value.trim(), password: f.elements.password.value })
    if (r.error) { er.textContent = /invalid/i.test(r.error.message) ? 'Wrong email or password.' : r.error.message; b.disabled = false; lab.textContent = 'Sign in' }
  }
  async function saveProject(f) {
    const v = (n) => f.elements[n].value.trim(), e = S.edit
    const row = { title: v('title'), slug: slugify(v('slug') || v('title')), category: v('category'), summary: v('summary'), description: v('description'), client: v('client'), role: v('role'), year: v('year'), delivery_time: v('delivery_time'), tools: v('tools').split(',').map((s) => s.trim()).filter(Boolean), link: v('link'), cover_url: e.cover_url || '', gallery: e.gallery, published: f.elements.published.checked, updated_at: new Date().toISOString() }
    if (!row.title) throw new Error('Add a title.')
    if (!row.slug) throw new Error('Add a page address.')
    if (!row.cover_url) throw new Error('Add a cover image.')
    if (row.link && !isUrl(row.link)) throw new Error('The case study link must start with http:// or https://')
    if (S.projects.some((p) => p.slug === row.slug && p.id !== e.id)) throw new Error('Another project already uses that page address. Change it.')
    let r
    if (e.id) r = await sb.from('projects').update(row).eq('id', e.id)
    else { row.sort_order = S.projects.length ? Math.min(...S.projects.map((p) => p.sort_order)) - 1 : 1; r = await sb.from('projects').insert(row) }
    if (r.error) throw r.error
    await loadProjects(); S.edit = null; paint(); scrollTo(0, 0); toast('Project saved')
  }
  async function saveAbout(f) {
    const v = (n) => f.elements[n].value.trim(), patch = {}
    ;['name', 'brand', 'role', 'email', 'heroTitle', 'heroText', 'about', 'aboutLong'].forEach((k) => (patch[k] = v(k)))
    Object.assign(patch, S.imgs)
    await saveSite(patch); toast('Saved. The website now shows your changes.')
  }

  // ---------- Auth ----------
  const onUser = (u) => { if ((u?.id || null) === (S.user?.id || null)) return; S.user = u; S.view = 'overview'; S.edit = null; if (u) setTimeout(boot, 0); else paint() }
  sb.auth.onAuthStateChange((_e, session) => onUser(session?.user || null))
  sb.auth.getSession().then(({ data }) => { onUser(data.session?.user || null); if (!data.session) paint() })
})()
