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
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════════

const PIPELINE = [
  { status: "New Lead", count: 42, color: "#6366F1" },
  { status: "Contacted", count: 28, color: "#3B82F6" },
  { status: "Replied", count: 12, color: "#F59E0B" },
  { status: "Interested", count: 7, color: "#F97316" },
  { status: "Discovery Call", count: 4, color: "#A855F7" },
  { status: "Proposal Sent", count: 2, color: "#EC4899" },
  { status: "Closed Won", count: 1, color: "#10B981" },
  { status: "Closed Lost", count: 3, color: "#EF4444" },
];

const METRICS = [
  { day: "Mon", sent: 125, opens: 48, replies: 6, positive: 2 },
  { day: "Tue", sent: 118, opens: 52, replies: 8, positive: 3 },
  { day: "Wed", sent: 130, opens: 45, replies: 5, positive: 1 },
  { day: "Thu", sent: 122, opens: 55, replies: 9, positive: 4 },
  { day: "Fri", sent: 115, opens: 50, replies: 7, positive: 2 },
  { day: "Sat", sent: 0, opens: 12, replies: 3, positive: 1 },
  { day: "Sun", sent: 0, opens: 8, replies: 1, positive: 0 },
];

const CHANNELS = [
  { name: "Cold Email", value: 68, color: "#6366F1" },
  { name: "LinkedIn", value: 18, color: "#10B981" },
  { name: "Facebook", value: 14, color: "#A855F7" },
];

const ACTIVITIES = [
  { id: 1, action: "Sent 125 cold emails via Instantly", cat: "Outreach", time: "2h ago", icon: "mail" },
  { id: 2, action: "Pulled campaign data from Apollo", cat: "Sync", time: "2h ago", icon: "refresh" },
  { id: 3, action: "3 new replies detected", cat: "Lead Gen", time: "3h ago", icon: "message" },
  { id: 4, action: "Updated 8 lead statuses", cat: "Pipeline", time: "4h ago", icon: "check" },
  { id: 5, action: "Sent 15 LinkedIn connection requests", cat: "Outreach", time: "5h ago", icon: "linkedin" },
  { id: 6, action: "Researched 20 plumbing companies in MA", cat: "Research", time: "6h ago", icon: "target" },
  { id: 7, action: "Generated daily metrics report", cat: "Reporting", time: "8h ago", icon: "chart" },
  { id: 8, action: "Facebook DMs sent to 10 prospects", cat: "Outreach", time: "9h ago", icon: "facebook" },
  { id: 9, action: "Cleaned bounce list from Instantly", cat: "Maintenance", time: "10h ago", icon: "refresh" },
  { id: 10, action: "Added 30 new leads from Apollo", cat: "Lead Gen", time: "11h ago", icon: "target" },
];

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
  { id: "pipeline", label: "Pipeline", icon: Users },
  { id: "outreach", label: "Outreach", icon: Mail },
  { id: "campaigns", label: "Campaigns", icon: Radio },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "activity", label: "Activity Feed", icon: Activity },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "automations", label: "Automations", icon: Zap },
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
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => setMsgs(p => [...p, { role: "assistant", content: "On it. I'll update the Activity Feed when it's done." }]), 1200);
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
        <div ref={endRef} />
      </div>

      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
        <div style={{ ...glass.input, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask Elliott anything..."
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 12 }}
          />
          <button onClick={send} style={{ background: "none", border: "none", color: "#6366F1", cursor: "pointer" }}><Send size={14} /></button>
        </div>
        <p style={{ fontSize: 9, color: "#374151", textAlign: "center", marginTop: 6 }}>Elliott can manage campaigns, pull data, and update your pipeline</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

function DashboardPage() {
  const ts = METRICS.reduce((a, b) => a + b.sent, 0);
  const tr = METRICS.reduce((a, b) => a + b.replies, 0);
  const tp = METRICS.reduce((a, b) => a + b.positive, 0);
  const pt = PIPELINE.reduce((a, b) => a + b.count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <Metric label="Total Pipeline" value={pt} change="+12 this week" up icon={Users} color="#6366F1" />
        <Metric label="Emails Sent (7d)" value={ts.toLocaleString()} change="+8.2%" up icon={Mail} color="#A855F7" />
        <Metric label="Reply Rate" value={`${((tr / ts) * 100).toFixed(1)}%`} change="+0.4%" up icon={MessageSquare} color="#10B981" />
        <Metric label="Positive Replies" value={tp} change="+3" up icon={TrendingUp} color="#F59E0B" />
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
          <Header title="Pipeline Funnel" sub={`${pt} total leads`} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PIPELINE.map(s => (
              <div key={s.status} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 80, fontSize: 10, color: "#6B7280", flexShrink: 0 }}>{s.status}</span>
                <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.02)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 8, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.8)", width: `${Math.max((s.count / 42) * 100, 6)}%`, background: `linear-gradient(90deg, ${s.color}CC, ${s.color}66)`, transition: "width 0.6s ease", boxShadow: `0 0 12px ${s.color}33` }}>
                    {s.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

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
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <Metric label="Total Leads" value={LEADS.length} icon={Users} color="#6366F1" />
        <Metric label="Interested" value={LEADS.filter(l => l.status === "Interested").length} icon={Star} color="#F59E0B" />
        <Metric label="Discovery Calls" value={LEADS.filter(l => l.status === "Discovery Call").length} icon={Phone} color="#A855F7" />
        <Metric label="Pipeline Value" value={`$${LEADS.reduce((a, b) => a + b.revenue, 0).toLocaleString()}/mo`} icon={TrendingUp} color="#10B981" />
      </div>
      <GlassCard className="p-5">
        <Header title="All Leads" sub={`${LEADS.length} prospects`} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Company", "Contact", "Industry", "State", "Status", "Source", "Value", "Last Active"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 6px", fontWeight: 500, color: "#4B5563", fontSize: 10 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {LEADS.map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "10px 6px", color: "#fff", fontWeight: 500 }}>{l.company}</td>
                  <td style={{ padding: "10px 6px", color: "#9CA3AF" }}>{l.contact}</td>
                  <td style={{ padding: "10px 6px" }}><Badge>{l.industry}</Badge></td>
                  <td style={{ padding: "10px 6px", color: "#9CA3AF" }}>{l.state}</td>
                  <td style={{ padding: "10px 6px" }}><StatusBadge status={l.status} /></td>
                  <td style={{ padding: "10px 6px", color: "#6B7280" }}>{l.source}</td>
                  <td style={{ padding: "10px 6px", color: "#9CA3AF" }}>${l.revenue}/mo</td>
                  <td style={{ padding: "10px 6px", color: "#4B5563" }}>{l.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

function ActivityPage() {
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

function AnalyticsPage() {
  const ts = METRICS.reduce((a, b) => a + b.sent, 0);
  const to = METRICS.reduce((a, b) => a + b.opens, 0);
  const tr = METRICS.reduce((a, b) => a + b.replies, 0);
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
          <BarChart data={METRICS}>
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
            <PieChart><Pie data={CHANNELS} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} dataKey="value">
              {CHANNELS.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
            </Pie><Tooltip contentStyle={ttStyle} /></PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
            {CHANNELS.map(c => <span key={c.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6B7280" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} /> {c.name} ({c.value}%)</span>)}
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

function OutreachPage() {
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
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

export default function NovароHQ() {
  const [page, setPage] = useState("dashboard");
  const [col, setCol] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobMenu, setMobMenu] = useState(false);
  const title = NAV.find(n => n.id === page)?.label || "Dashboard";

  const pages = { dashboard: DashboardPage, pipeline: PipelinePage, outreach: OutreachPage, campaigns: CampaignsPage, tasks: TasksPage, activity: ActivityPage, analytics: AnalyticsPage, automations: AutomationsPage, settings: SettingsPage };
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
            <button style={{ ...glass.input, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", cursor: "pointer", color: "#6B7280", fontSize: 10, background: "rgba(255,255,255,0.03)" }}>
              <RefreshCw size={11} /> Synced 3 min ago
            </button>
            <button onClick={() => setChatOpen(!chatOpen)}
              style={{ ...glass.input, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", cursor: "pointer", fontSize: 10, background: chatOpen ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", color: chatOpen ? "#818CF8" : "#6B7280" }}>
              <Bot size={11} /> Elliott
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.4)" }} />
            </button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <Page />
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