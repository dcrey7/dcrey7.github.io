/* ALL site content. Source of truth: profile/resume.typ +
   profile/recommendations.md in the parent workspace. Edit here, not in HTML.

   Two presentation fields travel with each entry:
     key , the tile's key colour. Everything else (background field, glow,
            tile face) is derived from it in CSS with color-mix().
     mark, 1-3 characters set in Anton and cropped by the tile. There is no
            key art anywhere on this site; the type is the art. */

export const ABOUT = {
  key: '#FFC800', mark: null,
  title: 'AI ENGINEER',
  sub: 'ABHISHEK THOMAS',
  meta: 'PARIS · OPEN TO WORK',
  /* the vertical menu under ABOUT: one screen per thing worth knowing */
  items: [
    {
      id: 'intro', title: 'AI ENGINEER', sub: 'ABHISHEK THOMAS',
      meta: 'PARIS · OPEN TO WORK', icon: true,
      body: 'I build AI systems that go to production and stay up. Today that means LLM extraction, evaluation and agents at Vistiq.AI in Paris. Before Paris it was six years of data science across Amazon, TheMathCompany, EXL and AXA, in Bangalore and then France. I started as a mechanical engineer and taught myself the rest.',
      bullets: [
        'Indian, grew up in Sharjah, live in Paris',
        'English and Hindi and Malayalam fluent, French in progress',
        'Football every Saturday, and I film my own games, which is how Kicky AI started'
      ]
    },
    {
      id: 'building', title: 'BUILDING', sub: 'what I am working on now',
      mark: 'B', key: '#16A34A',
      body: 'MemoryBridge AI: a phone call, not an app. It calls an elderly parent living alone every day, remembers the last conversation, scores memory over time, and messages the family within seconds if something is wrong. It works on a feature phone, because that is what the person actually owns. Built for the Malayali corridor first, where the family is 4,000 km away and the money arrives but the company does not.',
      bullets: [
        'Won three awards at the Speechmatics hackathon, including first place',
        'Real phone calls over PSTN, LiveKit and Speechmatics under it',
        'Malayalam first, because a person with dementia goes back to their mother tongue'
      ]
    },
    {
      id: 'community', title: 'COMMUNITY', sub: 'cerebras · hugging face · paris',
      mark: 'C', key: '#F59E0B',
      body: 'Cerebras Community Ambassador for Paris since July 2026, the only one for this city. I run Cafe Compute Paris: the venue, the room, the demo, the people. Also on the organising team for a Hugging Face robotics workshop, where we built and calibrated SO100 arms and trained them with action chunking transformers.',
      bullets: [
        'Cerebras served the 235B teacher model that made my thesis possible, on a free tier, to a student. That is why I said yes',
        'Hugging Face robotics workshop, SO100 build and calibration',
        'Paris AI scene: hackathons most months, and I write up what I learn'
      ]
    },
    {
      id: 'shop', title: 'SHOP', sub: 'clothes I designed',
      mark: 'S', key: '#EC4899',
      body: 'I design clothes as well as systems. The prints are mine, the shop prints and ships them.',
      links: [
        { label: 'frankly wearing', href: 'https://www.franklywearing.com/creator/dcrey7' },
        { label: 'instagram', href: 'https://www.instagram.com/dcrey7' }
      ]
    }
  ]
};

export const WORK = [
  {
    company: 'Vistiq.AI', role: 'AI Engineer', where: 'Paris', dates: 'since 2026',
    key: '#2F6BFF', mark: 'V', logo: 'work/vistiq_ai_logo.jpeg',
    bullets: [
      'Rebuilt the document extraction platform end to end: accuracy from 44% to 92% on private equity and venture capital documents, with the source cited for every field',
      'Built the LLM evaluation system that made model testing and release twice as fast, tracking cost, latency, tokens and quality across providers, wired into CI/CD',
      'Cut LLM inference cost by 40% through retrieval optimisation, caching and model routing',
      'Designed and shipped an agent that watches each tenant mailbox, drive and calendar through MCP connectors, pulls the right documents in, extracts the data, matches it to the right fund, and reports every run with validate, undo and rerun'
    ],
    stack: 'Python · Go · TypeScript · LLMs · Evals · MCP · PostgreSQL · Redis'
  },
  {
    company: 'AXA France', role: 'Data Scientist', where: 'Paris', dates: '2025 to 26',
    key: '#1B34C8', mark: 'AXA', logo: 'work/axa_france_logo.jpeg',
    bullets: [
      'Shipped an extraction pipeline built on GLiNER2 with LoRA distillation of GPT-4o mini, served as a FastAPI service in Docker: operational cost down 85% in production',
      'Built production OCR and key value extraction for noisy user submitted documents, fine tuning Qwen 3.5 4B with Unsloth on synthetic document images, accuracy up 4%',
      'Built image segmentation for property claims with SAM, accuracy up 15%',
      'Designed the active learning and annotation platform on Label Studio, and led internal accelerathons on voice agents and document summarisation'
    ],
    stack: 'PyTorch · Unsloth · LoRA · SAM · FastAPI · Docker · AWS'
  },
  {
    company: 'EXL Services', role: 'Senior Data Scientist', where: 'Bangalore', dates: '2022 to 24',
    key: '#6D28D9', mark: 'EXL', logo: 'work/exl_service_logo.jpeg',
    bullets: [
      'Production LightGBM models on large scale data, GINI up 6%',
      'Back testing and monitoring frameworks for model stability, drift detection and regulatory compliance across versions',
      'Churn prediction and segmentation on behavioural data, delivered through Power BI',
      'A/B testing and experiment design for data driven pricing, and mentored three junior data scientists'
    ],
    stack: 'LightGBM · SHAP · PySpark · MLflow · Power BI'
  },
  {
    company: 'MathCo', role: 'Data Scientist', where: 'Bangalore', dates: '2021 to 22',
    key: '#0EA5A4', mark: 'MC', logo: 'work/themathcompany_logo.jpeg',
    bullets: [
      'Marketing mix models with lag, adstock and saturation curves for a global quick service brand: causal inference and time series decomposition, channel ROI up 3%',
      'Budget simulator that ran scenarios against the optimal spend, in Dash and Streamlit',
      'Scalable ML pipelines on AWS SageMaker'
    ],
    stack: 'Dash · Streamlit · SageMaker · Time Series'
  },
  {
    company: 'Amazon', role: 'Risk Analyst', where: 'Bangalore', dates: '2019 to 21',
    key: '#FF9900', mark: 'AMZ', logo: 'work/amazon_logo.jpeg',
    bullets: [
      'Fraud detection and anomaly scoring with XGBoost and KNN on high volume transaction data, transaction risk down 12%',
      'Power BI dashboards read across teams',
      'First data science role, taken while finishing a postgraduate diploma at night'
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
      { label: 'demo', href: 'https://www.youtube.com/watch?v=knL8shghyBU' },
      { label: 'hugging face space', href: 'https://huggingface.co/spaces/build-small-hackathon/kicky-ai' },
      { label: 'writeup', href: 'https://dcrey7.substack.com/p/world-fut-coach' }
    ]
  },
  {
    name: 'MEMORY BRIDGEAI', tag: 'treble hackathon, winner ×3 awards', passed: true,
    key: '#DC2626', mark: 'MB',
    video: 'https://youtu.be/oadhJjaRd3I',
    desc: 'Proactive voice agent that calls elderly people living alone, remembers past conversations, scores their memory, and alerts a caregiver on WhatsApp within seconds. Real phone calls over PSTN, works on a feature phone. LiveKit · Speechmatics · Backboard.io.',
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
    desc: 'End-to-end agentic job-application system, 290 tests, SQLite, Playwright automation, parallel agent orchestration, MCP.',
    links: [{ label: 'github', href: 'https://github.com/dcrey7/jobomatrix-v2' }]
  },
  {
    name: 'REZOUME', tag: 'ai resume builder · live',
    key: '#0891B2', mark: 'RZ',
    video: 'https://youtu.be/QJBjcu8EAlU',
    desc: 'AI system that generates a tailored resume and cover letter for every job from one master profile, in batch, with dual LLM. Live on Cloudflare Workers with real payments.',
    links: [{ label: 'rezoume.com', href: 'https://rezoume.com' }]
  },
  {
    name: 'COVER SWITCH 2', tag: 'kde plasma · open source',
    key: '#2F6BFF', mark: 'CS',
    desc: 'A window switcher for KDE Plasma 6: GNOME styled cover flow, panel aware geometry, morph animations. QML, GPL, installable from the KDE store.',
    links: [
      { label: 'github', href: 'https://github.com/dcrey7/coverswitch2' },
      { label: 'kde store', href: 'https://store.kde.org/p/2308734' }
    ]
  },
  {
    name: 'ACTIVE GLINER', tag: 'research',
    key: '#7C3AED', mark: 'GL',
    desc: 'Active-learning framework for span-based NER, paper + code.',
    links: [
      { label: 'paper', href: 'https://drive.google.com/file/d/1eo1z6MbX-gSsD8jMPwdCOveldRVPxqrF/view' },
      { label: 'github', href: 'https://github.com/dcrey7/active_gliner' },
      { label: 'writeup', href: 'https://dcrey7.substack.com/p/teaching-a-small-model-to-beat-its' }
    ]
  },
  {
    name: 'NOTME', tag: 'mistral game jam, finalist',
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
      { label: 'hugging face space', href: 'https://huggingface.co/spaces/dcrey7/NotMe' },
      { label: 'the story', href: 'https://www.linkedin.com/posts/dcrey7_mistralai-huggingface-elevenlabs-ugcPost-7289345687324934145-pTog/' }
    ]
  },
  {
    name: 'MEDICAL RAG', tag: 'mistral × alan, finalist',
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
    name: 'PIKA PAL AI', tag: 'wids datathon, thales responsible ai award', passed: true,
    key: '#0D9488', mark: 'PP', logo: 'projects/pikapal.png',
    desc: 'Autonomous content moderation agent built to make online spaces safer for children. Won the Thales Responsible AI Excellence Award.',
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
    desc: 'Elo ratings + Bayesian optimization for EURO 2024, FIFA–EXL hackathon.',
    links: [{ label: 'github', href: 'https://github.com/dcrey7/FIFA_EURO_2024' }]
  }
];

/* All 16 LinkedIn recommendations, in full, exact titles and companies as
   they appear on LinkedIn, with the relationship and its date. Photos live
   in assets/reccomendations/ (Anamika has none, initials fall back). */
export const PEOPLE = [
  { init:'PF', name:'Philippe Fraisse', role:'Head of AI Lab @ AXA France',
    rel:'managed me · Jan 2026', photo:'reccomendations/philppe.jpeg',
    quote:'Abhishek is a great data scientist and human being. He is able to find unexpected technical solutions autonomously in order to produce the envisioned results. His capacity to stay positive in dynamic situations keeps the work atmosphere very productive. Brainstorming with him is a pleasure, his listening and logic abilities helps the team to carve optimized methodological paths for the projects.' },
  { init:'CB', name:'Clement Baccar', role:'Data & AI · Core member Tech.Rocks',
    rel:'mentored me · Jun 2025', photo:'reccomendations/clementbaccar.png',
    quote:'He effectively managed the project from start to finish, demonstrating exceptional structure and organization. As a strong leader, he engaged the entire team, driving the project forward quickly and proactively. He played a vital role throughout the project, particularly on the technical side, proposing highly relevant solutions and technical implementations that aligned with the strategic and business objectives. He has a clear understanding of the strategic, business, and technical challenges involved in the project.' },
  { init:'ED', name:'Ekaterina Dmitrieva', role:'AI & Data Engineer · WiDS ambassador Paris',
    rel:'studied together · Jun 2025', photo:'reccomendations/ekaterina.jpeg',
    quote:'Having such an excellent companion during our master journey made it not only smooth but also cohesive. Abhishek was more than a great delegate, he was also my teammate on several projects, where his unwavering support, thoughtful guidance, and generosity with time and resources stood out. He approaches every challenge with curiosity and a strong desire to learn, always eager to grow professionally. He listens with empathy, gives honest and constructive feedback, and always brings a calm, strategic perspective to the table. Abhishek is the kind of person you want to call first, not just to aim for a good result, but to achieve something truly outstanding.' },
  { init:'OT', name:'Olivier Taugourdeau', role:'PhD, Egis · Innovation, Water & Environment',
    rel:'client · Mar 2025', photo:'reccomendations/olivier.png',
    quote:'Thomas worked on a remote sensing application for an Egis project on biodiversity. He did a great job to understand the project context and develop a proof of concept deep learning solution applied on satellite data. In particular, he contributed to the data preprocessing, segmentation algorithms and project reporting.' },
  { init:'RV', name:'Raphaël Vienne', role:'Founding AI Engineer @ Gigi',
    rel:'mentored me · Mar 2025', photo:'reccomendations/raphael.jpeg',
    quote:'Abhishek worked on a satellite image segmentation topic with us, he was invested and very serious in that endeavor. On top of that, Abhishek also has strong interpersonal skills and is a very ambitious person.' },
  { init:'SK', name:'Sarthak Kala', role:'AI Agents @ HPE · prev ML/DS @ AmEx',
    rel:'managed me · Jul 2024', photo:'reccomendations/sarthak.jpeg',
    quote:'I had the pleasure of directly working with Abhishek. He is a technically adept, curious and hard working individual. Whatever he works on he gives his 100%. I would highly recommend him.' },
  { init:'GA', name:'Gandharv Aggarwal', role:'American Express',
    rel:'mentored me · Mar 2024', photo:'reccomendations/gandharv.jpeg',
    quote:'Abhishek is a talented individual who is very well versed technically. Over our course of working together for about a year, he constantly demonstrated significant analytical proficiency, picking up new concepts in the quickest time. He is not only an expert in certain programming languages like Python, he also does very well in applying that proficiency to solve the business problems. He is also great at presenting his work and always has deep knowledge of what he is working on. Any team will have a significant asset in him.' },
  { init:'RR', name:'Rishita Ray', role:'Data Manager @ Swiss Re',
    rel:'mentored me · Mar 2024', photo:'reccomendations/rishitaray.jpeg',
    quote:'Abhishek is an exceptional professional with outstanding skills in Python. His attention to detail is exemplary, ensuring that every aspect of his work is meticulously executed. He excels in high-pressure situations, demonstrating resilience and delivering results with precision and efficiency. He consistently puts forward innovative ideas and solutions, demonstrating his ability to think creatively and contribute valuable insights. With his robust technical expertise, strong work ethic, and creative thinking, Abhishek is undoubtedly an asset to any team or project.' },
  { init:'JT', name:'Jubin Thomas', role:'Customer Success Leader, DS & Products @ MathCo',
    rel:'managed me · Dec 2022', photo:'reccomendations/jubin.png',
    quote:'Abhishek is a very hardworking, diligent and dependable individual to have in a team. He is a quick learner and always steps up to the challenge. His ability to be calm in tough situations, coupled with the fact that he is a team player, sets him apart from others and sets a good example for other team members on how to excel in tough situations.' },
  { init:'SM', name:'Srikar Manepalli', role:'Analytics Consultant at MathCo',
    rel:'managed me · Sep 2022', photo:'reccomendations/srikar.jpeg',
    quote:'Abhishek is an imaginative thinker who can come up with creative solutions to problems he is facing. He has innate artistic skills which he showcases through creative data visualizations and mockups. Furthermore, he is an amazing collaborator and a great team player who takes ownership of his work at both the team and organization levels. Regardless of which team he is on, he would definitely be a valuable asset.' },
  { init:'SY', name:'Sugam Yadav', role:'Process & Operational Excellence Leader @ ADP',
    rel:'managed me · Feb 2021', photo:'reccomendations/sugam.png',
    quote:'Abhishek is a keen learner, articulate and knowledgeable. He is always committed to impart knowledge with other team members, without making them feel inferior to the subject. His focus and attention to detail is unmatched and he is someone who is passionate about data analytics and AI/ML.' },
  { init:'DK', name:'Darshan Kadam', role:'Sales Director · Principal Advisor, AI Procurement Strategy',
    rel:'teammate · Jan 2021', photo:'reccomendations/darshan.jpeg',
    quote:'Abhishek and I worked together to create an end to end FIFA player scouting application. Abhishek was a natural leader during the project. He helped us get through each stage, right from EDA to deployment. Abhishek would be a great addition to any data science team.' },
  { init:'SR', name:'Shishir Rao', role:'Executive Director, Principal Engineer, Digital Technology & Innovation',
    rel:'studied together · Jan 2021', photo:'reccomendations/shisihr.jpeg',
    quote:'Abhishek is really smart, talented and an out-of-box and analytical thinker. He is very passionate about data science and during our PGPDM course together, we worked on various projects using SQL, Tableau and Python for ML. He not only developed classification and recommendation models, but also deployed them, which made it a complete solution.' },
  { init:'AK', name:'Arpit Kumar', role:'RGM Consultant (Product, Strategy & Analytics)',
    rel:'teammate · Dec 2020', photo:'reccomendations/arpit.jpeg',
    quote:'Abhishek is a quick thinker who has excellent analytical skills. He is a key team player who is very resourceful and formulates ideal solutions for the problem. His positive and can-do attitude makes him fun to work with.' },
  { init:'DS', name:'Devesh Singh', role:'AI Engineer @ Fractal',
    rel:'teammate · Dec 2020', photo:'reccomendations/devesh.jpeg',
    quote:'Abhishek has really good knowledge of machine learning models. He has shown good understanding of the business problem and how to apply data science and machine learning to solve it.' }
];

export const TROPHIES = [
  { n: '5+', label: 'years in data science & AI' },
  { n: '3',  label: 'awards, Treble voice-AI hackathon winner' },
  { n: '2',  label: 'OSS PRs merged, GLiNER · HF Gemma' },
  { n: '16', label: 'LinkedIn recommendations' }
];

/* Certifications, each with its verification link (assets/links.txt). */
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
  { name: 'CHITRAKALA', issuer: 'art', mark: 'CK',
    key: '#E11D48',
    href: 'https://drive.google.com/file/d/1nvwbt2sHyTMtxiSNGlekgztIA1lLseQT/view' }
];

/* Education, school logos live in assets/education/. */
export const EDUCATION = [
  { school: 'EMLYON', role: 'MSc Data Science and Artificial Intelligence',
    line: 'Paris · Sep 2024 to Feb 2026', mark: 'EM',
    key: '#C8102E', logo: 'education/emlyon_business_school_logo.jpeg',
    bullets: [
      'Machine learning, deep learning, NLP, computer vision, MLOps',
      'Thesis: Active GLiNER, active learning for span based entity extraction, a small model taught to beat its teacher',
      'Built during the masters: Mistral hackathon finalist twice, a Thales responsible AI award, a Speechmatics hackathon sweep'
    ],
    stack: 'Python · PyTorch · LLMs · NLP · MLOps',
    href: 'https://certificate.bcdiploma.com/check/DB040D4C62396A4CAD0001E4A01FB14D402F43E556B3962C5964899D0A5BD766SGcwRjhKTWpqaUkxSUJPYU8rUG14MTlKcnJ5aHNCT3cyd2l4NHhJZXhPNXFlanhU' },
  { school: 'MCGILL', role: 'International semester, Data Science and AI',
    line: 'Montreal · Jan 2025', mark: 'MG',
    key: '#ED1B2F', logo: 'education/mcgill_university_school_of_continuing_studies_logo.jpeg',
    bullets: [
      'School of Continuing Studies, exchange term from emlyon',
      'Data science and AI coursework in an English speaking cohort in Canada'
    ] },
  { school: 'UCHICAGO', role: 'Postgraduate Diploma, Data Science and Machine Learning',
    line: 'Graham School · 2019 to 2020', mark: 'UC',
    key: '#800000',
    bullets: [
      'Machine learning and deep learning, taken while working full time at Amazon',
      'The pivot: a mechanical engineer teaching himself the field he now works in'
    ] },
  { school: 'SVNIT SURAT', role: 'B.Tech Mechanical Engineering',
    line: 'National Institute of Technology · Jun 2015 to May 2019', mark: 'SV',
    key: '#D97706', logo: 'education/nit-surat.svg',
    bullets: [
      'Robotics and advanced mathematics alongside the core mechanical syllabus',
      'Class delegate, the elected voice of the batch to the faculty',
      'Played football for the university team, and still plays every Saturday in Paris'
    ],
    stack: 'Robotics · Advanced mathematics · Thermodynamics · Machine design' }
];

/* Supabase project for visitor recommendations (pending → approved flow).
   Create a free project at supabase.com, then paste its URL and anon key. */
/* The anon key is a PUBLIC value by design: row level security on the
   server decides what it can do (insert pending, read approved). */
export const SUPA = {
  url: 'https://tzahyhzkxhedcuobalkr.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6YWh5aHpreGhlZGN1b2JhbGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0OTQ4MTQsImV4cCI6MjEwMzA3MDgxNH0.YuSi6KVoxIYVPwdzUeej1Hqbqz1cFxCs4hxhuNWk2HE'
};

/* The radio, saloon.wtf style: paste YOUR YouTube playlist link(s) here.
   The player loads the whole playlist itself, shows the current song's real
   title and channel, and prev/next skip real tracks. Nothing is hardcoded;
   manage the songs in the YouTube app. The disc click cycles playlists.
   e.g. 'https://www.youtube.com/playlist?list=PL...'                       */
export const YT_PLAYLISTS = [
  'https://www.youtube.com/watch?v=ple35INEvSg&list=PLlmyYmqoMXCsDoF4-oS_cTnwT3Qli-ibh',
  'https://www.youtube.com/watch?v=E71acITolMs&list=PLDisKgcnAC4RsAAPyU2XABwQxOBsup9aH',
  'https://www.youtube.com/watch?v=Jo8kz-ekR9g&list=PLxXDneBUCXERjmJJw4eijw45tfWr5ZLr-',
  'https://www.youtube.com/playlist?list=PLMp52FesfEMkrsmgKg5-QIKs-Jad8b3sj'
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
  contact:  { key: '#EC4899', mark: 'CT' }
};

/* The theme song: plays from the first key or click, loops between
   loopStart and the end of the file (the file's last bar is a crossfade
   back into the bar before loopStart, rendered offline; the first 3.12 s
   of the song are cut, so it starts straight in the music). */
export const THEME = {
  url: 'assets/theme.mp3', title: 'Silent Echoes', by: 'Flume',
  loopStart: 12.347, loopEnd: 55.504
};
