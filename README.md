# VikKreative Portfolio (static version)

Plain HTML, CSS and JS. No build step, no framework. Works on GitHub Pages.

## Files
- index.html: home page. about.html: About page. project.html: one template that shows any project (project.html?p=the-project-address).
- css/style.css: all site styling. The dark colours are the custom properties on the first line.
- js/content.js: SETTINGS, tool logo list and the starter content. Shown until the admin has its own content.
- js/app.js: smooth scroll, 3D scroll motion, sliding project rows, the opening animation, the rolling location label, project cards, tools strip, project page, loading content from Supabase, contact form.
- admin/: the admin panel (index.html, admin.css, admin.js). Open yoursite.com/admin/
- supabase/setup.sql: the database setup, run once.
- video/: hero.webm and hero.mp4, the looping background video on the home page (about 1 MB each). images/hero.webp is its poster and the fallback picture.
- images/: optimized WebP images. images/logos/: the tool logos shown in the moving strip.
- robots.txt and sitemap.xml: for search engines, already set to https://vikkreative.com.
- CNAME: tells GitHub Pages the custom domain (vikkreative.com).

## Preview locally
Open the folder in VS Code, install the "Live Server" extension, right click index.html and choose Open with Live Server.

## 1. Contact form
1. Go to web3forms.com, enter supportdoc11@gmail.com, and copy the access key they email you.
2. Paste it into js/content.js as web3formsKey.

## 2. Admin (Supabase)
The admin needs a free Supabase project because a static site cannot store logins or data by itself.

1. Create a project at supabase.com. In Project Settings > API, copy the Project URL and the anon public key.
2. Paste them into js/content.js as supabaseUrl and supabaseAnonKey. The anon key is meant to be public.
3. Open supabase/setup.sql, change CHANGE_ME@example.com on the last line to the email the client will log in with, then paste the whole file into Supabase > SQL Editor > New query > Run.
4. In Supabase > Authentication > Users > Add user, create that same email with a password. Tick Auto Confirm User.
5. Optional but recommended: Authentication > Sign In / Providers > turn off "Allow new users to sign up".
6. Visit yoursite.com/admin/ and sign in. On the Projects tab, click "Import the current projects" once so the starter projects become editable.

Only the email listed in the admins table can add, edit or delete anything, even if someone else creates an account.

What the client can do in the admin:
- Projects: add, edit, delete, reorder, save as draft, upload a cover and gallery images, set the delivery time and details shown on each project page.
- About: name, role, location, phone, titles under the name, the home page line, footer text, about story, profile photo and the big home page picture.
- Content: the tools and skills strip (logos or icons), services, work process steps and testimonials. Project categories are shown as tags, so separate several with commas.
- Overview: download a fresh sitemap.xml.

Changes show on the live site as soon as they are saved.

## 3. SEO files
1. js/content.js siteUrl is already https://vikkreative.com (line 3). Keep it with no slash at the end.
2. robots.txt and sitemap.xml already use the same address.
3. After adding or removing projects, open the admin Overview and click Download sitemap.xml, then replace the file in the site folder.
4. Submit https://your-address/sitemap.xml in Google Search Console.

## 4. Publish on GitHub Pages
1. Put this folder's contents in a GitHub repo.
2. Settings > Pages > Deploy from branch > main > / (root).
3. Settings > Pages > Custom domain: enter vikkreative.com and save. Tick Enforce HTTPS once it appears.
4. At your domain registrar add four A records for the root (@) pointing to 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153, plus a CNAME record for www pointing to Victor-writes12.github.io. DNS can take up to a few hours.

## Clean addresses
On the live domain the address bar shows /, /about and /project?p=name, never index.html or .html. GitHub Pages serves those clean paths by itself. When you preview locally (Live Server, localhost or a file), the links keep .html so they still open.

## Home page behaviour
- Location label: in Admin > About, put several places separated by commas (Lagos, Abuja, Dubai) and they roll one after another.
- Opening animation: the intro() function in js/app.js. Change the numbers there to speed it up or slow it down.
- Hero background video: plays by default. If the client uploads their own Home page picture in Admin, About, the video is replaced by that picture. To swap the video, replace video/hero.webm and video/hero.mp4 (keep the names, 1600px wide, no sound, under 2 MB).
- Dock: hovering Projects, About or Contact shows a text label.

## Notes
- The summaries, descriptions and delivery times of the 8 starter projects in js/content.js are placeholder text. Replace them in the admin.
- Testimonials stay hidden until the client adds real ones.
- CorelDRAW has no official colour logo file available, so images/logos/coreldraw.svg is the one shape coloured green. Swap in the official file if you have it.
- Link previews on social media read the tags in the page before any script runs, so a shared project link shows the general site preview. Search engines that run scripts read the full project details.
