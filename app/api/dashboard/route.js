// ─── API ROUTE: /api/dashboard ──────────────────────────────────────────────
// Fetches LIVE data from Instantly + aggregates for the dashboard.
// Instantly API key stays server-side. Frontend calls this endpoint.

export const revalidate = 120; // Cache for 2 minutes

const INSTANTLY_API = 'https://api.instantly.ai/api/v2';

async function instantlyFetch(path) {
  const key = process.env.INSTANTLY_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`${INSTANTLY_API}${path}`, {
      headers: { 'Authorization': `Bearer ${key}` },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error('Instantly fetch error:', path, e.message);
    return null;
  }
}

async function getInstantlyCampaigns() {
  const data = await instantlyFetch('/campaigns?limit=100');
  return data?.items || [];
}

async function getInstantlyAnalytics() {
  const data = await instantlyFetch('/campaigns/analytics');
  return Array.isArray(data) ? data : [];
}

async function getInstantlyEmails(limit = 20) {
  const data = await instantlyFetch(`/emails?limit=${limit}`);
  return data?.items || [];
}

export async function GET() {
  try {
    const [analytics, campaigns, recentEmails] = await Promise.all([
      getInstantlyAnalytics(),
      getInstantlyCampaigns(),
      getInstantlyEmails(30),
    ]);

    // ── Aggregate campaign totals ──
    let totalSent = 0, totalOpens = 0, totalReplies = 0, totalBounced = 0;
    let totalLeads = 0, totalContacted = 0, totalPositive = 0;
    const campaignDetails = [];

    for (const c of analytics) {
      totalSent += c.emails_sent_count || 0;
      totalOpens += c.open_count_unique || 0;
      totalReplies += c.reply_count_unique || 0;
      totalBounced += c.bounced_count || 0;
      totalLeads += c.leads_count || 0;
      totalContacted += c.contacted_count || 0;

      const statusMap = { 0: 'draft', 1: 'active', 2: 'paused', 3: 'completed' };
      campaignDetails.push({
        id: c.campaign_id,
        name: c.campaign_name,
        status: statusMap[c.campaign_status] || 'unknown',
        leads: c.leads_count || 0,
        contacted: c.contacted_count || 0,
        sent: c.emails_sent_count || 0,
        opens: c.open_count_unique || 0,
        replies: c.reply_count_unique || 0,
        bounced: c.bounced_count || 0,
        openRate: c.emails_sent_count > 0
          ? Math.round((c.open_count_unique / c.emails_sent_count) * 1000) / 10
          : 0,
        replyRate: c.emails_sent_count > 0
          ? Math.round((c.reply_count_unique / c.emails_sent_count) * 1000) / 10
          : 0,
      });
    }

    // ── Pipeline from Instantly lead statuses ──
    const pipeline = [
      { status: "New Lead", count: totalLeads - totalContacted, color: "#6366F1" },
      { status: "Contacted", count: totalContacted - totalOpens, color: "#3B82F6" },
      { status: "Opened", count: totalOpens - totalReplies, color: "#F59E0B" },
      { status: "Replied", count: totalReplies, color: "#10B981" },
      { status: "Bounced", count: totalBounced, color: "#EF4444" },
    ].filter(s => s.count > 0);

    // ── KPIs ──
    const openRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 1000) / 10 : 0;
    const replyRate = totalSent > 0 ? Math.round((totalReplies / totalSent) * 1000) / 10 : 0;

    const kpis = {
      totalPipeline: totalLeads,
      emailsSent7d: totalSent,
      openRate,
      replyRate,
      totalReplies,
      totalOpens,
      totalBounced,
      totalContacted,
      activeCampaigns: campaigns.filter(c => c.status === 1).length,
    };

    // ── Channel breakdown (email-only for now, LinkedIn/FB added later) ──
    const channels = [
      { name: "Cold Email", value: totalSent > 0 ? 100 : 0, color: "#6366F1", count: totalSent },
    ];

    // ── Recent activity from emails ──
    const activities = recentEmails.slice(0, 8).map((e, i) => ({
      id: i + 1,
      action: `Email to ${e.to_address_email_list?.[0] || e.to_address_email || 'prospect'}`,
      cat: "Outreach",
      time: e.timestamp_created ? getRelativeTime(e.timestamp_created) : "recently",
      icon: "mail",
      from: e.from_address_email || '',
    }));

    // ── Daily metrics (approximate from campaign data) ──
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const avgDaily = totalSent > 0 ? Math.round(totalSent / 7) : 0;
    const metrics = days.map((day, i) => {
      const dayIdx = (i + 1) % 7;
      const isWeekend = dayIdx === 0 || dayIdx === 6;
      const factor = isWeekend ? 0.1 : 1;
      return {
        day,
        sent: Math.round(avgDaily * factor),
        opens: Math.round((totalOpens / 7) * factor),
        replies: Math.round((totalReplies / 7) * factor),
        positive: 0,
      };
    });

    return Response.json({
      kpis,
      pipeline,
      channels,
      activities,
      metrics,
      campaigns: campaignDetails,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }
}

function getRelativeTime(timestamp) {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
