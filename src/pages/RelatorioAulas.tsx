import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  differenceInMinutes,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle } from "lucide-react";

const RelatorioAulas = () => {
  const { usuario } = useAuth();
  const [mes, setMes] = useState(new Date());
  const agora = new Date();

  const { data: aulas, isLoading } = useQuery({
    queryKey: ["aulas-relatorio", usuario?.id, mes.toISOString().slice(0, 7)],
    enabled: !!usuario,
    queryFn: async () => {
      const start = startOfMonth(mes).toISOString();
      const end = endOfMonth(mes).toISOString();

      const { data, error } = await supabase
        .from("aulas")
        .select("*")
        .eq("professor_id", usuario!.id)
        .gte("created_at", start)
        .lte("created_at", end)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const totalEncerradas = aulas?.filter((a) => new Date(a.expires_at) < agora).length ?? 0;
  const totalAtivas = aulas?.filter((a) => new Date(a.expires_at) >= agora).length ?? 0;
  const totalMinutos = aulas
    ?.filter((a) => new Date(a.expires_at) < agora)
    .reduce((acc, a) => acc + differenceInMinutes(new Date(a.expires_at), new Date(a.created_at)), 0) ?? 0;

  const formatDuracao = (min: number) => {
    if (min < 60) return `${min}min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Histórico de Aulas" showBack={true} />

      <div className="flex-1 bg-dojo-paper px-5 py-6 pb-24">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setMes(subMonths(mes, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground" />
          </button>
          <span className="font-serif font-bold text-foreground capitalize">
            {format(mes, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setMes(addMonths(mes, 1))}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight size={20} className="text-foreground" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="dojo-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{aulas?.length ?? 0}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total</p>
          </div>
          <div className="dojo-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{totalEncerradas}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Encerradas</p>
          </div>
          <div className="dojo-card p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{formatDuracao(totalMinutos)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total treino</p>
          </div>
        </div>

        {/* Aulas list */}
        <div className="space-y-3">
          {isLoading && (
            <div className="dojo-card p-10 flex justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!isLoading && (!aulas || aulas.length === 0) && (
            <div className="dojo-card p-10 text-center">
              <p className="text-muted-foreground text-sm">
                Nenhuma aula encontrada neste mês
              </p>
            </div>
          )}

          {aulas?.map((aula) => {
            const inicio = new Date(aula.created_at);
            const fim = new Date(aula.expires_at);
            const ativa = fim >= agora;
            const duracao = ativa ? null : differenceInMinutes(fim, inicio);

            return (
              <div key={aula.id} className="dojo-card p-4 animate-fade-in">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-serif font-bold text-foreground text-base">
                      {format(inicio, "dd 'de' MMMM", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {format(inicio, "EEEE", { locale: ptBR })}
                    </p>
                  </div>
                  {ativa ? (
                    <span className="flex items-center gap-1 text-green-700 text-xs font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                      <CheckCircle2 size={12} />
                      Ativa
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium bg-muted px-2.5 py-1 rounded-full">
                      <XCircle size={12} />
                      Encerrada
                    </span>
                  )}
                </div>

                {/* Time info */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Início</p>
                    <p className="font-bold text-sm text-foreground">
                      {format(inicio, "HH:mm")}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Término</p>
                    <p className="font-bold text-sm text-foreground">
                      {ativa ? "--:--" : format(fim, "HH:mm")}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center justify-center gap-0.5">
                      <Clock size={9} /> Duração
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {ativa
                        ? "Em curso"
                        : duracao !== null
                        ? formatDuracao(duracao)
                        : "--"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
};

export default RelatorioAulas;
