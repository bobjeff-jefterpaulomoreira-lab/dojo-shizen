import dojoInterior from "@/assets/dojo-interior.jpg";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  bgImage?: string;
}

const PageHeader = ({ title, subtitle, showBack = false, bgImage }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-b-3xl">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage || dojoInterior})` }}
      />
      <div className="absolute inset-0" style={{ backgroundColor: "hsla(0, 100%, 27%, 0.75)" }} />
      <div className="relative z-10 px-5 pt-5 pb-6">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-primary-foreground/90 mb-3"
          >
            <ArrowLeft size={18} />
            <span className="text-xs font-medium">Voltar</span>
          </button>
        )}
        <h1 className="text-xl font-serif font-bold text-primary-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-primary-foreground/70 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

export default PageHeader;
