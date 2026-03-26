// ─── NOTION API INTEGRATION ─────────────────────────────────────────────────
// This module handles all reads from Notion databases.
// In production, these run server-side via Next.js API routes so the
// Notion API key never hits the browser.

const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Database IDs from your Notion workspace
const DB_IDS = {
  leadPipeline: process.env.NOTION_LEAD_PIPELINE_DB,
  outreachLog: process.env.NOTION_OUTREACH_LOG_DB,
  campaignMetrics: process.env.NOTION_CAMPAIGN_METRICS_DB,
  activityFeed: process.env.NOTION_ACTIVITY_FEED_DB,
};

// ─── LEAD PIPELINE ──────────────────────────────────────────────────────────

export async function getLeadPipeline() {
  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.leadPipeline,
      sorts: [{ property: 'Updated', direction: 'descending' }],
      page_size: 100,
    });

    return response.results.map(page => ({
      id: page.id,
      company: page.properties['Company']?.title?.[0]?.plain_text || '',
      contactName: page.properties['Contact Name']?.rich_text?.[0]?.plain_text || '',
      industry: page.properties['Industry']?.select?.name || '',
      state: page.properties['State']?.select?.name || '',
      email: page.properties['Email']?.email || '',
      phone: page.properties['Phone']?.phone_number || '',
      source: page.properties['Source']?.select?.name || '',
      status: page.properties['Status']?.select?.name || '',
      revenuePotential: page.properties['Revenue Potential']?.number || 0,
      firstContact: page.properties['First Contact']?.date?.start || null,
      lastActivity: page.properties['Last Activity']?.date?.start || null,
      notes: page.properties['Notes']?.rich_text?.[0]?.plain_text || '',
    }));
  } catch (error) {
    console.error('Error fetching lead pipeline:', error);
    return [];
  }
}

export async function getPipelineSummary() {
  const leads = await getLeadPipeline();
  const statusCounts = {};
  leads.forEach(lead => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });
  return { total: leads.length, byStatus: statusCounts, recentLeads: leads.slice(0, 10) };
}

// ─── CAMPAIGN METRICS ───────────────────────────────────────────────────────

export async function getCampaignMetrics(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const response = await notion.databases.query({
      database_id: DB_IDS.campaignMetrics,
      sorts: [{ property: 'Created', direction: 'descending' }],
      page_size: days * 3, // Multiple campaigns per day
    });

    return response.results.map(page => ({
      id: page.id,
      date: page.properties['Date']?.title?.[0]?.plain_text || '',
      campaignName: page.properties['Campaign Name']?.rich_text?.[0]?.plain_text || '',
      channel: page.properties['Channel']?.select?.name || '',
      emailsSent: page.properties['Emails Sent']?.number || 0,
      opens: page.properties['Opens']?.number || 0,
      replies: page.properties['Replies']?.number || 0,
      positiveReplies: page.properties['Positive Replies']?.number || 0,
      bounces: page.properties['Bounces']?.number || 0,
      meetingsBooked: page.properties['Meetings Booked']?.number || 0,
      newLeads: page.properties['New Leads']?.number || 0,
    }));
  } catch (error) {
    console.error('Error fetching campaign metrics:', error);
    return [];
  }
}

// ─── ACTIVITY FEED ──────────────────────────────────────────────────────────

export async function getActivityFeed(limit = 20) {
  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.activityFeed,
      sorts: [{ property: 'Created', direction: 'descending' }],
      page_size: limit,
    });

    return response.results.map(page => ({
      id: page.id,
      action: page.properties['Action']?.title?.[0]?.plain_text || '',
      category: page.properties['Category']?.select?.name || '',
      actor: page.properties['Actor']?.select?.name || '',
      status: page.properties['Status']?.select?.name || '',
      description: page.properties['Description']?.rich_text?.[0]?.plain_text || '',
      duration: page.properties['Duration']?.rich_text?.[0]?.plain_text || '',
      timestamp: page.properties['Timestamp']?.date?.start || null,
      created: page.properties['Created']?.created_time || null,
    }));
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}

// ─── OUTREACH LOG ───────────────────────────────────────────────────────────

export async function getOutreachLog(limit = 50) {
  try {
    const response = await notion.databases.query({
      database_id: DB_IDS.outreachLog,
      sorts: [{ property: 'Created', direction: 'descending' }],
      page_size: limit,
    });

    return response.results.map(page => ({
      id: page.id,
      activity: page.properties['Activity']?.title?.[0]?.plain_text || '',
      channel: page.properties['Channel']?.select?.name || '',
      actionType: page.properties['Action Type']?.select?.name || '',
      leadName: page.properties['Lead Name']?.rich_text?.[0]?.plain_text || '',
      campaign: page.properties['Campaign']?.rich_text?.[0]?.plain_text || '',
      result: page.properties['Result']?.select?.name || '',
      timestamp: page.properties['Timestamp']?.date?.start || null,
    }));
  } catch (error) {
    console.error('Error fetching outreach log:', error);
    return [];
  }
}

// ─── AGGREGATE DASHBOARD DATA ───────────────────────────────────────────────

export async function getDashboardData() {
  const [pipeline, metrics, activities, outreach] = await Promise.all([
    getPipelineSummary(),
    getCampaignMetrics(7),
    getActivityFeed(20),
    getOutreachLog(50),
  ]);

  return { pipeline, metrics, activities, outreach };
}