import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { Bell } from "lucide-react";

const Comunicados = () => {
  return (
    <MobileLayout showBrush={true} showNav={true} fullWidth={true}>
      <PageHeader title="Comunicados" subtitle="Eventos e Avisos" showBack={true} />

      <div className="flex-1 overflow-y-auto pb-20 bg-dojo-paper">
        <div className="px-5 pt-5">
          <div className="dojo-card text-center py-12">
            <Bell size={40} className="mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-serif font-bold text-foreground text-sm mb-1">Nenhum comunicado</p>
            <p className="text-muted-foreground text-xs">
              Os comunicados e avisos do dojo aparecerão aqui.
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Comunicados;
