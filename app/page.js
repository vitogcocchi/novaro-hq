'use client';

import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from "recharts";
import {
  Activity, Mail, Linkedin, Facebook, Users, TrendingUp, CheckCircle,
  ChevronRight, ChevronLeft, RefreshCw, ArrowUpRight, ArrowDownRight,
  MessageSquare, Target, Calendar, BarChart3, Eye, Send, Bot, Settings,
  Zap, LayoutDashboard, ClipboardList, Radio, Search, Bell, Menu, X,
  Plus, Clock, Inbox, Star, AlertCircle, Filter, Circle, Phone
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA (overridden by live API fetch)
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_PIPELINE = [
  { status: "New Lead", count: 507, color: "#6366F1" },
  { status: "Contacted", count: 344, color: "#3B82F6" },
  { status: "Opened", count: 39, color: "#F59E0B" },
  { status: "Replied", count: 1, color: "#10B981" },
  { status: "Bounced", count: 7, color: "#EF4444" },
];

const DEFAULT_METRICS = [
  { day: "Mon", sent: 68, opens: 6, replies: 0, positive: 0 },
  { day: "Tue", sent: 68, opens: 6, replies: 0, positive: 0 },
  { day: "Wed", sent: 68, opens: 7, replies: 0, positive: 0 },
  { day: "Thu", sent: 68, opens: 6, replies: 0, positive: 0 },
  { day: "Fri", sent: 68, opens: 6, replies: 1, positive: 0 },
  { day: "Sat", sent: 7, opens: 1, replies: 0, positive: 0 },
  { day: "Sun", sent: 7, opens: 1, replies: 0, positive: 0 },
];

const DEFAULT_CHANNELS = [
  { name: "Cold Email", value: 100, color: "#6366F1" },
];

const DEFAULT_ACTIVITIES = [
  { id: 1, action: "Dashboard connected to Instantly API", cat: "System", time: "now", icon: "check" },
  { id: 2, action: "Live data feed active", cat: "System", time: "now", icon: "refresh" },
];

const DEFAULT_KPIS = {
  totalPipeline: 895,
  emailsSent7d: 474,
  openRate: 9.3,
  replyRate: 0.2,
  totalReplies: 1,
  totalOpens: 44,
  totalBounced: 7,
  totalContacted: 388,
  activeCampaigns: 3,
};

const LEADS = [
  { company: "Northeast Plumbing Co", contact: "Mike Torres", industry: "Plumber", state: "MA", status: "Interested", source: "Cold Email", revenue: 750, last: "Today" },
  { company: "Elite Roof Solutions", contact: "Dave Chen", industry: "Roofer", state: "CT", status: "Replied", source: "LinkedIn", revenue: 500, last: "Today" },
  { company: "GreenScape Pro", contact: "Sarah Kim", industry: "Landscaper", state: "NY", status: "Discovery Call", source: "Cold Email", revenue: 1000, last: "Yesterday" },
  { company: "Spark Electric LLC", contact: "James Reed", industry: "Electrician", state: "NJ", status: "Contacted", source: "Facebook", revenue: 750, last: "Yesterday" },
  { company: "Fresh Air HVAC", contact: "Tom Walsh", industry: "HVAC", state: "RI", status: "New Lead", source: "Cold Email", revenue: 500, last: "2 days ago" },
  { company: "Crystal Clean Maids", contact: "Lisa Park", industry: "Cleaner", state: "MA", status: "Interested", source: "Cold Email", revenue: 750, last: "Today" },
  { company: "ProShine Detailing", contact: "Carlos Vega", industry: "Detailer", state: "CT", status: "Contacted", source: "LinkedIn", revenue: 1000, last: "3 days ago" },
  { company: "Ace Plumbing & Drain", contact: "Bob Miller", industry: "Plumber", state: "NY", status: "New Lead", source: "Cold Email", revenue: 500, last: "Today" },
];

const TASKS = [
  { id: 1, title: "Set up LSA campaign for Northeast Plumbing", status: "in_progress", priority: "high", assignee: "Elliott", due: "Today" },
  { id: 2, title: "Send follow-up sequence to Week 2 leads", status: "in_progress", priority: "high", assignee: "Elliott", due: "Today" },
  { id: 3, title: "Research 50 HVAC companies in CT", status: "todo", priority: "medium", assignee: "Elliott", due: "Tomorrow" },
  { id: 4, title: "Create new cold email variant for roofers", status: "todo", priority: "medium", assignee: "Elliott", due: "Tomorrow" },
  { id: 5, title: "Pull weekly analytics report", status: "todo", priority: "low", assignee: "Elliott", due: "Friday" },
  { id: 6, title: "Optimize Instantly sending schedule", status: "todo", priority: "medium", assignee: "Elliott", due: "Wednesday" },
  { id: 7, title: "Prep discovery call deck for GreenScape", status: "in_progress", priority: "high", assignee: "Vito", due: "Today" },
  { id: 8, title: "Onboard Northeast Plumbing (if closed)", status: "todo", priority: "high", assignee: "Vito", due: "This week" },
  { id: 9, title: "Warm up 2 new sending domains", status: "done", priority: "medium", assignee: "Elliott", due: "Done" },
  { id: 10, title: "Import 200 landscaper leads from Apollo", status: "done", priority: "medium", assignee: "Elliott", due: "Done" },
];

const AUTOMATIONS = [
  { id: 1, name: "Daily Email Send", schedule: "Every day 9:00 AM ET", status: "active", lastRun: "Today 9:00 AM", nextRun: "Tomorrow 9:00 AM" },
  { id: 2, name: "Apollo Data Sync", schedule: "Every 2 hours", status: "active", lastRun: "1 hour ago", nextRun: "In 1 hour" },
  { id: 3, name: "Instantly Metrics Pull", schedule: "Every hour", status: "active", lastRun: "32 min ago", nextRun: "In 28 min" },
  { id: 4, name: "Lead Status Updater", schedule: "Every 4 hours", status: "active", lastRun: "2 hours ago", nextRun: "In 2 hours" },
  { id: 5, name: "Weekly Report Generator", schedule: "Mondays 8:00 AM", status: "active", lastRun: "Today 8:00 AM", nextRun: "Next Monday" },
  { id: 6, name: "LinkedIn Outreach Batch", schedule: "Weekdays 10:00 AM", status: "active", lastRun: "Today 10:00 AM", nextRun: "Tomorrow 10:00 AM" },
  { id: 7, name: "Bounce List Cleanup", schedule: "Daily 11:00 PM", status: "active", lastRun: "Yesterday 11:00 PM", nextRun: "Today 11:00 PM" },
  { id: 8, name: "Facebook DM Sequence", schedule: "Weekdays 2:00 PM", status: "paused", lastRun: "3 days ago", nextRun: "Paused" },
];

const CAMPAIGNS = [
  { name: "LSA Outreach - Plumbers MA", channel: "Cold Email", status: "active", sent: 340, opens: 142, replies: 18, positive: 6, start: "Mar 10" },
  { name: "LSA Outreach - Roofers CT/NY", channel: "Cold Email", status: "active", sent: 280, opens: 98, replies: 12, positive: 3, start: "Mar 12" },
  { name: "LinkedIn - HVAC Northeast", channel: "LinkedIn", status: "active", sent: 85, opens: 0, replies: 8, positive: 2, start: "Mar 15" },
  { name: "Facebook DMs - Landscapers", channel: "Facebook", status: "paused", sent: 45, opens: 0, replies: 3, positive: 1, start: "Mar 18" },
  { name: "LSA Outreach - Electricians NJ", channel: "Cold Email", status: "draft", sent: 0, opens: 0, replies: 0, positive: 0, start: "Pending" },
];

const CHAT_INIT = [
  { role: "assistant", content: "Good morning, Vito. Here's your daily briefing: 125 emails sent overnight, 3 new replies (1 positive from Northeast Plumbing Co), and all 5 sending accounts are healthy. Your discovery call with GreenScape Pro is at 2 PM today." },
  { role: "user", content: "What's our reply rate looking like this week?" },
  { role: "assistant", content: "This week's reply rate is 5.6% across all cold email campaigns, up from 4.2% last week. The plumber-focused campaign is outperforming at 5.3%. The new subject line variant we tested on Tuesday pulled a 7.8% reply rate. I'd recommend scaling that variant across all campaigns." },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

const glass = {
  card: {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
  },
  cardHover: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  sidebar: {
    background: "rgba(8,8,12,0.85)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    borderRight: "1px solid rgba(255,255,255,0.04)",
  },
  chat: {
    background: "rgba(8,8,12,0.9)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    borderLeft: "1px solid rgba(255,255,255,0.04)",
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

const GlassCard = ({ children, className = "", hover = false, style = {} }) => (
  <div
    className={`transition-all duration-300 ${hover ? "hover:scale-[1.01] cursor-pointer" : ""} ${className}`}
    style={{ ...glass.card, ...(hover ? {} : {}), ...style }}
    onMouseEnter={e => { if (hover) { e.currentTarget.style.background = glass.cardHover.background; e.currentTarget.style.border = glass.cardHover.border; }}}
    onMouseLeave={e => { if (hover) { e.currentTarget.style.background = glass.card.background; e.currentTarget.style.border = glass.card.border; }}}
  >
    {children}
  </div>
);

const Badge = ({ children, color = "gray" }) => {
  const s = {
    gray: "rgba(156,163,175,0.12)", blue: "rgba(99,102,241,0.15)", green: "rgba(16,185,129,0.15)",
    yellow: "rgba(245,158,11,0.15)", red: "rgba(239,68,68,0.15)", purple: "rgba(168,85,247,0.15)",
    orange: "rgba(249,115,22,0.15)", pink: "rgba(236,72,153,0.15)",
  };
  const t = {
    gray: "#9CA3AF", blue: "#818CF8", green: "#34D399", yellow: "#FBBF24",
    red: "#F87171", purple: "#C084FC", orange: "#FB923C", pink: "#F472B6",
  };
  return (
    <span style={{ background: s[color], color: t[color], padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: 500 }}>
      {children}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const m = { "New Lead": "gray", "Contacted": "blue", "Replied": "yellow", "Interested": "orange", "Discovery Call": "purple", "Proposal Sent": "pink", "Closed Won": "green", "Closed Lost": "red" };
  return <Badge color={m[status] || "gray"}>{status}</Badge>;
};

const PriorityDot = ({ p }) => {
  const c = { high: "#F87171", medium: "#FBBF24", low: "#6B7280" };
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: c[p], display: "inline-block", flexShrink: 0 }} />;
};

const AIcon = ({ type }) => {
  const icons = { mail: <Mail size={12} />, refresh: <RefreshCw size={12} />, message: <MessageSquare size={12} />, check: <CheckCircle size={12} />, linkedin: <Linkedin size={12} />, target: <Target size={12} />, chart: <BarChart3 size={12} />, facebook: <Facebook size={12} /> };
  return (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", flexShrink: 0 }}>
      {icons[type] || <Activity size={12} />}
    </div>
  );
};

const Metric = ({ label, value, change, up, icon: I, color }) => (
  <GlassCard className="p-4" hover>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <I size={16} />
      </div>
      {change && (
        <span style={{ fontSize: 10, fontWeight: 600, color: up ? "#34D399" : "#F87171", display: "flex", alignItems: "center", gap: 2 }}>
          {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{change}
        </span>
      )}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 10, color: "#6B7280", marginTop: 4 }}>{label}</div>
  </GlassCard>
);

const Header = ({ title, sub, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <div>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 10, color: "#4B5563", margin: "2px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const ttStyle = { backgroundColor: "rgba(15,15,20,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11, backdropFilter: "blur(20px)" };

// ═══════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pipeline", label: "Leads", icon: Users },
  { id: "outreach", label: "Outreach", icon: Mail },
  { id: "campaigns", label: "Campaigns", icon: Radio },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "activity", label: "Activity Feed", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automations", label: "Automations", icon: Zap },
  { id: "operations", label: "Operations", icon: Target },
  { id: "chat", label: "AI Chat", icon: Bot },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ page, setPage, col, setCol, onChat }) {
  return (
    <aside style={{ ...glass.sidebar, position: "fixed", left: 0, top: 0, height: "100%", width: col ? 64 : 220, zIndex: 40, display: "flex", flexDirection: "column", transition: "width 0.3s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: col ? "0 0" : "0 16px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.04)", justifyContent: col ? "center" : "flex-start" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #6366F1, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0, boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>N</div>
        {!col && <div style={{ overflow: "hidden" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "0.5px" }}>NOVARO HQ</div><div style={{ fontSize: 8, color: "#4B5563", letterSpacing: "2px", textTransform: "uppercase" }}>Mission Control</div></div>}
        <button onClick={() => setCol(!col)} style={{ marginLeft: col ? 0 : "auto", background: "none", border: "none", color: "#4B5563", cursor: "pointer", padding: 4 }}>
          {col ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {NAV.map(n => {
          const active = page === n.id && n.id !== "chat";
          const isChat = n.id === "chat";
          return (
            <button key={n.id} onClick={() => isChat ? onChat() : setPage(n.id)} title={col ? n.label : undefined}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: col ? "10px 0" : "8px 12px",
                borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 500, marginBottom: 2,
                justifyContent: col ? "center" : "flex-start", transition: "all 0.2s",
                background: active ? "rgba(99,102,241,0.12)" : "transparent",
                color: active ? "#818CF8" : isChat ? "#6366F1" : "#6B7280",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <n.icon size={16} style={{ flexShrink: 0 }} />
              {!col && <span>{n.label}</span>}
              {!col && isChat && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px rgba(16,185,129,0.5)" }} />}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: col ? "12px 0" : "12px 16px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 8, justifyContent: col ? "center" : "flex-start" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #10B981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>V</div>
        {!col && <div><div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>Vito</div><div style={{ fontSize: 9, color: "#4B5563" }}>Novaro AI</div></div>}
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CHAT PANEL
// ═══════════════════════════════════════════════════════════════════════════════

function Chat({ open, onClose }) {
  const [msgs, setMsgs] = useState(CHAT_INIT);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, thinking]);

  const send = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = { role: "user", content: input.trim() };
    const updatedMsgs = [...msgs, userMsg];
    setMsgs(updatedMsgs);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMsgs }),
      });
      const data = await res.json();
      setMsgs(p => [...p, { role: "assistant", content: data.reply || "Something went wrong. Try again." }]);
    } catch (err) {
      setMsgs(p => [...p, { role: "assistant", content: "Connection error. Check that ANTHROPIC_API_KEY is set in Vercel." }]);
    }
    setThinking(false);
  };

  return (
    <div style={{ ...glass.chat, position: "fixed", right: 0, top: 0, height: "100%", width: open ? 360 : 0, zIndex: 50, display: "flex", flexDirection: "column", transition: "width 0.3s ease", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={14} style={{ color: "#818CF8" }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Elliott</div>
            <div style={{ fontSize: 9, color: "#34D399", display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34D399", display: "inline-block", boxShadow: "0 0 6px rgba(52,211,153,0.5)" }} /> Online
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#4B5563", cursor: "pointer" }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px", fontSize: 12, lineHeight: 1.5, borderRadius: 14,
              ...(m.role === "user"
                ? { background: "rgba(99,102,241,0.2)", color: "#C7D2FE", borderBottomRightRadius: 4 }
                : { background: "rgba(255,255,255,0.04)", color: "#D1D5DB", borderBottomLeftRadius: 4, border: "1px solid rgba(255,255,255,0.04)" }),
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 12 }}>
            <div style={{ maxWidth: "85%", padding: "10px 14px", fontSize: 12, lineHeight: 1.5, borderRadius: 14, borderBottomLeftRadius: 4, background: "rgba(255,255,255,0.04)", color: "#6B7280", border: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", gap: 3 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#818CF8", display: "inline-block", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </span>
              Elliott is thinking...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
        <div style={{ ...glass.input, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask Elliott anything..."
            disabled={thinking}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 12, opacity: thinking ? 0.5 : 1 }}
          />
          <button onClick={send} disabled={thinking} style={{ background: "none", border: "none", color: thinking ? "#374151" : "#6366F1", cursor: thinking ? "not-allowed" : "pointer" }}><Send size={14} /></button>
        </div>
        <p style={{ fontSize: 9, color: "#374151", textAlign: "center", marginTop: 6 }}>Powered by Claude Sonnet · Ask about pipeline, campaigns, strategy</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardPage({ PIPELINE = DEFAULT_PIPELINE, METRICS = DEFAULT_METRICS, CHANNELS = DEFAULT_CHANNELS, ACTIVITIES = DEFAULT_ACTIVITIES, KPIS = DEFAULT_KPIS, CAMPAIGNS_DATA = [], liveData, setPage }) {
  const pt = KPIS.totalPipeline || PIPELINE.reduce((a, b) => a + b.count, 0);
  const ts = KPIS.emailsSent7d || METRICS.reduce((a, b) => a + b.sent, 0);
  const openRate = KPIS.openRate || 0;
  const replyRate = KPIS.replyRate || 0;
  const totalReplies = KPIS.totalReplies || 0;
  const activeCampaigns = KPIS.activeCampaigns || 0;

  const ClickMetric = ({ label, value, change, up, icon: Icon, color, onClick, sub }) => (
    <div onClick={onClick} style={{ ...glass.card, padding: 16, cursor: onClick ? "pointer" : "default", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
      onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = `${color}44`)}
      onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: 10, color: "#6B7280", margin: "0 0 6px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
          <p style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-1px" }}>{value}</p>
          {change && <p style={{ fontSize: 10, color: up ? "#34D399" : "#F87171", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 3 }}>{change}</p>}
          {sub && <p style={{ fontSize: 9, color: "#4B5563", margin: "2px 0 0" }}>{sub}</p>}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
          <Icon size={16} />
        </div>
      </div>
      {onClick && <div style={{ position: "absolute", bottom: 6, right: 10, fontSize: 8, color: "#374151" }}>click to explore →</div>}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <ClickMetric label="Total Pipeline" value={pt.toLocaleString()} change={`${activeCampaigns} active campaigns`} up icon={Users} color="#6366F1" onClick={() => setPage?.("pipeline")} sub="Click to view leads" />
        <ClickMetric label="Emails Sent" value={ts.toLocaleString()} change="all time" up icon={Mail} color="#A855F7" onClick={() => setPage?.("campaigns")} sub="Click to view campaigns" />
        <ClickMetric label="Open Rate" value={`${openRate}%`} change={`${KPIS.totalOpens || 0} total opens`} up icon={Eye} color="#10B981" onClick={() => setPage?.("analytics")} sub="Click for analytics" />
        <ClickMetric label="Reply Rate" value={`${replyRate}%`} change={`${totalReplies} replies`} up={totalReplies > 0} icon={MessageSquare} color="#F59E0B" onClick={() => setPage?.("outreach")} sub="Click for outreach log" />
      </div>

      <GlassCard className="p-5">
        <Header title="Outreach Performance" sub="Last 7 days across all channels" action={
          <div style={{ display: "flex", gap: 12, fontSize: 10 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6B7280" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", display: "inline-block" }} /> Sent</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6B7280" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#A855F7", display: "inline-block" }} /> Opens</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#6B7280" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} /> Replies</span>
          </div>
        } />
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={METRICS}>
            <defs>
              <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient>
              <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} /><stop offset="95%" stopColor="#A855F7" stopOpacity={0} /></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="day" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ttStyle} />
            <Area type="monotone" dataKey="sent" stroke="#6366F1" fill="url(#gS)" strokeWidth={2} />
            <Area type="monotone" dataKey="opens" stroke="#A855F7" fill="url(#gO)" strokeWidth={2} />
            <Line type="monotone" dataKey="replies" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: "#10B981", strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </GlassCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard className="p-5">
          <Header title="Pipeline Funnel" sub={`${pt.toLocaleString()} total leads`} action={
            <button onClick={() => setPage?.("pipeline")} style={{ fontSize: 9, color: "#818CF8", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, background: "rgba(99,102,241,0.1)" }}>View all →</button>
          } />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PIPELINE.map(s => (
              <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 80, fontSize: 10, color: "#6B7280", flexShrink: 0 }}>{s.status}</span>
                <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.02)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.8)", width: `${Math.max((s.count / Math.max(...PIPELINE.map(p => p.count), 1)) * 100, 6)}%`, background: `linear-gradient(90deg, ${s.color}CC, ${s.color}66)`, transition: "width 0.6s ease", boxShadow: `0 0 12px ${s.color}33` }}>
                    {s.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <Header title="Channels This Week" sub="Active outreach breakdown" action={
            <button onClick={() => setPage?.("operations")} style={{ fontSize: 9, color: "#818CF8", background: "rgba(99,102,241,0.1)", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4 }}>Operations →</button>
          } />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Cold Email", val: ts, sub: `${openRate}% open · ${replyRate}% reply`, color: "#6366F1", icon: Mail, page: "campaigns" },
              { label: "LinkedIn Outreach", val: "33 sent", sub: "6 accepted · 18.2% acceptance", color: "#0A66C2", icon: Linkedin, page: "pipeline" },
              { label: "Facebook Groups", val: "110 groups", sub: "18 posted this week · 35 replies", color: "#1877F2", icon: Facebook, page: "operations" },
            ].map(c => (
              <div key={c.label} onClick={() => setPage?.(c.page)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <c.icon size={13} style={{ color: c.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{c.label}</div>
                  <div style={{ fontSize: 9, color: "#4B5563" }}>{c.sub}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{c.val}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard className="p-5">
          <Header title="Recent Activity" sub="Latest actions by Elliott" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ACTIVITIES.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                <AIcon type={a.icon} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: "#D1D5DB", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.action}</p>
                  <p style={{ fontSize: 9, color: "#374151", margin: "1px 0 0" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function PipelinePage() {
  const [allLeads, setAllLeads] = useState(LEADS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        // Load cold email leads + LinkedIn leads in parallel
        const [emailRes, liRes] = await Promise.allSettled([
          fetch('/leads.json'),
          fetch('/linkedin-leads.json'),
        ]);

        const hotLeads = LEADS.filter(l => ["Interested","Discovery Call","Replied"].includes(l.status));
        const hotCompanies = new Set(hotLeads.map(l => (l.company||"").toLowerCase()));
        let combined = [...hotLeads];

        if (emailRes.status === "fulfilled" && emailRes.value.ok) {
          const data = await emailRes.value.json();
          if (data.leads?.length > 0) {
            const emailLeads = data.leads
              .filter(l => !hotCompanies.has((l.company||"").toLowerCase()))
              .map(l => ({
                company: l.company, contact: l.fullName,
                industry: l.industry || "", state: l.state || "",
                city: l.city || "", status: l.status || "Contacted",
                source: l.source || "Cold Email", last: "Contacted",
                email: l.email, phone: l.phone, title: l.title,
                linkedin: l.linkedin, website: l.website, campaign: l.campaign,
              }));
            combined = [...combined, ...emailLeads];
          }
        }

        if (liRes.status === "fulfilled" && liRes.value.ok) {
          const data = await liRes.value.json();
          if (data.leads?.length > 0) {
            const liCompanies = new Set(combined.map(l => (l.company||"").toLowerCase()));
            const liLeads = data.leads
              .filter(l => !liCompanies.has((l.company||"").toLowerCase()))
              .map(l => ({
                company: l.company, contact: l.name,
                industry: "", state: "", title: l.title,
                status: "New Lead", source: "LinkedIn",
                last: "Apollo", linkedin: l.linkedin,
              }));
            combined = [...combined, ...liLeads];
          }
        }

        setAllLeads(combined);
      } catch (e) { console.error("Lead load error:", e); }
      finally { setLoading(false); }
    };
    loadLeads();
  }, []);

  const hotCount = allLeads.filter(l => ["Interested","Discovery Call","Replied"].includes(l.status)).length;
  const emailCount = allLeads.filter(l => l.source === "Cold Email").length;
  const linkedinCount = allLeads.filter(l => l.source === "LinkedIn").length;
  const fbCount = allLeads.filter(l => l.source === "Facebook").length;

  const visible = allLeads.filter(l => {
    const matchFilter =
      filter === "all" ||
      (filter === "hot" && ["Interested","Discovery Call","Replied"].includes(l.status)) ||
      (filter === "email" && l.source === "Cold Email") ||
      (filter === "linkedin" && l.source === "LinkedIn") ||
      (filter === "facebook" && l.source === "Facebook");
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (l.company||"").toLowerCase().includes(q) ||
      (l.contact||"").toLowerCase().includes(q) ||
      (l.industry||"").toLowerCase().includes(q) ||
      (l.state||"").toLowerCase().includes(q) ||
      (l.title||"").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const filterBtns = [
    { id: "all", label: `All (${allLeads.length.toLocaleString()})` },
    { id: "hot", label: `🔥 Hot (${hotCount})` },
    { id: "email", label: `Email (${emailCount.toLocaleString()})` },
    { id: "linkedin", label: `LinkedIn (${linkedinCount.toLocaleString()})` },
    ...(fbCount > 0 ? [{ id: "facebook", label: `Facebook (${fbCount})` }] : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Metric label="Total Leads" value={allLeads.length.toLocaleString()} icon={Users} color="#6366F1" />
        <Metric label="Hot Leads" value={hotCount} icon={Star} color="#F59E0B" />
        <Metric label="Cold Email" value={emailCount.toLocaleString()} icon={Mail} color="#10B981" />
        <Metric label="LinkedIn" value={linkedinCount.toLocaleString()} icon={Linkedin} color="#0A66C2" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {filterBtns.map(f => (
          <button key={f.id} onClick={() => { setFilter(f.id); setSelectedIdx(null); }}
            style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 500,
              background: filter === f.id ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
              color: filter === f.id ? "#818CF8" : "#6B7280" }}>
            {f.label}
          </button>
        ))}
        <div style={{ ...glass.input, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", marginLeft: "auto" }}>
          <Search size={12} style={{ color: "#6B7280" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setSelectedIdx(null); }}
            placeholder="Search name, company, industry..."
            style={{ background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11, width: 200 }} />
        </div>
      </div>

      <GlassCard className="p-5">
        <Header title="Lead Pipeline"
          sub={loading ? "Loading real lead data..." : `${visible.length.toLocaleString()} leads${search ? ` matching "${search}"` : ""}`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Name","Company","Title","Location","Status","Source","Email","LinkedIn"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 6px", fontWeight: 500, color: "#4B5563", fontSize: 10 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {visible.slice(0, 100).map((l, i) => {
                const isOpen = selectedIdx === i;
                const loc = l.city && l.fullState ? `${l.city}, ${l.fullState}` : (l.state || l.city || "");
                const email = l.email || "";
                const liUrl = l.linkedin || "";
                return (
                  <>
                    <tr key={"r" + i} onClick={() => setSelectedIdx(isOpen ? null : i)}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer", background: isOpen ? "rgba(99,102,241,0.08)" : "transparent" }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}>
                      <td style={{ padding: "10px 6px", color: "#fff", fontWeight: 500 }}>{l.contact || "—"}</td>
                      <td style={{ padding: "10px 6px", color: "#D1D5DB" }}>{l.company || "—"}</td>
                      <td style={{ padding: "10px 6px", color: "#9CA3AF", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title || "—"}</td>
                      <td style={{ padding: "10px 6px", color: "#6B7280" }}>{loc || "—"}</td>
                      <td style={{ padding: "10px 6px" }}><StatusBadge status={l.status || "Contacted"} /></td>
                      <td style={{ padding: "10px 6px" }}><Badge color={l.source === "LinkedIn" ? "green" : "blue"}>{l.source || "—"}</Badge></td>
                      <td style={{ padding: "10px 6px", color: "#6B7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {email ? <a href={"mailto:" + email} onClick={e => e.stopPropagation()} style={{ color: "#818CF8", textDecoration: "none" }}>{email}</a> : "—"}
                      </td>
                      <td style={{ padding: "10px 6px" }}>
                        {liUrl ? <a href={liUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "#34D399", textDecoration: "none" }}>View →</a> : "—"}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={"d" + i} style={{ background: "rgba(99,102,241,0.04)" }}>
                        <td colSpan={8} style={{ padding: "16px 12px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 14 }}>
                            {[["Name", l.contact], ["Company", l.company], ["Title", l.title], ["Email", email], ["Phone", l.phone], ["Location", loc], ["Industry", l.industry], ["Campaign", l.campaign], ["Source", l.source], ["Status", l.status || "Contacted"], ["Website", l.website]].map(([label, val]) => (
                              <div key={label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: 10 }}>
                                <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 3 }}>{label}</div>
                                <div style={{ fontSize: 11, color: "#D1D5DB", fontWeight: 500, wordBreak: "break-word" }}>{val || "—"}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {email && <a href={"mailto:" + email} style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(99,102,241,0.2)", color: "#818CF8", textDecoration: "none", fontSize: 10, fontWeight: 500 }}>Send Email</a>}
                            {liUrl && <a href={liUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(16,185,129,0.15)", color: "#34D399", textDecoration: "none", fontSize: 10, fontWeight: 500 }}>Open LinkedIn</a>}
                            {l.website && <a href={l.website.startsWith("http") ? l.website : "https://" + l.website} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.06)", color: "#9CA3AF", textDecoration: "none", fontSize: 10, fontWeight: 500 }}>Website</a>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {visible.length > 100 && <p style={{ fontSize: 10, color: "#4B5563", textAlign: "center", padding: "12px 0" }}>Showing 100 of {visible.length.toLocaleString()} — use search to narrow results</p>}
          {visible.length === 0 && <p style={{ fontSize: 11, color: "#4B5563", textAlign: "center", padding: "24px 0" }}>No leads match your filter.</p>}
        </div>
      </GlassCard>
    </div>
  );
}

function CampaignsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Metric label="Active Campaigns" value={CAMPAIGNS.filter(c => c.status === "active").length} icon={Radio} color="#10B981" />
        <Metric label="Total Sent" value={CAMPAIGNS.reduce((a, b) => a + b.sent, 0)} icon={Mail} color="#6366F1" />
        <Metric label="Total Replies" value={CAMPAIGNS.reduce((a, b) => a + b.replies, 0)} icon={MessageSquare} color="#A855F7" />
        <Metric label="Positive Replies" value={CAMPAIGNS.reduce((a, b) => a + b.positive, 0)} icon={TrendingUp} color="#F59E0B" />
      </div>
      {CAMPAIGNS.map((c, i) => (
        <GlassCard key={i} className="p-4" hover>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.status === "active" ? "#10B981" : c.status === "paused" ? "#FBBF24" : "#6B7280", boxShadow: c.status === "active" ? "0 0 8px rgba(16,185,129,0.4)" : "none" }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "#4B5563", display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                  <Badge color={c.channel === "Cold Email" ? "blue" : c.channel === "LinkedIn" ? "green" : "purple"}>{c.channel}</Badge>
                  <span>Started {c.start}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 10 }}>
              <div style={{ textAlign: "center" }}><div style={{ color: "#D1D5DB", fontWeight: 600 }}>{c.sent}</div><div style={{ color: "#4B5563" }}>Sent</div></div>
              <div style={{ textAlign: "center" }}><div style={{ color: "#D1D5DB", fontWeight: 600 }}>{c.replies}</div><div style={{ color: "#4B5563" }}>Replies</div></div>
              <div style={{ textAlign: "center" }}><div style={{ color: "#34D399", fontWeight: 600 }}>{c.positive}</div><div style={{ color: "#4B5563" }}>Positive</div></div>
              <ChevronRight size={14} style={{ color: "#374151" }} />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function TasksPage() {
  const cols = [{ id: "todo", label: "To Do", color: "#6B7280" }, { id: "in_progress", label: "In Progress", color: "#6366F1" }, { id: "done", label: "Done", color: "#10B981" }];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
      {cols.map(col => (
        <div key={col.id}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: col.color }}>{col.label}</span>
            <span style={{ fontSize: 10, color: "#4B5563", background: "rgba(255,255,255,0.04)", padding: "1px 8px", borderRadius: 20 }}>{TASKS.filter(t => t.status === col.id).length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {TASKS.filter(t => t.status === col.id).map(task => (
              <GlassCard key={task.id} className="p-3" hover>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <PriorityDot p={task.priority} />
                  <div>
                    <p style={{ fontSize: 11, color: "#E5E7EB", margin: 0, lineHeight: 1.4 }}>{task.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 9, color: "#4B5563" }}>
                      <span>{task.assignee}</span><span style={{ color: "#2D3748" }}>|</span><span>{task.due}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPage({ ACTIVITIES = DEFAULT_ACTIVITIES }) {
  return (
    <GlassCard className="p-5">
      <Header title="Activity Feed" sub="Complete timeline of all actions" />
      {ACTIVITIES.map(a => (
        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)", borderRadius: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <AIcon type={a.icon} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{a.action}</span><Badge color="green">Done</Badge></div>
            <div style={{ fontSize: 9, color: "#4B5563", marginTop: 2 }}>Elliott | {a.cat}</div>
          </div>
          <span style={{ fontSize: 9, color: "#374151", whiteSpace: "nowrap" }}>{a.time}</span>
        </div>
      ))}
    </GlassCard>
  );
}

function AnalyticsPage({ METRICS = DEFAULT_METRICS, CHANNELS = DEFAULT_CHANNELS }) {
  const ts = (METRICS || DEFAULT_METRICS).reduce((a, b) => a + b.sent, 0);
  const to = (METRICS || DEFAULT_METRICS).reduce((a, b) => a + b.opens, 0);
  const tr = (METRICS || DEFAULT_METRICS).reduce((a, b) => a + b.replies, 0);
  const M = METRICS || DEFAULT_METRICS;
  const CH = CHANNELS || DEFAULT_CHANNELS;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Metric label="Open Rate" value={`${((to / ts) * 100).toFixed(1)}%`} change="+2.1%" up icon={Eye} color="#6366F1" />
        <Metric label="Reply Rate" value={`${((tr / ts) * 100).toFixed(1)}%`} change="+0.4%" up icon={MessageSquare} color="#10B981" />
        <Metric label="Bounce Rate" value="1.2%" change="-0.3%" up icon={AlertCircle} color="#EF4444" />
        <Metric label="Meetings Booked" value="4" change="+2" up icon={Calendar} color="#A855F7" />
      </div>
      <GlassCard className="p-5">
        <Header title="Send vs Reply Volume" sub="Weekly breakdown" />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={M}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="day" tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4B5563", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ttStyle} />
            <Bar dataKey="sent" fill="#6366F1" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="opens" fill="#A855F7" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Bar dataKey="replies" fill="#10B981" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <GlassCard className="p-5">
          <Header title="Channel Distribution" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart><Pie data={CH} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
              {CH.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
            </Pie><Tooltip contentStyle={ttStyle} /></PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {CH.map(c => <span key={c.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} /> {c.name} ({c.value}%)</span>)}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <Header title="Campaign Performance" />
          {CAMPAIGNS.filter(c => c.status === "active").map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div><div style={{ fontSize: 11, color: "#fff", fontWeight: 500 }}>{c.name}</div><div style={{ fontSize: 9, color: "#4B5563" }}>{c.sent} sent</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>{c.sent > 0 ? ((c.replies / c.sent) * 100).toFixed(1) : 0}%</div><div style={{ fontSize: 9, color: "#4B5563" }}>reply rate</div></div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
}

function AutomationsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Metric label="Active" value={AUTOMATIONS.filter(a => a.status === "active").length} icon={Zap} color="#10B981" />
        <Metric label="Runs Today" value="18" icon={RefreshCw} color="#6366F1" />
        <Metric label="Success Rate" value="98.2%" icon={CheckCircle} color="#A855F7" />
      </div>
      {AUTOMATIONS.map(a => (
        <GlassCard key={a.id} className="p-4" hover>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: a.status === "active" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: a.status === "active" ? "#34D399" : "#FBBF24" }}><Zap size={14} /></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#fff" }}>{a.name}</div>
                <div style={{ fontSize: 10, color: "#4B5563", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}><Clock size={9} /> {a.schedule}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 10 }}>
              <div style={{ textAlign: "right" }}><div style={{ color: "#9CA3AF" }}>Last: {a.lastRun}</div><div style={{ color: "#4B5563" }}>Next: {a.nextRun}</div></div>
              <Badge color={a.status === "active" ? "green" : "yellow"}>{a.status}</Badge>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function OutreachPage({ ACTIVITIES = DEFAULT_ACTIVITIES }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[{ icon: Mail, color: "#6366F1", val: "750", label: "Emails This Week" }, { icon: Linkedin, color: "#10B981", val: "85", label: "LinkedIn Messages" }, { icon: Facebook, color: "#A855F7", val: "45", label: "Facebook DMs" }].map((c, i) => (
          <GlassCard key={i} className="p-5" hover style={{ textAlign: "center" }}>
            <c.icon size={22} style={{ color: c.color, margin: "0 auto 8px", filter: `drop-shadow(0 0 8px ${c.color}44)` }} />
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{c.val}</div>
            <div style={{ fontSize: 10, color: "#6B7280", marginTop: 2 }}>{c.label}</div>
          </GlassCard>
        ))}
      </div>
      <GlassCard className="p-5">
        <Header title="Outreach Log" sub="Recent touchpoints" />
        {ACTIVITIES.filter(a => a.cat === "Outreach").map(a => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <AIcon type={a.icon} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: "#fff" }}>{a.action}</div><div style={{ fontSize: 9, color: "#4B5563", marginTop: 2 }}>{a.time}</div></div>
            <Badge color="green">Done</Badge>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPERATIONS HUB PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const OpsChannelIcon = ({ channel }) => {
  const colors = { linkedin: "#0A66C2", facebook: "#1877F2", email: "#6366F1", system: "#6B7280" };
  const labels = { LinkedIn: "in", Facebook: "f", Email: "@", System: "S" };
  const c = colors[(channel || "system").toLowerCase()] || "#6B7280";
  return (
    <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center", color: c, fontSize: 8, fontWeight: 700 }}>
      {labels[channel] || channel?.charAt(0) || "?"}
    </div>
  );
};

function OperationsHubPage({ PIPELINE, METRICS, CHANNELS, ACTIVITIES, KPIS, CAMPAIGNS_DATA, liveData }) {
  const [opsData, setOpsData] = useState(null);
  const [opsLoading, setOpsLoading] = useState(true);
  const [fbOps, setFbOps] = useState(null);
  const [liOutreach, setLiOutreach] = useState(null);
  const [liTab, setLiTab] = useState("stats"); // "stats" | "contacts"
  const [fbTab, setFbTab] = useState("stats"); // "stats" | "posts"

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [opsRes, fbRes, liRes] = await Promise.allSettled([
          fetch("/api/operations"),
          fetch("/facebook-ops.json"),
          fetch("/linkedin-outreach.json"),
        ]);
        if (opsRes.status === "fulfilled" && opsRes.value.ok) setOpsData(await opsRes.value.json());
        if (fbRes.status === "fulfilled" && fbRes.value.ok) setFbOps(await fbRes.value.json());
        if (liRes.status === "fulfilled" && liRes.value.ok) setLiOutreach(await liRes.value.json());
      } catch (err) { console.error("Ops fetch error:", err); }
      finally { setOpsLoading(false); }
    };
    fetchAll();
    const interval = setInterval(fetchAll, 1800000);
    return () => clearInterval(interval);
  }, []);

  const urgentItems = opsData?.urgent || [];
  const taskExecutions = opsData?.taskHistory || [];
  const systemHealth = opsData?.health || {};
  // Merge Notion LinkedIn data with local outreach CSV data
  const linkedinData = {
    requestsSent: liOutreach?.totalSent || opsData?.linkedin?.requestsSent || 0,
    acceptances: liOutreach?.accepted || opsData?.linkedin?.acceptances || 0,
    pending: liOutreach?.pending || 0,
    followUpSent: liOutreach?.followUpSent || 0,
    acceptanceRate: liOutreach?.acceptanceRate || 0,
    replies: opsData?.linkedin?.replies || 0,
    hotLeads: opsData?.linkedin?.hotLeads || 0,
    lastRun: opsData?.linkedin?.lastRun || liOutreach?.lastUpdated,
    contacts: liOutreach?.contacts || [],
  };
  // Merge Notion Facebook data with local ops JSON
  const facebookData = {
    postsMade: fbOps?.groupsPostedToday || opsData?.facebook?.postsMade || 0,
    groupsTotal: fbOps?.totalGroups || 110,
    groupsPostedWeek: fbOps?.groupsPostedThisWeek || 0,
    rotationDay: fbOps?.rotationDay || 1,
    commentsFound: fbOps?.commentsFound || 0,
    commentsReplied: fbOps?.commentsReplied || opsData?.facebook?.commentsReplied || 0,
    replyRate: fbOps?.replyRate || 0,
    lastRunStatus: fbOps?.lastRunStatus || "Unknown",
    lastRunDate: fbOps?.lastRunDate || null,
    recentPosts: fbOps?.recentPosts || [],
    commentHighlights: fbOps?.commentHighlights || [],
    urgentCount: opsData?.facebook?.urgentCount || 0,
    lastPostRun: opsData?.facebook?.lastPostRun || fbOps?.lastRunDate,
    lastCommentRun: opsData?.facebook?.lastCommentRun || fbOps?.lastCommentScan,
  };
  const emailData = opsData?.email || liveData?.kpis || {};

  const getHealthColor = (h) => h === "healthy" ? "#10B981" : h === "warning" ? "#F59E0B" : "#EF4444";
  const fmtTime = (ts) => {
    if (!ts) return "Never";
    const d = new Date(ts), now = new Date(), dm = Math.floor((now - d) / 60000);
    if (dm < 1) return "Just now";
    if (dm < 60) return `${dm}m ago`;
    const dh = Math.floor(dm / 60);
    return dh < 24 ? `${dh}h ago` : d.toLocaleDateString();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* URGENT ACTION CENTER */}
      {urgentItems.length > 0 ? (
        <GlassCard style={{ ...glass.card, border: "2px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.05)" }}>
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#EF4444", fontSize: 14 }}>!</div>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: "#EF4444", margin: 0 }}>{urgentItems.length} Urgent {urgentItems.length === 1 ? "Item" : "Items"}</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {urgentItems.sort((a, b) => {
                const po = { "Respond Now": 0, "Respond Today": 1, "FYI": 2 };
                return (po[a.priority] ?? 3) - (po[b.priority] ?? 3);
              }).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                  <Badge color={item.priority === "Respond Now" ? "red" : item.priority === "Respond Today" ? "yellow" : "green"}>{item.priority === "Respond Now" ? "URGENT" : (item.priority || "").toUpperCase()}</Badge>
                  <OpsChannelIcon channel={item.channel} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#fff" }}>{item.contactName} @ {item.company}</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{item.messagePreview}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <Badge color="blue">{item.type}</Badge>
                      <span style={{ fontSize: 9, color: "#4B5563" }}>{fmtTime(item.flaggedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      ) : (
        <GlassCard style={{ ...glass.card, border: "1px solid rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.05)" }}>
          <div style={{ padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981", fontSize: 16, fontWeight: 700 }}>&#10003;</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#10B981" }}>All Clear</div>
              <div style={{ fontSize: 10, color: "#4B5563", marginTop: 2 }}>No urgent items to address</div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* CHANNEL STATUS CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>

        {/* LinkedIn — rich card with tab toggle */}
        <GlassCard><div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(10,102,194,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0A66C2", fontSize: 14, fontWeight: 600 }}>in</div>
              <div><h3 style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0 }}>LinkedIn Outreach</h3><p style={{ fontSize: 9, color: "#4B5563", margin: "2px 0 0" }}>Connection campaign</p></div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["stats","contacts"].map(t => (
                <button key={t} onClick={() => setLiTab(t)} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 9, border: "1px solid rgba(255,255,255,0.08)", background: liTab === t ? "rgba(10,102,194,0.2)" : "transparent", color: liTab === t ? "#60A5FA" : "#4B5563", cursor: "pointer", fontWeight: liTab === t ? 600 : 400 }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
              ))}
            </div>
          </div>

          {liTab === "stats" ? (<>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
              {[
                { label: "Requests Sent", val: linkedinData.requestsSent, color: "#0A66C2" },
                { label: "Accepted", val: linkedinData.acceptances, color: "#10B981" },
                { label: "Pending", val: linkedinData.pending, color: "#F59E0B" },
                { label: "Follow-ups", val: linkedinData.followUpSent, color: "#818CF8" },
              ].map(m => (
                <div key={m.label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 8, color: "#4B5563", marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(10,102,194,0.08)", borderRadius: 10, padding: "8px 12px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#93C5FD" }}>Acceptance Rate</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#60A5FA" }}>{linkedinData.acceptanceRate}%</span>
              </div>
              <div style={{ marginTop: 6, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${Math.min(linkedinData.acceptanceRate, 100)}%`, background: "#0A66C2", borderRadius: 2, transition: "width 0.5s ease" }} />
              </div>
            </div>
          </>) : (
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {linkedinData.contacts.slice(0, 20).map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.accepted ? "#10B981" : "#F59E0B", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: "#fff", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: "#4B5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.company}</div>
                  </div>
                  <Badge color={c.accepted ? "green" : "yellow"}>{c.accepted ? "Accepted" : "Pending"}</Badge>
                </div>
              ))}
              {linkedinData.contacts.length > 20 && <div style={{ fontSize: 9, color: "#4B5563", paddingTop: 6 }}>+{linkedinData.contacts.length - 20} more in Leads</div>}
            </div>
          )}
          <div style={{ fontSize: 8, color: "#4B5563", marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>Last updated: {linkedinData.lastRun || "—"}</div>
        </div></GlassCard>

        {/* Facebook — rich card with tab toggle */}
        <GlassCard><div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(24,119,242,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1877F2", fontSize: 14, fontWeight: 600 }}>f</div>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0 }}>Facebook Groups</h3>
                <p style={{ fontSize: 9, color: "#4B5563", margin: "2px 0 0" }}>
                  {facebookData.groupsTotal} groups · Rotation Day {facebookData.rotationDay}/7
                  {facebookData.lastRunStatus === "PARTIAL" && <span style={{ color: "#F59E0B", marginLeft: 6 }}>⚠ Partial run</span>}
                  {facebookData.lastRunStatus === "SUCCESS" && <span style={{ color: "#10B981", marginLeft: 6 }}>✓ Success</span>}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["stats","posts"].map(t => (
                <button key={t} onClick={() => setFbTab(t)} style={{ padding: "3px 8px", borderRadius: 6, fontSize: 9, border: "1px solid rgba(255,255,255,0.08)", background: fbTab === t ? "rgba(24,119,242,0.2)" : "transparent", color: fbTab === t ? "#93C5FD" : "#4B5563", cursor: "pointer", fontWeight: fbTab === t ? 600 : 400 }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
              ))}
            </div>
          </div>

          {fbTab === "stats" ? (<>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
              {[
                { label: "Posted Today", val: facebookData.postsMade, sub: "of 16 planned", color: "#1877F2" },
                { label: "This Week", val: facebookData.groupsPostedWeek, sub: "groups reached", color: "#10B981" },
                { label: "Comments Found", val: facebookData.commentsFound, sub: "last scan", color: "#A855F7" },
              ].map(m => (
                <div key={m.label} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color }}>{m.val}</div>
                  <div style={{ fontSize: 8, color: "#4B5563", marginTop: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 7, color: "#374151" }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8 }}>
                <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Replies Sent</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#34D399" }}>{facebookData.commentsReplied}</div>
                <div style={{ fontSize: 8, color: "#4B5563" }}>{facebookData.replyRate}% reply rate</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 8 }}>
                <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Groups Coverage</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>{Math.round(((facebookData.groupsPostedWeek||0)/facebookData.groupsTotal)*100)}%</div>
                <div style={{ fontSize: 8, color: "#4B5563" }}>of 110 this week</div>
              </div>
            </div>
            {facebookData.commentHighlights.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 10 }}>
                <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 6 }}>Recent Engagement</div>
                {facebookData.commentHighlights.map((c, i) => (
                  <div key={i} style={{ fontSize: 9, color: "#9CA3AF", marginBottom: 4, paddingBottom: 4, borderBottom: i < facebookData.commentHighlights.length-1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
                    <span style={{ color: "#fff" }}>{c.commenter}</span> in {c.group} — <span style={{ color: "#34D399" }}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </>) : (
            <div style={{ maxHeight: 220, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {facebookData.recentPosts.map((p, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 9, color: "#60A5FA", fontWeight: 500 }}>{p.date} · Theme {p.theme}</span>
                    <Badge color={p.status === "SUCCESS" ? "green" : "yellow"}>{p.groupsPosted}/{p.groupsPlanned} groups</Badge>
                  </div>
                  <div style={{ fontSize: 9, color: "#9CA3AF", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{p.copy}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 8, color: "#4B5563", marginTop: 10, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12 }}>
            <span>Last post: {facebookData.lastRunDate || "—"}</span>
            <span>Last reply scan: {facebookData.lastCommentRun || "—"}</span>
          </div>
        </div></GlassCard>

        {/* Email (Instantly) */}
        <GlassCard hover><div style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6366F1", fontSize: 10, fontWeight: 600 }}>@</div>
            <div><h3 style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0 }}>Email</h3><p style={{ fontSize: 9, color: "#4B5563", margin: "2px 0 0" }}>Instantly campaigns</p></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Emails Sent</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#6366F1" }}>{emailData.sent || KPIS?.emailsSent7d || 0}</div>
              <div style={{ fontSize: 8, color: "#4B5563", marginTop: 2 }}>last 7 days</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Open Rate</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#10B981" }}>{emailData.openRate || KPIS?.openRate || 0}%</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Reply Rate</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#A855F7" }}>{emailData.replyRate || KPIS?.replyRate || 0}%</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 10 }}>
              <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Bounced</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#EF4444" }}>{emailData.bounced || KPIS?.totalBounced || 0}</div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 10 }}>
            <div style={{ fontSize: 9, color: "#4B5563", marginBottom: 4 }}>Active Campaigns</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#F59E0B" }}>{KPIS?.activeCampaigns || 0}</div>
          </div>
        </div></GlassCard>
      </div>

      {/* TASK EXECUTION LOG */}
      <GlassCard><div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div><h2 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>Task Execution Log</h2><p style={{ fontSize: 10, color: "#4B5563", margin: "2px 0 0" }}>Last 20 automation runs</p></div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Time", "Task", "Channel", "Status", "Summary", "Urgent"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 6px", fontWeight: 500, color: "#4B5563", fontSize: 10 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {taskExecutions.slice(0, 20).map((task, i) => {
                const st = (task.status || "").toLowerCase();
                const sc = { success: "#34D399", partial: "#FBBF24", failed: "#F87171", skipped: "#6B7280" };
                const sb = { success: "rgba(16,185,129,0.12)", partial: "rgba(245,158,11,0.12)", failed: "rgba(239,68,68,0.12)", skipped: "rgba(107,114,128,0.12)" };
                return (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "10px 6px", color: "#9CA3AF" }}>{fmtTime(task.runTime)}</td>
                    <td style={{ padding: "10px 6px", color: "#fff", fontWeight: 500 }}>{task.taskId || task.taskRun}</td>
                    <td style={{ padding: "10px 6px" }}><OpsChannelIcon channel={task.channel || "System"} /></td>
                    <td style={{ padding: "10px 6px" }}><span style={{ background: sb[st] || sb.skipped, color: sc[st] || sc.skipped, padding: "2px 8px", borderRadius: 20, fontSize: 9, fontWeight: 500 }}>{task.status || "Unknown"}</span></td>
                    <td style={{ padding: "10px 6px", color: "#9CA3AF", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.summary}</td>
                    <td style={{ padding: "10px 6px", color: (task.urgentCount || 0) > 0 ? "#F87171" : "#4B5563" }}>{(task.urgentCount || 0) > 0 ? `${task.urgentCount}` : "--"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {taskExecutions.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: "#4B5563" }}>
            <div style={{ fontSize: 12 }}>No task executions yet</div>
            <div style={{ fontSize: 10, marginTop: 4 }}>Automation runs will appear here as scheduled tasks execute</div>
          </div>
        )}
      </div></GlassCard>

      {/* SYSTEM HEALTH */}
      {(() => {
        const hs = (systemHealth.tasksFailed || 0) > 0 ? "warning" : (systemHealth.urgentPending || 0) > 3 ? "warning" : "healthy";
        const hc = getHealthColor(hs);
        return (
          <GlassCard style={{ border: `1px solid ${hc}33` }}><div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${hc}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: hc, boxShadow: `0 0 12px ${hc}66` }} />
              </div>
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0 }}>System Health</h3>
                <p style={{ fontSize: 10, color: "#4B5563", margin: "2px 0 0" }}>{hs === "healthy" ? "All systems operational" : "Issues detected"}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: "#6366F1" }}>{systemHealth.tasksRunToday || 0}</div><div style={{ fontSize: 9, color: "#4B5563" }}>Tasks Today</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: (systemHealth.tasksFailed || 0) > 0 ? "#EF4444" : "#10B981" }}>{systemHealth.tasksFailed || 0}</div><div style={{ fontSize: 9, color: "#4B5563" }}>Failed</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: urgentItems.length > 0 ? "#F59E0B" : "#10B981" }}>{urgentItems.length}</div><div style={{ fontSize: 9, color: "#4B5563" }}>Pending Urgent</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF" }}>{fmtTime(systemHealth.lastActivity)}</div><div style={{ fontSize: 9, color: "#4B5563" }}>Last Activity</div></div>
            </div>
          </div></GlassCard>
        );
      })()}
    </div>
  );
}

function SettingsPage() {
  const integrations = [
    { name: "Instantly", status: "connected", desc: "Cold email platform" },
    { name: "Apollo", status: "connected", desc: "Lead enrichment" },
    { name: "Notion", status: "connected", desc: "Database backend" },
    { name: "Facebook", status: "pending", desc: "DM outreach" },
    { name: "LinkedIn", status: "pending", desc: "Connection outreach" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <GlassCard className="p-5">
        <Header title="Connected Accounts" sub="API integrations" />
        {integrations.map(s => (
          <div key={s.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <div><div style={{ fontSize: 12, color: "#fff", fontWeight: 500 }}>{s.name}</div><div style={{ fontSize: 10, color: "#4B5563" }}>{s.desc}</div></div>
            <Badge color={s.status === "connected" ? "green" : "yellow"}>{s.status}</Badge>
          </div>
        ))}
      </GlassCard>
      <GlassCard className="p-5">
        <Header title="Sync Settings" />
        {[["Data refresh interval", "Every 1 hour", "gray"], ["Activity logging", "Enabled", "green"], ["Email notifications", "Disabled", "yellow"]].map(([l, v, c]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 12, color: "#9CA3AF" }}>
            <span>{l}</span><Badge color={c}>{v}</Badge>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD GATE
// ═══════════════════════════════════════════════════════════════════════════════

const ACCESS_KEY = "fydfdp99c9crkfh9";

function PasswordGate({ onAuth }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === ACCESS_KEY) {
        onAuth();
      } else {
        setErr(true);
        setLoading(false);
        setTimeout(() => setErr(false), 2000);
      }
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06060A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 400, padding: "0 24px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #6366F1, #A855F7)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 22, color: "#fff", marginBottom: 16, boxShadow: "0 0 40px rgba(99,102,241,0.3)" }}>N</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.5px" }}>NOVARO HQ</h1>
          <p style={{ fontSize: 11, color: "#4B5563", margin: 0, letterSpacing: "3px", textTransform: "uppercase" }}>Mission Control</p>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 32 }}>
          <label style={{ display: "block", fontSize: 11, color: "#6B7280", marginBottom: 8, fontWeight: 500 }}>Access Code</label>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="Enter access code"
            autoFocus
            style={{
              width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: err ? "1px solid #EF4444" : "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", transition: "all 0.2s ease", boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = err ? "#EF4444" : "rgba(99,102,241,0.5)"}
            onBlur={e => e.target.style.borderColor = err ? "#EF4444" : "rgba(255,255,255,0.08)"}
          />
          {err && <p style={{ color: "#EF4444", fontSize: 11, margin: "8px 0 0", fontWeight: 500 }}>Invalid access code. Try again.</p>}

          <button type="submit" disabled={loading || !pw} style={{
            width: "100%", padding: "12px 0", marginTop: 20, background: loading ? "rgba(99,102,241,0.3)" : "linear-gradient(135deg, #6366F1, #A855F7)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading || !pw ? "not-allowed" : "pointer", opacity: !pw ? 0.5 : 1, transition: "all 0.2s ease", letterSpacing: "0.5px"
          }}>
            {loading ? "Verifying..." : "Enter Mission Control"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 9, color: "#1F2937", marginTop: 32, letterSpacing: "2px", textTransform: "uppercase" }}>Novaro AI &middot; Authorized Access Only</p>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        input::placeholder { color: #374151; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function NovароHQ() {
  const [authed, setAuthed] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [col, setCol] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobMenu, setMobMenu] = useState(false);

  // ── Live data fetching from /api/dashboard ──
  const [liveData, setLiveData] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Password is always required — no localStorage bypass

  useEffect(() => {
    if (!authed) return;
    let mounted = true;
    async function fetchDashboard() {
      setSyncing(true);
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok && mounted) {
          const data = await res.json();
          setLiveData(data);
          setLastSync(new Date());
        }
      } catch (e) { console.error('Dashboard fetch error:', e); }
      if (mounted) setSyncing(false);
    }
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 1800000); // 30-minute Instantly scan interval
    return () => { mounted = false; clearInterval(interval); };
  }, [authed]);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  // Use live data when available, fall back to defaults
  const PIPELINE = liveData?.pipeline || DEFAULT_PIPELINE;
  const METRICS = liveData?.metrics || DEFAULT_METRICS;
  const CHANNELS = liveData?.channels || DEFAULT_CHANNELS;
  const ACTIVITIES = liveData?.activities || DEFAULT_ACTIVITIES;
  const KPIS = liveData?.kpis || DEFAULT_KPIS;
  const CAMPAIGNS_DATA = liveData?.campaigns || [];

  const title = NAV.find(n => n.id === page)?.label || "Dashboard";

  const pages = { dashboard: DashboardPage, pipeline: PipelinePage, outreach: OutreachPage, campaigns: CampaignsPage, tasks: TasksPage, activity: ActivityPage, analytics: AnalyticsPage, automations: AutomationsPage, operations: OperationsHubPage, settings: SettingsPage };
  const Page = pages[page] || DashboardPage;

  return (
    <div style={{ minHeight: "100vh", background: "#06060A", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* MESH GRADIENT BACKGROUND */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: "50%", height: "50%", background: "radial-gradient(ellipse, rgba(168,85,247,0.06) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: "30%", right: "20%", width: "30%", height: "30%", background: "radial-gradient(ellipse, rgba(16,185,129,0.04) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* SIDEBAR (desktop) */}
      <div className="hidden md:block" style={{ position: "relative", zIndex: 40 }}>
        <Sidebar page={page} setPage={p => { setPage(p); setMobMenu(false); }} col={col} setCol={setCol} onChat={() => setChatOpen(!chatOpen)} />
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden" style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(6,6,10,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 48 }}>
          <button onClick={() => setMobMenu(!mobMenu)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer" }}>
            {mobMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg, #6366F1, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 9 }}>N</div>
            <span style={{ fontSize: 12, fontWeight: 700 }}>NOVARO HQ</span>
          </div>
          <button onClick={() => setChatOpen(!chatOpen)} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer" }}><Bot size={18} /></button>
        </div>
        {mobMenu && (
          <div style={{ padding: "4px 8px 8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => { n.id === "chat" ? setChatOpen(true) : setPage(n.id); setMobMenu(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, border: "none", background: page === n.id ? "rgba(99,102,241,0.12)" : "transparent", color: page === n.id ? "#818CF8" : "#6B7280", fontSize: 12, cursor: "pointer" }}>
                <n.icon size={14} /> {n.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <main style={{ position: "relative", zIndex: 10, transition: "all 0.3s ease", marginLeft: col ? 64 : 220, marginRight: chatOpen ? 360 : 0 }} className="md:ml-auto">
        {/* Top Bar */}
        <div className="hidden md:flex" style={{ alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div>
            <h1 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</h1>
            <p style={{ fontSize: 10, color: "#374151", margin: "2px 0 0" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => { setSyncing(true); fetch('/api/dashboard').then(r => r.json()).then(d => { setLiveData(d); setLastSync(new Date()); setSyncing(false); }).catch(() => setSyncing(false)); }} style={{ ...glass.input, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", cursor: "pointer", color: syncing ? "#818CF8" : "#6B7280", fontSize: 10, background: syncing ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.03)" }}>
              <RefreshCw size={11} style={syncing ? { animation: "spin 1s linear infinite" } : {}} /> {syncing ? "Syncing..." : lastSync ? `Synced ${Math.round((Date.now() - lastSync.getTime()) / 60000)}m ago` : "Loading..."}
            </button>
            <button onClick={() => setChatOpen(!chatOpen)}
              style={{ ...glass.input, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", cursor: "pointer", fontSize: 10, background: chatOpen ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", color: chatOpen ? "#818CF8" : "#6B7280" }}>
              <Bot size={11} /> Elliott
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.4)" }} />
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <Page liveData={liveData} PIPELINE={PIPELINE} METRICS={METRICS} CHANNELS={CHANNELS} ACTIVITIES={ACTIVITIES} KPIS={KPIS} CAMPAIGNS_DATA={CAMPAIGNS_DATA} syncing={syncing} lastSync={lastSync} setPage={setPage} />
        </div>

        <div style={{ textAlign: "center", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: 9, color: "#1F2937", letterSpacing: "2px", textTransform: "uppercase" }}>Novaro HQ Mission Control &middot; Powered by Elliott AI</p>
        </div>
      </main>

      {/* CHAT PANEL */}
      <Chat open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* INLINE STYLES FOR RESPONSIVE */}
      <style>{`
        @media (max-width: 767px) {
          main { margin-left: 0 !important; margin-right: ${chatOpen ? '0' : '0'} !important; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 2px; }
        .hidden { display: none; }
        @media (min-width: 768px) { .md\\:block { display: block !important; } .md\\:flex { display: flex !important; } .md\\:ml-auto {} }
        @media (max-width: 767px) { .md\\:hidden { } .md\\:block { display: none !important; } .md\\:flex { display: none !important; } }
      `}</style>
    </div>
  );
}