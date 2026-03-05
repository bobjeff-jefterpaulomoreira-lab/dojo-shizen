import { ReactNode } from "react";
import brushRedBottom from "@/assets/brush-red-bottom.png";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/lib/auth";

interface MobileLayoutProps {
  children: ReactNode;
  showBrush?: boolean;
  bgImage?: string;
  darkOverlay?: boolean;
  className?: string;
  showNav?: boolean;
  fullWidth?: boolean;
}

const MobileLayout = ({
  children,
  showBrush = true,
  bgImage,
  darkOverlay = true,
  className = "",
  showNav = false,
  fullWidth = false,
}: MobileLayoutProps) => {
  const { usuario } = useAuth();
  const role = usuario?.role === "professor" ? "professor" : "aluno";

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center">
      {/* Desktop top nav - hidden on mobile */}
      {showNav && (
        <div className="hidden md:block w-full sticky top-0 z-50">
          <TopNav />
        </div>
      )}

      <div
        className={`${fullWidth ? "w-full" : "w-full max-w-[430px] md:max-w-full"} min-h-[calc(100vh-3.5rem)] md:min-h-0 relative overflow-hidden flex-1 ${className}`}
        style={{ position: "relative" }}
      >
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        {bgImage && darkOverlay && (
          <div className="absolute inset-0 z-[1]" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
        )}
        <div className="relative z-10 min-h-screen md:min-h-0 flex flex-col flex-1">
          {children}
        </div>
        {showBrush && (
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <img
              src={brushRedBottom}
              alt=""
              className="w-full h-12 object-cover object-bottom opacity-40"
            />
          </div>
        )}
      </div>

      {/* Mobile bottom nav - hidden on desktop */}
      {showNav && (
        <div className="md:hidden w-full max-w-[430px] sticky bottom-0 z-30">
          <BottomNav role={role} />
        </div>
      )}
    </div>
  );
};

export default MobileLayout;
