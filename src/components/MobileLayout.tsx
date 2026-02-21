import { ReactNode } from "react";
import brushRedBottom from "@/assets/brush-red-bottom.png";

interface MobileLayoutProps {
  children: ReactNode;
  showBrush?: boolean;
  bgImage?: string;
  darkOverlay?: boolean;
  className?: string;
}

const MobileLayout = ({ children, showBrush = true, bgImage, darkOverlay = true, className = "" }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted flex items-start justify-center">
      <div className={`dojo-container ${className}`} style={{ position: "relative" }}>
        {bgImage && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        {bgImage && darkOverlay && (
          <div className="absolute inset-0 z-[1]" style={{ backgroundColor: "rgba(0,0,0,0.45)" }} />
        )}
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
        {showBrush && (
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
            <img
              src={brushRedBottom}
              alt=""
              className="w-full h-32 object-cover object-bottom opacity-80"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileLayout;
