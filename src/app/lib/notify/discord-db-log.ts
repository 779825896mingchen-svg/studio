/**
 * Optional Discord notifications when rows are written to Supabase.
 * Set DISCORD_WEBHOOK_URL in .env (server-only; never NEXT_PUBLIC_*).
 */

function getWebhookUrl() {
  return (process.env.DISCORD_WEBHOOK_URL || "").trim();
}

function clampFieldValue(s: string, max = 1000) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export type DiscordDbLogPayload = {
  title: string;
  description: string;
  fields?: { name: string; value: string; inline?: boolean }[];
};

export async function notifyDiscordDbEvent(payload: DiscordDbLogPayload): Promise<void> {
  const url = getWebhookUrl();
  if (!url) return;

  const embed = {
    title: clampFieldValue(payload.title, 256),
    description: clampFieldValue(payload.description, 4096),
    color: 0x22c55e,
    timestamp: new Date().toISOString(),
    fields: (payload.fields || []).slice(0, 25).map((f) => ({
      name: clampFieldValue(f.name, 256),
      value: clampFieldValue(f.value, 1024),
      inline: f.inline === true,
    })),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[discord-db-log]", res.status, text);
    }
  } catch (e) {
    console.error("[discord-db-log]", e);
  }
}

/** Does not await; failures only hit server logs. */
export function notifyDiscordDbEventFireAndForget(payload: DiscordDbLogPayload): void {
  void notifyDiscordDbEvent(payload);
}
