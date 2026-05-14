import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import { STRIPE_TIERS } from "@/lib/stripe";
import { Plus, Send, Trash2, Sparkles, FileDown, ArrowRight, Lock } from "lucide-react";

type Thread = { id: string; title: string; updated_at: string };
type Msg = { id?: string; role: "user" | "assistant"; content: string };

const MASTER_KIT_PDF = "/PGVA_Gov_Contracting_MASTER_KIT_v7.pdf";
const KIT_PDF = "/PGVA_Gov_Contracting_Kit_v6.pdf";
const FILLABLE_PDF = "/PGVA_Gov_Contracting_Fillable_v5.pdf";

const TIER_CARDS: Array<{ key: keyof typeof STRIPE_TIERS | "free"; tagline: string; perks: string[]; highlight?: boolean }> = [
  { key: "free", tagline: "Recon: see what's possible.", perks: ["Public procurement guide", "NAICS lookup"] },
  { key: "arena", tagline: "Curious citizens.", perks: ["Live opportunity ticker", "Daily SAM digest"] },
  { key: "starter", tagline: "Sole proprietors.", perks: ["Capability Statement template", "5 saved searches"] },
  { key: "pro", tagline: "★ Unlocks the Master Kit.", perks: ["Master Kit PDF v6", "Fillable forms + tracker", "DMV outreach contacts"], highlight: true },
  { key: "premium", tagline: "Serious 8(a) firms.", perks: ["AI proposal drafting", "NAICS auto-match", "Agency intel"] },
  { key: "team", tagline: "Small firms · 3 seats.", perks: ["Shared pipeline board", "Multi-user tracker"] },
  { key: "whale", tagline: "Primes / consultants · 5 seats.", perks: ["White-glove onboarding", "Custom outreach lists"] },
];

const PROMPTS = [
  "How do I register on SAM.gov in 10 days?",
  "Who should I email first in Reston?",
  "Draft a capability statement for NAICS 541511.",
  "Compare Pro vs Premium for an 8(a) applicant.",
];

const Bioluminescent = () => {
  const { user, loading: authLoading, tier, subscribed } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const params = useParams<{ threadId?: string }>();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const kitUnlocked = useMemo(() => {
    if (!subscribed) return false;
    return tier === "pro" || tier === "premium" || tier === "team" || tier === "whale";
  }, [subscribed, tier]);

  // Load threads
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("unicorn_threads").select("id,title,updated_at")
        .order("updated_at", { ascending: false });
      setThreads((data ?? []) as Thread[]);
      if (!params.threadId && data && data[0]) {
        navigate(`/bioluminescent/${data[0].id}`, { replace: true });
      }
    })();
  }, [user]); // eslint-disable-line

  // Sync active thread + load messages
  useEffect(() => {
    if (!user || !params.threadId) {
      setMessages([]); setActiveId(null);
      return;
    }
    setActiveId(params.threadId);
    (async () => {
      const { data } = await supabase
        .from("unicorn_messages").select("id,role,content")
        .eq("thread_id", params.threadId)
        .order("created_at", { ascending: true });
      setMessages((data ?? []).map((m: any) => ({ id: m.id, role: m.role, content: m.content })));
    })();
  }, [params.threadId, user]);

  // Autoscroll + focus
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);
  useEffect(() => { taRef.current?.focus(); }, [activeId, streaming]);

  const newThread = async () => {
    if (!user) { setShowAuth(true); return; }
    const { data, error } = await supabase
      .from("unicorn_threads").insert({ user_id: user.id, title: "New conversation" })
      .select("id,title,updated_at").single();
    if (error || !data) { toast({ title: "Couldn't start", description: error?.message, variant: "destructive" }); return; }
    setThreads(t => [data as Thread, ...t]);
    navigate(`/bioluminescent/${data.id}`);
  };

  const deleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    await supabase.from("unicorn_threads").delete().eq("id", id);
    setThreads(t => t.filter(x => x.id !== id));
    if (activeId === id) navigate("/bioluminescent");
  };

  const send = async (textOverride?: string) => {
    if (!user) { setShowAuth(true); return; }
    const text = (textOverride ?? input).trim();
    if (!text || streaming) return;

    let threadId = activeId;
    if (!threadId) {
      const { data, error } = await supabase
        .from("unicorn_threads").insert({ user_id: user.id, title: "New conversation" })
        .select("id,title,updated_at").single();
      if (error || !data) { toast({ title: "Couldn't start", variant: "destructive" }); return; }
      threadId = data.id;
      setThreads(t => [data as Thread, ...t]);
      navigate(`/bioluminescent/${threadId}`);
    }

    setInput("");
    setSubmitting(true);
    setMessages(m => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const projectId = (import.meta as any).env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/unicorn-chat`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threadId, message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 429) toast({ title: "Slow down", description: "Rate limited — try again in a moment.", variant: "destructive" });
        else if (res.status === 402) toast({ title: "AI credits exhausted", description: "Add credits in workspace settings.", variant: "destructive" });
        else toast({ title: "AI error", description: err.error ?? "Try again.", variant: "destructive" });
        setMessages(m => m.slice(0, -2));
        return;
      }

      setSubmitting(false);
      setStreaming(true);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
      // Refresh thread title in sidebar
      const { data: th } = await supabase
        .from("unicorn_threads").select("id,title,updated_at").eq("id", threadId).single();
      if (th) setThreads(t => [th as Thread, ...t.filter(x => x.id !== threadId)]);
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
      setMessages(m => m.slice(0, -2));
    } finally {
      setSubmitting(false);
      setStreaming(false);
    }
  };

  const handleSubscribe = async (priceId: string, key: string) => {
    if (!user) { setShowAuth(true); return; }
    setLoadingTier(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId, trial: key === "pro" ? 14 : undefined },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Checkout error", description: e.message, variant: "destructive" });
    } finally { setLoadingTier(null); }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#E8FDF5_0%,_#F0FBFF_45%,_#FFFFFF_100%)] text-slate-900">
      {/* Soft glow header */}
      <header className="px-6 sm:px-10 pt-8 pb-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-cyan-300 to-violet-300 shadow-[0_0_24px_rgba(16,185,129,0.45)]">
              <Sparkles className="h-4 w-4 text-white" />
            </span>
            <span className="font-semibold tracking-tight text-slate-800">Unicorn AI Builder</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <span className="text-slate-500">Signed in {kitUnlocked ? "· Kit unlocked" : ""}</span>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-emerald-700 hover:text-emerald-900 font-medium">
                Sign in
              </button>
            )}
            <Link to="/" className="text-slate-500 hover:text-slate-800">Back to Pulse</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 sm:px-10 pb-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-[11px] tracking-[0.3em] text-emerald-700/80 font-semibold uppercase">Bioluminescent</span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            Light, airy, <span className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 bg-clip-text text-transparent">automated procurement</span>.
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Ask the AI Builder anything. Download the Government Contracting Master Kit. Pick a tier when you're ready.
          </p>
        </div>
      </section>

      {/* Chat */}
      <section className="px-4 sm:px-10 pb-10">
        <div className="max-w-6xl mx-auto grid gap-4 lg:grid-cols-[260px_1fr]">
          {/* Threads */}
          <aside className="hidden lg:flex flex-col gap-2 rounded-2xl bg-white/60 backdrop-blur p-3 border border-emerald-100/70 shadow-[0_8px_30px_-12px_rgba(16,185,129,0.18)]">
            <button onClick={newThread} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition shadow-sm">
              <Plus className="h-4 w-4" /> New conversation
            </button>
            <div className="flex-1 overflow-y-auto max-h-[60vh] mt-1 pr-1">
              {!user && <p className="text-xs text-slate-500 px-2 py-3">Sign in to save chats across devices.</p>}
              {threads.map(t => (
                <div key={t.id}
                  onClick={() => navigate(`/bioluminescent/${t.id}`)}
                  className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm cursor-pointer transition ${
                    activeId === t.id ? "bg-emerald-100/70 text-emerald-900" : "text-slate-700 hover:bg-emerald-50"
                  }`}>
                  <span className="truncate flex-1">{t.title}</span>
                  <button onClick={(e) => deleteThread(t.id, e)} aria-label="Delete"
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </aside>

          {/* Chat panel */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-md border border-cyan-100/60 shadow-[0_20px_60px_-20px_rgba(14,165,233,0.2)] flex flex-col min-h-[60vh] overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-5">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  <p className="text-sm">Try one of these to start:</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {PROMPTS.map(p => (
                      <button key={p} onClick={() => send(p)}
                        className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-emerald-50 to-cyan-50 hover:from-emerald-100 hover:to-cyan-100 border border-emerald-100 text-slate-700 transition">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                m.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-500 text-white px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="text-slate-800 text-[15px] leading-relaxed whitespace-pre-wrap">
                    {m.content}
                    {streaming && i === messages.length - 1 && (
                      <span className="inline-block w-2 h-4 ml-0.5 align-middle bg-emerald-400 animate-pulse rounded-sm" />
                    )}
                  </div>
                )
              ))}
              {submitting && (
                <div className="text-slate-400 text-sm italic">Thinking…</div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-emerald-100/70 bg-white/80 backdrop-blur px-3 sm:px-5 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={taRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1}
                  placeholder={user ? "Ask the AI Builder…" : "Sign in to chat…"}
                  className="flex-1 resize-none rounded-2xl bg-white border border-emerald-100 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200/60 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 max-h-40"
                />
                <button
                  onClick={() => send()}
                  disabled={streaming || submitting || !input.trim()}
                  className="h-11 w-11 inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-md hover:opacity-95 disabled:opacity-40 transition"
                  aria-label="Send">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Master Kit download */}
      <section className="px-6 sm:px-10 pb-10">
        <div className="max-w-6xl mx-auto rounded-3xl bg-gradient-to-br from-white via-emerald-50/60 to-cyan-50/60 border border-emerald-100/70 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Government Contracting Master Kit · v7 (Combined)</h2>
              <p className="mt-1 text-slate-600 text-sm max-w-xl">
                One PDF: procurement flow + 7 tiers + DMV outreach roster + fillable forms with highlighted blanks and source links. Compresses 120-day onboarding to 45–60.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {kitUnlocked ? (
                <>
                  <a href={MASTER_KIT_PDF} download className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 shadow-sm">
                    <FileDown className="h-4 w-4" /> Combined Master Kit v7
                  </a>
                  <a href={KIT_PDF} download className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-50">
                    Kit only
                  </a>
                  <a href={FILLABLE_PDF} download className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-50">
                    Fillable only
                  </a>
                </>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm">
                  <Lock className="h-4 w-4" /> Pro tier or higher unlocks the kit
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tier showcase */}
      <section className="px-6 sm:px-10 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Pick your tier</h2>
            <p className="text-slate-500 mt-2 text-sm">Same Stripe products you already have wired. Master Kit unlocks at Pro and above.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {TIER_CARDS.map(card => {
              const def = card.key === "free" ? null : (STRIPE_TIERS as any)[card.key];
              const price = def?.price ?? "$0";
              const period = def?.period ?? "/forever";
              const priceId = def?.price_id;
              const isCurrent = subscribed && tier === card.key;
              return (
                <div key={card.key}
                  className={`relative rounded-2xl p-4 flex flex-col bg-white/80 backdrop-blur border transition ${
                    card.highlight
                      ? "border-emerald-300 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.45)]"
                      : "border-slate-100"
                  }`}>
                  {card.highlight && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500 text-white">★ KIT UNLOCK</span>
                  )}
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">{card.key === "free" ? "FREE" : (STRIPE_TIERS as any)[card.key].name}</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">{price}</span>
                    <span className="text-[11px] text-slate-500">{period}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">{card.tagline}</p>
                  <ul className="mt-3 space-y-1.5 flex-1">
                    {card.perks.map(p => (
                      <li key={p} className="flex gap-1.5 text-[11px] text-slate-700">
                        <span className="text-emerald-500">✓</span><span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="mt-3 text-center text-[11px] py-2 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">Current plan</div>
                  ) : priceId ? (
                    <button
                      onClick={() => handleSubscribe(priceId, card.key as string)}
                      disabled={loadingTier === card.key}
                      className={`mt-3 inline-flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition ${
                        card.highlight
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      } disabled:opacity-50`}>
                      {loadingTier === card.key ? "…" : <>Subscribe <ArrowRight className="h-3 w-3" /></>}
                    </button>
                  ) : (
                    <Link to="/" className="mt-3 inline-flex items-center justify-center py-2 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">
                      Free always
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="px-6 pb-10 text-center text-[11px] text-slate-400">
        PGVA Ventures LLC · Bioluminescent · Unicorn AI Builder
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
};

export default Bioluminescent;
