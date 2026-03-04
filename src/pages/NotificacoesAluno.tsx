import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Bell, Check, AlertTriangle, Users, Award } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  created_at: string;
}

const TIPO_ICONS: Record<string, typeof Bell> = {
  geral: Bell,
  evento: Users,
  aula: Award,
  urgente: AlertTriangle,
};

const NotificacoesAluno = () => {
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [lidas, setLidas] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    if (!usuario) return;

    const [notifRes, leiturasRes] = await Promise.all([
      supabase.from("notificacoes").select("id, titulo, mensagem, tipo, created_at").order("created_at", { ascending: false }),
      supabase.from("notificacao_leituras").select("notificacao_id").eq("usuario_id", usuario.id),
    ]);

    setNotificacoes((notifRes.data as Notificacao[]) || []);
    setLidas(new Set((leiturasRes.data || []).map((l: any) => l.notificacao_id)));
  };

  useEffect(() => {
    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel("notificacoes-aluno")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificacoes" }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [usuario]);

  const markAsRead = async (notifId: string) => {
    if (!usuario || lidas.has(notifId)) return;
    await supabase.from("notificacao_leituras").insert({
      notificacao_id: notifId,
      usuario_id: usuario.id,
    });
    setLidas((prev) => new Set([...prev, notifId]));
  };

  const markAllAsRead = async () => {
    if (!usuario) return;
    const unread = notificacoes.filter((n) => !lidas.has(n.id));
    if (unread.length === 0) return;
    
    await supabase.from("notificacao_leituras").insert(
      unread.map((n) => ({ notificacao_id: n.id, usuario_id: usuario.id }))
    );
    setLidas(new Set(notificacoes.map((n) => n.id)));
  };

  const unreadCount = notificacoes.filter((n) => !lidas.has(n.id)).length;

  return (
    <MobileLayout showBrush={false} showNav={true} fullWidth={true}>
      <PageHeader title="Notificações" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        <div className="px-4 pt-4 space-y-3">
          {/* Mark all as read */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-accent transition-colors"
            >
              <Check size={16} />
              Marcar todas como lidas ({unreadCount})
            </button>
          )}

          {notificacoes.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <Bell size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">Nenhuma notificação.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificacoes.map((n, i) => {
                const isRead = lidas.has(n.id);
                const Icon = TIPO_ICONS[n.tipo] || Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`w-full text-left dojo-card animate-fade-in transition-all ${!isRead ? "border-l-4" : "opacity-70"}`}
                    style={{
                      animationDelay: `${i * 0.03}s`,
                      borderLeftColor: !isRead ? (n.tipo === "urgente" ? "hsl(var(--destructive))" : "hsl(var(--primary))") : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: n.tipo === "urgente" ? "hsl(var(--destructive))" : "hsl(var(--primary))" }}
                      >
                        <Icon size={16} className="text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-serif font-bold text-sm ${isRead ? "text-muted-foreground" : "text-foreground"}`}>
                            {n.titulo}
                          </p>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.mensagem}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(n.created_at), "dd/MM · HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default NotificacoesAluno;
