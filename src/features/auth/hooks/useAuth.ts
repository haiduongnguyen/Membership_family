import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ensureUserRecord, signInWithEmail, signOut, signUpWithEmail } from "@/features/auth/api";

export function useAuth(client: SupabaseClient) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    client.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      if (data.session?.user) void ensureUserRecord(client);
    });

    const sub = client.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      if (session?.user) void ensureUserRecord(client);
    });

    return () => sub.data.subscription.unsubscribe();
  }, [client]);

  async function login(email: string, password: string) {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const result = await signInWithEmail(client, email, password);
      if (result.error) setError(result.error);
      else if (result.message) setMessage(result.message);
    } finally {
      setLoading(false);
    }
  }

  async function register(email: string, password: string) {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const result = await signUpWithEmail(client, email, password);
      if (result.error) setError(result.error);
      else if (result.message) setMessage(result.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut(client);
  }

  return { userId, loading, message, error, login, register, logout };
}
