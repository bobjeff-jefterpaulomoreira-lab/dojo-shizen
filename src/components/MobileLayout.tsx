import { ReactNode } from "react";
import brushStrokes from "@/assets/brush-strokes.png";

interface MobileLayoutProps {
  children: ReactNode;
  showBrush?: boolean;
  bgImage?: string;
  className?: string;
}

const MobileLayout = ({ children, showBrush = true, bgImage, className = "" }: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-muted flex items-start justify-center">
      <div className={`dojo-container ${className}`}>
        {bgImage && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="dojo-overlay" />
          </>
        )}
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
        {showBrush && (
          <img
            src={brushStrokes}
            alt=""
            className="brush-bottom h-24 object-cover opacity-60"
          />
        )}
      </div>
    </div>
  );
};

export default MobileLayout;
