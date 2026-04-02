import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!usuario) return;

    try {
      const [notifRes, leiturasRes] = await Promise.all([
        supabase.from("notificacoes").select("id"),
        supabase.from("notificacao_leituras").select("notificacao_id").eq("usuario_id", usuario.id),
      ]);

      const readIds = new Set((leiturasRes.data || []).map((l) => l.notificacao_id));
      const allIds = (notifRes.data || []).map((n) => n.id);
      setUnreadCount(allIds.filter((id) => !readIds.has(id)).length);
    } catch {
      // Silently fail for bell count
    }
  }, [usuario]);

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel("notif-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notificacoes" }, () => {
        fetchCount();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCount]);

  const isProfessor = usuario?.role === "professor";
  const path = isProfessor ? "/sensei/notificacoes" : "/notificacoes";

  return (
    <button
      onClick={() => navigate(path)}
      className="relative p-2 rounded-lg transition-colors hover:bg-primary-foreground/10"
    >
      <Bell size={20} className="text-primary-foreground" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
