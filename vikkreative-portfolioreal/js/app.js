(() => {
  const C = window.SITE_CONFIG, D = window.SITE, LOGOS = window.LOGOS || {}, ICONS = window.ICONS || {}
  const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)]
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const set = (id, html) => { const e = $(id); if (e) e.innerHTML = html }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const paras = (t = '') => String(t).split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
  const vt = (slug) => 'vt-' + String(slug).replace(/[^a-z0-9-]/gi, '')
  const isUrl = (u) => /^https?:\/\//.test(u || '')
  const SITE_URL = (C.siteUrl || '').replace(/\/+$/, '')
  const list = (t = '') => String(t).split(',').map((x) => x.trim()).filter(Boolean)
  const pills = (c) => list(c).map((x) => `<span class="pill">${esc(x)}</span>`).join('')
  let CUR = D

  // ---------- Clean addresses ----------
  // On the live site the links have no .html. When the folder is opened on your own computer the .html is added back so the pages still open.
  const LOCAL = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)
  const fixLinks = () => {
    if (!LOCAL) return
    $$('a[href]').forEach((a) => {
      const h = a.getAttribute('href'), n = h.replace(/^\.\/(?=$|#)/, 'index.html').replace(/^(about|project)(?=$|[?#])/, '$1.html')
      if (n !== h) a.setAttribute('href', n)
    })
  }
  if (!LOCAL) {
    const clean = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '')
    if (clean !== location.pathname) history.replaceState(null, '', clean + location.search + location.hash)
  }

  // ---------- Tools and skills strip ----------
  const logoFor = (t) => {
    if (t.logo === 'none') return ''
    return LOGOS[t.logo] || LOGOS[String(t.name || '').toLowerCase().replace(/[^a-z]/g, '')] || ''
  }
  const toolLi = (t) => {
    const src = logoFor(t), n = String(t.name || '')
    const ic = ICONS[t.logo]
    return `<li class="tool">${src ? `<img class="tool-logo" src="${esc(src)}" alt="" width="34" height="34">` : ic ? `<span class="tool-ic"><i class="fa-solid ${esc(ic)}" aria-hidden="true"></i></span>` : `<b>${esc(t.abbr || n.slice(0, 2))}</b>`}<span>${esc(n)}</span></li>`
  }
  const BRANDS = { html: 'fa-brands fa-html5', css: 'fa-brands fa-css3-alt', javascript: 'fa-brands fa-js', js: 'fa-brands fa-js', react: 'fa-brands fa-react', github: 'fa-brands fa-github', git: 'fa-brands fa-git-alt', node: 'fa-brands fa-node-js', sketch: 'fa-brands fa-sketch', notion: 'fa-brands fa-notion', slack: 'fa-brands fa-slack' }
  const ptool = (name) => {
    const n = String(name), k = n.toLowerCase().replace(/[^a-z]/g, ''), src = LOGOS[k], ic = ICONS[k] ? `fa-solid ${ICONS[k]}` : BRANDS[k]
    return `<span class="ptool" data-rv>${src ? `<img src="${esc(src)}" alt="" width="30" height="30">` : `<span class="ti">${ic ? `<i class="${ic}" aria-hidden="true"></i>` : esc(n.slice(0, 2))}</span>`}${esc(n)}</span>`
  }
  function renderTools(items) {
    const el = $('#tools')
    if (!el) return
    const seg = items.map(toolLi).join('')
    el.style.setProperty('--dur', `${Math.max(24, items.length * 9)}s`)
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

  // ---------- Location label that rolls through several places ----------
  let locTimer = null
  function startLoc(items) {
    clearInterval(locTimer)
    const loc = $('#loc'), track = loc && loc.querySelector('.loc-track')
    if (!loc) return
    loc.hidden = !items.length
    if (!track) return
    track.style.transition = 'none'; track.style.transform = ''
    track.innerHTML = (items.length > 1 ? items.concat(items[0]) : items).map((x) => `<span>${esc(x)}</span>`).join('')
    if (items.length < 2 || reduced) return
    let i = 0
    locTimer = setInterval(() => {
      i++
      track.style.transition = ''; track.style.transform = `translateY(-${i * 1.5}em)`
      if (i === items.length) setTimeout(() => { track.style.transition = 'none'; track.style.transform = ''; i = 0 }, 700)
    }, 2400)
  }

  // ---------- Rendering ----------
  const zcard = (p) => `<a class="zc" data-rv href="project?p=${encodeURIComponent(p.slug)}"><div class="zc-in"><div class="pills">${pills(p.category)}</div><h3>${esc(p.title)}</h3>${p.summary ? `<p class="zc-sum">${esc(p.summary)}</p>` : ''}${p.src ? `<div class="zc-img"><img src="${esc(p.src)}" alt="${esc(p.title)}" width="808" height="632" loading="lazy" style="view-transition-name:${vt(p.slug)}"></div>` : ''}</div></a>`

  function strips(projects) {
    const a = $('#strip-a'), b = $('#strip-b')
    if (!a || !b) return
    const items = projects.filter((p) => p.src), wrap = a.closest('.strips')
    wrap.hidden = !items.length
    if (!items.length) return
    let base = items
    while (base.length < 8) base = base.concat(items)
    const one = (p) => `<a href="project?p=${encodeURIComponent(p.slug)}" tabindex="-1" aria-label="${esc(p.title)}"><img src="${esc(p.src)}" alt="" width="808" height="632" decoding="async"><span class="tip"><b>${esc(p.title)}</b><span class="pills">${pills(p.category)}</span></span></a>`
    const row = (arr) => { const h = arr.map(one).join(''); return h + h.replace(/<a /g, '<a aria-hidden="true" ') }
    const half = Math.floor(base.length / 2)
    a.innerHTML = row(base); b.innerHTML = row(base.slice(half).concat(base.slice(0, half)))
    a.style.setProperty('--dur', `${base.length * 8}s`); b.style.setProperty('--dur', `${base.length * 9}s`)
  }

  function render(d, ready) {
    CUR = d
    $$('[data-f]').forEach((e) => (e.textContent = d[e.dataset.f] ?? ''))
    $$('[data-img]').forEach((e) => { if (d[e.dataset.img]) e.src = d[e.dataset.img] })
    const hv = $('.hero-vid'); if (hv && ((d.heroSrc && d.heroSrc !== 'images/hero.webp') || matchMedia('(prefers-reduced-motion: reduce)').matches)) hv.remove()
    $$('[data-img="portraitSrc"]').forEach((e) => (e.alt = d.name))
    $$('[data-year]').forEach((e) => (e.textContent = new Date().getFullYear()))
    $$('[data-email]').forEach((e) => { const i = e.querySelector('i'); e.textContent = ' ' + d.email; if (i) e.prepend(i); e.href = 'mailto:' + d.email })
    $$('[data-phone]').forEach((e) => { const i = e.querySelector('i'); e.hidden = !d.phone; e.textContent = ' ' + (d.phone || ''); if (i) e.prepend(i); e.href = 'tel:' + String(d.phone || '').replace(/[^0-9+]/g, '') })
    startLoc(list(d.location))
    set('#roles', list(d.roles).map((r) => `<span>${esc(r)}</span>`).join(''))
    strips(d.projects)
    const groups = []
    d.projects.forEach((p) => { const c = list(p.category)[0] || 'More work'; let g = groups.find((x) => x.c === c); if (!g) groups.push((g = { c, items: [] })); g.items.push(p) })
    set('#work-list', groups.map((g) => `<section class="cat" aria-label="${esc(g.c)}"><header class="cat-h" data-rv><h3>${esc(g.c)}</h3></header><div class="zgrid">${g.items.map(zcard).join('')}</div></section>`).join(''))
    set('#cards', d.services.map((s) => `<article class="glass tilt"><div class="tilt-in"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join(''))
    set('#foot-services', d.services.map((s) => `<li><a href="./#services">${esc(s.title)}</a></li>`).join(''))
    renderTools(d.tools)
    set('#steps', d.process.map((s) => `<li data-rv><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join(''))
    set('#story', paras(d.aboutLong || d.about).map((t) => `<p class="lead story">${esc(t)}</p>`).join(''))
    const q = $('#testimonials')
    if (q) { q.hidden = !d.testimonials.length; set('#quotes', d.testimonials.map((t) => `<figure class="quote"><i class="fa-solid fa-quote-left" aria-hidden="true"></i><blockquote>${esc(t.quote)}</blockquote><figcaption><b>${esc(t.name)}</b><span>${esc(t.role)}</span></figcaption></figure>`).join('')) }
    if ($('#p-main')) renderProject(d, ready)
    fixLinks()
  }

  // ---------- Project preview page ----------
  function renderProject(d, ready) {
    const slug = new URLSearchParams(location.search).get('p')
    const i = d.projects.findIndex((x) => x.slug === slug), p = d.projects[i]
    const main = $('#p-main'), miss = $('#p-missing')
    if (!p) { main.hidden = true; miss.hidden = !ready; return }
    miss.hidden = true; main.hidden = false
    set('#p-cat', pills(p.category))
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
    set('#p-tools', (p.tools || []).length ? '<h3 data-rv>Tools used</h3><div class="ptools">' + p.tools.map(ptool).join('') + '</div>' : '')
    const gal = (p.gallery || []).filter(Boolean)
    $('#p-gallery-wrap').hidden = !gal.length
    set('#p-gallery', gal.map((s) => `<img data-depth src="${esc(s)}" alt="${esc(p.title)} detail" loading="lazy">`).join(''))
    const vw = $('#p-video-wrap'), vd = $('#p-video')
    vw.hidden = !isUrl(p.video) && !p.video
    if (!vw.hidden) { vd.poster = p.src || ''; vd.src = p.video; if ('IntersectionObserver' in window) new IntersectionObserver((en) => en.forEach((x) => (x.isIntersecting ? vd.play().catch(() => {}) : vd.pause())), { threshold: 0.35 }).observe(vd) }
    const cs = [['The problem', p.problem], ['The approach', p.approach]].filter((x) => x[1])
    $('#p-case').hidden = !cs.length
    set('#p-case', cs.map(([k, t], n) => `<article class="case-c" data-rv><small>${String(n + 1).padStart(2, '0')}</small><h3>${k}</h3>${paras(t).map((x) => `<p>${esc(x)}</p>`).join('')}</article>`).join(''))
    const wf = (p.wireframes || []).filter(Boolean)
    $('#p-wire-wrap').hidden = !wf.length
    set('#p-wire', wf.map((s) => `<img data-rv data-par src="${esc(s)}" alt="${esc(p.title)} wireframe" loading="lazy">`).join(''))
    const mk = (p.mockups || []).filter(Boolean)
    $('#p-mock-wrap').hidden = !mk.length
    set('#p-mock', mk.map((s) => `<img data-rv data-par src="${esc(s)}" alt="${esc(p.title)} mockup" loading="lazy">`).join(''))
    const pr = p.process || []
    $('#p-process-wrap').hidden = !pr.length
    set('#p-process', pr.map((s) => `<li data-rv><h3>${esc(s.title)}</h3>${s.text ? `<p>${esc(s.text)}</p>` : ''}</li>`).join(''))
    $('#p-results-wrap').hidden = !p.results
    set('#p-results', paras(p.results).map((x) => `<p>${esc(x)}</p>`).join(''))
    $('#p-quote-wrap').hidden = !p.quote
    set('#p-quote', p.quote ? `<figure class="quote" data-rv><i class="fa-solid fa-quote-left" aria-hidden="true"></i><blockquote>${esc(p.quote)}</blockquote><figcaption><b>${esc(p.quoteName)}</b><span>${esc(p.quoteRole)}</span></figcaption></figure>` : '')
    const n = d.projects[(i + 1) % d.projects.length], nx = $('#p-next')
    nx.hidden = d.projects.length < 2
    if (d.projects.length > 1) nx.innerHTML = `<a class="next" href="project?p=${encodeURIComponent(n.slug)}"><div><small>Next project</small><h3>${esc(n.title)}</h3><span class="go">View project <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span></div>${n.src ? `<img src="${esc(n.src)}" alt="" loading="lazy">` : '<span></span>'}</a>`
    const title = `${p.title} | ${d.brand}`
    document.title = title
    const desc = p.summary || `${p.title}, a ${p.category || 'design'} project by ${d.name}.`
    meta('meta[name=description]', 'name', 'description', desc)
    meta('meta[property="og:title"]', 'property', 'og:title', title)
    meta('meta[property="og:description"]', 'property', 'og:description', desc)
    meta('meta[property="og:type"]', 'property', 'og:type', 'article')
    meta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    if (p.src) meta('meta[property="og:image"]', 'property', 'og:image', abs(p.src))
    canon(`project?p=${encodeURIComponent(p.slug)}`)
  }

  // ---------- Admin content (Supabase), loaded in the browser ----------
  const REST = (path) => fetch(`${C.supabaseUrl.replace(/\/+$/, '')}/rest/v1/${path}`, { headers: { apikey: C.supabaseAnonKey } }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
  async function remote() {
    if (!C.supabaseUrl || !C.supabaseAnonKey) return null
    const [s, pr] = await Promise.all([REST('site_settings?id=eq.1&select=data'), REST('projects?select=*&published=eq.true&order=sort_order.asc')])
    return { site: s[0]?.data, projects: pr }
  }
  const stepsOf = (t = '') => String(t).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [a, ...b] = l.split('|'); return { title: a.trim(), text: b.join('|').trim() } })
  const norm = (x) => ({ slug: x.slug, title: x.title, category: x.category || '', summary: x.summary || '', description: x.description || '', client: x.client || '', role: x.role || '', year: x.year || '', deliveryTime: x.delivery_time || '', tools: x.tools || [], link: x.link || '', src: x.cover_url || '', gallery: x.gallery || [], video: x.video_url || '', mockups: x.mockups || [], wireframes: x.wireframes || [], problem: x.problem || '', approach: x.approach || '', results: x.results || '', process: stepsOf(x.process), quote: x.quote || '', quoteName: x.quote_name || '', quoteRole: x.quote_role || '' })
  const TEXT = ['name', 'brand', 'role', 'roles', 'location', 'phone', 'heroTitle', 'heroText', 'email', 'about', 'aboutLong', 'heroSrc', 'servicesSrc', 'contactSrc', 'portraitSrc']
  const LISTS = ['process', 'testimonials', 'services', 'tools']
  function merge(res) {
    const d = { ...D }, s = res.site || {}
    TEXT.forEach((k) => { if (typeof s[k] === 'string' && s[k].trim()) d[k] = s[k] })
    LISTS.forEach((k) => { if (Array.isArray(s[k])) d[k] = s[k] })
    if (res.projects.length) d.projects = res.projects.map(norm)
    return d
  }

  // ---------- Opening animation, smooth scroll and 3D motion ----------
  let kill = () => {}, heroDone = false, L = null
  function splitName() {
    const nm = $('.who h1 [data-f=name]')
    if (!nm || nm.querySelector('.ch')) return
    const t = nm.textContent
    nm.setAttribute('aria-label', t)
    nm.innerHTML = [...t].map((c) => `<span class="ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')
  }
  function intro(g) {
    splitName()
    const tl = g.timeline({ defaults: { ease: 'power3.out' }, delay: 0.25 })
    tl.from('.hero-card', { scale: 0.88, y: 50, opacity: 0, borderRadius: 80, duration: 1.5, ease: 'expo.out' }, 0)
      .from('.hero-card img, .hero-card video', { scale: 1.4, filter: 'blur(16px) brightness(.4)', duration: 2.2, ease: 'expo.out' }, 0)
      .from('.avatar', { scale: 0.4, opacity: 0, rotate: -10, duration: 1, ease: 'back.out(1.6)' }, 0.5)
      .from('.who h1 .ch, .who h1 .dot', { yPercent: 115, rotate: 5, duration: 1, stagger: 0.03 }, 0.6)
      .from('.loc', { opacity: 0, y: 8, duration: 0.6 }, 1.1)
      .from('.roles span, .tagline, .contacts a, .callbtn', { y: 22, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.95)
      .from('.strip', { opacity: 0, y: 40, duration: 1, stagger: 0.15 }, 1.2)
      .from('.dock', { y: 110, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, 1.3)
  }
  function motion() {
    kill()
    const g = window.gsap
    if (!g || !window.ScrollTrigger || !window.Lenis || reduced) return
    g.registerPlugin(ScrollTrigger)
    if (!heroDone && $('[data-hero]')) { intro(g); heroDone = true }
    const lenis = new Lenis(), tick = (t) => lenis.raf(t * 1000)
    L = lenis
    lenis.on('scroll', ScrollTrigger.update); g.ticker.add(tick); g.ticker.lagSmoothing(0)
    const small = innerWidth < 700
    const ctx = g.context(() => {
      // Hero: the picture drifts slower than the page, the profile fades as the rows arrive
      if ($('#home')) {
        g.fromTo('.hero-card img, .hero-card video', { yPercent: -4 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true } })
        g.to('#home', { scale: 0.93, opacity: 0.3, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: { trigger: '.cover', start: 'top 95%', end: 'top 5%', scrub: true } })
      }

      // Staged reveal: nothing opens at once. Each card, heading and section waits until it scrolls into view,
      // then arrives small and grows into place, one after another.
      const rv = g.utils.toArray('[data-rv]')
      if (rv.length) {
        g.set(rv, { opacity: 0, y: small ? 40 : 80, scale: 0.9, transformOrigin: '50% 100%' })
        g.set('.zc-img', { clipPath: 'inset(45% 0% 0% 45% round 26px 0 0 0)' })
        ScrollTrigger.batch(rv, {
          start: small ? 'top 94%' : 'top 90%', once: true,
          onEnter: (b) => {
            g.to(b, { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: 'expo.out', stagger: 0.18, overwrite: true })
            g.to(b.map((e) => e.querySelector?.('.zc-img')).filter(Boolean), { clipPath: 'inset(0% 0% 0% 0% round 26px 0 0 0)', duration: 1.5, ease: 'expo.inOut', delay: 0.35, stagger: 0.18 })
          },
        })
      }

      // Wireframes and mockups drift slightly against the scroll, so the page feels alive
      if (!small) g.utils.toArray('[data-par]').forEach((el) => g.fromTo(el, { yPercent: 4 }, { yPercent: -4, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }))

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
    if (!C.web3formsKey) { st.textContent = `The form is unavailable right now. Please email ${CUR.email}.`; return }
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
  const show = () => document.documentElement.classList.remove('wait')
  // The hero stays pinned while the page slides over it. If it is taller than the screen, it pins by its bottom edge.
  const pinHero = () => { const h = $('#home'); if (h) h.style.top = Math.min(0, innerHeight - h.offsetHeight) + 'px' }
  addEventListener('resize', pinHero); addEventListener('load', pinHero)
  const paint = (d) => { render(d, true); pinHero(); motion(); show(); setTimeout(pinHero, 600) }
  if (!$('#p-main')) canon(location.pathname.split('/').pop().replace(/\.html$/, '') === 'about' ? 'about' : '')
  if (!hasRemote) paint(D)
  else {
    const t = setTimeout(() => paint(D), 3000)
    remote().then((res) => { clearTimeout(t); paint(res ? merge(res) : D) }).catch(() => { clearTimeout(t); paint(D) })
  }
})()
