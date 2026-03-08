import { useState, useMemo } from "react";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { format, isSameDay, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Dumbbell, Megaphone, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type EventItem = {
  id: string;
  title: string;
  date: Date;
  type: "treino" | "evento" | "aviso" | "avaliacao";
};

const typeConfig = {
  treino: { label: "Treino", icon: Dumbbell, color: "bg-dojo-green text-white", dotColor: "bg-dojo-green" },
  evento: { label: "Evento", icon: CalendarDays, color: "bg-blue-500 text-white", dotColor: "bg-blue-500" },
  aviso: { label: "Aviso", icon: Megaphone, color: "bg-destructive text-white", dotColor: "bg-destructive" },
  avaliacao: { label: "Avaliação", icon: Star, color: "bg-dojo-yellow text-foreground", dotColor: "bg-dojo-yellow" },
};

const TIPOS = ["Aviso Geral", "Evento", "Avaliação", "Treino Especial"];

const Calendario = () => {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isProfessor = usuario?.role === "professor";

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [createOpen, setCreateOpen] = useState(false);

  // Form state
  const [tipo, setTipo] = useState("Evento");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [hora, setHora] = useState("19:00");
  const [submitting, setSubmitting] = useState(false);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

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
      items.push({ id: aula.id, title: "Treino", date: parseISO(aula.data), type: "treino" });
    });
    comunicados?.forEach((c) => {
      const mapTipo = (t: string): EventItem["type"] => {
        if (t === "Evento") return "evento";
        if (t === "Avaliação") return "avaliacao";
        return "aviso";
      };
      const dateStr = c.data_evento || c.created_at;
      if (dateStr) {
        items.push({ id: c.id, title: c.titulo, date: parseISO(dateStr), type: mapTipo(c.tipo) });
      }
    });
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [aulas, comunicados]);

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

  const modifiers = useMemo(() => {
    const hasTreino: Date[] = [];
    const hasEvento: Date[] = [];
    const hasAviso: Date[] = [];
    const hasAvaliacao: Date[] = [];
    eventDates.forEach((types, key) => {
      const d = parseISO(key);
      if (types.includes("treino")) hasTreino.push(d);
      if (types.includes("evento")) hasEvento.push(d);
      if (types.includes("aviso")) hasAviso.push(d);
      if (types.includes("avaliacao")) hasAvaliacao.push(d);
    });
    return { hasTreino, hasEvento, hasAviso, hasAvaliacao };
  }, [eventDates]);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    // If professor and clicking a day, offer to create
  };

  const openCreateForDay = () => {
    setTipo("Evento");
    setTitulo("");
    setDescricao("");
    setHora("19:00");
    setCreateOpen(true);
  };

  const handleCreateEvent = async () => {
    if (!titulo.trim()) {
      toast({ title: "Título obrigatório", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const dateTime = new Date(selectedDate);
      const [h, m] = hora.split(":").map(Number);
      dateTime.setHours(h, m, 0, 0);

      const { error } = await supabase.from("comunicados").insert({
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        data_evento: dateTime.toISOString(),
        professor_id: usuario!.id,
      });
      if (error) throw error;
      toast({ title: "Evento criado!" });
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["comunicados-calendario"] });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Calendário" subtitle="Treinos e Eventos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-24 bg-dojo-paper">
        <div className="px-3 pt-4">
          <div className="dojo-card p-2">
            <CalendarUI
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && handleDayClick(d)}
              month={month}
              onMonthChange={setMonth}
              locale={ptBR}
              className="p-2 pointer-events-auto w-full"
              modifiers={modifiers}
              modifiersClassNames={{
                hasTreino: "calendar-dot-treino",
                hasEvento: "calendar-dot-evento",
                hasAviso: "calendar-dot-aviso",
                hasAvaliacao: "calendar-dot-avaliacao",
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

        {/* Selected day */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-bold text-foreground text-sm">
              {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            {isProfessor && (
              <button onClick={openCreateForDay} className="dojo-btn text-xs py-1.5 px-3">
                <Plus size={14} /> Criar
              </button>
            )}
          </div>

          {selectedEvents.length === 0 ? (
            <div className="dojo-card text-center py-8">
              <CalendarDays size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground text-xs">Nenhum evento neste dia.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const cfg = typeConfig[event.type];
                const Icon = cfg.icon;
                return (
                  <div key={event.id} className="dojo-card flex items-center gap-3 py-3 px-4">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.color)}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-foreground text-sm truncate">{event.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {format(event.date, "HH:mm") !== "00:00" ? format(event.date, "HH:mm") : cfg.label}
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

      {/* Create event dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Criar Evento — {format(selectedDate, "dd/MM/yyyy")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background z-50">
                  {TIPOS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome do evento" />
            </div>
            <div>
              <Label>Hora</Label>
              <Input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Detalhes..." rows={3} />
            </div>
            <button onClick={handleCreateEvent} disabled={submitting} className="dojo-btn w-full text-sm">
              {submitting ? "Criando..." : "Criar Evento"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
};

export default Calendario;
