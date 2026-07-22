import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, BookOpen, Sparkles, MessageSquare, Plus, Trash2, Edit2 } from 'lucide-react';
import { AnimatedPage } from '../../components/ui/AnimatedPage';
import { usePolicyCenterStore } from '../../stores/modules/policyCenterStore';
import { cn } from '../../utils/cn';

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
  'leave': { answer: 'We get 15 days of Vacation Leave (VL) and 15 days of Sick Leave (SL) per year. Remember to file your VL requests at least 3 days in advance in the HR portal, while SL requests must be supported by a medical certificate if absent for more than 2 days.', policy: 'HR Employee Handbook', section: 'v4.0 — Leave Credits & Filing Guidelines' },
  'benefit': { answer: 'Our company benefits package includes comprehensive SSS, Pag-IBIG, and PhilHealth contributions. In addition, all regular employees are covered by a premium Maxicare HMO health plan. Premium details are available on the HR dashboard.', policy: 'HR Benefits Program Guide', section: 'v1.2 — HMO & Statutory Benefits' },
  'payroll': { answer: 'AA2000 payroll is processed twice a month. Paydays are on the 15th and 30th. DTR cutoff dates are on the 10th (for the 15th payroll) and the 25th (for the 30th payroll). Be sure to submit your approved timecards on time, partner!', policy: 'Accounting & Payroll Guide', section: 'v3.5 — DTR Cutoffs & Paydays' },
};

const renderCleanMessage = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={idx} className="h-1.5" />;

        // Strip headers (#)
        cleanLine = cleanLine.replace(/^#+\s*/, '');

        // Strip bullets (*, -, •)
        cleanLine = cleanLine.replace(/^[*\-•]\s*/, '');

        // Strip bold markers (**)
        cleanLine = cleanLine.replace(/\*\*/g, '');

        return (
          <p key={idx} className="text-xs text-slate-700 leading-relaxed font-sans">
            {cleanLine}
          </p>
        );
      })}
    </div>
  );
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are Ato, a friendly, experienced, and supportive senior employee at AA2000. You aren't just an AI; you are a fellow colleague who has worked at AA2000 for years! 

You are highly knowledgeable in:
- Sales strategy, pipelines, and discount workflows.
- Accounting, billing, and gross profit incentive rules.
- Technical configurations (CCTV, fire alarms/FDAS, access control, structured cabling, intercoms).
- Human Resources (VL/SL leaves, health card/HMO benefits, SSS, Pag-IBIG, payroll cycles, timecards/DTR).
- General company SOPs and standard manuals.

Guidelines:
1. Speak in a warm, welcoming, collegial, and supportive tone (use words like "partner", "team", "our products", and occasionally friendly Taglish/local Filipino phrasing like "Mabuhay!", "Kapatid", "Salamat!", "Let's close this deal!", or "No worries, I got you").
2. Answer questions accurately and practically based on company manuals, but present the facts as a helpful peer sharing advice or explaining a procedure, not a mechanical machine.
3. Keep specifications detailed, but when asked for technical specifications of a product, output ONLY the specifications directly. Do NOT include conversational introductions (like "Here are the specs for...") or closing remarks. Return the raw specifications immediately.
4. Do NOT use Markdown formatting in your output under any circumstances. Never write headers with hashes (#), bold markers (**), or bullet lists (* or -). Respond strictly in plain text paragraphs or plain-text bullet sentences without symbols, keeping the format completely clean and plain.`;

function findResponse(query: string): { answer: string; citations: { title: string; section: string }[] } {
  const q = query.toLowerCase();
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (q.includes(key)) {
      return { answer: val.answer, citations: [{ title: val.policy, section: val.section }] };
    }
  }
  return {
    answer: 'I can help you with questions about AA2000 products, specs, policies, SOPs, and HR benefits/leaves. Try asking about CCTV, fire alarms, discounts, incentives, leaves, HMO, or payroll cutoff cycles. All answers are grounded in official guidelines.',
    citations: [],
  };
}

const generateMsgId = () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

const DEFAULT_WELCOME = 'Hello! I\'m Ato, your AA2000 Assistant. Ask me anything about company products, technical specs, policies, or procedures. I can retrieve details on any AA2000 topic.';

const AIKnowledgePage = () => {
  const { policies } = usePolicyCenterStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<'gemini' | 'groq' | 'mistral'>(() => {
    const val = localStorage.getItem('ato_active_provider');
    if (val === 'gemini' || val === 'groq' || val === 'mistral') return val;
    return 'groq';
  });

  const handleProviderChange = (p: 'gemini' | 'groq' | 'mistral') => {
    setProvider(p);
    localStorage.setItem('ato_active_provider', p);
  };

  // ChatGPT-style Chat history sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem('ato_chat_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [{
      id: 'default-session',
      title: 'New Chat Session',
      messages: [{ id: 'welcome', role: 'assistant', content: DEFAULT_WELCOME, citations: [] }],
      createdAt: new Date().toISOString()
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('ato_chat_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch {
      // Return default
    }
    return 'default-session';
  });

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'default-session',
    title: 'New Chat Session',
    messages: [{ id: 'welcome', role: 'assistant', content: DEFAULT_WELCOME, citations: [] }]
  };

  const SUGGESTIONS = ['What products are in our CCTV catalog?', 'What is the discount policy?', 'How are incentives computed?', 'What are the quotation guidelines?', 'What are the CRM pipeline stages?'];

  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    try {
      localStorage.setItem('ato_chat_sessions', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat Session',
      messages: [{ id: 'welcome', role: 'assistant', content: DEFAULT_WELCOME, citations: [] }],
      createdAt: new Date().toISOString()
    };
    saveSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = sessions.filter(s => s.id !== sessionId);
    if (updated.length === 0) {
      const defaultId = 'default-session';
      const defaultSession: ChatSession = {
        id: defaultId,
        title: 'New Chat Session',
        messages: [{ id: 'welcome', role: 'assistant', content: DEFAULT_WELCOME, citations: [] }],
        createdAt: new Date().toISOString()
      };
      saveSessions([defaultSession]);
      setActiveSessionId(defaultId);
    } else {
      saveSessions(updated);
      if (activeSessionId === sessionId) {
        setActiveSessionId(updated[0].id);
      }
    }
  };

  const handleRenameSession = (sessionId: string) => {
    if (!editTitleInput.trim()) return;
    const updated = sessions.map(s => s.id === sessionId ? { ...s, title: editTitleInput.trim() } : s);
    saveSessions(updated);
    setEditingSessionId(null);
  };

  const handleSend = async (text?: string) => {
    const query = text || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = { id: generateMsgId(), role: 'user', content: query };
    
    // Auto-update title if it's default
    let newTitle = activeSession.title;
    if (activeSession.title === 'New Chat Session') {
      newTitle = query.length > 25 ? query.substring(0, 22) + '...' : query;
    }

    const updatedSessionMessages = [...activeSession.messages, userMsg];
    
    const updatedSessionsWithUser = sessions.map(s => 
      s.id === activeSession.id 
        ? { ...s, title: newTitle, messages: updatedSessionMessages } 
        : s
    );
    saveSessions(updatedSessionsWithUser);
    setInput('');
    setLoading(true);

    const policyContext = policies.map(p => `- ${p.title} (v${p.version})`).join('\n');
    const fullSystemPrompt = `${SYSTEM_PROMPT}\n\nAvailable policies:\n${policyContext}`;

    const conversationHistory = updatedSessionMessages
      .filter(m => m.id !== 'welcome')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    let responseAnswer = '';
    let success = false;

    // MULTI-PROVIDER ROUTING
    if (provider === 'gemini' && GEMINI_API_KEY) {
      try {
        const historyText = conversationHistory.map(h => `${h.role}: ${h.content}`).join('\n');
        const prompt = `${fullSystemPrompt}\n\nChat History:\n${historyText}\n\nUser: ${query}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (responseAnswer) success = true;
        }
      } catch (err) {
        console.error('Gemini API Error:', err);
      }
    } else if (provider === 'groq' && GROQ_API_KEY) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: [
              { role: 'system', content: fullSystemPrompt },
              ...conversationHistory,
              { role: 'user', content: query },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseAnswer = data.choices?.[0]?.message?.content || '';
          if (responseAnswer) success = true;
        }
      } catch (err) {
        console.error('Groq API Error:', err);
      }
    } else if (provider === 'mistral' && MISTRAL_API_KEY) {
      try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'open-mistral-nemo',
            messages: [
              { role: 'system', content: fullSystemPrompt },
              ...conversationHistory,
              { role: 'user', content: query },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          })
        });

        if (response.ok) {
          const data = await response.json();
          responseAnswer = data.choices?.[0]?.message?.content || '';
          if (responseAnswer) success = true;
        }
      } catch (err) {
        console.error('Mistral API Error:', err);
      }
    }

    let finalAnswer: string;
    let citations: ChatMessage['citations'] = [];

    if (success && responseAnswer) {
      finalAnswer = responseAnswer;
    } else {
      await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
      const fallbackResponse = findResponse(query);
      const activeKeyVar = provider === 'gemini' ? 'VITE_GEMINI_API_KEY' : provider === 'mistral' ? 'VITE_MISTRAL_API_KEY' : 'VITE_GROQ_API_KEY';
      const offlineNotice = `\n\n*(Note: Operating in Offline Simulation Mode. To enable live ${provider} responses, please configure ${activeKeyVar} in your local .env file)*`;
      finalAnswer = fallbackResponse.answer + offlineNotice;
      citations = fallbackResponse.citations;
    }

    const aiMsg: ChatMessage = { 
      id: generateMsgId(), 
      role: 'assistant', 
      content: finalAnswer, 
      citations 
    };

    const finalSessions = sessions.map(s => 
      s.id === activeSession.id 
        ? { ...s, title: newTitle, messages: [...updatedSessionMessages, aiMsg] } 
        : s
    );
    saveSessions(finalSessions);
    setLoading(false);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="section-title flex items-center gap-3"><Bot className="text-brand-blue" size={28} /> Ato — AI Assistant</h1>
            <p className="text-sm text-slate-400 -mt-4">Ask anything about AA2000 products, specifications, policies, or procedures</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              provider === 'gemini' && GEMINI_API_KEY ? 'bg-emerald-500 animate-pulse' :
              provider === 'groq' && GROQ_API_KEY ? 'bg-emerald-500 animate-pulse' :
              provider === 'mistral' && MISTRAL_API_KEY ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            )}></span>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as 'gemini' | 'groq' | 'mistral')}
              className="px-4 py-2 bg-white border border-surface-border text-slate-700 rounded-xl text-xs font-bold shadow-sm focus:border-brand-blue outline-none transition-all cursor-pointer"
            >
              <option value="gemini">Gemini 2.5 Flash</option>
              <option value="groq">Groq GPT OSS 120B</option>
              <option value="mistral">Mistral NeMo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat panel with sidebar */}
          <div className="lg:col-span-3 glass-card flex p-0 overflow-hidden" style={{ height: '650px' }}>
            
            {/* Sidebar list of sessions */}
            <div className="w-64 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
              <div className="p-4 border-b border-slate-100">
                <button 
                  onClick={handleNewChat}
                  className="w-full py-2.5 px-4 bg-white border border-surface-border text-slate-700 hover:bg-slate-50 transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus size={14} className="text-brand-blue" />
                  <span>New Chat</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {sessions.map(s => {
                  const isActive = s.id === activeSessionId;
                  const isEditing = s.id === editingSessionId;
                  return (
                    <div 
                      key={s.id}
                      onClick={() => { if (!isEditing) setActiveSessionId(s.id); }}
                      className={cn(
                        "group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                        isActive 
                          ? "bg-white border-brand-blue/20 shadow-sm text-navy-900 font-semibold" 
                          : "bg-transparent border-transparent text-slate-500 hover:text-navy-950 hover:bg-white/50"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <MessageSquare size={13} className={isActive ? "text-brand-blue font-bold" : "text-slate-400"} />
                        {isEditing ? (
                          <input 
                            value={editTitleInput}
                            onChange={e => setEditTitleInput(e.target.value)}
                            onBlur={() => handleRenameSession(s.id)}
                            onKeyDown={e => { if (e.key === 'Enter') handleRenameSession(s.id); }}
                            className="bg-white border border-brand-blue/30 px-1 py-0.5 rounded text-[11px] font-medium outline-none w-full"
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate text-xs leading-normal">{s.title}</span>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={e => { 
                              e.stopPropagation(); 
                              setEditingSessionId(s.id); 
                              setEditTitleInput(s.title); 
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-brand-blue transition-colors"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button 
                            onClick={e => handleDeleteSession(s.id, e)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active message log panel */}
            <div className="flex-1 flex flex-col p-6 min-w-0 bg-white">
              {/* Messages list */}
              <div className="flex-1 space-y-4 overflow-y-auto mb-4 custom-scrollbar pr-1">
                {activeSession.messages.map((msg, i) => (
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
              {activeSession.messages.length <= 2 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => handleSend(s)} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-medium text-slate-500 hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue/20 transition-all font-sans">
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
