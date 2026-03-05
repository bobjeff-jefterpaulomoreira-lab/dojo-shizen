import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface Unidade {
  id: string;
  nome: string;
}

const RegisterStudent = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [unidadeId, setUnidadeId] = useState<string>((location.state as any)?.unidade_id || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUnidades = async () => {
      const { data } = await supabase.from("unidades").select("id, nome").order("nome");
      const list = (data as Unidade[]) || [];
      setUnidades(list);
      if (!unidadeId && list.length > 0) {
        setUnidadeId(list[0].id);
      }
    };
    fetchUnidades();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email || !senha || !unidadeId) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("register-student", {
        body: { nome, email, senha, unidade_id: unidadeId },
      });

      if (res.error || res.data?.error) {
        const msg = res.data?.error || res.error?.message || "Erro ao cadastrar";
        const translated = msg.includes("already been registered")
          ? "Já existe um aluno cadastrado com este e-mail."
          : msg;
        toast.error(translated);
      } else {
        toast.success("Aluno cadastrado com sucesso!");
        navigate("/sensei/alunos");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      <PageHeader title="Cadastrar Aluno" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper">
        <form onSubmit={handleSubmit} className="px-5 pt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Nome do aluno"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Senha de acesso"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">Unidade</label>
            <select
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {unidades.map((u) => (
                <option key={u.id} value={u.id}>
                  Dojo {u.nome}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-primary-foreground font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "hsl(var(--primary))" }}
          >
            {loading ? "Cadastrando..." : "Cadastrar Aluno"}
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default RegisterStudent;
