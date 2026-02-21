import { useState } from "react";
import { useAuth } from "@/lib/auth";
import MobileLayout from "@/components/MobileLayout";
import shizenLogo from "@/assets/shizen-logo.png";
import karatekaBack from "@/assets/karateka-back.jpg";
import brushRedBottom from "@/assets/brush-red-bottom.png";
import { Mail, Lock, LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

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
    <MobileLayout bgImage={karatekaBack} showBrush={false} darkOverlay={true}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Shizen Logo */}
        <div className="w-36 h-36 mb-4 animate-fade-in">
          <img src={shizenLogo} alt="Dojo Shizen" className="w-full h-full object-contain drop-shadow-lg" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-primary-foreground mb-1 animate-fade-in drop-shadow-md" style={{ animationDelay: "0.1s" }}>
          Dojo Shizen
        </h1>
        <p className="text-sm text-primary-foreground/70 mb-10 animate-fade-in font-serif italic" style={{ animationDelay: "0.2s" }}>
          Shihan Aldair
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
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card/90 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 backdrop-blur-sm"
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
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-card/90 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 backdrop-blur-sm"
            />
          </div>

          {error && (
            <p className="text-primary-foreground text-sm text-center bg-destructive/80 rounded-lg py-2">{error}</p>
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
        <img src={brushRedBottom} alt="" className="w-full h-36 object-cover object-bottom opacity-80" />
      </div>
    </MobileLayout>
  );
};

export default Login;
