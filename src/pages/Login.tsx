import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import MobileLayout from "@/components/MobileLayout";
import brushStrokes from "@/assets/brush-strokes.png";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      setError("E-mail ou senha incorretos.");
    }
  };

  return (
    <MobileLayout showBrush={false}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Logo */}
        <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center mb-6 shadow-lg animate-fade-in">
          <span className="text-primary-foreground text-4xl font-serif font-black">極</span>
        </div>

        <h1 className="text-2xl font-serif font-bold text-foreground mb-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Dojo Kyokushin
        </h1>
        <p className="text-sm text-muted-foreground mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Sistema de Gestão do Dojo
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="dojo-btn w-full text-lg"
          >
            <LogIn size={20} />
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      {/* Brush strokes at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <img
          src={brushStrokes}
          alt=""
          className="w-full h-28 object-cover opacity-70"
        />
      </div>
    </MobileLayout>
  );
};

export default Login;
