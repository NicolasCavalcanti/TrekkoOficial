import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Loader2, User, Shield, CheckCircle, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
}

type UserType = "trekker" | "guide" | null;
type GuideStep = 1 | 2;

export default function RegisterModal({ open, onOpenChange, onSwitchToLogin }: RegisterModalProps) {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // User type selection
  const [userType, setUserType] = useState<UserType>(null);

  // Guide-specific state
  const [guideStep, setGuideStep] = useState<GuideStep>(1);
  const [cadasturValidated, setCadasturValidated] = useState(false);
  const [cadasturNumber, setCadasturNumber] = useState("");
  const [cadasturData, setCadasturData] = useState<{
    name: string | null;
    uf: string | null;
    city: string | null;
    phone: string | null;
    email: string | null;
    languages: string[] | null;
    categories: string[] | null;
  } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [bio, setBio] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const validateCadasturMutation = trpc.auth.validateCadastur.useMutation({
    onSuccess: (data) => {
      setCadasturValidated(true);
      setCadasturData(data.guideData as any);
      toast.success("CADASTUR validado com sucesso!");
      // Pre-fill name and email if available from CADASTUR data
      if (data.guideData?.name) {
        setName(data.guideData.name);
      }
      if (data.guideData?.email) {
        setEmail(data.guideData.email);
      }
    },
    onError: (error) => {
      setErrors({ cadastur: error.message });
      toast.error(error.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      toast.success("Conta criada com sucesso!");
      await utils.auth.me.invalidate();
      onOpenChange(false);
      resetForm();
      // Force page reload to ensure auth state is fully updated
      window.location.href = "/perfil";
    },
    onError: (error) => {
      if (error.message.includes("E-mail")) {
        setErrors({ email: error.message });
      } else if (error.message.includes("CADASTUR")) {
        setErrors({ cadastur: error.message });
      } else {
        toast.error(error.message);
      }
    },
  });

  const resetForm = () => {
    setUserType(null);
    setGuideStep(1);
    setCadasturValidated(false);
    setCadasturNumber("");
    setCadasturData(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setBio("");
    setAcceptedTerms(false);
    setErrors({});
  };

  // Validation functions
  const validateName = (value: string) => {
    if (!value.trim()) return "Nome é obrigatório";
    if (value.trim().length < 3) return "Nome deve ter pelo menos 3 caracteres";
    return "";
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return "E-mail é obrigatório";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "E-mail inválido";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Senha é obrigatória";
    if (value.length < 8) return "Senha deve ter pelo menos 8 caracteres";
    if (!/[a-zA-Z]/.test(value)) return "Senha deve conter pelo menos 1 letra";
    if (!/[0-9]/.test(value)) return "Senha deve conter pelo menos 1 número";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Confirmação de senha é obrigatória";
    if (value !== password) return "As senhas não coincidem";
    return "";
  };

  const validateCadasturNumber = (value: string) => {
    if (!value.trim()) return "Número CADASTUR é obrigatório";
    if (value.trim().length < 6) return "Número CADASTUR inválido";
    return "";
  };

  // Check if form is valid
  const isTrekkerFormValid = () => {
    return (
      !validateName(name) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validateConfirmPassword(confirmPassword) &&
      acceptedTerms
    );
  };

  const isGuideStep1Valid = () => {
    return cadasturValidated;
  };

  const isGuideStep2Valid = () => {
    return (
      !validateName(name) &&
      !validateEmail(email) &&
      !validatePassword(password) &&
      !validateConfirmPassword(confirmPassword) &&
      acceptedTerms
    );
  };

  // Handle CADASTUR validation
  const handleValidateCadastur = () => {
    const error = validateCadasturNumber(cadasturNumber);
    if (error) {
      setErrors({ cadastur: error });
      return;
    }
    setErrors({});
    validateCadasturMutation.mutate({ cadasturNumber });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmPasswordError = validateConfirmPassword(confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    
    if (!acceptedTerms) newErrors.terms = "Você deve aceitar os termos";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    registerMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      userType: userType!,
      cadasturNumber: userType === "guide" ? cadasturNumber : undefined,
    });
  };

  // Handle back navigation
  const handleBack = () => {
    if (userType === "guide" && guideStep === 2) {
      setGuideStep(1);
    } else {
      setUserType(null);
      resetForm();
    }
  };

  // Render user type selection
  const renderUserTypeSelection = () => (
    <div className="space-y-6">
      <DialogDescription className="text-center text-muted-foreground">
        Escolha o tipo de conta que deseja criar
      </DialogDescription>

      <div className="grid grid-cols-1 gap-4">
        <button
          type="button"
          onClick={() => setUserType("trekker")}
          className="flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">Sou Trekker</h3>
            <p className="text-sm text-muted-foreground">
              Quero explorar trilhas e participar de expedições
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setUserType("guide")}
          className="flex items-center gap-4 p-4 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
        >
          <div className="w-12 h-12 rounded-full bg-earth/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-earth" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">Sou Guia (CADASTUR)</h3>
            <p className="text-sm text-muted-foreground">
              Sou guia certificado e quero criar expedições
            </p>
          </div>
        </button>
      </div>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Fazer login
          </button>
        </p>
      )}
    </div>
  );

  // Render Trekker registration form
  const renderTrekkerForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          placeholder="Seu nome completo"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          placeholder="seu@email.com"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            placeholder="Mínimo 8 caracteres"
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
            }}
            placeholder="Repita a senha"
            className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => {
            setAcceptedTerms(checked === true);
            if (errors.terms) setErrors({ ...errors, terms: "" });
          }}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
          Aceito os{" "}
          <a href="/termos" className="text-primary hover:underline" target="_blank">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="/privacidade" className="text-primary hover:underline" target="_blank">
            Política de Privacidade
          </a>
        </Label>
      </div>
      {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={!isTrekkerFormValid() || registerMutation.isPending}
          className="flex-1"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </div>
    </form>
  );

  // Render Guide Step 1 - CADASTUR validation
  const renderGuideStep1 = () => (
    <div className="space-y-4">
      <DialogDescription className="text-muted-foreground">
        Primeiro, precisamos validar seu número CADASTUR para confirmar sua certificação como guia.
      </DialogDescription>

      <div className="space-y-2">
        <Label htmlFor="cadastur">Número CADASTUR</Label>
        <div className="flex gap-2">
          <Input
            id="cadastur"
            type="text"
            value={cadasturNumber}
            onChange={(e) => {
              setCadasturNumber(e.target.value.toUpperCase());
              setCadasturValidated(false);
              if (errors.cadastur) setErrors({ ...errors, cadastur: "" });
            }}
            placeholder="Digite seu número CADASTUR"
            className={errors.cadastur ? "border-destructive" : ""}
            disabled={cadasturValidated}
          />
          {!cadasturValidated && (
            <Button
              type="button"
              onClick={handleValidateCadastur}
              disabled={validateCadasturMutation.isPending || !cadasturNumber.trim()}
            >
              {validateCadasturMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                "Validar"
              )}
            </Button>
          )}
        </div>
        {errors.cadastur && <p className="text-sm text-destructive">{errors.cadastur}</p>}
      </div>

      {cadasturValidated && cadasturData && (
        <div className="space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Guia validado!</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome:</span>
              <span className="font-medium text-foreground">{cadasturData.name}</span>
            </div>
            {cadasturData.city && cadasturData.uf && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Localização:</span>
                <span className="font-medium text-foreground">{cadasturData.city}, {cadasturData.uf}</span>
              </div>
            )}
            {cadasturData.languages && cadasturData.languages.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idiomas:</span>
                <span className="font-medium text-foreground">{cadasturData.languages.join(", ")}</span>
              </div>
            )}
            {cadasturData.categories && cadasturData.categories.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Categorias:</span>
                <span className="font-medium text-foreground text-xs">{cadasturData.categories.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={() => setGuideStep(2)}
          disabled={!isGuideStep1Valid()}
          className="flex-1"
        >
          Próximo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render Guide Step 2 - Account details
  const renderGuideStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary mb-4">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">CADASTUR: {cadasturNumber}</span>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          placeholder="Seu nome completo"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          placeholder="seu@email.com"
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: "" });
            }}
            placeholder="Mínimo 8 caracteres"
            className={errors.password ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
            }}
            placeholder="Repita a senha"
            className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio (opcional)</Label>
        <Input
          id="bio"
          type="text"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Conte um pouco sobre você como guia"
        />
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => {
            setAcceptedTerms(checked === true);
            if (errors.terms) setErrors({ ...errors, terms: "" });
          }}
          className="mt-1"
        />
        <Label htmlFor="terms" className="text-sm font-normal leading-relaxed">
          Aceito os{" "}
          <a href="/termos" className="text-primary hover:underline" target="_blank">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="/privacidade" className="text-primary hover:underline" target="_blank">
            Política de Privacidade
          </a>
        </Label>
      </div>
      {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => setGuideStep(1)} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={!isGuideStep2Valid() || registerMutation.isPending}
          className="flex-1"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </div>
    </form>
  );

  // Determine what to render
  const renderContent = () => {
    if (!userType) {
      return renderUserTypeSelection();
    }

    if (userType === "trekker") {
      return renderTrekkerForm();
    }

    if (userType === "guide") {
      if (guideStep === 1) {
        return renderGuideStep1();
      }
      return renderGuideStep2();
    }

    return null;
  };

  // Get dialog title
  const getTitle = () => {
    if (!userType) return "Criar conta";
    if (userType === "trekker") return "Cadastro de Trekker";
    if (userType === "guide") {
      if (guideStep === 1) return "Validação CADASTUR";
      return "Dados da conta";
    }
    return "Criar conta";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
