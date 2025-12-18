import { useState, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { User, Heart, Star, Calendar, Plus, Edit, Trash2, Shield, Mountain, MapPin, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Profile() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const { user, isAuthenticated, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState(params.get("tab") || "atividades");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expeditionDialogOpen, setExpeditionDialogOpen] = useState(false);

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
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-2">Acesso restrito</h2>
              <p className="text-muted-foreground mb-6">
                Faça login para acessar seu perfil
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        <div className="container py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {user?.photoUrl ? (
                    <img src={user.photoUrl} alt="" className="w-24 h-24 rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-semibold text-primary">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-heading text-2xl font-bold">{user?.name || "Usuário"}</h1>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user?.userType === 'guide' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {user?.userType === 'guide' ? 'Guia' : 'Trekker'}
                    </span>
                    {user?.cadasturValidated === 1 && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        CADASTUR
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {user?.bio && <p className="text-sm mt-2">{user.bio}</p>}
                </div>
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Editar perfil</DialogTitle>
                    </DialogHeader>
                    <EditProfileForm onClose={() => setEditDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="atividades">
                <Star className="w-4 h-4 mr-2" />
                Atividades
              </TabsTrigger>
              <TabsTrigger value="favoritos">
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
              </TabsTrigger>
              {user?.userType === 'guide' && (
                <TabsTrigger value="expedicoes">
                  <Calendar className="w-4 h-4 mr-2" />
                  Expedições
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="atividades">
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-heading text-lg font-semibold mb-2">Suas atividades</h3>
                  <p className="text-muted-foreground">
                    Suas atividades e avaliações aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favoritos">
              <FavoritesList />
            </TabsContent>

            {user?.userType === 'guide' && (
              <TabsContent value="expedicoes">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-semibold">Minhas Expedições</h2>
                  <Dialog open={expeditionDialogOpen} onOpenChange={setExpeditionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Expedição
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Criar nova expedição</DialogTitle>
                      </DialogHeader>
                      <CreateExpeditionForm onClose={() => setExpeditionDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
                <GuideExpeditions />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function EditProfileForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [cadasturNumber, setCadasturNumber] = useState(user?.cadasturNumber || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Perfil atualizado!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil");
    },
  });

  const uploadMutation = trpc.user.uploadPhoto.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Foto atualizada!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar foto");
    },
  });

  const removeMutation = trpc.user.removePhoto.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Foto removida!");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou GIF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        base64,
        mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/gif',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, email, bio, cadasturNumber: cadasturNumber || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Photo Upload */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {user?.photoUrl ? (
            <img src={user.photoUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Enviar foto
          </Button>
          {user?.photoUrl && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-2 text-destructive"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Remover
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. Máx 5MB.</p>
        </div>
      </div>

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
      </div>
      {user?.userType === 'guide' && (
        <div>
          <Label htmlFor="cadastur">Número CADASTUR</Label>
          <Input id="cadastur" value={cadasturNumber} onChange={(e) => setCadasturNumber(e.target.value)} />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Salvar
        </Button>
      </div>
    </form>
  );
}

function FavoritesList() {
  const [, navigate] = useLocation();
  const { data: favorites, isLoading } = trpc.favorites.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold mb-2">Nenhuma trilha favoritada</h3>
          <p className="text-muted-foreground mb-4">
            Explore trilhas e adicione aos favoritos
          </p>
          <Button onClick={() => navigate("/trilhas")}>Explorar trilhas</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((trail) => (
        <Card 
          key={trail?.id} 
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate(`/trilha/${trail?.id}`)}
        >
          <div className="h-32 bg-gradient-to-br from-forest/20 to-forest-light/20 flex items-center justify-center">
            <Mountain className="w-10 h-10 text-forest/40" />
          </div>
          <CardContent className="p-4">
            <h3 className="font-heading font-semibold mb-1">{trail?.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {trail?.city}, {trail?.uf}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GuideExpeditions() {
  const { data, isLoading } = trpc.guide.myExpeditions.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.expeditions || data.expeditions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading text-lg font-semibold mb-2">Nenhuma expedição criada</h3>
          <p className="text-muted-foreground">
            Crie sua primeira expedição para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.expeditions.map((expedition) => (
        <ExpeditionManageCard key={expedition.id} expedition={expedition} />
      ))}
    </div>
  );
}

function ExpeditionManageCard({ expedition }: { expedition: any }) {
  const { data: trailData } = trpc.trails.getById.useQuery({ id: expedition.trailId });
  const utils = trpc.useUtils();
  
  const deleteMutation = trpc.guide.deleteExpedition.useMutation({
    onSuccess: () => {
      utils.guide.myExpeditions.invalidate();
      toast.success("Expedição removida!");
    },
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-heading font-semibold text-lg">
                {expedition.title || trailData?.trail.name || "Expedição"}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                expedition.status === 'published' ? 'bg-green-100 text-green-700' :
                expedition.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {expedition.status === 'published' ? 'Publicada' :
                 expedition.status === 'draft' ? 'Rascunho' : 'Cancelada'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(expedition.startDate), "dd/MM/yyyy")}
              </span>
              <span>{expedition.availableSpots}/{expedition.capacity} vagas</span>
              {expedition.price && <span>R$ {parseFloat(expedition.price).toFixed(2)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive"
              onClick={() => deleteMutation.mutate({ id: expedition.id })}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remover
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateExpeditionForm({ onClose }: { onClose: () => void }) {
  const [trailId, setTrailId] = useState<number | null>(null);
  const [trailSearch, setTrailSearch] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [capacity, setCapacity] = useState("10");
  const [price, setPrice] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");
  const [notes, setNotes] = useState("");

  const { data: trailsData } = trpc.trails.list.useQuery({ search: trailSearch, limit: 5 });
  const utils = trpc.useUtils();

  const createMutation = trpc.guide.createExpedition.useMutation({
    onSuccess: () => {
      utils.guide.myExpeditions.invalidate();
      toast.success("Expedição criada!");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao criar expedição");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trailId || !startDate) {
      toast.error("Selecione uma trilha e data");
      return;
    }
    createMutation.mutate({
      trailId,
      title: title || undefined,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      capacity: parseInt(capacity),
      price: price ? parseFloat(price) : undefined,
      meetingPoint: meetingPoint || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Trilha *</Label>
        <Input
          placeholder="Buscar trilha..."
          value={trailSearch}
          onChange={(e) => setTrailSearch(e.target.value)}
          className="mb-2"
        />
        {trailsData?.trails && trailsData.trails.length > 0 && trailSearch && (
          <div className="border rounded-md max-h-40 overflow-y-auto">
            {trailsData.trails.map((trail) => (
              <button
                key={trail.id}
                type="button"
                className={`w-full text-left px-3 py-2 hover:bg-muted ${trailId === trail.id ? 'bg-primary/10' : ''}`}
                onClick={() => {
                  setTrailId(trail.id);
                  setTrailSearch(trail.name);
                }}
              >
                <span className="font-medium">{trail.name}</span>
                <span className="text-sm text-muted-foreground ml-2">{trail.city}, {trail.uf}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="title">Título (opcional)</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Expedição de fim de semana" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Data início *</Label>
          <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="endDate">Data fim</Label>
          <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capacity">Vagas</Label>
          <Input id="capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} min="1" />
        </div>
        <div>
          <Label htmlFor="price">Preço (R$)</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" />
        </div>
      </div>
      <div>
        <Label htmlFor="meetingPoint">Ponto de encontro</Label>
        <Input id="meetingPoint" value={meetingPoint} onChange={(e) => setMeetingPoint(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Criar expedição
        </Button>
      </div>
    </form>
  );
}
