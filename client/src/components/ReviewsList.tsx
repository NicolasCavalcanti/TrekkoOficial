import { useState } from 'react';
import { Loader2, MessageSquare, Camera, Star } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewStats } from './ReviewStats';
import { ReviewForm } from './ReviewForm';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReviewsListProps {
  targetType: 'trail' | 'guide';
  targetId: number;
  targetName: string;
}

export function ReviewsList({ targetType, targetId, targetName }: ReviewsListProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'best' | 'worst'>('recent');
  const [filterStars, setFilterStars] = useState<number | undefined>(undefined);
  const [withPhotos, setWithPhotos] = useState<boolean | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [deleteReviewId, setDeleteReviewId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: user } = trpc.auth.me.useQuery();
  
  const { data: stats, isLoading: statsLoading } = trpc.reviews.getStats.useQuery({
    targetType,
    targetId,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = trpc.reviews.list.useQuery({
    targetType,
    targetId,
    page,
    limit: 10,
    sortBy,
    filterStars,
    withPhotos,
  });

  const { data: hasReviewedData } = trpc.reviews.hasReviewed.useQuery(
    { targetType, targetId },
    { enabled: !!user }
  );

  const deleteReview = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate();
      utils.reviews.getStats.invalidate();
      utils.reviews.hasReviewed.invalidate();
      setDeleteReviewId(null);
    },
  });

  const handleFormSuccess = () => {
    setShowForm(false);
    setPage(1);
  };

  const handleDelete = (reviewId: number) => {
    setDeleteReviewId(reviewId);
  };

  const confirmDelete = () => {
    if (deleteReviewId) {
      deleteReview.mutate({ reviewId: deleteReviewId });
    }
  };

  const canReview = user && !hasReviewedData?.hasReviewed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Avaliações
        </h2>
        {canReview && !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#2D6A4F] hover:bg-[#1B4332]"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Escrever avaliação
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold mb-4">
            Avaliar {targetName}
          </h3>
          <ReviewForm
            targetType={targetType}
            targetId={targetId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* User's existing review notice */}
      {hasReviewedData?.hasReviewed && !showForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          Você já avaliou {targetType === 'trail' ? 'esta trilha' : 'este guia'}.
        </div>
      )}

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : stats && stats.totalReviews > 0 ? (
        <ReviewStats stats={stats} />
      ) : null}

      {/* Filters */}
      {stats && stats.totalReviews > 0 && (
        <div className="flex flex-wrap gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="best">Melhores notas</SelectItem>
              <SelectItem value="worst">Piores notas</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by stars */}
          <Select 
            value={filterStars?.toString() || 'all'} 
            onValueChange={(v) => { setFilterStars(v === 'all' ? undefined : Number(v)); setPage(1); }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estrelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="5">5 estrelas</SelectItem>
              <SelectItem value="4">4 estrelas</SelectItem>
              <SelectItem value="3">3 estrelas</SelectItem>
              <SelectItem value="2">2 estrelas</SelectItem>
              <SelectItem value="1">1 estrela</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by photos */}
          <Select 
            value={withPhotos === undefined ? 'all' : withPhotos ? 'with' : 'without'} 
            onValueChange={(v) => { 
              setWithPhotos(v === 'all' ? undefined : v === 'with'); 
              setPage(1); 
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Fotos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="with">Com fotos</SelectItem>
              <SelectItem value="without">Sem fotos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      {reviewsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : reviewsData && reviewsData.reviews.length > 0 ? (
        <div className="space-y-4">
          {reviewsData.reviews.map((review: any) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onDelete={() => handleDelete(review.id)}
            />
          ))}

          {/* Load More */}
          {reviewsData.page < reviewsData.totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
              >
                Carregar mais avaliações
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            Nenhuma avaliação ainda.
            {canReview && ' Seja o primeiro a avaliar!'}
          </p>
          {canReview && !showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#2D6A4F] hover:bg-[#1B4332]"
            >
              Escrever avaliação
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Sua avaliação será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteReview.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
