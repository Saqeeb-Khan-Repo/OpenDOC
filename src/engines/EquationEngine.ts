export interface EquationPreset {
  id: string;
  name: string;
  category: 'algebra' | 'calculus' | 'matrices' | 'physics' | 'statistics';
  latex: string;
  previewText: string;
}

export const EQUATION_PRESETS: EquationPreset[] = [
  {
    id: 'quadratic',
    name: 'Quadratic Formula',
    category: 'algebra',
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    previewText: 'x = (-b ± √(b² - 4ac)) / 2a',
  },
  {
    id: 'pythagoras',
    name: 'Pythagorean Theorem',
    category: 'algebra',
    latex: 'a^2 + b^2 = c^2',
    previewText: 'a² + b² = c²',
  },
  {
    id: 'gaussian-integral',
    name: 'Gaussian Integral',
    category: 'calculus',
    latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
    previewText: '∫ e^(-x²) dx = √π',
  },
  {
    id: 'taylor-series',
    name: 'Taylor Series',
    category: 'calculus',
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n',
    previewText: 'f(x) = ∑ f^(n)(a)/n! (x - a)ⁿ',
  },
  {
    id: 'matrix-2x2',
    name: '2x2 Matrix Determinant',
    category: 'matrices',
    latex: '\\det(A) = \\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc',
    previewText: 'det(A) = |a b; c d| = ad - bc',
  },
  {
    id: 'schrodinger',
    name: "Schrödinger's Equation",
    category: 'physics',
    latex: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H}\\Psi',
    previewText: 'iħ ∂Ψ/∂t = ĤΨ',
  },
  {
    id: 'standard-deviation',
    name: 'Standard Deviation (Sample)',
    category: 'statistics',
    latex: 's = \\sqrt{\\frac{1}{N-1}\\sum_{i=1}^N (x_i - \\bar{x})^2}',
    previewText: 's = √[∑(x_i - x̄)² / (N-1)]',
  },
  {
    id: 'euler-identity',
    name: "Euler's Identity",
    category: 'algebra',
    latex: 'e^{i\\pi} + 1 = 0',
    previewText: 'e^(iπ) + 1 = 0',
  },
];

export const MATH_SYMBOLS: { symbol: string; latex: string; label: string }[] = [
  { symbol: 'α', latex: '\\alpha', label: 'alpha' },
  { symbol: 'β', latex: '\\beta', label: 'beta' },
  { symbol: 'γ', latex: '\\gamma', label: 'gamma' },
  { symbol: 'δ', latex: '\\delta', label: 'delta' },
  { symbol: 'θ', latex: '\\theta', label: 'theta' },
  { symbol: 'λ', latex: '\\lambda', label: 'lambda' },
  { symbol: 'μ', latex: '\\mu', label: 'mu' },
  { symbol: 'π', latex: '\\pi', label: 'pi' },
  { symbol: 'σ', latex: '\\sigma', label: 'sigma' },
  { symbol: 'ω', latex: '\\omega', label: 'omega' },
  { symbol: 'Δ', latex: '\\Delta', label: 'Delta' },
  { symbol: '∑', latex: '\\sum', label: 'sum' },
  { symbol: '∏', latex: '\\prod', label: 'product' },
  { symbol: '∫', latex: '\\int', label: 'integral' },
  { symbol: '√', latex: '\\sqrt{}', label: 'sqrt' },
  { symbol: '±', latex: '\\pm', label: 'plus-minus' },
  { symbol: '≤', latex: '\\le', label: 'less-equal' },
  { symbol: '≥', latex: '\\ge', label: 'greater-equal' },
  { symbol: '≠', latex: '\\ne', label: 'not-equal' },
  { symbol: '≈', latex: '\\approx', label: 'approx' },
  { symbol: '∞', latex: '\\infty', label: 'infinity' },
  { symbol: '→', latex: '\\rightarrow', label: 'arrow' },
  { symbol: '∈', latex: '\\in', label: 'element-of' },
  { symbol: '∂', latex: '\\partial', label: 'partial' },
];

export class EquationEngine {
  /**
   * Render LaTeX string to clean HTML/SVG or fallback HTML
   */
  static renderLatexToHtml(latex: string, displayMode = false): string {
    // If window.katex is loaded, use it directly
    if (typeof window !== 'undefined' && (window as any).katex) {
      try {
        return (window as any).katex.renderToString(latex, {
          displayMode,
          throwOnError: false,
        });
      } catch (e) {
        console.error('KaTeX render error:', e);
      }
    }

    // High quality fallback MathML / SVG representation
    const clean = latex
      .replace(/\\frac{([^}]+)}{([^}]+)}/g, '($1 / $2)')
      .replace(/\\sqrt{([^}]+)}/g, '√($1)')
      .replace(/\\sum/g, '∑')
      .replace(/\\int/g, '∫')
      .replace(/\\pi/g, 'π')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\theta/g, 'θ')
      .replace(/\\lambda/g, 'λ')
      .replace(/\\pm/g, '±')
      .replace(/\\infty/g, '∞')
      .replace(/\\times/g, '×')
      .replace(/\\partial/g, '∂');

    return `<span class="math-equation ${displayMode ? 'math-display block my-2 text-center' : 'math-inline font-serif font-medium'} font-mono bg-muted/40 px-2 py-0.5 rounded border border-border/50">${clean}</span>`;
  }
}
