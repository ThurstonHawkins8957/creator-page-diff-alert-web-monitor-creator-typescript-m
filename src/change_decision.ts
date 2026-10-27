export type ChangeDecision = { changed: boolean; subject: string; body: string };

export function decideChange(previous: string, current: string, pageUrl: string): ChangeDecision {
  const changed = previous.trim() !== current.trim();
  return {
    changed,
    subject: changed ? `Creator page changed: ${pageUrl}` : `Creator page unchanged: ${pageUrl}`,
    body: changed
      ? `A monitored creator page changed. Review the new text before processing digital-asset delivery.\n\n${current}`
      : "No page change detected.",
  };
}
