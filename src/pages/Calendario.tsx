import { useState, useMemo } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Dumbbell, Megaphone, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type EventItem = {
  id: string;
  title: string;
  date: Date;
  type: "treino" | "evento" | "aviso" | "avaliacao";
};

const typeConfig = {
  treino: { label: "Treino", icon: Dumbbell, color: "bg-primary text-primary-foreground" },
  evento: { label: "Evento", icon: CalendarDays, color: "bg-dojo-green text-primary-foreground" },
  aviso: { label: "Aviso", icon: Megaphone, color: "bg-dojo-yellow text-foreground" },
  avaliacao: { label: "Avaliação", icon: Star, color: "bg-dojo-red-status text-primary-foreground" },
};

const Calendario = () => {
  const { usuario } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Fetch aulas (treinos) for the month
  const { data: aulas } = useQuery({
    queryKey: ["aulas-calendario", monthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("aulas")
        .select("id, data, professor_id")
        .gte("data", format(monthStart, "yyyy-MM-dd"))
        .lte("data", format(monthEnd, "yyyy-MM-dd"));
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch comunicados (eventos/avisos) for the month
  const { data: comunicados } = useQuery({
    queryKey: ["comunicados-calendario", monthStart.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comunicados")
        .select("id, titulo, tipo, data_evento, created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const events: EventItem[] = useMemo(() => {
    const items: EventItem[] = [];

    aulas?.forEach((aula) => {
      items.push({
        id: aula.id,
        title: "Treino",
        date: parseISO(aula.data),
        type: "treino",
      });
    });

    comunicados?.forEach((c) => {
      const mapTipo = (tipo: string): EventItem["type"] => {
        if (tipo === "Evento") return "evento";
        if (tipo === "Avaliação") return "avaliacao";
        return "aviso";
      };
      const dateStr = c.data_evento || c.created_at;
      if (dateStr) {
        items.push({
          id: c.id,
          title: c.titulo,
          date: parseISO(dateStr),
          type: mapTipo(c.tipo),
        });
      }
    });

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [aulas, comunicados]);

  // Dates that have events (for highlighting on calendar)
  const eventDates = useMemo(() => {
    const map = new Map<string, EventItem["type"][]>();
    events.forEach((e) => {
      const key = format(e.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e.type);
    });
    return map;
  }, [events]);

  const selectedEvents = events.filter((e) => isSameDay(e.date, selectedDate));

  // Custom day render to show dots
  const modifiers = useMemo(() => {
    const hasTreino: Date[] = [];
    const hasEvento: Date[] = [];
    eventDates.forEach((types, key) => {
      const d = parseISO(key);
      if (types.includes("treino")) hasTreino.push(d);
      if (types.some((t) => t !== "treino")) hasEvento.push(d);
    });
    return { hasTreino, hasEvento };
  }, [eventDates]);

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Calendário" subtitle="Treinos e Eventos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        {/* Calendar */}
        <div className="px-3 pt-4">
          <div className="dojo-card p-2">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              month={month}
              onMonthChange={setMonth}
              locale={ptBR}
              className="p-2 pointer-events-auto w-full"
              modifiers={modifiers}
              modifiersClassNames={{
                hasTreino: "calendar-dot-treino",
                hasEvento: "calendar-dot-evento",
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="px-5 pt-3 flex gap-3 flex-wrap">
          {Object.entries(typeConfig).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("w-2.5 h-2.5 rounded-full", cfg.color)} />
              <span className="text-xs text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>

        {/* Selected day events */}
        <div className="px-5 pt-4">
          <h3 className="font-serif font-bold text-foreground text-sm mb-3">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>

          {selectedEvents.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <CalendarDays size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground text-xs">
                Nenhum evento neste dia.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const cfg = typeConfig[event.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={event.id}
                    className="dojo-card flex items-center gap-3 py-3 px-4"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.color)}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-foreground text-sm truncate">
                        {event.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {format(event.date, "HH:mm") !== "00:00"
                          ? format(event.date, "HH:mm")
                          : cfg.label}
                      </p>
                    </div>
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Calendario;
