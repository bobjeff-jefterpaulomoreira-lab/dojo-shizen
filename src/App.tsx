import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import QRCodePage from "./pages/QRCodePage";
import ScanQRCode from "./pages/ScanQRCode";
import Evolution from "./pages/Evolution";
import Assessment from "./pages/Assessment";
import AttendanceReport from "./pages/AttendanceReport";
import StudentList from "./pages/StudentList";
import RegisterStudent from "./pages/RegisterStudent";
import Comunicados from "./pages/Comunicados";
import Calendario from "./pages/Calendario";
import Profile from "./pages/Profile";
import Notificacoes from "./pages/Notificacoes";
import NotificacoesAluno from "./pages/NotificacoesAluno";
import MeusDocumentos from "./pages/MeusDocumentos";
import NotFound from "./pages/NotFound";
import RelatorioAulas from "./pages/RelatorioAulas";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (requiredRole && usuario?.role !== requiredRole) {
    return <Navigate to={usuario?.role === "professor" ? "/sensei" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

const AuthRedirect = () => {
  const { user, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (user && usuario) {
    return <Navigate to={usuario.role === "professor" ? "/sensei" : "/dashboard"} replace />;
  }

  return <Login />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AuthRedirect />} />
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="aluno"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/evolucao" element={<ProtectedRoute requiredRole="aluno"><Evolution /></ProtectedRoute>} />
            <Route path="/presenca" element={<ProtectedRoute requiredRole="aluno"><ScanQRCode /></ProtectedRoute>} />
            <Route path="/presenca/relatorio" element={<ProtectedRoute requiredRole="aluno"><AttendanceReport /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/sensei" element={<ProtectedRoute requiredRole="professor"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/sensei/qrcode" element={<ProtectedRoute requiredRole="professor"><QRCodePage /></ProtectedRoute>} />
            <Route path="/sensei/alunos" element={<ProtectedRoute requiredRole="professor"><StudentList /></ProtectedRoute>} />
            <Route path="/sensei/cadastrar-aluno" element={<ProtectedRoute requiredRole="professor"><RegisterStudent /></ProtectedRoute>} />
            <Route path="/sensei/avaliacao" element={<ProtectedRoute requiredRole="professor"><Assessment /></ProtectedRoute>} />
            <Route path="/sensei/relatorio" element={<ProtectedRoute requiredRole="professor"><AttendanceReport /></ProtectedRoute>} />
            <Route path="/sensei/comunicados" element={<ProtectedRoute requiredRole="professor"><Comunicados /></ProtectedRoute>} />
            <Route path="/sensei/calendario" element={<ProtectedRoute requiredRole="professor"><Calendario /></ProtectedRoute>} />
            <Route path="/sensei/notificacoes" element={<ProtectedRoute requiredRole="professor"><Notificacoes /></ProtectedRoute>} />
            <Route path="/sensei/aulas" element={<ProtectedRoute requiredRole="professor"><RelatorioAulas /></ProtectedRoute>} />
            <Route path="/comunicados" element={<ProtectedRoute requiredRole="aluno"><Comunicados /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute requiredRole="aluno"><Calendario /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute requiredRole="aluno"><NotificacoesAluno /></ProtectedRoute>} />
            <Route path="/documentos" element={<ProtectedRoute requiredRole="aluno"><MeusDocumentos /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
