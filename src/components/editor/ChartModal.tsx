import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { ChartData } from '@/engines/types';

interface ChartModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (svgHtml: string, chartData: ChartData) => void;
}

export function ChartModal({ open, onClose, onInsert }: ChartModalProps) {
  const [chartType, setChartType] = useState<ChartData['type']>('bar');
  const [title, setTitle] = useState('Quarterly Performance & Metrics');
  const [labels, setLabels] = useState(['Q1', 'Q2', 'Q3', 'Q4']);
  const [values, setValues] = useState([45, 78, 62, 95]);

  const handleAddDataPoint = () => {
    setLabels(prev => [...prev, `Item ${prev.length + 1}`]);
    setValues(prev => [...prev, 50]);
  };

  const handleRemoveDataPoint = (idx: number) => {
    if (labels.length <= 2) return;
    setLabels(prev => prev.filter((_, i) => i !== idx));
    setValues(prev => prev.filter((_, i) => i !== idx));
  };

  const handleValueChange = (idx: number, val: number) => {
    const next = [...values];
    next[idx] = val || 0;
    setValues(next);
  };

  const handleLabelChange = (idx: number, label: string) => {
    const next = [...labels];
    next[idx] = label;
    setLabels(next);
  };

  // Generate responsive SVG Chart representation
  const renderChartSvg = () => {
    const maxVal = Math.max(...values, 100);
    const height = 260;
    const width = 480;
    const padding = 40;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'];

    if (chartType === 'bar') {
      const barWidth = Math.min(48, (chartWidth / labels.length) * 0.6);
      const gap = chartWidth / labels.length;

      return `
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <!-- Grid Lines -->
          <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#e2e8f0" stroke-dasharray="4" />
          <line x1="${padding}" y1="${padding + chartHeight / 2}" x2="${width - padding}" y2="${padding + chartHeight / 2}" stroke="#e2e8f0" stroke-dasharray="4" />
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1.5" />

          ${values.map((v, i) => {
            const barH = (v / maxVal) * chartHeight;
            const x = padding + i * gap + (gap - barWidth) / 2;
            const y = height - padding - barH;
            const color = colors[i % colors.length];

            return `
              <g>
                <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${color}" />
                <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="#475569" font-weight="bold">${v}</text>
                <text x="${x + barWidth / 2}" y="${height - padding + 18}" text-anchor="middle" font-size="12" fill="#64748b">${labels[i]}</text>
              </g>
            `;
          }).join('')}
        </svg>
      `;
    }

    if (chartType === 'line' || chartType === 'area') {
      const step = chartWidth / (labels.length - 1 || 1);
      const points = values.map((v, i) => {
        const x = padding + i * step;
        const y = height - padding - (v / maxVal) * chartHeight;
        return { x, y, v, label: labels[i] };
      });

      const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
      const areaPath = `M ${points[0].x} ${height - padding} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - padding} Z`;

      return `
        <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1.5" />
          ${chartType === 'area' ? `<path d="${areaPath}" fill="#3B82F622" />` : ''}
          <polyline points="${polylinePoints}" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round" />
          ${points.map(p => `
            <g>
              <circle cx="${p.x}" cy="${p.y}" r="5" fill="#FFFFFF" stroke="#2563EB" stroke-width="2.5" />
              <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="11" fill="#1e293b" font-weight="bold">${p.v}</text>
              <text x="${p.x}" y="${height - padding + 18}" text-anchor="middle" font-size="12" fill="#64748b">${p.label}</text>
            </g>
          `).join('')}
        </svg>
      `;
    }

    // Pie chart
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let accumulated = 0;
    const cx = width / 2;
    const cy = height / 2;
    const r = 80;

    return `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        ${values.map((v, i) => {
          const startAngle = (accumulated / total) * 2 * Math.PI - Math.PI / 2;
          accumulated += v;
          const endAngle = (accumulated / total) * 2 * Math.PI - Math.PI / 2;

          const x1 = cx + r * Math.cos(startAngle);
          const y1 = cy + r * Math.sin(startAngle);
          const x2 = cx + r * Math.cos(endAngle);
          const y2 = cy + r * Math.sin(endAngle);

          const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
          const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          const color = colors[i % colors.length];

          return `<path d="${path}" fill="${color}" stroke="#FFFFFF" stroke-width="2" />`;
        }).join('')}
      </svg>
    `;
  };

  const handleInsert = () => {
    const chartDataObj: ChartData = {
      type: chartType,
      title,
      labels,
      datasets: [{ label: 'Series 1', data: values }],
    };

    const container = `
      <div class="chart-embed my-6 p-4 rounded-xl border border-border bg-card flex flex-col items-center shadow-sm">
        <h4 style="text-align: center; margin: 0 0 12px 0; font-size: 16px; font-weight: bold; color: #1e3a8a;">${title}</h4>
        ${renderChartSvg()}
        <p class="text-xs text-muted-foreground text-center mt-2 font-medium">Figure: Comparative Data Analysis</p>
      </div>
    `;

    onInsert(container, chartDataObj);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Chart & Data Visualizer
          </DialogTitle>
          <DialogDescription>
            Configure data series, labels, and chart types to generate high-resolution visual charts.
          </DialogDescription>
        </DialogHeader>

        {/* Chart type bar */}
        <div className="flex gap-2 border-b border-border pb-3 pt-1">
          {(['bar', 'line', 'area', 'pie'] as const).map(t => (
            <Button
              key={t}
              variant={chartType === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType(t)}
              className="capitalize text-xs"
            >
              {t} Chart
            </Button>
          ))}
          <Button variant="secondary" size="sm" onClick={handleAddDataPoint} className="ml-auto text-xs gap-1">
            <Plus className="h-3.5 w-3.5" /> Add Data Point
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Chart preview */}
          <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col items-center justify-center">
            <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
            <div className="w-full" dangerouslySetInnerHTML={{ __html: renderChartSvg() }} />
          </div>

          {/* Data table inputs */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Chart Title</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-sm" />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Data Points & Categories</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {labels.map((lbl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={lbl}
                      onChange={e => handleLabelChange(idx, e.target.value)}
                      placeholder="Label"
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="number"
                      value={values[idx]}
                      onChange={e => handleValueChange(idx, parseFloat(e.target.value))}
                      placeholder="Value"
                      className="h-8 text-xs w-20"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveDataPoint(idx)}
                      disabled={labels.length <= 2}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 border-t border-border pt-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInsert} className="gap-1.5">
            <Plus className="h-4 w-4" /> Insert Chart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
