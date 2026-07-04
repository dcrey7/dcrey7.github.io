/* ALL site content. Source of truth: profile/resume.typ +
   profile/recommendations.md in the parent workspace. Edit here, not in HTML. */

export const WORK = [
  {
    company: 'Vistiq.AI', role: 'AI Engineer', where: 'Paris', dates: '2026 —',
    bullets: [
      'LLM evals for long-context retrieval — measured answer accuracy +15%',
      'RAG over financial corpora — inference cost −40% via retrieval, caching, routing',
      'MCP + agentic patterns on an AI-native SaaS for PE / VC / family offices'
    ],
    stack: 'Python · LLMs · RAG · Evals · MCP · TypeScript · PostgreSQL · Redis'
  },
  {
    company: 'AXA France', role: 'Data Scientist', where: 'Paris', dates: '2025 — 26',
    bullets: [
      'Production OCR + KV extraction — fine-tuned Qwen 3.5 4B (Unsloth), +4% accuracy',
      'GLiNER2 with LoRA distillation of GPT-4o mini — operational cost −85%',
      'SAM segmentation for property claims +15% · active-learning platform (Label Studio)'
    ],
    stack: 'PyTorch · Unsloth · LoRA · SAM · FastAPI · Docker · AWS'
  },
  {
    company: 'EXL Services', role: 'Senior Data Scientist', where: 'Bangalore', dates: '2022 — 24',
    bullets: [
      'Production LightGBM models — GINI +6% on large-scale data',
      'Back-testing, drift detection & compliance monitoring frameworks',
      'A/B testing for pricing · mentored 3 junior data scientists (SHAP)'
    ],
    stack: 'LightGBM · SHAP · PySpark · MLflow · Power BI'
  },
  {
    company: 'TheMathCompany', role: 'Data Scientist', where: 'Bangalore', dates: '2021 — 22',
    bullets: [
      'Marketing-mix models (lag, adstock) — channel ROI +3%',
      'Dash & Streamlit apps for KPIs, funnels, engagement',
      'Scalable ML pipelines on AWS SageMaker'
    ],
    stack: 'Dash · Streamlit · SageMaker · Time Series'
  },
  {
    company: 'Amazon', role: 'Risk Analyst', where: 'Bangalore', dates: '2019 — 21',
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
    desc: 'Zero-label football shot analysis. SAM3 + LocateAnything-3B auto-labels distilled into a fast RF-DETR-Seg detector; on-device VLM coach (MiniCPM-V) + BlazePose. Detects goals, shooting foot, shot speed.',
    links: [
      { label: '▶ demo', href: 'https://www.youtube.com/watch?v=knL8shghyBU' },
      { label: '🤗 space', href: 'https://huggingface.co/spaces/build-small-hackathon/kicky-ai' }
    ]
  },
  {
    name: 'MEMORY BRIDGEAI', tag: 'treble hackathon — winner ×3 awards', passed: true,
    desc: 'Voice-AI agent that calls patients over real phone lines (Twilio PSTN) to reinforce memories. LiveKit · Speechmatics · Backboard.io.',
    links: [{ label: 'the story', href: 'https://www.linkedin.com/posts/dcrey7_hackathon-voiceai-ai-activity-7434207452876800000-Da2X' }]
  },
  {
    name: 'JOBAMATRIX', tag: 'agentic system',
    desc: 'End-to-end agentic job-application system — 290 tests, SQLite, Playwright automation, parallel agent orchestration, MCP.',
    links: [{ label: 'github', href: 'https://github.com/dcrey7/jobomatrix-v2' }]
  },
  {
    name: 'RIZZUME', tag: 'ai resume builder',
    desc: 'Real-time PDF resume builder with dual LLM back-end (Ollama + Cerebras), keyword matching and AI tailoring.',
    links: [{ label: 'live app', href: 'https://rizzume--dcrey7.replit.app/' }]
  },
  {
    name: 'ACTIVE GLINER', tag: 'research',
    desc: 'Active-learning framework for span-based NER — paper + code.',
    links: [
      { label: 'paper', href: 'https://drive.google.com/file/d/1eo1z6MbX-gSsD8jMPwdCOveldRVPxqrF/view' },
      { label: 'github', href: 'https://github.com/dcrey7/active_gliner' }
    ]
  },
  {
    name: 'NOTME', tag: 'mistral game jam — finalist',
    desc: 'Voice imposter detection game built for the Mistral AI Game Jam.',
    links: [{ label: '🤗 space', href: 'https://huggingface.co/spaces/dcrey7/NotMe' }]
  },
  {
    name: 'MEDICAL RAG', tag: 'mistral × alan — finalist',
    desc: 'RAG + fine-tuning on French medical MCQs.',
    links: [{ label: 'slides', href: 'https://github.com/dcrey7/mistral_alan_hackathon/blob/main/Mistral%20ppt%20hackathon%20_compressed.pdf' }]
  },
  {
    name: 'FIFA ELO', tag: 'unique method award',
    desc: 'Elo ratings + Bayesian optimization for EURO 2024 — FIFA–EXL hackathon.',
    links: [{ label: 'github', href: 'https://github.com/dcrey7/FIFA_EURO_2024' }]
  }
];

export const PEOPLE = [
  { init:'PF', name:'Philippe Fraisse', role:'Head of AI Lab · AXA France', rel:'managed me',
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

export const CONTACT = {
  email: 'abhishek01789@gmail.com',
  links: [
    { label: 'GITHUB', href: 'https://github.com/dcrey7' },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/dcrey7' },
    { label: 'HUGGING FACE', href: 'https://huggingface.co/dcrey7' }
  ],
  where: 'PARIS · NETHERLANDS · GERMANY · REMOTE'
};
