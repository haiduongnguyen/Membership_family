export async function bootstrapDatabaseIfNeeded() {
  const response = await fetch("/api/bootstrap-db", { method: "POST" });
  const payload = (await response.json()) as { ok?: boolean; error?: string };
  if (!response.ok) {
    return { error: payload.error ?? "Bootstrap failed" };
  }
  return { ok: true };
}
