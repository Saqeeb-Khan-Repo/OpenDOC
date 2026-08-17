import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  item: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  h1?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  faqs?: FAQItem[];
  softwareAppSchema?: boolean;
}

const SITE_URL = 'https://docflow.app';
const SITE_NAME = 'DocFlow';
const DEFAULT_OG_IMAGE = 'https://docflow.app/docflow-og.png';

export function SEOHead({
  title,
  description,
  canonicalPath,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  breadcrumbs,
  faqs,
  softwareAppSchema = false,
}: SEOHeadProps) {
  const canonicalUrl = `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or create meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('description', description);
    setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Canonical Link Tag
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 4. Open Graph Meta Tags
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:url', canonicalUrl, true);
    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:type', ogType, true);
    setMetaTag('og:image', ogImage, true);

    // 5. Twitter Meta Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', title);
    setMetaTag('twitter:description', description);
    setMetaTag('twitter:image', ogImage);

    // 6. JSON-LD Structured Data Management
    const scriptId = 'docflow-structured-data';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemas: any[] = [];

    // WebSite Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'DocFlow',
      alternateName: 'DocFlow Editor',
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    // Organization Schema
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'DocFlow',
      url: SITE_URL,
      logo: `${SITE_URL}/docflow-icon.svg`,
      description: 'All-in-One Document, Presentation, Flowchart, Resume, and PDF Workspace.',
    });

    // SoftwareApplication / WebApplication Schema
    if (softwareAppSchema || canonicalPath === '/' || canonicalPath === '/document-editor' || canonicalPath === '/presentation-maker' || canonicalPath === '/flowchart-maker' || canonicalPath === '/resume-builder') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'DocFlow',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All (Web Browser)',
        url: canonicalUrl,
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Online Paginated Document Editor with A4 Page Breaks',
          '16:9 Slide Presentation Maker with Speaker Notes',
          'Interactive Flowchart Maker with 4-Directional Smart Connectors',
          'ATS-Friendly Resume Builder',
          'In-Browser PDF Editor and Merger',
          'Multi-Format File Conversion',
        ],
      });
    }

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.item.startsWith('http') ? b.item : `${SITE_URL}${b.item}`,
        })),
      });
    }

    // FAQPage Schema
    if (faqs && faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      });
    }

    scriptTag.textContent = JSON.stringify(schemas);

    return () => {
      // Cleanup on unmount if needed
    };
  }, [title, description, canonicalUrl, ogType, ogImage, noindex, breadcrumbs, faqs, softwareAppSchema]);

  return null;
}
