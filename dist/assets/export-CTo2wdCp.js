import{ah as l}from"./index-B9kbQMc3.js";function n(e,t,o){const a=new Blob([e],{type:o}),i=URL.createObjectURL(a),r=document.createElement("a");r.href=i,r.download=t,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(i)}function c(e,t){const o=l(t);n(o,`${e}.txt`,"text/plain")}function g(e,t){const o=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${e}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1a1a1a; }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; margin-top: 1.5em; }
    p { margin: 1em 0; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f5f5f5; font-weight: 600; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    pre { background: #f5f5f5; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 4px solid #2563eb; margin: 0; padding-left: 1em; color: #555; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    a { color: #2563eb; }
    ul, ol { padding-left: 1.5em; }
  </style>
</head>
<body>
  <h1>${e}</h1>
  ${t}
</body>
</html>`;n(o,`${e}.html`,"text/html")}function m(e,t){let o=t.replace(/<h1[^>]*>(.*?)<\/h1>/gi,`# $1

`).replace(/<h2[^>]*>(.*?)<\/h2>/gi,`## $1

`).replace(/<h3[^>]*>(.*?)<\/h3>/gi,`### $1

`).replace(/<h4[^>]*>(.*?)<\/h4>/gi,`#### $1

`).replace(/<h5[^>]*>(.*?)<\/h5>/gi,`##### $1

`).replace(/<h6[^>]*>(.*?)<\/h6>/gi,`###### $1

`).replace(/<strong[^>]*>(.*?)<\/strong>/gi,"**$1**").replace(/<b[^>]*>(.*?)<\/b>/gi,"**$1**").replace(/<em[^>]*>(.*?)<\/em>/gi,"_$1_").replace(/<i[^>]*>(.*?)<\/i>/gi,"_$1_").replace(/<u[^>]*>(.*?)<\/u>/gi,"_$1_").replace(/<s[^>]*>(.*?)<\/s>/gi,"~~$1~~").replace(/<code[^>]*>(.*?)<\/code>/gi,"`$1`").replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,"[$2]($1)").replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/gi,"![$2]($1)").replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis,(i,r)=>r.split(`
`).map(d=>`> ${d}`).join(`
`)+`

`).replace(/<li[^>]*>(.*?)<\/li>/gi,`- $1
`).replace(/<ul[^>]*>(.*?)<\/ul>/gis,`$1
`).replace(/<ol[^>]*>(.*?)<\/ol>/gis,`$1
`).replace(/<p[^>]*>(.*?)<\/p>/gi,`$1

`).replace(/<br\s*\/?>/gi,`
`).replace(/<hr\s*\/?>/gi,`
---

`).replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/\n{3,}/g,`

`).trim();const a=`# ${e}

${o}`;n(a,`${e}.md`,"text/markdown")}function h(e,t){const o=window.open("","_blank","width=900,height=700");o&&(o.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${e}</title>
  <style>
    @page { margin: 1in; }
    * { box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #111;
      max-width: 100%;
    }
    h1 { font-size: 24pt; margin: 0 0 0.5em; border-bottom: 2px solid #333; padding-bottom: 0.25em; }
    h2 { font-size: 18pt; margin: 1.2em 0 0.4em; }
    h3 { font-size: 14pt; margin: 1em 0 0.3em; }
    h4, h5, h6 { font-size: 12pt; margin: 0.8em 0 0.2em; }
    p  { margin: 0.6em 0; }
    a  { color: #1d4ed8; text-decoration: underline; }
    blockquote { border-left: 4px solid #94a3b8; margin: 1em 0; padding: 0.5em 1em; color: #555; font-style: italic; }
    code { background: #f3f4f6; padding: 2px 5px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 10pt; }
    pre  { background: #f3f4f6; padding: 1em; border-radius: 6px; overflow-x: auto; font-size: 10pt; }
    pre code { background: none; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    td, th { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    li { margin: 0.2em 0; }
    img { max-width: 100%; height: auto; border-radius: 4px; page-break-inside: avoid; }
    hr  { border: none; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
    [data-border-box] { border: 2px solid #94a3b8; border-radius: 6px; padding: 12px 16px; margin: 8px 0; }
    input[type="checkbox"] { margin-right: 6px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1>${e}</h1>
  ${t}
  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`),o.document.close())}export{c as a,g as b,h as c,m as e};
