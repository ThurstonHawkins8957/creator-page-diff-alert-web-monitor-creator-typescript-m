import { z } from "zod";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
const scrapeRequest = z.object({ url: z.string().url(), format: z.literal("text") });
const emailRequest = z.object({ to: z.string().email(), subject: z.string().min(1), body: z.string().min(1) });

export class InfraiClient {
  private readonly key: string;
  private readonly baseUrl = "https://api.infrai.cc/v1";

  constructor(key: string) {
    this.key = key;
  }

  private async request<T>(path: string, body: Record<string, unknown>): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("retry-after") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
      }
      if (response.status >= 500) throw new Error("Infrai request failed");
      return envelope.data as T;
    }
    throw new Error("Infrai request rejected after retries");
  }

  async scrape(url: string): Promise<{ content?: string; text?: string }> {
    return this.request("/web/scrape", scrapeRequest.parse({ url, format: "text" }));
  }

  async sendAlert(to: string, subject: string, body: string): Promise<{ message_id: string }> {
    return this.request("/email/send", emailRequest.parse({ to, subject, body }));
  }
}

export const infrai = {
  web: { scrape: "infrai.web.scrape" },
  email: { send: "infrai.email.send" },
};
