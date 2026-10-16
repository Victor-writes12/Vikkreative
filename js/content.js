window.SITE_CONFIG = {
  siteUrl: 'https://vikkreative.com',
  supabaseUrl: 'https://bmlgxcdhruticmvigbqe.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbGd4Y2RocnV0aWNtdmlnYnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMDg5MzIsImV4cCI6MjEwNzY4NDkzMn0.Wo4AtyUOv3mOI3P-X-cixJ7pQfa0-Wce_ad28fSVyLg',
  web3formsKey: ''
};

window.LOGOS = {
  photoshop: 'images/logos/photoshop.svg',
  illustrator: 'images/logos/illustrator.svg',
  blender: 'images/logos/blender.svg',
  coreldraw: 'images/logos/coreldraw.svg',
  figma: 'images/logos/figma.svg'
};

const KIND = {
  'Brand identity': {
    time: '2 to 3 weeks',
    tools: ['Illustrator', 'Photoshop'],
    summary: 'A complete visual identity: logo, colour palette, typography and usage guidelines.',
    body: 'The brief was to give the business a recognisable, consistent look. I explored logo directions, settled on one with the client, then built out colour, type and example applications.\n\nThe result is a brand kit the client can hand to any printer, developer or agency and get consistent work back.'
  },
  'Web design': {
    time: '3 to 4 weeks',
    tools: ['Figma', 'Photoshop'],
    summary: 'A conversion focused website design, from layout and visuals to a developer ready handoff.',
    body: 'I started with the goal of the page and the questions a first-time visitor has, then shaped the layout, copy hierarchy and visuals around answering them quickly.\n\nThe design was delivered as organised Figma files with responsive layouts, ready for development.'
  },
  'Mobile app': {
    time: '6 to 8 weeks',
    tools: ['Figma'],
    summary: 'Mobile app interface design with clear flows, a consistent visual system and a clickable prototype.',
    body: 'I mapped the main user journeys first, then designed the screens, components and states needed to support them, so the app stays consistent as it grows.\n\nA clickable prototype let the team test the flow before any code was written.'
  },
  'E-commerce': {
    time: '4 to 6 weeks',
    tools: ['Figma', 'Photoshop'],
    summary: 'An online store experience designed to make browsing and buying simple.',
    body: 'The focus was on helping shoppers find a product quickly and feel confident checking out: clear product pages, simple navigation and a short path to purchase.\n\nThe store design was handed over with layouts for desktop and mobile.'
  },
  'Product design': {
    time: '4 to 6 weeks',
    tools: ['Figma'],
    summary: 'Product design from user flows to polished interface and prototype.',
    body: 'I worked from the core user tasks outward: flows first, then wireframes, then the visual layer, reviewing each stage with the team.\n\nThe final screens and prototype give developers a precise reference to build from.'
  }
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const p = (title, category, file) => {
  const k = KIND[category];
  return {
    slug: slug(title),
    title,
    category,
    src: `images/${file}.webp`,
    summary: k.summary,
    description: k.body,
    client: '',
    role: 'Designer',
    year: '',
    deliveryTime: k.time,
    tools: k.tools,
    link: '',
    gallery: []
  };
};

window.SITE = {
  name: 'Victor Ibrahim',
  brand: 'VikKreative',
  role: 'Creative Product & Visual Designer',
  heroTitle: 'Interfaces people trust with their money, their stories and their time.',
  heroText: 'I design apps, websites and brands for teams building across Africa and beyond.',
  heroSrc: 'images/hero.webp',
  servicesSrc: 'images/services.webp',
  contactSrc: 'images/contact.webp',
  portraitSrc: 'images/portrait.webp',
  email: 'supportdoc11@gmail.com',
  about: 'I am a product and visual designer with several years of experience shipping fintech, entertainment, e-commerce and brand identity work. I care about clear structure, fast interfaces and details that make a first-time visitor feel safe.',
  aboutLong: 'I started designing because I wanted software that feels obvious to use. Since then I have worked on fintech wallets, entertainment apps, e-commerce stores and brand identities for businesses at different stages.\n\nI work closely with founders and developers, so what I design is something a team can actually build and ship. Replace this text with your own story in the admin.',
  process: [
    { title: 'Discover', text: 'We agree on goals, users and what success looks like before any screen is drawn.' },
    { title: 'Design', text: 'Flows, wireframes and visual design, reviewed with you at each stage.' },
    { title: 'Prototype', text: 'Clickable prototypes so you can test the product before it is built.' },
    { title: 'Hand off', text: 'Clean files and support for your developers until the product ships.' }
  ],
  testimonials: [],
  services: [
    { title: 'Product design', text: 'Research, flows, wireframes and polished UI for mobile and web apps, with working prototypes.' },
    { title: 'Brand identity', text: 'Logos, colour, type and guidelines that stay consistent from a business card to a billboard.' },
    { title: 'Web design', text: 'Landing pages and e-commerce sites built around one goal: turning visitors into customers.' }
  ],
  tools: [
    { name: 'Photoshop', logo: 'photoshop' },
    { name: 'Illustrator', logo: 'illustrator' },
    { name: 'Blender', logo: 'blender' },
    { name: 'CorelDRAW', logo: 'coreldraw' },
    { name: 'Figma', logo: 'figma' }
  ],
  projects: [
    p('Jovine Touch', 'Brand identity', 'jovine'),
    p('Kablux', 'Web design', 'kablux'),
    p('Jollof Game', 'Mobile app', 'jollof'),
    p('Hennessy Store', 'E-commerce', 'hennessy'),
    p('Grandeur Structures', 'Brand identity', 'grandeur'),
    p('Crypto Wallet', 'Product design', 'wallet'),
    p('iOS Watch', 'Web design', 'watch'),
    p('Ajosepo Movie App', 'Product design', 'movie')
  ]
};
