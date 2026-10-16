(() => {
  const C = window.SITE_CONFIG, D = window.SITE, LOGOS = window.LOGOS || {}
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)]
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const set = (id, html) => { const e = $(id); if (e) e.innerHTML = html }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const paras = (t = '') => String(t).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
  const vt = (slug) => 'vt-' + String(slug).replace(/[^a-z0-9-]/gi, '')
  const isUrl = (u) => /^https?:\/\//.test(u || '')
  const SITE_URL = (C.siteUrl || '').replace(/\/+$/, '')

  // ---------- Tools trust strip ----------
  const logoFor = (t) => {
    if (t.logo === 'none') return ''
    return LOGOS[t.logo] || LOGOS[String(t.name || '').toLowerCase().replace(/[^a-z]/g, '')] || ''
  }
  const toolLi = (t) => {
    const src = logoFor(t), n = String(t.name || '')
    return `<li class="tool glass">${src ? `<img class="tool-logo" src="${esc(src)}" alt="" width="34" height="34">` : `<b>${esc(t.abbr || n.slice(0, 2))}</b>`}<span>${esc(n)}</span></li>`
  }
  function renderTools(list) {
    const el = $('#tools')
    if (!el) return
    const seg = list.map(toolLi).join('')
    el.style.setProperty('--dur', `${Math.max(24, list.length * 9)}s`)
    el.innerHTML = Array.from({ length: 6 }, (_, i) => `<ul class="seg"${i ? ' aria-hidden="true"' : ''}>${seg}</ul>`).join('')
  }

  // ---------- SEO helpers ----------
  const meta = (sel, attr, key, val) => {
    let e = document.head.querySelector(sel)
    if (!e) { e = document.createElement('meta'); e.setAttribute(attr, key); document.head.append(e) }
    e.setAttribute('content', val)
  }
  function canon(path) {
    if (!SITE_URL) return
    let l = document.head.querySelector('link[rel=canonical]')
    if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.append(l) }
    l.href = `${SITE_URL}/${path}`
    meta('meta[property="og:url"]', 'property', 'og:url', l.href)
  }
  const abs = (u = '') => (isUrl(u) ? u : SITE_URL ? `${SITE_URL}/${u.replace(/^\//, '')}` : u)

  // ---------- Rendering ----------
  const card = (p, i) => `<a class="pcard" href="project.html?p=${encodeURIComponent(p.slug)}" style="--i:${i}"><div class="pcard-in"><div class="pcard-text"><div class="pcard-top"><span class="pcard-n">${String(i + 1).padStart(2, '0')}</span>${p.category ? `<span class="chip">${esc(p.category)}</span>` : ''}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><div class="pcard-foot">${p.deliveryTime ? `<span class="time"><i class="fa-regular fa-clock" aria-hidden="true"></i>Delivery ${esc(p.deliveryTime)}</span>` : '<span></span>'}<span class="go">View project <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></div></div><div class="pcard-media">${p.src ? `<img src="${esc(p.src)}" alt="${esc(p.title)}" width="808" height="632" loading="lazy" style="view-transition-name:${vt(p.slug)}">` : ''}</div></div></a>`

  function render(d, ready) {
    $$('[data-f]').forEach((e) => (e.textContent = d[e.dataset.f] ?? ''))
    $$('[data-img]').forEach((e) => { if (d[e.dataset.img]) e.src = d[e.dataset.img] })
    $$('[data-img="portraitSrc"]').forEach((e) => (e.alt = d.name))
    $$('[data-year]').forEach((e) => (e.textContent = new Date().getFullYear()))
    $$('[data-email]').forEach((e) => { e.textContent = d.email; e.href = 'mailto:' + d.email })
    set('#work-list', d.projects.map(card).join(''))
    set('#cards', d.services.map((s) => `<article class="glass tilt"><div class="tilt-in"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join(''))
    set('#foot-services', d.services.map((s) => `<li><a href="index.html#services">${esc(s.title)}</a></li>`).join(''))
    renderTools(d.tools)
    set('#steps', d.process.map((s) => `<li><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join(''))
    set('#story', paras(d.aboutLong || d.about).map((t) => `<p class="lead story">${esc(t)}</p>`).join(''))
    const q = $('#testimonials')
    if (q) { q.hidden = !d.testimonials.length; set('#quotes', d.testimonials.map((t) => `<figure class="quote"><i class="fa-solid fa-quote-left" aria-hidden="true"></i><blockquote>${esc(t.quote)}</blockquote><figcaption><b>${esc(t.name)}</b><span>${esc(t.role)}</span></figcaption></figure>`).join('')) }
    if ($('#p-main')) renderProject(d, ready)
  }

  // ---------- Project preview page ----------
  function renderProject(d, ready) {
    const slug = new URLSearchParams(location.search).get('p')
    const i = d.projects.findIndex((x) => x.slug === slug), p = d.projects[i]
    const main = $('#p-main'), miss = $('#p-missing')
    if (!p) { main.hidden = true; miss.hidden = !ready; return }
    miss.hidden = true; main.hidden = false
    $('#p-cat').textContent = p.category
    $('#p-title').textContent = p.title
    $('#p-summary').textContent = p.summary; $('#p-summary').hidden = !p.summary
    const facts = [['Delivery time', p.deliveryTime, 1], ['Client', p.client], ['Role', p.role], ['Year', p.year]].filter((f) => f[1])
    set('#p-facts', facts.map(([k, v, hl]) => `<div class="fact${hl ? ' hl' : ''}"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join(''))
    $('#p-facts').hidden = !facts.length
    const cover = $('#p-cover')
    if (p.src) { cover.src = p.src; cover.alt = p.title; cover.style.viewTransitionName = vt(p.slug) }
    cover.parentElement.hidden = !p.src
    $('#p-time').textContent = p.deliveryTime || 'Agreed in your free quote'
    const a = $('#p-link'); a.hidden = !isUrl(p.link); if (isUrl(p.link)) a.href = p.link
    const ps = paras(p.description)
    set('#p-desc', ps.length ? '<h2>About this project</h2>' + ps.map((t) => `<p class="lead">${esc(t)}</p>`).join('') : '')
    set('#p-tools', (p.tools || []).map((t) => `<span class="chip">${esc(t)}</span>`).join(''))
    const gal = (p.gallery || []).filter(Boolean)
    $('#p-gallery-wrap').hidden = !gal.length
    set('#p-gallery', gal.map((s) => `<img data-depth src="${esc(s)}" alt="${esc(p.title)} detail" loading="lazy">`).join(''))
    const n = d.projects[(i + 1) % d.projects.length], nx = $('#p-next')
    nx.hidden = d.projects.length < 2
    if (d.projects.length > 1) nx.innerHTML = `<a class="next" href="project.html?p=${encodeURIComponent(n.slug)}"><div><small>Next project</small><h3>${esc(n.title)}</h3><span class="go">View project <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></div>${n.src ? `<img src="${esc(n.src)}" alt="" loading="lazy">` : '<span></span>'}</a>`
    const title = `${p.title} | ${d.brand}`
    document.title = title
    const desc = p.summary || `${p.title}, a ${p.category || 'design'} project by ${d.name}.`
    meta('meta[name=description]', 'name', 'description', desc)
    meta('meta[property="og:title"]', 'property', 'og:title', title)
    meta('meta[property="og:description"]', 'property', 'og:description', desc)
    meta('meta[property="og:type"]', 'property', 'og:type', 'article')
    meta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    if (p.src) meta('meta[property="og:image"]', 'property', 'og:image', abs(p.src))
    canon(`project.html?p=${encodeURIComponent(p.slug)}`)
  }

  // ---------- Admin content (Supabase), loaded in the browser ----------
  const REST = (path) => fetch(`${C.supabaseUrl.replace(/\/+$/, '')}/rest/v1/${path}`, { headers: { apikey: C.supabaseAnonKey } }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  async function remote() {
    if (!C.supabaseUrl || !C.supabaseAnonKey) return null
    const [s, pr] = await Promise.all([REST('site_settings?id=eq.1&select=data'), REST('projects?select=*&published=eq.true&order=sort_order.asc')])
    return { site: s[0]?.data, projects: pr }
  }
  const norm = (x) => ({ slug: x.slug, title: x.title, category: x.category || '', summary: x.summary || '', description: x.description || '', client: x.client || '', role: x.role || '', year: x.year || '', deliveryTime: x.delivery_time || '', tools: x.tools || [], link: x.link || '', src: x.cover_url || '', gallery: x.gallery || [] })
  const TEXT = ['name', 'brand', 'role', 'heroTitle', 'heroText', 'email', 'about', 'aboutLong', 'heroSrc', 'servicesSrc', 'contactSrc', 'portraitSrc']
  const LISTS = ['process', 'testimonials', 'services', 'tools']
  function merge(res) {
    const d = { ...D }, s = res.site || {}
    TEXT.forEach((k) => { if (typeof s[k] === 'string' && s[k].trim()) d[k] = s[k] })
    LISTS.forEach((k) => { if (Array.isArray(s[k])) d[k] = s[k] })
    if (res.projects.length) d.projects = res.projects.map(norm)
    return d
  }

  // ---------- Smooth scroll + 3D motion ----------
  let kill = () => {}, heroDone = false, L = null
  function motion() {
    kill()
    const g = window.gsap
    if (!g || !window.ScrollTrigger || !window.Lenis || reduced) return
    g.registerPlugin(ScrollTrigger)
    if (!heroDone && $('[data-hero]')) { g.from('[data-hero] > *', { y: 44, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.15 }); heroDone = true }
    const lenis = new Lenis(), tick = (t) => lenis.raf(t * 1000)
    L = lenis
    lenis.on('scroll', ScrollTrigger.update); g.ticker.add(tick); g.ticker.lagSmoothing(0)
    const small = innerWidth < 700
    const ctx = g.context(() => {
      g.utils.toArray('[data-bg]').forEach((el) => g.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }))

      // Hero depth: the text drifts away and the picture pushes in
      if ($('#home')) {
        g.to('[data-hero]', { yPercent: -16, opacity: 0.1, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } })
        g.fromTo('#home .bg', { scale: 1 }, { scale: 1.14, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } })
      }

      // Projects: each card tips up into place, then the one beneath it leans back as the next slides over it
      const cards = g.utils.toArray('.pcard')
      cards.forEach((c, i) => {
        const inn = c.querySelector('.pcard-in'), nx = cards[i + 1]
        g.fromTo(inn, { rotateX: small ? 9 : 16, y: 90, scale: 0.94, opacity: 0.15 }, { rotateX: 0, y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: c, start: 'top 98%', end: 'top 62%', scrub: true } })
        if (nx) g.fromTo(inn, { scale: 1, rotateX: 0, '--dim': 0 }, { scale: 0.92, rotateX: small ? -3 : -6, '--dim': 0.5, ease: 'none', immediateRender: false, scrollTrigger: { trigger: nx, start: 'top 85%', end: 'top 22%', scrub: true } })
      })

      // Service cards fold up from below
      if ($('#cards .glass')) g.from('#cards .glass', { rotateX: -28, y: 70, opacity: 0, transformPerspective: 900, transformOrigin: '50% 100%', stagger: 0.12, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '#cards', start: 'top 88%', once: true } })

      // Portrait, project cover and gallery images tilt flat as they arrive
      g.utils.toArray('[data-depth]').forEach((el) => g.fromTo(el, { rotateX: small ? 4 : 8, y: 40, opacity: 0.4, transformPerspective: 2000, transformOrigin: '50% 100%' }, { rotateX: 0, y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 98%', end: 'top 50%', scrub: true } }))
    })
    kill = () => { ctx.revert(); g.ticker.remove(tick); lenis.destroy(); L = null }
  }

  // Back to top
  document.addEventListener('click', (e) => {
    if (!e.target.closest?.('[data-top]')) return
    e.preventDefault()
    L ? L.scrollTo(0) : scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  })

  // Hover tilt on service cards
  if (matchMedia('(hover:hover)').matches && !reduced) {
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest?.('.tilt'); if (!c) return
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5, t = c.firstElementChild
      t.style.setProperty('--ry', `${x * 10}deg`); t.style.setProperty('--rx', `${-y * 10}deg`)
    })
    document.addEventListener('pointerout', (e) => {
      const c = e.target.closest?.('.tilt')
      if (c && !c.contains(e.relatedTarget)) { c.firstElementChild.style.setProperty('--rx', '0deg'); c.firstElementChild.style.setProperty('--ry', '0deg') }
    })
  }

  // Contact form (Web3Forms sends it to the email the key was created with)
  const form = $('#form')
  if (form) form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const st = $('#status'), b = form.querySelector('button')
    if (!C.web3formsKey) { st.textContent = 'The contact form is not connected yet. Add the Web3Forms key in js/content.js.'; return }
    b.disabled = true; st.textContent = 'Sending...'
    try {
      const body = { ...Object.fromEntries(new FormData(form)), access_key: C.web3formsKey, subject: 'New portfolio enquiry' }
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
      const j = await r.json()
      st.textContent = j.success ? 'Message sent. Expect a reply by email.' : 'Message not sent. Check the fields and try again.'
      if (j.success) form.reset()
    } catch { st.textContent = 'Message not sent. Check your connection and try again.' }
    b.disabled = false
  })

  // Start
  const hasRemote = !!(C.supabaseUrl && C.supabaseAnonKey)
  if (!$('#p-main')) canon(location.pathname.split('/').pop() === 'about.html' ? 'about.html' : '')
  render(D, !hasRemote); motion()
  remote().then((res) => { if (res) { render(merge(res), true); motion() } }).catch(() => { if ($('#p-main')) renderProject(D, true) })
})()
