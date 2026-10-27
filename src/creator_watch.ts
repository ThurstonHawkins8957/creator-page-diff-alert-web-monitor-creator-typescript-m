import { readFile, writeFile } from "node:fs/promises";
import { decideChange } from "./change_decision.ts";
import { InfraiClient } from "./infrai_client.ts";

const url = process.env.CREATOR_PAGE_URL;
const recipient = process.env.ALERT_TO;
const statePath = process.env.SNAPSHOT_FILE ?? "./creator-page.snapshot.txt";
const key = process.env.INFRAI_API_KEY;

if (!url || !recipient || !key) throw new Error("Set CREATOR_PAGE_URL, ALERT_TO, and INFRAI_API_KEY");

const client = new InfraiClient(key);
const scraped = await client.scrape(url);
const current = scraped.text ?? scraped.content ?? "";
const previous = await readFile(statePath, "utf8").catch(() => "");
const decision = decideChange(previous, current, url);
await writeFile(statePath, current, "utf8");

if (decision.changed) {
  const result = await client.sendAlert(recipient, decision.subject, decision.body);
  console.log(JSON.stringify({ changed: true, message_id: result.message_id }));
} else {
  console.log(JSON.stringify({ changed: false }));
}
