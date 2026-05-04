import { useState } from "react";

type Props = {
  loading: boolean;
  error: string;
  message: string;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
};

export default function AuthForm({ loading, error, message, onLogin, onRegister }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(6,182,212,0.22),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(45,212,191,0.22),transparent_35%),linear-gradient(180deg,#020617_0%,#0b1123_60%,#111827_100%)]" />
      <div className="relative mx-auto grid min-h-[85vh] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <p className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-3 py-1 text-xs tracking-wide text-cyan-100">
            NỀN TẢNG GHI NHỚ MỐI QUAN HỆ
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white lg:text-5xl">
            Ký Ức Quan Hệ
          </h1>
          <p className="max-w-xl text-slate-300">
            Quản lý gia đình, bạn bè và đồng nghiệp bằng sơ đồ trực quan. Thêm thành viên, kết nối quan hệ và ghi lại sự kiện quan trọng ở một nơi duy nhất.
          </p>
        </section>

        <div className="w-full space-y-4 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">Đăng nhập tài khoản</h2>
          <input
            className="w-full rounded-xl border border-white/15 bg-white/90 px-3 py-2 text-slate-900 placeholder:text-slate-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-white/15 bg-white/90 px-3 py-2 text-slate-900 placeholder:text-slate-500"
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {message && <p className="text-sm text-emerald-300">{message}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={loading}
              className="rounded-xl bg-cyan-500 px-3 py-2 font-medium text-white transition hover:bg-cyan-400 disabled:opacity-60"
              onClick={() => void onLogin(email, password)}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            <button
              disabled={loading}
              className="rounded-xl bg-white/20 px-3 py-2 font-medium text-white transition hover:bg-white/30 disabled:opacity-60"
              onClick={() => void onRegister(email, password)}
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
