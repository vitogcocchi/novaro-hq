// ─── API ROUTE: /api/chat ────────────────────────────────────────────────────
// Powers the Elliott AI chat panel using Claude Sonnet.
// Requires ANTHROPIC_API_KEY env var in Vercel.

export const runtime = 'edge';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are Elliott, the AI assistant embedded inside Novaro HQ — Vito's private mission control dashboard for his AI automation agency, Novaro AI.

Vito runs Novaro AI, a one-person agency based in the US Northeast. He sells Google LSA management ($500-750/month) and AI receptionist services ($1,000-1,500/month) to home service businesses — plumbers, roofers, HVAC, landscapers, electricians, cleaners, and detailers — primarily in MA, CT, RI, NY, and NJ.

Current state:
- Pre-revenue, building toward first client
- 5 Instantly cold email sending accounts (3 warmed, 2 warming), sending ~125 emails/day
- 900+ leads in pipeline from Apollo/PhantomBuster prospecting
- Repositioned from AI-first messaging to LSA management as the entry offer
- Running LinkedIn outreach and Facebook DMs as secondary channels
- Dashboard pulls live data from Instantly API and Notion databases

Your role:
- Answer questions about Vito's pipeline, campaigns, metrics, and strategy
- Help Vito analyze what's working and what isn't
- Give blunt, direct, actionable advice — no sugarcoating
- When asked about live data, note that you have access to the dashboard context but advise Vito to check the live panels for real-time numbers
- You can help draft emails, analyze reply data, suggest campaign tweaks, and think through sales strategy
- Be concise and punchy. Vito is a busy operator, not a student

Tone: Direct, confident, no filler words. You're a business partner, not a chatbot.`;

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Only pass role/content to Anthropic — strip any extra fields
  const cleanMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: String(m.content) }));

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: cleanMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return new Response(JSON.stringify({ error: 'Claude API error', details: err }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'No response from Claude.';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to reach Claude API', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
