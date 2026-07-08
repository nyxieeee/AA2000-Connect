import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { usePolicyCenterStore } from '../../stores/modules/policyCenterStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: { title: string; section: string }[];
}

const AI_RESPONSES: Record<string, { answer: string; policy: string; section: string }> = {
  'discount': { answer: 'According to AA2000 policy, discount authority levels are: Sales Rep (up to 5%), Sales Manager (up to 10%), GM (up to 15%), and CEO (20%+). All discounts above 10% require written justification and GM approval.', policy: 'Pricing & Discount Policy', section: 'v2.4 — Discount Authority Levels' },
  'incentive': { answer: 'Incentives are computed at 10% of actual Gross Profit. Advance payments are capped at 50% of the estimated incentive. A 12% tax deduction applies. Final release occurs upon 100% collection confirmation from Finance.', policy: 'Incentive Computation Rules', section: 'v1.8 — Computation Formula' },
  'quotation': { answer: 'All quotations must include: scope of work, bill of materials, labor costs, warranty terms, payment terms, and validity period (30 days default). Use the standard AA2000 quotation template available in the Documents module.', policy: 'Quotation Preparation Guide', section: 'v2.0 — Required Components' },
  'pipeline': { answer: 'Pipeline stages follow: Lead → Qualified → Proposal → Negotiation → Closed Won/Lost. Each stage transition requires completion of the stage checklist. Ensure all client interactions are documented in the CRM.', policy: 'CRM Standard Operating Procedure', section: 'v1.5 — Pipeline Stage Rules' },
  'follow': { answer: 'Follow-up cadence per lead temperature: Hot leads — 3 days, Warm leads — 7 days, Cold leads — 14 days. All client interactions must be logged in the CRM within 24 hours.', policy: 'Sales Manual — General Procedures', section: 'v3.1 — Follow-up Cadence' },
};

const renderCleanMessage = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={idx} className="h-1.5" />;

        // Headers
        if (cleanLine.startsWith('#')) {
          const headingText = cleanLine.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="text-xs font-extrabold text-navy-900 mt-3 first:mt-0 pb-0.5">
              {headingText}
            </h4>
          );
        }

        // Bullet points
        const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.startsWith('• ');
        if (isBullet) {
          cleanLine = cleanLine.replace(/^[*\-•]\s*/, '');
        }

        // Parse bold syntax **text**
        const parts = cleanLine.split('**');
        const content = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-extrabold text-navy-900">{part}</strong>;
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 pl-1.5">
              <span className="text-brand-blue shrink-0 mt-1">•</span>
              <span className="leading-relaxed">{content}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-xs text-slate-700 leading-relaxed">
            {content}
          </p>
        );
      })}
    </div>
  );
};

function findResponse(query: string): { answer: string; citations: { title: string; section: string }[] } {
  const q = query.toLowerCase();
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (q.includes(key)) {
      return { answer: val.answer, citations: [{ title: val.policy, section: val.section }] };
    }
  }
  return {
    answer: 'I can help you with questions about AA2000 products, specs, policies, and SOPs. Try asking about CCTV, fire alarms, discounts, incentives, or pipeline checklists. All answers are grounded in official product sheets and policy center manuals.',
    citations: [],
  };
}

const AIKnowledgePage = () => {
  const { policies } = usePolicyCenterStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: 'Hello! I\'m Ato, your AA2000 Assistant. Ask me anything about company products, technical specs, policies, or procedures. I can retrieve details on any AA2000 topic.', citations: [] },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS = ['What products are in our CCTV catalog?', 'What is the discount policy?', 'How are incentives computed?', 'What are the quotation guidelines?', 'What are the CRM pipeline stages?'];

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = { id: `msg-${Date.now()}`, role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate AI delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 800));

    const response = findResponse(query);
    const aiMsg: ChatMessage = { id: `msg-${Date.now() + 1}`, role: 'assistant', content: response.answer, citations: response.citations };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="section-title flex items-center gap-3"><Bot className="text-brand-blue" size={28} /> Ato — AI Assistant</h1>
          <p className="text-sm text-slate-400 -mt-4">Ask anything about AA2000 products, specifications, policies, or procedures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat panel */}
          <div className="lg:col-span-3 glass-card flex flex-col" style={{ minHeight: '500px' }}>
            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-brand-blue text-white rounded-2xl rounded-tr-md px-5 py-3' : 'bg-slate-50 text-slate-700 rounded-2xl rounded-tl-md px-5 py-3 border border-slate-100'}`}>
                    {msg.role === 'assistant' && <div className="flex items-center gap-1.5 mb-2"><Sparkles size={12} className="text-brand-blue" /><span className="text-[9px] font-bold text-brand-blue uppercase tracking-widest">Ato</span></div>}
                    {msg.role === 'user' ? (
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    ) : (
                      renderCleanMessage(msg.content)
                    )}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 space-y-1">
                        {msg.citations.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-2 text-[10px] font-medium text-brand-blue">
                            <BookOpen size={10} />
                            <span>{c.title} — {c.section}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 rounded-2xl rounded-tl-md px-5 py-4 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => handleSend(s)} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-medium text-slate-500 hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue/20 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <input className="input-field" placeholder="Ask about products, specifications, policies, or procedures..." value={input} onChange={e => setInput(e.target.value)} disabled={loading} />
              <button type="submit" disabled={loading || !input.trim()} className="premium-button !px-4 !py-3 !rounded-xl flex items-center gap-1.5 disabled:opacity-50"><Send size={14} /></button>
            </form>
          </div>

          {/* Policy sidebar */}
          <div className="space-y-3">
            <h3 className="sub-title flex items-center gap-1.5"><BookOpen size={12} /> Available Policies</h3>
            {policies.map(p => (
              <div key={p.id} className="p-3 bg-white rounded-xl border border-slate-100 hover:border-brand-blue/20 transition-all">
                <p className="text-xs font-bold text-navy-900 truncate">{p.title}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">v{p.version}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AIKnowledgePage;
