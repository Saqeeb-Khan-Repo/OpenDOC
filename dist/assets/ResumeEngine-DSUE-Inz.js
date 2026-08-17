const m=[{id:"tmpl_modern_pro",name:"Modern Professional (ATS-Optimized)",category:"General & ATS",description:"Clean single-column layout with subtle dividing lines. Optimized for applicant tracking systems.",thumbnailColor:"#2563eb",layout:"single-column"},{id:"tmpl_two_column",name:"Modern Two-Column Layout",category:"Corporate",description:"Compact sidebar for contact info, skills, and languages with expansive experience column.",thumbnailColor:"#0f172a",layout:"two-column"},{id:"tmpl_software_eng",name:"Software Engineer & Full-Stack",category:"Technology",description:"Tailored for developers with tech stack badges, GitHub links, and high-impact engineering projects.",thumbnailColor:"#059669",layout:"technical"},{id:"tmpl_graduate_fresher",name:"Graduate / Entry-Level Fresher",category:"Academic",description:"Clean layout emphasizing academic degree, capstone projects, internships, and hackathons.",thumbnailColor:"#7c3aed",layout:"academic"},{id:"tmpl_executive_corp",name:"Executive & Corporate Leadership",category:"Executive",description:"Sophisticated typography emphasizing strategic leadership, board experience, and revenue metrics.",thumbnailColor:"#9f1239",layout:"executive"}];class g{static getTemplates(){return m}static getDefaultResumeData(){return{personalInfo:{name:"Alex Chen",title:"Senior Full-Stack Software Engineer",email:"alex.chen@example.com",phone:"+1 (555) 234-5678",location:"San Francisco, CA",website:"https://alexchen.dev",github:"github.com/alexchen",linkedin:"linkedin.com/in/alexchen"},summary:"Results-oriented Senior Software Engineer with 6+ years of experience architecting high-throughput distributed systems, scalable web applications, and real-time collaborative workspaces. Proven track record of improving latency by 45% and leading cross-functional engineering teams.",skillCategories:[{category:"Languages & Frameworks",skills:["TypeScript","JavaScript (ESNext)","React","Next.js","Node.js","Python","Go","GraphQL"]},{category:"Cloud & DevOps",skills:["AWS (Lambda, S3, ECS)","Docker","Kubernetes","CI/CD Pipelines","PostgreSQL","Redis"]},{category:"Methodologies",skills:["System Architecture","Microservices","RESTful APIs","Agile / Scrum","TDD"]}],experience:[{title:"Lead Software Engineer",company:"ScaleTech Solutions",location:"San Francisco, CA",period:"2022 – Present",highlights:["Architected real-time collaboration engine using WebSockets and CRDTs, supporting 50K concurrent users with sub-20ms sync latency.","Spearheaded migration of legacy monolith to Next.js and microservices, slashing initial page load times by 48%.","Mentored 8 junior and mid-level engineers, instituted rigorous automated testing standards with 94% code coverage."]},{title:"Full-Stack Software Engineer",company:"Nexus Cloud Platforms",location:"San Jose, CA",period:"2019 – 2022",highlights:["Engineered REST and GraphQL data pipelines processing over 12M events daily with 99.99% uptime.","Implemented automated billing and subscription infrastructure generating $4.2M in annual recurring revenue.","Optimized complex PostgreSQL queries, reducing database CPU load by 35% during peak hours."]}],education:[{degree:"B.S. in Computer Science",school:"University of California, Berkeley",location:"Berkeley, CA",year:"2015 – 2019",gpa:"3.85 / 4.00",details:"Dean’s Honor List • Coursework: Distributed Systems, Operating Systems, Algorithms, Machine Learning"}],projects:[{name:"DocProEditor Canvas Engine",role:"Creator & Lead Architect",techStack:["React","TypeScript","TailwindCSS","Web Workers"],link:"https://github.com/alexchen/docflow",highlights:["Built a high-performance vector canvas and multi-page document pagination engine running at 60fps.","Implemented custom LaTeX math parser and client-side PDF/DOCX multi-format serializers."]},{name:"Neural OCR Scanner",role:"Core Contributor",techStack:["Python","FastAPI","OpenCV","PyTorch"],highlights:["Developed optical document segmentation algorithm achieving 96% accuracy on complex invoice scans."]}],certifications:[{name:"AWS Certified Solutions Architect (Associate)",issuer:"Amazon Web Services",year:"2023"},{name:"Certified Kubernetes Administrator (CKA)",issuer:"Cloud Native Computing Foundation",year:"2022"}],achievements:["1st Place Winner — Silicon Valley AI Hackathon (2024)","Published author of technical engineering articles with 150K+ reads on Medium"]}}static renderTemplate(n,t){switch(t){case"tmpl_two_column":return this.renderTwoColumnTemplate(n);case"tmpl_software_eng":return this.renderSoftwareEngTemplate(n);case"tmpl_graduate_fresher":return this.renderGraduateTemplate(n);case"tmpl_executive_corp":return this.renderExecutiveTemplate(n);case"tmpl_modern_pro":default:return this.renderModernProTemplate(n)}}static renderModernProTemplate(n){const{personalInfo:t,summary:s,skillCategories:l,experience:a,education:r,projects:p,certifications:o,achievements:e}=n;return`
<div style="font-family: 'Inter', -apple-system, sans-serif; line-height: 1.5; color: #1e293b;">
  <!-- Header -->
  <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 18px;">
    <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.02em;">${t.name}</h1>
    <p style="font-size: 14px; font-weight: 600; color: #2563eb; margin: 0 0 8px 0;">${t.title}</p>
    <p style="font-size: 11px; color: #64748b; margin: 0;">
      ${t.location} • ${t.email} • ${t.phone} • <a href="${t.website}" style="color: #2563eb; text-decoration: none;">${t.website?.replace(/^https?:\/\//,"")}</a> • <a href="https://${t.github}" style="color: #2563eb; text-decoration: none;">${t.github}</a>
    </p>
  </div>

  <!-- Professional Summary -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 6px 0;">Professional Summary</h2>
    <p style="font-size: 11.5px; color: #334155; margin: 0; line-height: 1.6;">${s}</p>
  </div>

  <!-- Technical Skills -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 6px 0;">Skills &amp; Competencies</h2>
    <div style="font-size: 11px; color: #334155;">
      ${l.map(i=>`<p style="margin: 0 0 3px 0;"><strong>${i.category}:</strong> ${i.skills.join(", ")}</p>`).join("")}
    </div>
  </div>

  <!-- Work Experience -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 8px 0;">Work Experience</h2>
    ${a.map(i=>`
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${i.title} — <span style="font-weight: 600; color: #2563eb;">${i.company}</span></h3>
          <span style="font-size: 10.5px; color: #64748b; font-weight: 500;">${i.period} | ${i.location}</span>
        </div>
        <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
          ${i.highlights.map(c=>`<li style="margin-bottom: 2px;">${c}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- Key Projects -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 8px 0;">Key Projects</h2>
    ${p.map(i=>`
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${i.name} <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">(${i.techStack.join(", ")})</span></h3>
          ${i.link?`<a href="${i.link}" style="font-size: 10.5px; color: #2563eb; text-decoration: none;">View Project</a>`:""}
        </div>
        <ul style="margin: 3px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${i.highlights.map(c=>`<li style="margin-bottom: 2px;">${c}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- Education -->
  <div style="margin-bottom: 14px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 6px 0;">Education</h2>
    ${r.map(i=>`
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px;">
        <div>
          <strong style="color: #0f172a;">${i.degree}</strong> — ${i.school}, ${i.location}
          ${i.details?`<div style="color: #64748b; font-size: 10.5px; margin-top: 1px;">${i.details}</div>`:""}
        </div>
        <span style="color: #64748b; font-weight: 500;">${i.year}</span>
      </div>
    `).join("")}
  </div>

  <!-- Certifications & Honors -->
  <div>
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 4px 0;">Certifications &amp; Honors</h2>
    <p style="font-size: 11px; color: #334155; margin: 0;">
      ${o.map(i=>`${i.name} (${i.issuer}, ${i.year})`).join(" • ")}
    </p>
  </div>
</div>
`}static renderTwoColumnTemplate(n){const{personalInfo:t,summary:s,skillCategories:l,experience:a,education:r,projects:p,certifications:o}=n;return`
<div style="font-family: 'Inter', sans-serif; display: grid; grid-template-columns: 240px 1fr; gap: 24px; color: #1e293b; line-height: 1.5;">
  <!-- Left Sidebar -->
  <div style="background: #f8fafc; padding: 20px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${t.name}</h1>
    <p style="font-size: 12px; font-weight: 600; color: #2563eb; margin: 0 0 16px 0;">${t.title}</p>

    <!-- Contact Info -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Contact</h3>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">📍 ${t.location}</p>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">✉️ ${t.email}</p>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">📱 ${t.phone}</p>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">🌐 ${t.website?.replace(/^https?:\/\//,"")}</p>
    </div>

    <!-- Skills -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Skills</h3>
      ${l.map(e=>`
        <div style="margin-bottom: 8px;">
          <p style="font-size: 10px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">${e.category}</p>
          <p style="font-size: 10.5px; color: #475569; margin: 0;">${e.skills.join(", ")}</p>
        </div>
      `).join("")}
    </div>

    <!-- Education in Sidebar -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Education</h3>
      ${r.map(e=>`
        <div style="margin-bottom: 6px;">
          <p style="font-size: 10.5px; font-weight: 700; color: #0f172a; margin: 0;">${e.degree}</p>
          <p style="font-size: 10px; color: #64748b; margin: 0;">${e.school} (${e.year})</p>
        </div>
      `).join("")}
    </div>

    <!-- Certifications -->
    <div>
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Certifications</h3>
      ${o.map(e=>`
        <p style="font-size: 10px; color: #334155; margin: 0 0 4px 0;">• ${e.name}</p>
      `).join("")}
    </div>
  </div>

  <!-- Right Main Column -->
  <div>
    <!-- Executive Summary -->
    <div style="margin-bottom: 18px;">
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 0 0 6px 0;">Executive Summary</h2>
      <p style="font-size: 11.5px; color: #334155; margin: 0; line-height: 1.6;">${s}</p>
    </div>

    <!-- Experience -->
    <div style="margin-bottom: 18px;">
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 0 0 10px 0;">Professional Experience</h2>
      ${a.map(e=>`
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${e.title}</h3>
            <span style="font-size: 10.5px; color: #64748b;">${e.period}</span>
          </div>
          <p style="font-size: 11px; color: #2563eb; font-weight: 600; margin: 0 0 4px 0;">${e.company} • ${e.location}</p>
          <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
            ${e.highlights.map(i=>`<li style="margin-bottom: 2px;">${i}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </div>

    <!-- Featured Projects -->
    <div>
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 0 0 8px 0;">Featured Projects</h2>
      ${p.map(e=>`
        <div style="margin-bottom: 8px;">
          <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${e.name}</h3>
          <ul style="margin: 3px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
            ${e.highlights.map(i=>`<li style="margin-bottom: 2px;">${i}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </div>
  </div>
</div>
`}static renderSoftwareEngTemplate(n){const{personalInfo:t,summary:s,skillCategories:l,experience:a,projects:r,education:p,certifications:o}=n;return`
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace, sans-serif; line-height: 1.5; color: #0f172a;">
  <!-- Header with Terminal Vibe -->
  <div style="background: #0f172a; color: #f8fafc; padding: 18px 22px; border-radius: 8px; margin-bottom: 18px;">
    <h1 style="font-size: 24px; font-weight: 800; color: #38bdf8; margin: 0 0 2px 0;">${t.name}</h1>
    <p style="font-size: 13px; color: #a78bfa; margin: 0 0 8px 0; font-weight: 600;">$ role --title="${t.title}"</p>
    <p style="font-size: 10.5px; color: #94a3b8; margin: 0;">
      📍 ${t.location} | ✉️ ${t.email} | 📱 ${t.phone} | 🔗 <a href="https://${t.github}" style="color: #38bdf8; text-decoration: none;">${t.github}</a>
    </p>
  </div>

  <!-- Tech Stack Badges -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 6px 0;">// TECH STACK</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
      ${l.flatMap(e=>e.skills).map(e=>`
        <span style="font-size: 10px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px;">${e}</span>
      `).join("")}
    </div>
  </div>

  <!-- Engineering Experience -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 8px 0;">// PRODUCTION EXPERIENCE</h2>
    ${a.map(e=>`
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${e.title} @ <span style="color: #059669;">${e.company}</span></h3>
          <span style="font-size: 10.5px; color: #64748b;">${e.period}</span>
        </div>
        <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${e.highlights.map(i=>`<li style="margin-bottom: 2px;">${i}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- Open-Source & Key Projects -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 8px 0;">// OPEN SOURCE &amp; ARCHITECTURE PROJECTS</h2>
    ${r.map(e=>`
      <div style="margin-bottom: 8px;">
        <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${e.name}</h3>
        <p style="font-size: 10px; color: #64748b; margin: 1px 0 3px 0;">Stack: ${e.techStack.join(" • ")}</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${e.highlights.map(i=>`<li>${i}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- Education & Certifications -->
  <div>
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 6px 0;">// EDUCATION &amp; CREDENTIALS</h2>
    ${p.map(e=>`
      <p style="font-size: 11px; color: #334155; margin: 0 0 2px 0;"><strong>${e.degree}</strong> — ${e.school} (${e.year}) [GPA: ${e.gpa}]</p>
    `).join("")}
    <p style="font-size: 10.5px; color: #64748b; margin: 4px 0 0 0;">
      Certifications: ${o.map(e=>`${e.name}`).join(" • ")}
    </p>
  </div>
</div>
`}static renderGraduateTemplate(n){const{personalInfo:t,summary:s,skillCategories:l,education:a,projects:r,achievements:p,certifications:o}=n;return`
<div style="font-family: 'Inter', sans-serif; line-height: 1.5; color: #1e293b;">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 16px;">
    <h1 style="font-size: 24px; font-weight: 800; color: #4338ca; margin: 0 0 4px 0;">${t.name}</h1>
    <p style="font-size: 12px; color: #64748b; margin: 0;">
      ${t.location} • ${t.email} • ${t.phone} • <a href="https://${t.github}" style="color: #4338ca; text-decoration: none;">GitHub</a> • <a href="https://${t.linkedin}" style="color: #4338ca; text-decoration: none;">LinkedIn</a>
    </p>
  </div>

  <!-- Academic Objective -->
  <div style="margin-bottom: 14px; background: #eef2ff; padding: 10px 14px; border-radius: 6px; border-left: 4px solid #4338ca;">
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4338ca; margin: 0 0 3px 0;">Career Objective</h2>
    <p style="font-size: 11px; color: #312e81; margin: 0; line-height: 1.5;">${s}</p>
  </div>

  <!-- Education (Prominent for Graduates) -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 6px 0;">Academic Background</h2>
    ${a.map(e=>`
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${e.degree}</h3>
          <span style="font-size: 10.5px; color: #4338ca; font-weight: 600;">${e.year}</span>
        </div>
        <p style="font-size: 11px; color: #475569; margin: 1px 0 2px 0;">${e.school}, ${e.location} • <strong>GPA: ${e.gpa}</strong></p>
        <p style="font-size: 10.5px; color: #64748b; margin: 0;">${e.details}</p>
      </div>
    `).join("")}
  </div>

  <!-- Technical Skills -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 6px 0;">Technical Competencies</h2>
    <div style="font-size: 11px; color: #334155;">
      ${l.map(e=>`<p style="margin: 0 0 2px 0;"><strong>${e.category}:</strong> ${e.skills.join(", ")}</p>`).join("")}
    </div>
  </div>

  <!-- Academic & Capstone Projects -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 8px 0;">Academic &amp; Capstone Projects</h2>
    ${r.map(e=>`
      <div style="margin-bottom: 10px;">
        <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${e.name} <span style="font-size: 10px; color: #64748b; font-weight: normal;">[${e.techStack.join(", ")}]</span></h3>
        <ul style="margin: 3px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${e.highlights.map(i=>`<li style="margin-bottom: 2px;">${i}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- Achievements & Extracurriculars -->
  <div>
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 4px 0;">Achievements &amp; Activities</h2>
    <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
      ${p.map(e=>`<li style="margin-bottom: 2px;">${e}</li>`).join("")}
    </ul>
  </div>
</div>
`}static renderExecutiveTemplate(n){const{personalInfo:t,summary:s,skillCategories:l,experience:a,education:r,achievements:p}=n;return`
<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1c1917;">
  <!-- Header -->
  <div style="text-align: center; border-bottom: 3px double #78350f; padding-bottom: 14px; margin-bottom: 18px;">
    <h1 style="font-size: 26px; font-weight: 700; color: #451a03; margin: 0 0 4px 0; letter-spacing: 0.04em; text-transform: uppercase;">${t.name}</h1>
    <p style="font-size: 13px; font-weight: 600; color: #92400e; font-style: italic; margin: 0 0 6px 0;">${t.title}</p>
    <p style="font-family: 'Inter', sans-serif; font-size: 10.5px; color: #78716c; margin: 0;">
      ${t.location} • ${t.email} • ${t.phone} • ${t.linkedin}
    </p>
  </div>

  <!-- Executive Leadership Profile -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 6px 0;">Executive Profile</h2>
    <p style="font-size: 11.5px; color: #292524; margin: 0; text-align: justify;">${s}</p>
  </div>

  <!-- Core Competencies Grid -->
  <div style="margin-bottom: 16px; font-family: 'Inter', sans-serif;">
    <h2 style="font-family: 'Georgia', serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 6px 0;">Core Competencies</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #44403c;">
      <div>• Strategic P&amp;L &amp; Growth Execution</div>
      <div>• Engineering Leadership &amp; Mentorship</div>
      <div>• Enterprise Cloud Architecture</div>
      <div>• Cross-Functional Agile Management</div>
    </div>
  </div>

  <!-- Executive Experience -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 8px 0;">Executive &amp; Professional Experience</h2>
    ${a.map(o=>`
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1c1917; margin: 0;">${o.title}</h3>
          <span style="font-family: 'Inter', sans-serif; font-size: 10px; color: #78716c;">${o.period}</span>
        </div>
        <p style="font-size: 11px; font-style: italic; color: #92400e; margin: 1px 0 4px 0;">${o.company} — ${o.location}</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #292524;">
          ${o.highlights.map(e=>`<li style="margin-bottom: 2px;">${e}</li>`).join("")}
        </ul>
      </div>
    `).join("")}
  </div>

  <!-- Education & Credentials -->
  <div>
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 4px 0;">Education &amp; Board Appointments</h2>
    ${r.map(o=>`
      <p style="font-size: 11px; color: #292524; margin: 0 0 2px 0;"><strong>${o.degree}</strong> — ${o.school} (${o.year})</p>
    `).join("")}
  </div>
</div>
`}}export{g as R,m as a};
