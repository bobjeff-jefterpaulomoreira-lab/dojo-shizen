import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Calendar } from "lucide-react";

const Calendario = () => {
  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Calendário" subtitle="Eventos e Treinos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        <div className="px-5 pt-5">
          <div className="dojo-card text-center py-12">
            <Calendar size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-serif font-bold text-foreground text-sm mb-1">Nenhum evento agendado</p>
            <p className="text-muted-foreground text-xs">
              O calendário de treinos e eventos aparecerá aqui.
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Calendario;
