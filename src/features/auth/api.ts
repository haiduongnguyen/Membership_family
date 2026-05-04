import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserRecord(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return;

  const displayName =
    data.user.user_metadata?.full_name ??
    data.user.email?.split("@")[0] ??
    null;

  await client.from("users").upsert(
    {
      id: data.user.id,
      email: data.user.email ?? "",
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
}

export async function signInWithEmail(
  client: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  if (data.user) await ensureUserRecord(client);
  return { message: "Đăng nhập thành công." };
}

export async function signUpWithEmail(
  client: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) return { error: error.message };
  if (data.user) await ensureUserRecord(client);
  if (!data.session) {
    return { message: "Tài khoản đã tạo. Kiểm tra email để xác thực rồi đăng nhập." };
  }
  return { message: "Đăng ký thành công." };
}

export async function signOut(client: SupabaseClient) {
  await client.auth.signOut();
}

