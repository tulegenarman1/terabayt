import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Lock, User, ArrowLeft, ShieldCheck } from "lucide-react";

const LOGO_URL = "/logo.jpeg";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = trpc.admin.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ username, password });
      localStorage.setItem("admin_authenticated", "true");
      localStorage.setItem("admin_login_time", new Date().toISOString());
      toast.success("Вход выполнен успешно");
      navigate("/admin");
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      else toast.error("Неверные учетные данные");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-block relative mb-4"
          >
            <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
            <img
              src={LOGO_URL}
              alt="Terabayt.kz"
              className="relative w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/40 shadow-2xl shadow-emerald-500/30"
            />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight">
            Terabayt<span className="text-emerald-400">.kz</span>
          </h1>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
              Админ-панель
            </span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-emerald-500/5">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Логин</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  autoComplete="username"
                  className="pl-10 h-12 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  className="pl-10 h-12 bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-6 text-base shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loginMutation.isPending ? "Проверяем..." : "Войти в панель"}
            </Button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться на главную
          </button>
        </div>
      </motion.div>
    </div>
  );
}
