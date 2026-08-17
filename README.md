# OpenDoc Studio — Local-First AI Document, Presentation, Resume & Flowchart Workspace

> **Open-Source • 100% Client-Side • Local-First • Zero Authentication Required • Vercel-Ready**

OpenDoc Studio is a professional, privacy-first workspace combining a word processor, slide deck creator, resume builder, vector flowchart studio, and optical document scanner into a single unified web application.

---

## 🌟 Key Capabilities & Features

### 1. 📄 Document Studio & Word Processor
- **True Page Pagination**: Fixed A4 paper container sheets with automatic content flow, manual page breaks (`data-type="page-break"`), visible page gaps, and zero page overlap.
- **Canva-Style Text Toolbar**: Contextual formatting, font steppers (8 to 144+ pt), color swatches, line heights, letter spacing, alignments, and lists.
- **Academic & Professional Cover Pages**: VTU/University project report cover presets, guide/student details, and IEEE formatting.
- **Math Equations & KaTeX**: LaTeX mathematical equation renderer and inline editor.
- **Custom Page Borders**: 6 border presets (Academic Double, Modern Box, Certificate Gold, Ridge, Dashed, Dotted Frame) with customizable color, width, and scope.
- **Headers, Footers & Page Numbering**: Customizable header/footer text with Arabic, Roman, and Alphabetic formats.

### 2. 🪄 Presentation Creator
- **Interactive Slide Management**: Add slides, duplicate slides, delete slides, and reorder slide decks.
- **Modern Gradient Backgrounds**: 10+ professional linear gradients (*Blue → Purple*, *Dark Navy*, *Emerald Teal*, *Soft Pastel*) with customizable angle directions.
- **Slide Layout Presets**: Title, Title + Content, Two-Column, Statistics & Metrics, Architecture Grid, and Timeline.
- **Presenter Mode & Speaker Notes**: Dual-pane presenter view with live timer, slide navigation, and speaker notes.

### 3. 📑 5 ATS-Optimized Resume Templates & Lossless Switcher
- **Modern Professional**: Single-column ATS-friendly corporate resume.
- **Modern Two-Column**: Compact slate sidebar for contact info and technical skills with expansive experience column.
- **Software Engineer & Developer**: Terminal-inspired dark header, tech stack badges, GitHub project links, and quantifiable architectural metrics.
- **Graduate / Entry-Level Fresher**: Academic-focused layout highlighting GPA, capstone projects, internships, and hackathon honors.
- **Executive & Corporate Leadership**: Sophisticated serif typography emphasizing strategic management, board appointments, and P&L achievements.
- **Lossless Layout Switching**: Switch an active resume between any of the 5 templates instantly without losing content.

### 4. 🔀 Vector Flowchart & Diagram Studio
- **Interactive Nodes**: Start/End pills, Process rectangles, Decision diamonds, Database cylinders.
- **Drag-and-Drop Positioning**: Smooth canvas dragging, resizing, color customization, and node duplication.
- **SVG Connectors**: Dynamic bezier curves and orthogonal lines with custom branch labels (*Yes*, *No*, *Retry*).
- **8 Built-in Templates**: Login Authentication Flow, E-Commerce Checkout, SDLC Pipeline, Decision Trees, System Architecture, etc.
- **Auto-Layout**: 1-click Vertical and Horizontal flow alignment.

### 5. 🔍 Optical Document Scanner (OCR)
- **Image & Scan Processing**: Extract editable semantic HTML from JPG, JPEG, PNG, WebP, TIFF, and PDF scans.
- **4-Stage Visual Feedback**: Scanning -> Extracting Glyphs -> Detecting Layout -> Preparing Editable Document.
- **Preserved Typography**: Detects titles, headings, bullet lists, and tables, directly opening into the editor.

### 6. 📦 High-Fidelity Document Import & Multi-Format Export
- **Import Formats**: DOCX (unpacked via `JSZip`), PDF, RTF, Markdown, HTML, CSV, TXT.
- **Export Formats**: PDF (Print Dialog & PDF renderer), DOCX, PPTX, HTML, Markdown, Plain Text, Vector SVG, PNG.

### 7. ⌨️ Global Command Palette (`Ctrl+K`)
- Instant keyboard navigation to trigger AI tools, templates, export presets, find & replace (`Ctrl+H`), and mode switching.

---

## 🏛️ Local-First Architecture

```text
                               GitHub
                                 │
                                 ▼
                         Vercel Deployment
                                 │
                         ┌───────┴───────┐
                         ▼               ▼
                   React Frontend   Serverless Proxy
                         │          (Zero-Config)
                         ▼
                  IndexedDB Storage
                  (Local-First Persistence)
```

- **Zero Cloud Database**: All documents, presentations, resumes, and diagrams are stored in **IndexedDB** (`LocalStorageEngine`) in the user's browser.
- **Zero Authentication**: No login, sign-up, or user accounts are required.
- **Privacy-First**: No document contents or personal information are sent to third-party servers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/opendoc-studio.git
cd opendoc-studio

# Install dependencies
npm install

# Start local development server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🧪 Testing & Validation

```bash
# Run unit & engine test suite
npm test

# Build production bundle
npm run build
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
