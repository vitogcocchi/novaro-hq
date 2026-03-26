export const revalidate = 120; // 2-minute caching

const NOTION_API = 'https://api.notion.com/v1';
const INSTANTLY_API = 'https://api.instantly.ai/api/v2';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const INSTANTLY_API_KEY = process.env.INSTANTLY_API_KEY;

// Database IDs (not collection IDs)
const OPS_LOG_DB_ID = '0db0a15051aa41ebaae40dd27351721b';
const URGENT_INBOX_DB_ID = '068f6998446f461693b8e125c9950600';

// Helper to get nested Notion property value
function getNotionProperty(page, propertyName) {
  const prop = page.properties[propertyName];
  if (!prop) return null;

  switch (prop.type) {
    case 'title':
      return prop.title[0]?.plain_text || null;
    case 'rich_text':
      return prop.rich_text[0]?.plain_text || null;
    case 'select':
      return prop.select?.name || null;
    case 'multi_select':
      return prop.multi_select?.map(s => s.name) || [];
    case 'number':
      return prop.number;
    case 'checkbox':
      return prop.checkbox;
    case 'date':
      return prop.date?.start || null;
    case 'url':
      return prop.url;
    case 'created_time':
      return prop.created_time;
    default:
      return null;
  }
}

// Check if a date is today (local time)
function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
}

// Fetch from Notion API with error handling
async function queryNotionDatabase(databaseId, filters = null) {
  try {
    const response = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 50,
        sorts: [
          {
            property: 'created_time',
            direction: 'descending',
          },
        ],
        ...(filters && { filter: filters }),
      }),
    });

    if (!response.ok) {
      console.error(`Notion API error (${databaseId}):`, response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Failed to fetch Notion database ${databaseId}:`, error.message);
    return null;
  }
}

// Fetch email metrics from Instantly API
async function fetchInstantlyMetrics() {
  try {
    const response = await fetch(`${INSTANTLY_API}/analytics/campaign/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${INSTANTLY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Instantly API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Calculate rates
    const sent = data.total_sent || 0;
    const opens = data.total_opens || 0;
    const replies = data.total_replies || 0;
    const bounced = data.total_bounced || 0;

    return {
      sent,
      opens,
      replies,
      bounced,
      openRate: sent > 0 ? Math.round((opens / sent) * 100) : 0,
      replyRate: sent > 0 ? Math.round((replies / sent) * 100) : 0,
      lastRun: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to fetch Instantly metrics:', error.message);
    return null;
  }
}

// Parse Operations Log entries
function parseOperationsLogEntries(entries) {
  if (!entries) return { linkedin: null, facebook: null, taskHistory: [] };

  const linkedin = {
    requestsSent: 0,
    acceptances: 0,
    replies: 0,
    hotLeads: 0,
    lastRun: null,
  };

  const facebook = {
    postsMade: 0,
    groupsPosted: 0,
    commentsReplied: 0,
    interests: 0,
    messages: 0,
    urgentCount: 0,
    lastPostRun: null,
    lastCommentRun: null,
  };

  const taskHistory = [];

  entries.forEach((page) => {
    const channel = getNotionProperty(page, 'Channel');
    const status = getNotionProperty(page, 'Status');
    const metricsJson = getNotionProperty(page, 'Metrics');
    const runTime = getNotionProperty(page, 'Run Time');
    const taskId = getNotionProperty(page, 'Task ID');
    const summary = getNotionProperty(page, 'Summary');
    const urgentCount = getNotionProperty(page, 'Urgent Count');

    let metrics = {};
    if (metricsJson) {
      try {
        metrics = JSON.parse(metricsJson);
      } catch {
        metrics = {};
      }
    }

    // Add to task history (keep last 20)
    if (taskHistory.length < 20) {
      taskHistory.push({
        taskRun: runTime,
        taskId,
        channel,
        status,
        summary,
        urgentCount: urgentCount || 0,
        runTime,
        metrics,
      });
    }

    // LinkedIn aggregation
    if (channel === 'LinkedIn' && isToday(runTime)) {
      linkedin.requestsSent += metrics.requests_sent || 0;
      linkedin.acceptances += metrics.acceptances || 0;
      linkedin.replies += metrics.replies || 0;
      linkedin.hotLeads += metrics.hot_leads || 0;
      linkedin.lastRun = runTime;
    }

    // Facebook aggregation
    if (channel === 'Facebook' && isToday(runTime)) {
      if (taskId?.includes('daily-fb-posts')) {
        facebook.postsMade += metrics.posts_made || 0;
        facebook.groupsPosted += metrics.groups_posted || 0;
        facebook.lastPostRun = runTime;
      }
      if (taskId?.includes('fb-comment-replies')) {
        facebook.commentsReplied += metrics.comments_replied || 0;
        facebook.interests += metrics.interests || 0;
        facebook.messages += metrics.messages || 0;
        facebook.lastCommentRun = runTime;
      }
      facebook.urgentCount += urgentCount || 0;
    }
  });

  return {
    linkedin: linkedin.lastRun ? linkedin : null,
    facebook: facebook.lastPostRun || facebook.lastCommentRun ? facebook : null,
    taskHistory,
  };
}

// Parse Urgent Inbox entries
function parseUrgentEntries(entries) {
  if (!entries) return [];

  return entries
    .filter((page) => {
      const resolved = getNotionProperty(page, 'Resolved');
      return !resolved; // Only unresolved items
    })
    .map((page) => ({
      id: page.id,
      subject: getNotionProperty(page, 'Subject'),
      channel: getNotionProperty(page, 'Channel'),
      priority: getNotionProperty(page, 'Priority'),
      type: getNotionProperty(page, 'Type'),
      contactName: getNotionProperty(page, 'Contact Name'),
      company: getNotionProperty(page, 'Company'),
      messagePreview: getNotionProperty(page, 'Message Preview'),
      sourceUrl: getNotionProperty(page, 'Source URL'),
      flaggedBy: getNotionProperty(page, 'Flagged By'),
      flaggedAt: getNotionProperty(page, 'Flagged At'),
      notes: getNotionProperty(page, 'Notes'),
    }))
    .slice(0, 50); // Limit to 50 urgent items
}

// Calculate health metrics
function calculateHealth(urgentCount, opsLogEntries, taskHistory) {
  if (!opsLogEntries) {
    return {
      tasksRunToday: 0,
      tasksFailed: 0,
      urgentPending: urgentCount,
      lastActivity: null,
    };
  }

  const tasksRunToday = opsLogEntries.filter((page) => {
    const runTime = getNotionProperty(page, 'Run Time');
    return isToday(runTime);
  }).length;

  const tasksFailed = opsLogEntries.filter((page) => {
    const runTime = getNotionProperty(page, 'Run Time');
    const status = getNotionProperty(page, 'Status');
    return isToday(runTime) && status === 'Failed';
  }).length;

  const lastActivity = taskHistory.length > 0 ? taskHistory[0].runTime : null;

  return {
    tasksRunToday,
    tasksFailed,
    urgentPending: urgentCount,
    lastActivity,
  };
}

export async function GET(request) {
  try {
    // Fetch data in parallel with error handling
    const [opsLogResult, urgentResult, emailResult] = await Promise.allSettled([
      queryNotionDatabase(OPS_LOG_DB_ID),
      queryNotionDatabase(URGENT_INBOX_DB_ID),
      fetchInstantlyMetrics(),
    ]);

    const opsLogEntries = opsLogResult.status === 'fulfilled' ? opsLogResult.value : null;
    const urgentEntries = urgentResult.status === 'fulfilled' ? urgentResult.value : null;
    const emailMetrics = emailResult.status === 'fulfilled' ? emailResult.value : null;

    // Parse data
    const { linkedin, facebook, taskHistory } = parseOperationsLogEntries(opsLogEntries);
    const urgent = parseUrgentEntries(urgentEntries);
    const health = calculateHealth(urgent.length, opsLogEntries, taskHistory);

    // Build response
    const response = {
      urgent: urgent || [],
      linkedin: linkedin || {
        requestsSent: 0,
        acceptances: 0,
        replies: 0,
        hotLeads: 0,
        lastRun: null,
      },
      facebook: facebook || {
        postsMade: 0,
        groupsPosted: 0,
        commentsReplied: 0,
        interests: 0,
        messages: 0,
        urgentCount: 0,
        lastPostRun: null,
        lastCommentRun: null,
      },
      email: emailMetrics || {
        sent: 0,
        opens: 0,
        replies: 0,
        bounced: 0,
        openRate: 0,
        replyRate: 0,
        lastRun: null,
      },
      taskHistory: taskHistory || [],
      health,
      lastSync: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Operations API error:', error);

    // Return partial data on error
    return new Response(
      JSON.stringify({
        urgent: [],
        linkedin: {
          requestsSent: 0,
          acceptances: 0,
          replies: 0,
          hotLeads: 0,
          lastRun: null,
        },
        facebook: {
          postsMade: 0,
          groupsPosted: 0,
          commentsReplied: 0,
          interests: 0,
          messages: 0,
          urgentCount: 0,
          lastPostRun: null,
          lastCommentRun: null,
        },
        email: {
          sent: 0,
          opens: 0,
          replies: 0,
          bounced: 0,
          openRate: 0,
          replyRate: 0,
          lastRun: null,
        },
        taskHistory: [],
        health: {
          tasksRunToday: 0,
          tasksFailed: 0,
          urgentPending: 0,
          lastActivity: null,
        },
        lastSync: new Date().toISOString(),
        error: error.message,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
