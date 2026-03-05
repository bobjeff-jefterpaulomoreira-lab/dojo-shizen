import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import MobileLayout from "@/components/MobileLayout";
import PageHeader from "@/components/PageHeader";
import { CreditCard, Award, Upload, Download, ExternalLink, Trash2, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Documento {
  id: string;
  usuario_id: string;
  tipo: string;
  nome: string;
  arquivo_url: string;
  created_at: string;
}

const MeusDocumentos = () => {
  const { user } = useAuth();
  const [carteirinha, setCarteirinha] = useState<Documento | null>(null);
  const [certificados, setCertificados] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocumentos = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("documentos")
      .select("*")
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const docs = data as Documento[];
      setCarteirinha(docs.find((d) => d.tipo === "carteirinha") || null);
      setCertificados(docs.filter((d) => d.tipo === "certificado"));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocumentos();
  }, [user]);

  const uploadFile = async (file: File, tipo: "carteirinha" | "certificado") => {
    if (!user) return;
    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/${tipo}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documentos")
        .getPublicUrl(fileName);

      // If replacing carteirinha, delete old record
      if (tipo === "carteirinha" && carteirinha) {
        await supabase.from("documentos").delete().eq("id", carteirinha.id);
        // Delete old file from storage
        const oldPath = carteirinha.arquivo_url.split("/documentos/")[1];
        if (oldPath) {
          await supabase.storage.from("documentos").remove([decodeURIComponent(oldPath)]);
        }
      }

      const { error: dbError } = await supabase.from("documentos").insert({
        usuario_id: user.id,
        tipo,
        nome: file.name,
        arquivo_url: urlData.publicUrl,
      });

      if (dbError) throw dbError;

      toast({ title: "Sucesso", description: `${tipo === "carteirinha" ? "Carteirinha" : "Certificado"} enviado com sucesso!` });
      fetchDocumentos();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocumento = async (doc: Documento) => {
    try {
      const path = doc.arquivo_url.split("/documentos/")[1];
      if (path) {
        await supabase.storage.from("documentos").remove([decodeURIComponent(path)]);
      }
      await supabase.from("documentos").delete().eq("id", doc.id);
      toast({ title: "Removido", description: "Documento removido com sucesso." });
      fetchDocumentos();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  };

  const handleFileSelect = (tipo: "carteirinha" | "certificado") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = tipo === "carteirinha" ? "image/*" : ".pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: "Erro", description: "Arquivo muito grande. Máximo 10MB.", variant: "destructive" });
          return;
        }
        uploadFile(file, tipo);
      }
    };
    input.click();
  };

  if (loading) {
    return (
      <MobileLayout showBrush showNav fullWidth>
        <PageHeader title="Meus Documentos" showBack />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBrush showNav fullWidth>
      <PageHeader title="Meus Documentos" showBack />

      <div className="flex-1 overflow-y-auto pb-28 bg-dojo-paper">
        <div className="px-5 pt-5 space-y-6">
          {/* Carteirinha Section */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-serif font-bold text-foreground mb-3">
              <CreditCard size={20} className="text-primary" />
              Carteirinha IKO Matsushima
            </h2>

            {carteirinha ? (
              <div className="space-y-3">
                <div className="dojo-card p-0 overflow-hidden relative">
                  <img
                    src={carteirinha.arquivo_url}
                    alt="Carteirinha"
                    className="w-full h-auto rounded-xl"
                  />
                  <a
                    href={carteirinha.arquivo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 bg-foreground/70 text-background text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm"
                  >
                    <ExternalLink size={14} /> Ver
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href={carteirinha.arquivo_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dojo-card flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground"
                  >
                    <Download size={16} /> Baixar
                  </a>
                  <button
                    onClick={() => handleFileSelect("carteirinha")}
                    disabled={uploading}
                    className="dojo-card flex items-center justify-center gap-2 py-3 text-sm font-medium text-foreground"
                  >
                    <Upload size={16} /> Atualizar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleFileSelect("carteirinha")}
                disabled={uploading}
                className="dojo-card w-full flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground border-2 border-dashed border-border"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <>
                    <CreditCard size={32} />
                    <span className="text-sm">Enviar carteirinha</span>
                    <span className="text-xs">Toque para fazer upload da imagem</span>
                  </>
                )}
              </button>
            )}
          </section>

          {/* Certificados Section */}
          <section>
            <h2 className="flex items-center gap-2 text-base font-serif font-bold text-foreground mb-3">
              <Award size={20} className="text-primary" />
              Certificados de Graduação
            </h2>

            {certificados.length > 0 ? (
              <div className="space-y-3">
                {certificados.map((cert) => (
                  <div key={cert.id} className="dojo-card flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{cert.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(cert.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={cert.arquivo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-muted"
                      >
                        <ExternalLink size={16} className="text-muted-foreground" />
                      </a>
                      <button
                        onClick={() => deleteDocumento(cert)}
                        className="p-2 rounded-lg hover:bg-destructive/10"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dojo-card flex flex-col items-center py-10 text-muted-foreground">
                <Award size={40} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum cadastrado</p>
                <p className="text-xs">Seus certificados aparecem aqui</p>
              </div>
            )}

            <button
              onClick={() => handleFileSelect("certificado")}
              disabled={uploading}
              className="dojo-btn w-full mt-3"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              Adicionar certificado
            </button>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MeusDocumentos;
