/* ALL site content. Source of truth: profile/resume.typ +
   profile/recommendations.md in the parent workspace. Edit here, not in HTML.

   Two presentation fields travel with each entry:
     key  — the tile's key colour. Everything else (background field, glow,
            tile face) is derived from it in CSS with color-mix().
     mark — 1-3 characters set in Anton and cropped by the tile. There is no
            key art anywhere on this site; the type is the art. */

export const ABOUT = {
  key: '#FFC800', mark: null,
  title: 'AI ENGINEER',
  sub: 'ABHISHEK THOMAS',
  meta: 'PARIS · OPEN TO WORK',
  cards: [
    { kicker: 'NOW', title: 'Vistiq.AI, Paris',
      body: 'Making LLMs behave — evals, retrieval, and agents on an AI-native SaaS.' },
    { kicker: 'BEFORE', title: 'Amazon → MathCo → EXL → AXA',
      body: '5+ years turning data science into systems that shipped and stayed up.' },
    { kicker: 'ALSO', title: 'Football, GPUs, hackathons',
      body: 'Masters in Data Science & AI, emlyon 2026. I build small things that win prizes.' }
  ]
};

export const WORK = [
  {
    company: 'Vistiq.AI', role: 'AI Engineer', where: 'Paris', dates: '2026 —',
    key: '#2F6BFF', mark: 'V', logo: 'work/vistiq_ai_logo.jpeg',
    bullets: [
      'LLM evals for long-context retrieval — measured answer accuracy +15%',
      'RAG over financial corpora — inference cost −40% via retrieval, caching, routing',
      'MCP + agentic patterns on an AI-native SaaS for PE / VC / family offices'
    ],
    stack: 'Python · LLMs · RAG · Evals · MCP · TypeScript · PostgreSQL · Redis'
  },
  {
    company: 'AXA France', role: 'Data Scientist', where: 'Paris', dates: '2025 — 26',
    key: '#1B34C8', mark: 'AXA', logo: 'work/axa_france_logo.jpeg',
    bullets: [
      'Production OCR + KV extraction — fine-tuned Qwen 3.5 4B (Unsloth), +4% accuracy',
      'GLiNER2 with LoRA distillation of GPT-4o mini — operational cost −85%',
      'SAM segmentation for property claims +15% · active-learning platform (Label Studio)'
    ],
    stack: 'PyTorch · Unsloth · LoRA · SAM · FastAPI · Docker · AWS'
  },
  {
    company: 'EXL Services', role: 'Senior Data Scientist', where: 'Bangalore', dates: '2022 — 24',
    key: '#6D28D9', mark: 'EXL', logo: 'work/exl_service_logo.jpeg',
    bullets: [
      'Production LightGBM models — GINI +6% on large-scale data',
      'Back-testing, drift detection & compliance monitoring frameworks',
      'A/B testing for pricing · mentored 3 junior data scientists (SHAP)'
    ],
    stack: 'LightGBM · SHAP · PySpark · MLflow · Power BI'
  },
  {
    company: 'MathCo', role: 'Data Scientist', where: 'Bangalore', dates: '2021 — 22',
    key: '#0EA5A4', mark: 'MC', logo: 'work/themathcompany_logo.jpeg',
    bullets: [
      'Marketing-mix models (lag, adstock) — channel ROI +3%',
      'Dash & Streamlit apps for KPIs, funnels, engagement',
      'Scalable ML pipelines on AWS SageMaker'
    ],
    stack: 'Dash · Streamlit · SageMaker · Time Series'
  },
  {
    company: 'Amazon', role: 'Risk Analyst', where: 'Bangalore', dates: '2019 — 21',
    key: '#FF9900', mark: 'AMZ', logo: 'work/amazon_logo.jpeg',
    bullets: [
      'Fraud & anomaly scoring (XGBoost, KNN) — transaction risk −12%',
      'Power BI dashboards for cross-functional stakeholders',
      'Improved automated risk-decision frameworks'
    ],
    stack: 'XGBoost · Scikit-learn · SQL · Power BI'
  }
];

export const PROJECTS = [
  {
    name: 'KICKY AI', tag: 'build-small hackathon', passed: true,
    key: '#16A34A', mark: 'K',
    video: 'https://www.youtube.com/watch?v=knL8shghyBU',
    desc: 'Zero-label football shot analysis. SAM3 + LocateAnything-3B auto-labels distilled into a fast RF-DETR-Seg detector; on-device VLM coach (MiniCPM-V) + BlazePose. Detects goals, shooting foot, shot speed.',
    links: [
      { label: '▶ demo', href: 'https://www.youtube.com/watch?v=knL8shghyBU' },
      { label: '🤗 space', href: 'https://huggingface.co/spaces/build-small-hackathon/kicky-ai' }
    ]
  },
  {
    name: 'MEMORY BRIDGEAI', tag: 'treble hackathon — winner ×3 awards', passed: true,
    key: '#DC2626', mark: 'MB',
    desc: 'Voice-AI agent that calls patients over real phone lines (Twilio PSTN) to reinforce memories. LiveKit · Speechmatics · Backboard.io.',
    photos: [
      'projectsandhackthons/speechmatics/1772453175497.jpeg',
      'projectsandhackthons/speechmatics/1772453176051.jpeg',
      'projectsandhackthons/speechmatics/b388a5b5-50b5-416f-89de-c4c800b4afd1.jpeg'
    ],
    links: [{ label: 'the story', href: 'https://www.linkedin.com/posts/dcrey7_hackathon-voiceai-ai-activity-7434207452876800000-Da2X' }]
  },
  {
    name: 'JOBAMATRIX', tag: 'agentic system',
    key: '#EA580C', mark: 'JM',
    desc: 'End-to-end agentic job-application system — 290 tests, SQLite, Playwright automation, parallel agent orchestration, MCP.',
    links: [{ label: 'github', href: 'https://github.com/dcrey7/jobomatrix-v2' }]
  },
  {
    name: 'RIZZUME', tag: 'ai resume builder',
    key: '#0891B2', mark: 'RZ',
    desc: 'Real-time PDF resume builder with dual LLM back-end (Ollama + Cerebras), keyword matching and AI tailoring.',
    links: [{ label: 'live app', href: 'https://rizzume--dcrey7.replit.app/' }]
  },
  {
    name: 'ACTIVE GLINER', tag: 'research',
    key: '#7C3AED', mark: 'GL',
    desc: 'Active-learning framework for span-based NER — paper + code.',
    links: [
      { label: 'paper', href: 'https://drive.google.com/file/d/1eo1z6MbX-gSsD8jMPwdCOveldRVPxqrF/view' },
      { label: 'github', href: 'https://github.com/dcrey7/active_gliner' }
    ]
  },
  {
    name: 'NOTME', tag: 'mistral game jam — finalist',
    key: '#E11D48', mark: 'NM',
    desc: 'Voice imposter detection game built for the Mistral AI Game Jam.',
    photos: [
      'projectsandhackthons/mistralgamejam/1737915427569.jpeg',
      'projectsandhackthons/mistralgamejam/1737915428002.jpeg',
      'projectsandhackthons/mistralgamejam/1737915428112.jpeg',
      'projectsandhackthons/mistralgamejam/1737915434912.jpeg',
      'projectsandhackthons/mistralgamejam/1737915440270.jpeg'
    ],
    links: [
      { label: '🤗 space', href: 'https://huggingface.co/spaces/dcrey7/NotMe' },
      { label: 'the story', href: 'https://www.linkedin.com/posts/dcrey7_mistralai-huggingface-elevenlabs-ugcPost-7289345687324934145-pTog/' }
    ]
  },
  {
    name: 'MEDICAL RAG', tag: 'mistral × alan — finalist',
    key: '#059669', mark: 'MR',
    desc: 'RAG + fine-tuning on French medical MCQs.',
    photos: [
      'projectsandhackthons/mistralrag/1728839714292.jpeg',
      'projectsandhackthons/mistralrag/1728839714328.jpeg'
    ],
    links: [
      { label: 'slides', href: 'https://github.com/dcrey7/mistral_alan_hackathon/blob/main/Mistral%20ppt%20hackathon%20_compressed.pdf' },
      { label: 'the story', href: 'https://www.linkedin.com/posts/dcrey7_one-incredible-month-in-paris-and-i-had-ugcPost-7251279334219374592-OCwQ/' }
    ]
  },
  {
    name: 'WIDS × HF', tag: 'wids datathon — hugging face',
    key: '#0D9488', mark: 'W',
    desc: 'WiDS Datathon with Hugging Face — responsible-AI challenge.',
    photos: [
      'projectsandhackthons/widsshiuggingface/1742974537676.jpeg',
      'projectsandhackthons/widsshiuggingface/1742974538096.jpeg',
      'projectsandhackthons/widsshiuggingface/1742974538183.jpeg',
      'projectsandhackthons/widsshiuggingface/1742974538435.jpeg'
    ],
    links: [{ label: 'the story', href: 'https://www.linkedin.com/posts/dcrey7_wids-datathon-responsibleai-ugcPost-7310565086404714497-Rzzx/' }]
  },
  {
    name: 'FIFA ELO', tag: 'unique method award',
    key: '#CA8A04', mark: 'FE',
    desc: 'Elo ratings + Bayesian optimization for EURO 2024 — FIFA–EXL hackathon.',
    links: [{ label: 'github', href: 'https://github.com/dcrey7/FIFA_EURO_2024' }]
  }
];

export const PEOPLE = [
  { init:'PF', name:'Philippe Fraisse', role:'Head of AI Lab · AXA France', rel:'managed me',
    photo:'reccomendations/philppe.jpeg',
    quote:'Finds unexpected technical solutions autonomously… brainstorming with him is a pleasure.' },
  { init:'ED', name:'Ekaterina Dmitrieva', role:'AI & Data Engineer', rel:'studied together',
    quote:'The kind of person you want to call first — to achieve something truly outstanding.' },
  { init:'CB', name:'Clement Baccar', role:'Data & AI · Tech.Rocks', rel:'mentored me',
    quote:'Managed the project from start to finish — exceptional structure, a strong leader.' },
  { init:'SM', name:'Srikar Manepalli', role:'Analytics Consultant · MathCo', rel:'managed me',
    quote:'An imaginative thinker with innate artistic skills — creative visualizations and mockups.' },
  { init:'OT', name:'Olivier Taugourdeau', role:'PhD · Egis', rel:'client',
    quote:'Understood the project context and delivered a deep-learning PoC on satellite data.' },
  { init:'SK', name:'Sarthak Kala', role:'AI Agents · HPE', rel:'managed me',
    quote:'Whatever he works on, he gives his 100%.' },
  { init:'GA', name:'Gandharv Aggarwal', role:'American Express', rel:'mentored me',
    quote:'Picks up new concepts in the quickest time and applies them to real business problems.' },
  { init:'RR', name:'Rishita Ray', role:'Analytics · Swiss Re', rel:'mentored me',
    quote:'Exemplary attention to detail; excels in high-pressure situations.' },
  { init:'JT', name:'Jubin Thomas', role:'DS Leader · MathCo', rel:'managed me',
    quote:'Calm in tough situations — sets the example for how to excel.' },
  { init:'RV', name:'Raphaël Vienne', role:'Founding AI Engineer · Gigi', rel:'mentored me',
    quote:'Invested and serious — with strong interpersonal skills and real ambition.' },
  { init:'AP', name:'Anamika Patil', role:'Data Science · Finance', rel:'teammate',
    quote:'The coworker you can always count on to finish a task.' },
  { init:'SY', name:'Sugam Yadav', role:'OpEx Leader · ADP', rel:'managed me',
    quote:'Keen learner, articulate — shares knowledge without making anyone feel small.' },
  { init:'DK', name:'Darshan Kadam', role:'Sales Director · AI Procurement', rel:'teammate',
    quote:'A natural leader — from EDA all the way to deployment.' },
  { init:'SR', name:'Shishir Rao', role:'Principal Engineer', rel:'studied together',
    quote:'Out-of-the-box analytical thinker who ships complete solutions.' },
  { init:'AK', name:'Arpit Kumar', role:'RGM Consultant', rel:'teammate',
    quote:'Quick thinker, resourceful, and fun to work with.' },
  { init:'DS', name:'Devesh Singh', role:'AI Engineer · Fractal', rel:'teammate',
    quote:'Knows how to apply ML to real business problems.' }
];

export const TROPHIES = [
  { n: '5+', label: 'years in data science & AI' },
  { n: '3',  label: 'awards — Treble voice-AI hackathon winner' },
  { n: '2',  label: 'OSS PRs merged — GLiNER · HF Gemma' },
  { n: '16', label: 'LinkedIn recommendations' }
];

/* Certifications — each with its verification link (assets/links.txt). */
export const CERTS = [
  { name: 'AWS ML SPECIALTY', issuer: 'Amazon Web Services', mark: 'ML',
    key: '#FF9900', logo: 'certifications/aws-mls.png',
    href: 'https://www.credly.com/badges/79f99a54-3b81-44a7-b4d5-ec9b131f9678/linked_in_profile' },
  { name: 'AWS CLOUD PRACTITIONER', issuer: 'Amazon Web Services', mark: 'CP',
    key: '#EC7211', logo: 'certifications/aws-cp1.png',
    href: 'https://cp.certmetrics.com/amazon/en/public/verify/credential/cf3d32bbf8ad4d178e5776980cd54731' },
  { name: 'GOOGLE CLOUD', issuer: 'Google · skills badge', mark: 'G',
    key: '#4285F4',
    href: 'https://www.skills.google/public_profiles/805b81d6-b4f4-49dd-9a56-ed83fff6c719/badges/1312320' },
  { name: 'GEN AI WITH LLMS', issuer: 'DeepLearning.AI · Coursera', mark: 'AI',
    key: '#DC2626',
    href: 'https://www.coursera.org/account/accomplishments/verify/6DP9L2ALTU27' },
  { name: 'COHERE', issuer: 'Cohere · verified credential', mark: 'CO',
    key: '#0EA5A4',
    href: 'https://credsverse.com/credentials/e4121a84-0d35-411a-86da-1435a26f997a' },
  { name: 'DGM · IISc', issuer: 'IISc Bangalore', mark: 'DG',
    key: '#7C3AED', logo: 'certifications/dgm-iisc.jpg',
    href: 'https://drive.google.com/file/d/1ILI3O1_qUFbRJsUGlLb8OrcPE5gdJKxf/view' },
  { name: 'CHITRAKALA', issuer: 'art', mark: '🎨',
    key: '#E11D48',
    href: 'https://drive.google.com/file/d/1nvwbt2sHyTMtxiSNGlekgztIA1lLseQT/view' }
];

/* Education — school logos live in assets/education/. */
export const EDUCATION = [
  { school: 'EMLYON', line: 'Masters in Data Science & AI · Paris · 2026', mark: 'EM',
    key: '#C8102E', logo: 'education/emlyon_business_school_logo.jpeg',
    href: 'https://certificate.bcdiploma.com/check/DB040D4C62396A4CAD0001E4A01FB14D402F43E556B3962C5964899D0A5BD766SGcwRjhKTWpqaUkxSUJPYU8rUG14MTlKcnJ5aHNCT3cyd2l4NHhJZXhPNXFlanhU' },
  { school: 'MCGILL', line: 'School of Continuing Studies · Montréal', mark: 'MG',
    key: '#ED1B2F', logo: 'education/mcgill_university_school_of_continuing_studies_logo.jpeg' },
  { school: 'SVNIT SURAT', line: 'National Institute of Technology', mark: 'SV',
    key: '#D97706', logo: 'education/sardar_vallabhbhai_national_institute_of_technology_surat_logo.jpeg' }
];

export const CONTACT = {
  email: 'abhishek01789@gmail.com',
  links: [
    { label: 'GITHUB', href: 'https://github.com/dcrey7' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/dcrey7' },
    { label: 'HUGGING FACE', href: 'https://huggingface.co/dcrey7' }
  ],
  where: 'PARIS · NETHERLANDS · GERMANY · REMOTE'
};

/* Colours for the four tiles pinned to the right of every rail. */
export const SYSTEM_KEYS = {
  people:   { key: '#8B5CF6', mark: '16' },
  trophies: { key: '#F59E0B', mark: '★'  },
  contact:  { key: '#EC4899', mark: '✉'  }
};
