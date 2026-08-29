const $={pageSize:"A4",customWidth:210,customHeight:297,unit:"mm",orientation:"portrait",marginTop:15,marginBottom:15,marginLeft:15,marginRight:15,linkedMargins:!0,marginPreset:"normal"},b=[{id:"professional",name:"Professional Blue",colors:{primary:"#2563eb",accent:"#3b82f6",heading:"#0f172a",body:"#334155",muted:"#64748b",link:"#2563eb",border:"#e2e8f0",background:"#ffffff"}},{id:"navy",name:"Executive Navy",colors:{primary:"#0f2942",accent:"#1e40af",heading:"#0a192f",body:"#1e293b",muted:"#5c7080",link:"#1d4ed8",border:"#cbd5e1",background:"#ffffff"}},{id:"slate",name:"Modern Slate",colors:{primary:"#334155",accent:"#475569",heading:"#0f172a",body:"#334155",muted:"#64748b",link:"#2563eb",border:"#e2e8f0",background:"#ffffff"}},{id:"modern-blue",name:"Clean Cyan",colors:{primary:"#0284c7",accent:"#0369a1",heading:"#0f172a",body:"#334155",muted:"#64748b",link:"#0284c7",border:"#e0f2fe",background:"#ffffff"}},{id:"emerald",name:"Emerald Forest",colors:{primary:"#059669",accent:"#047857",heading:"#064e3b",body:"#1e293b",muted:"#64748b",link:"#059669",border:"#d1fae5",background:"#ffffff"}},{id:"burgundy",name:"Deep Burgundy",colors:{primary:"#9f1239",accent:"#881337",heading:"#4c0519",body:"#1e293b",muted:"#64748b",link:"#be123c",border:"#ffe4e6",background:"#ffffff"}},{id:"minimal-black",name:"Minimal Black & White (ATS)",colors:{primary:"#18181b",accent:"#27272a",heading:"#09090b",body:"#27272a",muted:"#52525b",link:"#18181b",border:"#e4e4e7",background:"#ffffff"}},{id:"warm-gray",name:"Warm Charcoal",colors:{primary:"#44403c",accent:"#78716c",heading:"#1c1917",body:"#292524",muted:"#78716c",link:"#b45309",border:"#e7e5e4",background:"#ffffff"}},{id:"dark-pro",name:"Dark Studio",colors:{primary:"#38bdf8",accent:"#818cf8",heading:"#ffffff",body:"#e2e8f0",muted:"#94a3b8",link:"#38bdf8",border:"#334155",background:"#0f172a"}}],h=[{id:"tmpl_modern_pro",name:"Modern Professional (ATS-Optimized)",category:"ATS",description:"Clean single-column layout with subtle dividing lines. Optimized for applicant tracking systems.",thumbnailColor:"#2563eb",layout:"single-column"},{id:"tmpl_two_column",name:"Modern Two-Column Layout",category:"Professional",description:"Compact sidebar for contact info, skills, and languages with expansive experience column.",thumbnailColor:"#0f172a",layout:"two-column"},{id:"tmpl_software_eng",name:"Software Engineer & Full-Stack",category:"Developer",description:"Tailored for developers with tech stack badges, GitHub links, and high-impact engineering projects.",thumbnailColor:"#059669",layout:"technical"},{id:"tmpl_graduate_fresher",name:"Graduate / Entry-Level Fresher",category:"Student",description:"Clean layout emphasizing academic degree, capstone projects, internships, and hackathons.",thumbnailColor:"#7c3aed",layout:"academic"},{id:"tmpl_executive_corp",name:"Executive & Corporate Leadership",category:"Executive",description:"Sophisticated typography emphasizing strategic leadership, board experience, and revenue metrics.",thumbnailColor:"#9f1239",layout:"executive"},{id:"tmpl_ats_classic",name:"ATS Classic Standard",category:"ATS",description:"High-parsability standard formatting with zero complex tables or floating graphics.",thumbnailColor:"#1e293b",layout:"single-column"},{id:"tmpl_ats_pro",name:"ATS Professional Clean",category:"ATS",description:"Minimalist hierarchy with clear uppercase section headers and robust text extraction.",thumbnailColor:"#3b82f6",layout:"single-column"},{id:"tmpl_ats_modern",name:"ATS Modern Minimal",category:"ATS",description:"Crisp sans-serif typography with compact metadata line items designed for quick automated scans.",thumbnailColor:"#0f766e",layout:"single-column"},{id:"tmpl_ats_developer",name:"ATS Developer Tech",category:"ATS",description:"Categorized technical skill blocks and clean project bullet points for engineering scanners.",thumbnailColor:"#0284c7",layout:"single-column"},{id:"tmpl_ats_executive",name:"ATS Executive Streamlined",category:"ATS",description:"Designed for senior leaders with executive summaries and quantified achievement bullets.",thumbnailColor:"#475569",layout:"single-column"},{id:"tmpl_compact_ats",name:"Compact ATS Single-Page",category:"ATS",description:"High-density single page layout designed to fit extensive career histories without spilling over.",thumbnailColor:"#334155",layout:"compact"},{id:"tmpl_minimalist_clean",name:"Minimalist Clean Studio",category:"Modern",description:"Generous whitespace with lightweight typography and understated border accents.",thumbnailColor:"#18181b",layout:"single-column"},{id:"tmpl_clean_corporate",name:"Clean Corporate White",category:"Professional",description:"Corporate aesthetic with bold role titles, dual-color headers, and clear timeline dividers.",thumbnailColor:"#1e40af",layout:"single-column"},{id:"tmpl_developer_pro",name:"Developer Pro Terminal",category:"Developer",description:"Modern developer layout with monospace metadata accents, GitHub metrics, and live demo links.",thumbnailColor:"#10b981",layout:"technical"},{id:"tmpl_creative_portfolio",name:"Creative Portfolio Accent",category:"Creative",description:"Visual header layout with photo support, skill tag bubbles, and highlighted portfolio links.",thumbnailColor:"#ec4899",layout:"creative"},{id:"tmpl_academic_research",name:"Academic & Research Thesis",category:"Academic",description:"Classic serif typography tailored for universities, grant applications, and published research.",thumbnailColor:"#6366f1",layout:"academic"},{id:"tmpl_consulting_strategy",name:"Consulting & Strategy Matrix",category:"Executive",description:"Two-column strategic layout highlighting core advisory domains, client engagements, and certifications.",thumbnailColor:"#0369a1",layout:"two-column"},{id:"tmpl_elegant_serif",name:"Elegant Serif Classic",category:"Creative",description:"Editorial aesthetic with Playfair Display headings and refined timeless styling.",thumbnailColor:"#b45309",layout:"single-column"},{id:"tmpl_soft_modern",name:"Soft Modern Slate",category:"Modern",description:"Contemporary rounded badges, soft muted palette, and modern card-style project blocks.",thumbnailColor:"#64748b",layout:"single-column"},{id:"tmpl_split_sidebar",name:"Split Two-Tone Sidebar",category:"Modern",description:"High-contrast tinted sidebar for contact, education, and skills with clean main experience column.",thumbnailColor:"#0f172a",layout:"two-column"},{id:"tmpl_dotnet_dev",name:".NET & C# Enterprise Architect",category:"Developer",description:"Specialized enterprise layout with C# .NET core competencies, microservices, and database highlights.",thumbnailColor:"#512bd4",layout:"technical"},{id:"tmpl_backend_dev",name:"Backend & Distributed Systems",category:"Developer",description:"Tailored for backend engineers focusing on APIs, cloud architecture, throughput, and database optimization.",thumbnailColor:"#0d9488",layout:"technical"},{id:"tmpl_frontend_dev",name:"Frontend & UI Engineer",category:"Developer",description:"Clean visual hierarchy showcasing modern web frameworks, component libraries, and performance metrics.",thumbnailColor:"#06b6d4",layout:"single-column"},{id:"tmpl_fullstack_dev",name:"Full Stack Engineer Stack",category:"Developer",description:"Balanced dual-focus layout highlighting both client-side and cloud/server implementations.",thumbnailColor:"#2563eb",layout:"technical"},{id:"tmpl_data_analyst",name:"Data Analyst & BI Specialist",category:"Professional",description:"Structured layout emphasizing SQL, visualization dashboards, statistical modeling, and insights.",thumbnailColor:"#d97706",layout:"single-column"},{id:"tmpl_data_scientist",name:"Data Scientist & ML Engineer",category:"Developer",description:"Highlights predictive algorithms, Python/PyTorch pipelines, publications, and ML metrics.",thumbnailColor:"#7c3aed",layout:"technical"},{id:"tmpl_ai_ml",name:"AI / LLM Research Engineer",category:"Developer",description:"Designed for deep learning, transformer fine-tuning, neural networks, and research contributions.",thumbnailColor:"#4f46e5",layout:"technical"},{id:"tmpl_internship",name:"Internship & Co-op Candidate",category:"Student",description:"Optimized for university students and interns highlighting coursework, hackathons, and projects.",thumbnailColor:"#14b8a6",layout:"academic"},{id:"tmpl_professional_minimal",name:"Professional Minimal ATS",category:"ATS",description:"Ultra-clean single column layout with standard headings for automated ATS screening.",thumbnailColor:"#334155",layout:"single-column"}],u=[{id:"sec_personal",type:"personal",title:"Header & Contact",visible:!0},{id:"sec_summary",type:"summary",title:"Professional Summary",visible:!0},{id:"sec_skills",type:"skills",title:"Skills & Competencies",visible:!0},{id:"sec_experience",type:"experience",title:"Work Experience",visible:!0},{id:"sec_projects",type:"projects",title:"Key Projects",visible:!0},{id:"sec_education",type:"education",title:"Education",visible:!0},{id:"sec_certifications",type:"certifications",title:"Certifications",visible:!0},{id:"sec_achievements",type:"achievements",title:"Achievements",visible:!0},{id:"sec_awards",type:"awards",title:"Honors & Awards",visible:!1},{id:"sec_publications",type:"publications",title:"Publications",visible:!1},{id:"sec_languages",type:"languages",title:"Languages",visible:!1},{id:"sec_volunteer",type:"volunteer",title:"Volunteer Experience",visible:!1},{id:"sec_organizations",type:"organizations",title:"Organizations",visible:!1},{id:"sec_references",type:"references",title:"References",visible:!1}];class y{static getTemplates(){return h}static getDefaultDesign(){return{headerLayout:"modern",fontFamily:"Inter",typographyPreset:"normal",nameSize:26,headingSize:12.5,bodySize:11,metadataSize:10,lineHeight:1.5,letterSpacing:"normal",textAlign:"left",palette:"professional",colors:{...b[0].colors},spacingPreset:"balanced",spacing:{pageMargin:32,sectionGap:16,entryGap:12,paragraphGap:4,lineHeight:1.5},paperSize:"A4",skillsStyle:"categories",bulletStyle:"dot",headingStyle:"underline",projectStyle:"standard",educationStyle:"classic"}}static getDefaultResumeData(){return{personalInfo:{name:"Alex Chen",title:"Senior Full-Stack Software Engineer",email:"alex.chen@example.com",phone:"+1 (555) 234-5678",location:"San Francisco, CA",website:"https://alexchen.dev",github:"github.com/alexchen",linkedin:"linkedin.com/in/alexchen",portfolio:"https://alexchen.dev/portfolio",customLinks:[{label:"Blog",url:"https://alexchen.dev/blog"}],photo:{url:"",style:"none",size:"md"}},summary:"Results-oriented Senior Software Engineer with 6+ years of experience architecting high-throughput distributed systems, scalable web applications, and real-time collaborative workspaces. Proven track record of improving latency by 45% and leading cross-functional engineering teams.",objective:"",skillCategories:[{category:"Languages & Frameworks",skills:["TypeScript","JavaScript (ESNext)","React","Next.js","Node.js","Python","Go","GraphQL"]},{category:"Cloud & DevOps",skills:["AWS (Lambda, S3, ECS)","Docker","Kubernetes","CI/CD Pipelines","PostgreSQL","Redis"]},{category:"Methodologies",skills:["System Architecture","Microservices","RESTful APIs","Agile / Scrum","TDD"]}],skills:["TypeScript","React","Next.js","Node.js","Python","Go","GraphQL","AWS","Docker","Kubernetes","PostgreSQL","Redis","CI/CD","Microservices"],experience:[{id:"exp_1",title:"Lead Software Engineer",company:"ScaleTech Solutions",location:"San Francisco, CA",period:"2022 – Present",current:!0,website:"https://scaletech.example.com",highlights:["Architected real-time collaboration engine using WebSockets and CRDTs, supporting 50K concurrent users with sub-20ms sync latency.","Spearheaded migration of legacy monolith to Next.js and microservices, slashing initial page load times by 48%.","Mentored 8 junior and mid-level engineers, instituted rigorous automated testing standards with 94% code coverage."]},{id:"exp_2",title:"Full-Stack Software Engineer",company:"Nexus Cloud Platforms",location:"San Jose, CA",period:"2019 – 2022",current:!1,website:"https://nexuscloud.example.com",highlights:["Engineered REST and GraphQL data pipelines processing over 12M events daily with 99.99% uptime.","Implemented automated billing and subscription infrastructure generating $4.2M in annual recurring revenue.","Optimized complex PostgreSQL queries, reducing database CPU load by 35% during peak hours."]}],education:[{id:"edu_1",degree:"B.S. in Computer Science",school:"University of California, Berkeley",location:"Berkeley, CA",year:"2015 – 2019",gpa:"3.85 / 4.00",details:"Dean’s Honor List • Coursework: Distributed Systems, Operating Systems, Algorithms, Machine Learning"}],projects:[{id:"proj_1",name:"DocProEditor Canvas Engine",role:"Creator & Lead Architect",techStack:["React","TypeScript","TailwindCSS","Web Workers"],link:"https://github.com/alexchen/docproeditor",projectUrl:"https://docproeditor.example.com",githubUrl:"https://github.com/alexchen/docproeditor",liveDemoUrl:"https://docproeditor.example.com/demo",highlights:["Built a high-performance vector canvas and multi-page document pagination engine running at 60fps.","Implemented custom LaTeX math parser and client-side PDF/DOCX multi-format serializers."]},{id:"proj_2",name:"Neural OCR Scanner",role:"Core Contributor",techStack:["Python","FastAPI","OpenCV","PyTorch"],link:"https://github.com/alexchen/neural-ocr",projectUrl:"https://ocr.example.com",githubUrl:"https://github.com/alexchen/neural-ocr",highlights:["Developed optical document segmentation algorithm achieving 96% accuracy on complex invoice scans."]}],certifications:[{id:"cert_1",name:"AWS Certified Solutions Architect (Associate)",issuer:"Amazon Web Services",year:"2023",link:"https://aws.amazon.com"},{id:"cert_2",name:"Certified Kubernetes Administrator (CKA)",issuer:"Cloud Native Computing Foundation",year:"2022",link:"https://cncf.io"}],achievements:["1st Place Winner — Silicon Valley AI Hackathon (2024)","Published author of technical engineering articles with 150K+ reads on Medium"],awards:[{id:"award_1",title:"Outstanding Engineering Impact Award",issuer:"ScaleTech Solutions",date:"2023",description:"Awarded for architecting sub-20ms collaboration protocol."}],publications:[{id:"pub_1",title:"High-Throughput Offline-First Web Applications with CRDTs",publisher:"ACM Digital Library",date:"2023",link:"https://doi.org/10.1145/example"}],languages:[{id:"lang_1",language:"English",proficiency:"Native / Bilingual"},{id:"lang_2",language:"Mandarin Chinese",proficiency:"Professional Working"}],interests:["Distributed Computing","Open Source Tooling","Rock Climbing","Triathlons"],volunteer:[{id:"vol_1",role:"Mentor & Code Instructor",organization:"Code for Youth Initiative",period:"2021 – Present",highlights:["Taught foundational web development to 40+ high school students."]}],organizations:[{id:"org_1",role:"Active Contributor",name:"Open Source Software Collective",period:"2020 – Present"}],references:[{id:"ref_1",name:"Available Upon Request",title:"",company:"",contact:""}],customSections:[{id:"custom_opensource",title:"Open Source Contributions",style:"standard",items:[{id:"item_1",title:"React Core & Ecosystem",subtitle:"Contributor",date:"2021 – Present",description:"Contributed performance fixes and TypeScript definitions to open source developer tools with over 2M monthly downloads.",link:"https://github.com/facebook/react",bullets:["Resolved critical hydration edge cases.","Improved memory consumption by 15%."]}]}],sectionOrder:[...u],design:y.getDefaultDesign()}}static renderTemplate(t,e="tmpl_modern_pro",o){const i={...this.getDefaultDesign(),...t.design||{},...o||{}},l=h.find(n=>n.id===e)?.layout||"single-column";return l==="two-column"?this.renderTwoColumnTemplate(t,i,e):l==="technical"?this.renderTechnicalTemplate(t,i,e):l==="academic"?this.renderAcademicTemplate(t,i,e):l==="executive"?this.renderExecutiveTemplate(t,i,e):l==="compact"?this.renderCompactTemplate(t,i,e):l==="creative"?this.renderCreativeTemplate(t,i,e):this.renderSingleColumnTemplate(t,i,e)}static formatLink(t,e){if(!t)return"";const o=t.startsWith("http://")||t.startsWith("https://")||t.startsWith("mailto:")||t.startsWith("tel:")?t:`https://${t}`,i=e||t.replace(/^https?:\/\//,"").replace(/\/$/,"");return`<a href="${o}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; text-underline-offset: 2px;">${i}</a>`}static renderHeader(t,e){const{colors:o,headerLayout:i,nameSize:c,bodySize:l,metadataSize:n}=e,m=t.photo,p=m&&m.url&&m.style!=="none";let r="0";m?.style==="circle"&&(r="50%"),m?.style==="rounded"&&(r="12px");const a=m?.size==="lg"?84:m?.size==="sm"?52:68,s=p?`<img src="${m.url}" alt="${t.name}" style="width: ${a}px; height: ${a}px; border-radius: ${r}; object-fit: cover; border: 2px solid ${o.border}; shrink: 0;" />`:"",d=[];t.location&&d.push(`<span>📍 ${t.location}</span>`),t.email&&d.push(`<span>✉️ ${this.formatLink(`mailto:${t.email}`,t.email)}</span>`),t.phone&&d.push(`<span>📞 ${this.formatLink(`tel:${t.phone}`,t.phone)}</span>`),t.website&&d.push(`<span>🌐 ${this.formatLink(t.website)}</span>`),t.linkedin&&d.push(`<span>💼 ${this.formatLink(t.linkedin,t.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//,"linkedin/"))}</span>`),t.github&&d.push(`<span>🐙 ${this.formatLink(t.github,t.github.replace(/^https?:\/\/(www\.)?github\.com\//,"github/"))}</span>`),t.portfolio&&d.push(`<span>✨ ${this.formatLink(t.portfolio,"Portfolio")}</span>`),t.customLinks&&t.customLinks.length>0&&t.customLinks.forEach(g=>{g.url&&d.push(`<span>🔗 ${this.formatLink(g.url,g.label||g.url)}</span>`)});const f=`<div style="font-size: ${n}px; color: ${o.muted}; display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 6px; line-height: 1.4;">${d.join(" • ")}</div>`;return i==="centered"?`
        <div style="text-align: center; border-bottom: 2px solid ${o.primary}; padding-bottom: 14px; margin-bottom: ${e.spacing.sectionGap}px;">
          ${p?`<div style="display: flex; justify-content: center; margin-bottom: 8px;">${s}</div>`:""}
          <h1 style="font-size: ${c}px; font-weight: 800; color: ${o.heading}; margin: 0 0 4px 0; letter-spacing: -0.02em;">${t.name}</h1>
          <p style="font-size: ${l*1.15}px; font-weight: 600; color: ${o.primary}; margin: 0 0 6px 0;">${t.title}</p>
          <div style="font-size: ${n}px; color: ${o.muted}; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 12px; line-height: 1.4;">
            ${d.join(" • ")}
          </div>
        </div>
      `:i==="split"||i==="executive"?`
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${o.primary}; padding-bottom: 14px; margin-bottom: ${e.spacing.sectionGap}px; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            ${s}
            <div>
              <h1 style="font-size: ${c}px; font-weight: 800; color: ${o.heading}; margin: 0 0 4px 0; letter-spacing: -0.02em;">${t.name}</h1>
              <p style="font-size: ${l*1.15}px; font-weight: 600; color: ${o.primary}; margin: 0;">${t.title}</p>
            </div>
          </div>
          <div style="text-align: right; font-size: ${n}px; color: ${o.muted}; line-height: 1.5; max-width: 45%;">
            ${d.join("<br />")}
          </div>
        </div>
      `:i==="minimal"?`
        <div style="border-bottom: 1px solid ${o.border}; padding-bottom: 10px; margin-bottom: ${e.spacing.sectionGap}px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <h1 style="font-size: ${c*.9}px; font-weight: 700; color: ${o.heading}; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">${t.name}</h1>
            <span style="font-size: ${l}px; font-weight: 500; color: ${o.primary};">${t.title}</span>
          </div>
          <div style="font-size: ${n}px; color: ${o.muted}; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px 10px;">
            ${d.join(" | ")}
          </div>
        </div>
      `:i==="compact"?`
        <div style="border-bottom: 1.5px solid ${o.primary}; padding-bottom: 8px; margin-bottom: ${e.spacing.sectionGap*.75}px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: ${c*.85}px; font-weight: 800; color: ${o.heading}; margin: 0;">${t.name} — <span style="font-size: ${l}px; font-weight: 600; color: ${o.primary};">${t.title}</span></h1>
            <div style="font-size: ${n*.95}px; color: ${o.muted}; margin-top: 2px;">
              ${d.join(" • ")}
            </div>
          </div>
          ${s}
        </div>
      `:`
      <div style="border-bottom: 2px solid ${o.primary}; padding-bottom: 12px; margin-bottom: ${e.spacing.sectionGap}px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: ${c}px; font-weight: 800; color: ${o.heading}; margin: 0 0 4px 0; letter-spacing: -0.02em;">${t.name}</h1>
          <p style="font-size: ${l*1.15}px; font-weight: 600; color: ${o.primary}; margin: 0;">${t.title}</p>
          ${f}
        </div>
        ${s}
      </div>
    `}static renderSectionHeading(t,e){const{colors:o,headingSize:i,headingStyle:c}=e;return c==="banner"?`
        <h2 style="font-size: ${i}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background-color: ${o.primary}; color: #ffffff; padding: 4px 8px; border-radius: 4px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
          ${t}
        </h2>
      `:c==="left-border"?`
        <h2 style="font-size: ${i}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${o.heading}; border-left: 3.5px solid ${o.primary}; padding-left: 8px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
          ${t}
        </h2>
      `:c==="minimal-uppercase"?`
        <h2 style="font-size: ${i}px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: ${o.primary}; margin: 0 0 6px 0; page-break-after: avoid; break-after: avoid;">
          ${t}
        </h2>
      `:c==="bold-divider"?`
        <div style="display: flex; align-items: center; gap: 8px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
          <h2 style="font-size: ${i}px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${o.heading}; margin: 0; shrink: 0;">${t}</h2>
          <div style="flex: 1; height: 1.5px; background-color: ${o.primary};"></div>
        </div>
      `:`
      <h2 style="font-size: ${i}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${o.heading}; border-bottom: 1.5px solid ${o.border}; padding-bottom: 3px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
        ${t}
      </h2>
    `}static renderBullets(t,e){if(!t||t.length===0)return"";const{colors:o,bodySize:i,bulletStyle:c}=e;let l="disc";return c==="dash"&&(l="square"),c==="minimal"&&(l="none"),`
      <ul style="margin: 4px 0 0 0; padding-left: ${c==="minimal"?"0":"16px"}; font-size: ${i}px; color: ${o.body}; line-height: ${e.spacing.lineHeight}; list-style-type: ${l};">
        ${t.map(n=>`<li style="margin-bottom: ${e.spacing.paragraphGap}px;">${n}</li>`).join("")}
      </ul>
    `}static getPaddingCss(t){const e=t.pageSettings;return e?`${e.marginTop}mm ${e.marginRight}mm ${e.marginBottom}mm ${e.marginLeft}mm`:`${t.spacing.pageMargin}px`}static renderSingleColumnTemplate(t,e,o){const{colors:i,fontFamily:c}=e,l=t.personalInfo,n=t.sectionOrder||u,m=this.getPaddingCss(e);let p=`
<div class="resume-document" style="font-family: '${c}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: ${e.spacing.lineHeight}; color: ${i.body}; background-color: ${i.background}; padding: ${m}; max-width: 100%; box-sizing: border-box;">
  ${this.renderHeader(l,e)}
`;return n.forEach(r=>{if(r.visible){if(r.type==="summary"&&t.summary)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Professional Summary",e)}
            <p style="font-size: ${e.bodySize}px; color: ${i.body}; margin: 0; line-height: ${e.spacing.lineHeight};">${t.summary}</p>
          </div>
        `;else if(r.type==="objective"&&t.objective)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Career Objective",e)}
            <p style="font-size: ${e.bodySize}px; color: ${i.body}; margin: 0; line-height: ${e.spacing.lineHeight};">${t.objective}</p>
          </div>
        `;else if(r.type==="skills"&&t.skillCategories&&t.skillCategories.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Skills & Competencies",e)}
            <div style="font-size: ${e.bodySize}px; color: ${i.body};">
              ${t.skillCategories.map(a=>`
                <div style="margin-bottom: ${e.spacing.paragraphGap}px;">
                  <strong style="color: ${i.heading};">${a.category}:</strong> ${a.skills.join(", ")}
                </div>
              `).join("")}
            </div>
          </div>
        `;else if(r.type==="experience"&&t.experience&&t.experience.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px;">
            ${this.renderSectionHeading(r.title||"Work Experience",e)}
            ${t.experience.map(a=>`
              <div style="margin-bottom: ${e.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                  <h3 style="font-size: ${e.bodySize*1.05}px; font-weight: 700; color: ${i.heading}; margin: 0;">
                    ${a.title} — <span style="font-weight: 600; color: ${i.primary};">${a.company}</span>
                  </h3>
                  <span style="font-size: ${e.metadataSize}px; color: ${i.muted}; font-weight: 500;">
                    ${a.period} ${a.location?`| ${a.location}`:""}
                  </span>
                </div>
                ${this.renderBullets(a.highlights,e)}
              </div>
            `).join("")}
          </div>
        `;else if(r.type==="projects"&&t.projects&&t.projects.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px;">
            ${this.renderSectionHeading(r.title||"Key Projects",e)}
            ${t.projects.map(a=>`
              <div style="margin-bottom: ${e.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                  <h3 style="font-size: ${e.bodySize*1.02}px; font-weight: 700; color: ${i.heading}; margin: 0;">
                    ${a.name} ${a.techStack&&a.techStack.length>0?`<span style="font-size: ${e.metadataSize}px; font-weight: normal; color: ${i.muted};">(${a.techStack.join(", ")})</span>`:""}
                  </h3>
                  <div style="font-size: ${e.metadataSize}px; color: ${i.primary};">
                    ${a.liveDemoUrl?this.formatLink(a.liveDemoUrl,"Live Demo"):a.link?this.formatLink(a.link,"View Project"):""}
                  </div>
                </div>
                ${a.role?`<div style="font-size: ${e.metadataSize}px; color: ${i.muted}; margin-top: 1px;">Role: ${a.role}</div>`:""}
                ${this.renderBullets(a.highlights,e)}
              </div>
            `).join("")}
          </div>
        `;else if(r.type==="education"&&t.education&&t.education.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Education",e)}
            ${t.education.map(a=>`
              <div style="margin-bottom: ${e.spacing.entryGap*.75}px; page-break-inside: avoid; break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: ${e.bodySize}px;">
                  <div>
                    <strong style="color: ${i.heading};">${a.degree}</strong> — ${a.school}${a.location?`, ${a.location}`:""}
                    ${a.details?`<div style="color: ${i.muted}; font-size: ${e.metadataSize}px; margin-top: 2px;">${a.details}</div>`:""}
                  </div>
                  <span style="color: ${i.muted}; font-size: ${e.metadataSize}px; font-weight: 500;">${a.year}</span>
                </div>
              </div>
            `).join("")}
          </div>
        `;else if(r.type==="certifications"&&t.certifications&&t.certifications.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Certifications & Credentials",e)}
            <div style="font-size: ${e.bodySize}px; color: ${i.body};">
              ${t.certifications.map(a=>`
                <div style="margin-bottom: 4px; display: flex; justify-content: space-between;">
                  <span><strong>${a.name}</strong> — ${a.issuer}</span>
                  <span style="color: ${i.muted}; font-size: ${e.metadataSize}px;">${a.year}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `;else if(r.type==="achievements"&&t.achievements&&t.achievements.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Key Achievements & Honors",e)}
            ${this.renderBullets(t.achievements,e)}
          </div>
        `;else if(r.type==="awards"&&t.awards&&t.awards.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Honors & Awards",e)}
            ${t.awards.map(a=>`
              <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: ${e.bodySize}px;">
                  <strong>${a.title}</strong> — <span style="color: ${i.muted};">${a.issuer}</span>
                  <span style="color: ${i.muted}; font-size: ${e.metadataSize}px;">${a.date}</span>
                </div>
                ${a.description?`<p style="font-size: ${e.metadataSize}px; color: ${i.muted}; margin: 2px 0 0 0;">${a.description}</p>`:""}
              </div>
            `).join("")}
          </div>
        `;else if(r.type==="publications"&&t.publications&&t.publications.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Publications",e)}
            ${t.publications.map(a=>`
              <div style="margin-bottom: 6px; font-size: ${e.bodySize}px;">
                <strong>${a.link?this.formatLink(a.link,a.title):a.title}</strong> — <span style="color: ${i.muted};">${a.publisher} (${a.date})</span>
              </div>
            `).join("")}
          </div>
        `;else if(r.type==="languages"&&t.languages&&t.languages.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Languages",e)}
            <div style="font-size: ${e.bodySize}px; display: flex; flex-wrap: wrap; gap: 8px 16px;">
              ${t.languages.map(a=>`<span><strong>${a.language}:</strong> <span style="color: ${i.muted};">${a.proficiency}</span></span>`).join("")}
            </div>
          </div>
        `;else if(r.type==="volunteer"&&t.volunteer&&t.volunteer.length>0)p+=`
          <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(r.title||"Volunteer Experience",e)}
            ${t.volunteer.map(a=>`
              <div style="margin-bottom: ${e.spacing.entryGap*.75}px;">
                <div style="display: flex; justify-content: space-between; font-size: ${e.bodySize}px;">
                  <strong>${a.role}</strong> — <span style="color: ${i.primary};">${a.organization}</span>
                  <span style="color: ${i.muted}; font-size: ${e.metadataSize}px;">${a.period}</span>
                </div>
                ${this.renderBullets(a.highlights,e)}
              </div>
            `).join("")}
          </div>
        `;else if(r.type==="custom"&&t.customSections){const a=t.customSections.find(s=>s.id===r.customSectionId||s.title===r.title);a&&a.items&&a.items.length>0&&(p+=`
            <div style="margin-bottom: ${e.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
              ${this.renderSectionHeading(a.title,e)}
              ${a.items.map(s=>`
                <div style="margin-bottom: ${e.spacing.entryGap*.75}px; page-break-inside: avoid; break-inside: avoid;">
                  <div style="display: flex; justify-content: space-between; font-size: ${e.bodySize}px;">
                    <strong>${s.link?this.formatLink(s.link,s.title):s.title}</strong>
                    ${s.date?`<span style="color: ${i.muted}; font-size: ${e.metadataSize}px;">${s.date}</span>`:""}
                  </div>
                  ${s.subtitle?`<div style="font-size: ${e.metadataSize}px; color: ${i.primary}; font-weight: 500;">${s.subtitle}</div>`:""}
                  ${s.description?`<p style="font-size: ${e.bodySize*.95}px; color: ${i.body}; margin: 2px 0 0 0;">${s.description}</p>`:""}
                  ${s.bullets&&s.bullets.length>0?this.renderBullets(s.bullets,e):""}
                </div>
              `).join("")}
            </div>
          `)}}}),p+="</div>",p}static renderTwoColumnTemplate(t,e,o){const{colors:i,fontFamily:c}=e,l=t.personalInfo;return`
<div class="resume-document" style="font-family: '${c}', -apple-system, sans-serif; line-height: ${e.spacing.lineHeight}; color: ${i.body}; background-color: ${i.background}; padding: ${this.getPaddingCss(e)}; box-sizing: border-box;">
  ${this.renderHeader(l,e)}
  <div style="display: grid; grid-template-columns: 32% 64%; gap: 4%;">
    <!-- Left Column: Contact, Skills, Education, Certifications -->
    <div>
      ${t.summary?`
        <div style="margin-bottom: ${e.spacing.sectionGap}px;">
          ${this.renderSectionHeading("About Me",e)}
          <p style="font-size: ${e.bodySize*.95}px; line-height: 1.5; color: ${i.body}; margin: 0;">${t.summary}</p>
        </div>
      `:""}

      ${t.skillCategories&&t.skillCategories.length>0?`
        <div style="margin-bottom: ${e.spacing.sectionGap}px;">
          ${this.renderSectionHeading("Skills",e)}
          ${t.skillCategories.map(n=>`
            <div style="margin-bottom: 8px;">
              <strong style="font-size: ${e.bodySize*.9}px; color: ${i.heading}; display: block; margin-bottom: 2px;">${n.category}</strong>
              <div style="font-size: ${e.metadataSize}px; color: ${i.muted};">${n.skills.join(", ")}</div>
            </div>
          `).join("")}
        </div>
      `:""}

      ${t.education&&t.education.length>0?`
        <div style="margin-bottom: ${e.spacing.sectionGap}px;">
          ${this.renderSectionHeading("Education",e)}
          ${t.education.map(n=>`
            <div style="margin-bottom: 8px;">
              <strong style="font-size: ${e.bodySize*.95}px; color: ${i.heading}; display: block;">${n.degree}</strong>
              <span style="font-size: ${e.metadataSize}px; color: ${i.primary}; font-weight: 500;">${n.school}</span>
              <div style="font-size: ${e.metadataSize*.9}px; color: ${i.muted};">${n.year}</div>
            </div>
          `).join("")}
        </div>
      `:""}

      ${t.languages&&t.languages.length>0?`
        <div style="margin-bottom: ${e.spacing.sectionGap}px;">
          ${this.renderSectionHeading("Languages",e)}
          ${t.languages.map(n=>`<div style="font-size: ${e.metadataSize}px; margin-bottom: 2px;"><strong>${n.language}:</strong> ${n.proficiency}</div>`).join("")}
        </div>
      `:""}
    </div>

    <!-- Right Column: Experience, Projects, Custom Sections -->
    <div>
      ${t.experience&&t.experience.length>0?`
        <div style="margin-bottom: ${e.spacing.sectionGap}px;">
          ${this.renderSectionHeading("Experience",e)}
          ${t.experience.map(n=>`
            <div style="margin-bottom: ${e.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: ${e.bodySize*1.05}px; font-weight: 700; color: ${i.heading}; margin: 0;">${n.title}</h3>
                <span style="font-size: ${e.metadataSize}px; color: ${i.muted};">${n.period}</span>
              </div>
              <div style="font-size: ${e.metadataSize}px; color: ${i.primary}; font-weight: 600; margin-bottom: 2px;">${n.company} — ${n.location}</div>
              ${this.renderBullets(n.highlights,e)}
            </div>
          `).join("")}
        </div>
      `:""}

      ${t.projects&&t.projects.length>0?`
        <div style="margin-bottom: ${e.spacing.sectionGap}px;">
          ${this.renderSectionHeading("Projects",e)}
          ${t.projects.map(n=>`
            <div style="margin-bottom: ${e.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: ${e.bodySize}px; font-weight: 700; color: ${i.heading}; margin: 0;">${n.name}</h3>
                ${n.link?`<span style="font-size: ${e.metadataSize}px;">${this.formatLink(n.link,"Link")}</span>`:""}
              </div>
              ${this.renderBullets(n.highlights,e)}
            </div>
          `).join("")}
        </div>
      `:""}
    </div>
  </div>
</div>
`}static renderTechnicalTemplate(t,e,o){return this.renderSingleColumnTemplate(t,{...e,headingStyle:"banner",bulletStyle:"dot"},o)}static renderAcademicTemplate(t,e,o){return this.renderSingleColumnTemplate(t,{...e,fontFamily:e.fontFamily||"Merriweather",headingStyle:"bold-divider"},o)}static renderExecutiveTemplate(t,e,o){return this.renderSingleColumnTemplate(t,{...e,headerLayout:"executive",headingStyle:"left-border"},o)}static renderCompactTemplate(t,e,o){return this.renderSingleColumnTemplate(t,{...e,headerLayout:"compact",spacing:{pageMargin:20,sectionGap:10,entryGap:8,paragraphGap:2,lineHeight:1.35},nameSize:22,bodySize:10,metadataSize:9},o)}static renderCreativeTemplate(t,e,o){return this.renderSingleColumnTemplate(t,{...e,headingStyle:"banner",headerLayout:"centered"},o)}}export{$ as D,y as R,h as a,b,u as c};
