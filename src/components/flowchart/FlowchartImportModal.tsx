import React, { useState, useMemo, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FlowchartTextParser, FlowParseResult
} from '@/engines/FlowchartTextParser';
import { DiagramData } from '@/engines/types';
import { FlowchartTheme } from '@/engines/DiagramEngine';
import {
  Sparkles, FileText, ArrowRight, CheckCircle2, AlertTriangle,
  Layers, Database, Cpu, User, GitBranch, RefreshCw, Upload,
  HelpCircle, Code2, Play
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface FlowchartImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportDiagram: (diagram: DiagramData, mode: 'replace' | 'add') => void;
  existingNodeCount: number;
  selectedTheme?: FlowchartTheme;
}

const FLOW_EXAMPLES: { label: string; tag: string; text: string }[] = [
  {
    label: 'Basic Web App',
    tag: 'Arrow Chain',
    text: `Client → API Gateway → Application Service → PostgreSQL Database`,
  },
  {
    label: 'Microservices Mesh',
    tag: 'Fanout',
    text: `Client → API Gateway
API Gateway → Auth Service
API Gateway → User Service
API Gateway → Order Service
Order Service → Payment Service
Order Service → PostgreSQL Database
Payment Service → Stripe API`,
  },
  {
    label: 'Decision Workflow',
    tag: 'Decision Tree',
    text: `User submits form
↓
Validate input
↓
Is valid?
├── Yes → Save to database
└── No → Show validation error`,
  },
  {
    label: 'E-Commerce Checkout',
    tag: 'Chained Architecture',
    text: `Customer → Web Store → Checkout API → Stripe Gateway → Orders Database → Kafka Event Bus → Warehouse Service`,
  },
  {
    label: 'CI/CD Pipeline',
    tag: 'Pipeline',
    text: `Developer → Git Push → GitHub Actions → Docker Build → Run Test Suite → Deploy to Kubernetes Cluster`,
  },
  {
    label: 'Mermaid Architecture',
    tag: 'Mermaid',
    text: `graph TD
    Client[Web Browser] -->|HTTPS Request| Gateway[API Gateway]
    Gateway -->|Validate Token| Auth[Auth Service]
    Gateway -->|Forward Order| OrderService[Order Service]
    OrderService -->|SQL Query| DB[(PostgreSQL Database)]
    OrderService -->|Publish Event| Queue[Kafka Event Bus]
    Queue --> Worker[Fulfillment Worker]`,
  },
  {
    label: 'Natural Language Flow',
    tag: 'AI Prompt',
    text: `The user opens the application. The request goes to the API Gateway. The API Gateway validates the request with the Auth Service and routes it to the Employee Service. The Employee Service reads employee data from SQL Server.`,
  },
  {
    label: 'Auth & Session Cache',
    tag: 'Security',
    text: `User → Login Screen → Auth API → Verify Password → Generate JWT Token → Redis Session Cache`,
  },
];

export function FlowchartImportModal({
  open,
  onOpenChange,
  onImportDiagram,
  existingNodeCount,
  selectedTheme,
}: FlowchartImportModalProps) {
  const [inputText, setInputText] = useState<string>(FLOW_EXAMPLES[0].text);
  const [direction, setDirection] = useState<'vertical' | 'horizontal'>('vertical');
  const [confirmReplaceMode, setConfirmReplaceMode] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse on the fly
  const parseResult: FlowParseResult = useMemo(() => {
    return FlowchartTextParser.parse(inputText, { direction, theme: selectedTheme });
  }, [inputText, direction, selectedTheme]);

  const handleApplyExample = (text: string) => {
    setInputText(text);
    setConfirmReplaceMode(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        if (content) {
          setInputText(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = (mode: 'replace' | 'add') => {
    if (parseResult.success && parseResult.diagram.nodes.length > 0) {
      onImportDiagram(parseResult.diagram, mode);
      onOpenChange(false);
      setConfirmReplaceMode(false);
    }
  };

  const stats = parseResult.stats;

  return (
    <Dialog open={open} onOpenChange={isOpen => {
      onOpenChange(isOpen);
      if (!isOpen) setConfirmReplaceMode(false);
    }}>
      <DialogContent className="sm:max-w-[700px] p-5 max-h-[90vh] flex flex-col bg-[#070D1F] border border-white/10 text-white shadow-2xl">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                  <span>Import Flowchart from Text / AI</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    AI-Ready Engine
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Paste plain text, AI outputs (ChatGPT, Claude, Gemini), Mermaid syntax, or workflows.
                </DialogDescription>
              </div>
            </div>

            {/* Layout Direction Toggle */}
            <div className="hidden sm:flex items-center bg-[#0B1224] p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setDirection('vertical')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px]',
                  direction === 'vertical'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Top → Down
              </button>
              <button
                type="button"
                onClick={() => setDirection('horizontal')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer text-[11px]',
                  direction === 'horizontal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                Left → Right
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 my-2 flex-1 overflow-y-auto pr-1 text-xs">
          {/* Example Library Pills */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-400" /> Pre-built Architecture Examples
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Upload className="h-3 w-3" /> Upload .txt / .md
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.mermaid"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {FLOW_EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => handleApplyExample(ex.text)}
                  className="px-2.5 py-1 rounded-lg bg-[#0D1528] hover:bg-[#151F35] border border-white/10 hover:border-blue-500/40 text-[11px] font-medium text-slate-300 hover:text-white whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{ex.label}</span>
                  <span className="text-[9px] opacity-60 font-mono">({ex.tag})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-slate-300">Flow Description or Mermaid Syntax</span>
              <span className="text-[10px] font-mono text-slate-400">
                Format: <strong className="text-blue-400 uppercase">{parseResult.format}</strong>
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                setConfirmReplaceMode(false);
              }}
              placeholder={`Paste your flow or AI output here...\n\nExample:\nClient → API Gateway → Order Service → Database`}
              rows={6}
              className="w-full text-xs font-mono p-3 rounded-xl bg-[#050A18] border border-white/10 text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Live Parse Summary & Entities Inspection */}
          <div className="p-3 bg-[#0B1224] border border-white/10 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-slate-200 text-xs">
                  Detected Structure Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
                  {stats.totalNodes} Nodes
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono text-[10px] font-bold">
                  {stats.totalEdges} Connections
                </span>
                {stats.decisionsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[10px] font-bold">
                    {stats.decisionsCount} Decisions
                  </span>
                )}
                {stats.databasesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold">
                    {stats.databasesCount} DBs
                  </span>
                )}
              </div>
            </div>

            {/* Entity Chips */}
            {parseResult.entities.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pt-1">
                {parseResult.entities.map(ent => (
                  <span
                    key={ent.id}
                    className="px-2 py-1 rounded-md bg-[#111A2E] border border-white/10 text-[10.5px] text-slate-300 font-medium flex items-center gap-1.5"
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          ent.category === 'client' ? '#06b6d4' :
                          ent.category === 'data' ? '#8b5cf6' :
                          ent.category === 'integration' ? '#f59e0b' :
                          ent.category === 'logic' ? '#10b981' : '#3b82f6',
                      }}
                    />
                    <strong className="text-white">{ent.label}</strong>
                    <span className="text-[9px] uppercase font-mono opacity-50">[{ent.category}]</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic text-[11px] py-2">
                Type or paste a workflow above to see detected nodes and connections.
              </p>
            )}

            {/* Warnings if any */}
            {parseResult.warnings.length > 0 && (
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>{parseResult.warnings[0]}</span>
              </div>
            )}
          </div>

          {/* Protection Notice if canvas currently has existing nodes */}
          {existingNodeCount > 0 && confirmReplaceMode && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs">
                <HelpCircle className="h-4 w-4 text-blue-400" />
                <span>Existing diagram detected ({existingNodeCount} nodes currently on canvas)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Would you like to replace the existing diagram completely, or append these new nodes to the existing canvas?
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleGenerate('replace')}
                  className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer"
                >
                  Replace Current Diagram
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate('add')}
                  className="h-7 text-xs border-blue-500/40 text-blue-300 hover:bg-blue-500/10 font-bold cursor-pointer"
                >
                  Add to Current Diagram
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmReplaceMode(false)}
                  className="h-7 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-white/10 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs border-white/10 text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </Button>

          {!confirmReplaceMode && (
            <Button
              type="button"
              size="sm"
              disabled={!parseResult.success || parseResult.entities.length === 0}
              onClick={() => {
                if (existingNodeCount > 0) {
                  setConfirmReplaceMode(true);
                } else {
                  handleGenerate('replace');
                }
              }}
              className="h-8 text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md cursor-pointer flex-1 sm:flex-initial"
            >
              <Sparkles className="h-3.5 w-3.5" /> Generate Diagram ({stats.totalNodes} Nodes)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
