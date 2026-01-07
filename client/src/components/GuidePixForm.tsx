import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Shield, AlertTriangle, CheckCircle2, Wallet, Info } from "lucide-react";

interface GuidePixFormProps {
  onSuccess?: () => void;
}

export default function GuidePixForm({ onSuccess }: GuidePixFormProps) {
  const [documentType, setDocumentType] = useState<"cpf" | "cnpj">("cpf");
  const [documentNumber, setDocumentNumber] = useState("");
  const [pixKeyType, setPixKeyType] = useState<"cpf" | "cnpj" | "email" | "phone" | "random">("cpf");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyHolderName, setPixKeyHolderName] = useState("");
  
  // Terms acceptance
  const [acceptedIntermediation, setAcceptedIntermediation] = useState(false);
  const [acceptedPayout, setAcceptedPayout] = useState(false);
  const [acceptedContestation, setAcceptedContestation] = useState(false);

  const utils = trpc.useUtils();
  
  const { data: verification, isLoading: loadingVerification } = trpc.guides.getMyVerification.useQuery();
  
  const saveMutation = trpc.guides.savePixData.useMutation({
    onSuccess: () => {
      utils.guides.getMyVerification.invalidate();
      toast.success("Dados PIX salvos com sucesso!");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar dados PIX");
    },
  });

  // Format CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // Format CNPJ: 00.000.000/0000-00
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 14);
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  // Format phone: (00) 00000-0000
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  };

  const handleDocumentChange = (value: string) => {
    if (documentType === "cpf") {
      setDocumentNumber(formatCPF(value));
    } else {
      setDocumentNumber(formatCNPJ(value));
    }
  };

  const handlePixKeyChange = (value: string) => {
    if (pixKeyType === "cpf") {
      setPixKey(formatCPF(value));
    } else if (pixKeyType === "cnpj") {
      setPixKey(formatCNPJ(value));
    } else if (pixKeyType === "phone") {
      setPixKey(formatPhone(value));
    } else {
      setPixKey(value);
    }
  };

  const getPixKeyPlaceholder = () => {
    switch (pixKeyType) {
      case "cpf": return "000.000.000-00";
      case "cnpj": return "00.000.000/0000-00";
      case "email": return "seu@email.com";
      case "phone": return "(00) 00000-0000";
      case "random": return "Chave aleatória";
    }
  };

  const validateForm = () => {
    const cleanDoc = documentNumber.replace(/\D/g, "");
    const cleanPixKey = pixKey.replace(/\D/g, "");
    
    if (documentType === "cpf" && cleanDoc.length !== 11) {
      toast.error("CPF deve ter 11 dígitos");
      return false;
    }
    if (documentType === "cnpj" && cleanDoc.length !== 14) {
      toast.error("CNPJ deve ter 14 dígitos");
      return false;
    }
    if (!pixKey) {
      toast.error("Informe a chave PIX");
      return false;
    }
    if (!pixKeyHolderName) {
      toast.error("Informe o nome do titular da chave PIX");
      return false;
    }
    
    // Validate PIX key matches document for CPF/CNPJ keys
    if ((pixKeyType === "cpf" || pixKeyType === "cnpj") && cleanPixKey !== cleanDoc) {
      toast.error("A chave PIX deve pertencer ao mesmo CPF/CNPJ cadastrado");
      return false;
    }
    
    if (!acceptedIntermediation || !acceptedPayout || !acceptedContestation) {
      toast.error("Você deve aceitar todos os termos para continuar");
      return false;
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    saveMutation.mutate({
      documentType,
      documentNumber: documentNumber.replace(/\D/g, ""),
      pixKeyType,
      pixKey: pixKeyType === "email" ? pixKey : pixKey.replace(/\D/g, ""),
      pixKeyHolderName,
      acceptedIntermediationTerms: acceptedIntermediation,
      acceptedPayoutTerms: acceptedPayout,
      acceptedContestationPolicy: acceptedContestation,
    });
  };

  if (loadingVerification) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already has PIX data configured
  if (verification?.pixKey && verification?.pixKeyVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Dados PIX Configurados
          </CardTitle>
          <CardDescription>
            Seus dados para recebimento via PIX estão configurados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tipo de Chave:</span>
                <p className="font-medium capitalize">{verification.pixKeyType}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Chave PIX:</span>
                <p className="font-medium">
                  {verification.pixKeyType === "email" 
                    ? verification.pixKey 
                    : "•••••" + verification.pixKey?.slice(-4)}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Titular:</span>
                <p className="font-medium">{verification.pixKeyHolderName}</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => {
            // Reset to allow editing
            setDocumentNumber(verification.documentNumber || "");
            setPixKey("");
            setPixKeyHolderName(verification.pixKeyHolderName || "");
          }}>
            Atualizar Dados PIX
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Dados para Recebimento via PIX
        </CardTitle>
        <CardDescription>
          Configure seus dados para receber os pagamentos das expedições
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              Os pagamentos das expedições são realizados exclusivamente via PIX, 
              após 2 dias úteis da conclusão da trilha (período de contestação).
            </AlertDescription>
          </Alert>

          {/* Document Type */}
          <div className="space-y-2">
            <Label>Tipo de Pessoa</Label>
            <Select value={documentType} onValueChange={(v: "cpf" | "cnpj") => {
              setDocumentType(v);
              setDocumentNumber("");
              if (v === "cpf" && pixKeyType === "cnpj") setPixKeyType("cpf");
              if (v === "cnpj" && pixKeyType === "cpf") setPixKeyType("cnpj");
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">Pessoa Física (CPF)</SelectItem>
                <SelectItem value="cnpj">Pessoa Jurídica (CNPJ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Number */}
          <div className="space-y-2">
            <Label>{documentType === "cpf" ? "CPF" : "CNPJ"}</Label>
            <Input
              value={documentNumber}
              onChange={(e) => handleDocumentChange(e.target.value)}
              placeholder={documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
            />
          </div>

          {/* PIX Key Type */}
          <div className="space-y-2">
            <Label>Tipo de Chave PIX</Label>
            <Select value={pixKeyType} onValueChange={(v: "cpf" | "cnpj" | "email" | "phone" | "random") => {
              setPixKeyType(v);
              setPixKey("");
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="random">Chave Aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PIX Key */}
          <div className="space-y-2">
            <Label>Chave PIX</Label>
            <Input
              value={pixKey}
              onChange={(e) => handlePixKeyChange(e.target.value)}
              placeholder={getPixKeyPlaceholder()}
            />
            {(pixKeyType === "cpf" || pixKeyType === "cnpj") && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="w-3 h-3" />
                A chave PIX deve pertencer ao mesmo {documentType.toUpperCase()} cadastrado
              </p>
            )}
          </div>

          {/* PIX Key Holder Name */}
          <div className="space-y-2">
            <Label>Nome do Titular da Chave PIX</Label>
            <Input
              value={pixKeyHolderName}
              onChange={(e) => setPixKeyHolderName(e.target.value)}
              placeholder="Nome completo conforme cadastro no banco"
            />
          </div>

          {/* Terms */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Termos e Condições
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="intermediation"
                  checked={acceptedIntermediation}
                  onCheckedChange={(checked) => setAcceptedIntermediation(checked === true)}
                />
                <label htmlFor="intermediation" className="text-sm leading-relaxed cursor-pointer">
                  Aceito que o Trekko atue como intermediador dos pagamentos, retendo o valor até a conclusão da expedição.
                </label>
              </div>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="payout"
                  checked={acceptedPayout}
                  onCheckedChange={(checked) => setAcceptedPayout(checked === true)}
                />
                <label htmlFor="payout" className="text-sm leading-relaxed cursor-pointer">
                  Entendo que o repasse será realizado <strong>exclusivamente via PIX</strong>, após <strong>2 dias úteis</strong> da conclusão da trilha, 
                  descontando a <strong>taxa de 4% da plataforma</strong> e as taxas do gateway de pagamento.
                </label>
              </div>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="contestation"
                  checked={acceptedContestation}
                  onCheckedChange={(checked) => setAcceptedContestation(checked === true)}
                />
                <label htmlFor="contestation" className="text-sm leading-relaxed cursor-pointer">
                  Estou ciente da política de contestação: o usuário pode abrir disputa em até 2 dias úteis após a conclusão, 
                  e o repasse será suspenso até a resolução da disputa.
                </label>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={saveMutation.isPending || !acceptedIntermediation || !acceptedPayout || !acceptedContestation}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Dados PIX"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
