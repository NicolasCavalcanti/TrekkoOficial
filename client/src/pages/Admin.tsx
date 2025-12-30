import { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { 
  LayoutDashboard, Mountain, Calendar, Users, DollarSign, 
  Activity, Settings, Database, Shield, Loader2, AlertCircle,
  CheckCircle, Info, AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// RBAC Permissions
const PERMISSIONS = {
  DASHBOARD: 'DASHBOARD',
  GUIAS: 'GUIAS',
  TRILHAS: 'TRILHAS',
  EXPEDICOES: 'EXPEDICOES',
  FINANCEIRO: 'FINANCEIRO',
  CMS: 'CMS',
  INTEGRACOES: 'INTEGRACOES',
  CONFIGURACOES: 'CONFIGURACOES',
};

export default function Admin() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Check admin access
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-2">Acesso Admin</h2>
              <p className="text-muted-foreground mb-6">
                Faça login com uma conta de administrador
              </p>
              <Button asChild className="w-full">
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center bg-muted/30">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-2">Acesso negado</h2>
              <p className="text-muted-foreground mb-6">
                Você não tem permissão para acessar esta área
              </p>
              <Button onClick={() => navigate("/")}>Voltar ao início</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">Painel Admin</h1>
              <p className="text-muted-foreground">Gerencie trilhas, expedições e usuários</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
              <Shield className="w-4 h-4" />
              Administrador
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="dashboard" data-permission={PERMISSIONS.DASHBOARD}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="expedicoes" data-permission={PERMISSIONS.EXPEDICOES}>
                <Calendar className="w-4 h-4 mr-2" />
                Expedições
              </TabsTrigger>
              <TabsTrigger value="trilhas" data-permission={PERMISSIONS.TRILHAS}>
                <Mountain className="w-4 h-4 mr-2" />
                Trilhas
              </TabsTrigger>
              <TabsTrigger value="integracoes" data-permission={PERMISSIONS.INTEGRACOES}>
                <Database className="w-4 h-4 mr-2" />
                Integrações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AdminDashboard />
            </TabsContent>

            <TabsContent value="expedicoes">
              <AdminExpeditions />
            </TabsContent>

            <TabsContent value="trilhas">
              <AdminTrails />
            </TabsContent>

            <TabsContent value="integracoes">
              <AdminIntegrations />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AdminDashboard() {
  const { data: metrics, isLoading: metricsLoading } = trpc.admin.metrics.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.admin.events.useQuery({ limit: 10 });

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Trilhas"
          value={metrics?.trails || 0}
          icon={Mountain}
          loading={metricsLoading}
        />
        <MetricCard
          title="Expedições"
          value={metrics?.expeditions || 0}
          icon={Calendar}
          loading={metricsLoading}
        />
        <MetricCard
          title="Guias"
          value={metrics?.guides || 0}
          icon={Users}
          loading={metricsLoading}
        />
        <MetricCard
          title="Reservas"
          value={metrics?.reservations || 0}
          icon={Activity}
          loading={metricsLoading}
        />
        <MetricCard
          title="Receita"
          value={`R$ ${(metrics?.revenue || 0).toFixed(2)}`}
          icon={DollarSign}
          loading={metricsLoading}
        />
      </div>

      {/* System Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Últimos eventos do sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : events && events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className={`p-1 rounded ${
                    event.severity === 'error' ? 'bg-red-100 text-red-600' :
                    event.severity === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {event.severity === 'error' ? <AlertCircle className="w-4 h-4" /> :
                     event.severity === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                     <Info className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-muted">{event.type}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum evento registrado</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <QuickActionButton label="Criar trilha" icon={Mountain} />
            <QuickActionButton label="Criar expedição" icon={Calendar} />
            <QuickActionButton label="Gerenciar guias" icon={Users} />
            <SeedDataButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, loading }: { title: string; value: number | string; icon: any; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary mt-1" />
            ) : (
              <p className="font-heading text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ label, icon: Icon }: { label: string; icon: any }) {
  return (
    <Button variant="outline" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

function SeedDataButton() {
  const utils = trpc.useUtils();
  const seedMutation = trpc.admin.seedData.useMutation({
    onSuccess: () => {
      utils.admin.metrics.invalidate();
      utils.trails.list.invalidate();
      toast.success("Dados de exemplo carregados!");
    },
    onError: () => {
      toast.error("Erro ao carregar dados");
    },
  });

  return (
    <Button 
      variant="outline" 
      onClick={() => seedMutation.mutate()}
      disabled={seedMutation.isPending}
    >
      {seedMutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <Database className="w-4 h-4 mr-2" />
      )}
      Carregar dados exemplo
    </Button>
  );
}

function AdminExpeditions() {
  const { data, isLoading } = trpc.admin.expeditions.list.useQuery({ page: 1, limit: 20 });
  const utils = trpc.useUtils();

  const updateMutation = trpc.admin.expeditions.update.useMutation({
    onSuccess: () => {
      utils.admin.expeditions.list.invalidate();
      toast.success("Expedição atualizada!");
    },
  });

  const deleteMutation = trpc.admin.expeditions.delete.useMutation({
    onSuccess: () => {
      utils.admin.expeditions.list.invalidate();
      toast.success("Expedição removida!");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Expedições</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.expeditions && data.expeditions.length > 0 ? (
          <div className="space-y-4">
            {data.expeditions.map((expedition) => (
              <div key={expedition.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">{expedition.title || `Expedição #${expedition.id}`}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(expedition.startDate), "dd/MM/yyyy")} • 
                    {(expedition.capacity || 10) - (expedition.enrolledCount || 0)}/{expedition.capacity || 10} vagas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    expedition.status === 'active' ? 'bg-green-100 text-green-700' :
                    expedition.status === 'full' ? 'bg-blue-100 text-blue-700' :
                    expedition.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {expedition.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateMutation.mutate({ 
                      id: expedition.id, 
                      status: expedition.status === 'active' ? 'cancelled' : 'active' 
                    })}
                  >
                    {expedition.status === 'active' || expedition.status === 'full' ? 'Cancelar' : 'Ativar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate({ id: expedition.id })}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhuma expedição encontrada</p>
        )}
      </CardContent>
    </Card>
  );
}

function AdminTrails() {
  const { data, isLoading } = trpc.trails.list.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Trilhas</CardTitle>
        <Button onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
          <Mountain className="w-4 h-4 mr-2" />
          Nova trilha
        </Button>
      </CardHeader>
      <CardContent>
        {data?.trails && data.trails.length > 0 ? (
          <div className="space-y-4">
            {data.trails.map((trail) => (
              <div key={trail.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-medium">{trail.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {trail.city}, {trail.uf} • {trail.distanceKm} km • {trail.difficulty}
                  </p>
                </div>
                <Button variant="outline" size="sm">Editar</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Nenhuma trilha encontrada</p>
        )}
      </CardContent>
    </Card>
  );
}

function AdminIntegrations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Integração CADASTUR
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Dataset CADASTUR</h3>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                Ativo
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Base de dados de guias certificados pelo Ministério do Turismo
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                Atualizar dados
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Funcionalidade em desenvolvimento")}>
                Importar CSV
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
