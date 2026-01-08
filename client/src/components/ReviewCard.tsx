import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, MoreVertical, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { StarRatingDisplay } from './StarRating';
import ImageLightbox from './ImageLightbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ReviewImage {
  id: number;
  imageUrl: string;
  thumbnailUrl?: string;
}

interface ReviewCardProps {
  review: {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    userName?: string;
    userPhotoUrl?: string;
    isVerified?: number;
    createdAt: string;
    updatedAt: string;
    images?: ReviewImage[];
  };
  currentUserId?: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({ review, currentUserId, onEdit, onDelete }: ReviewCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isOwner = currentUserId === review.userId;
  const hasImages = review.images && review.images.length > 0;
  const wasEdited = review.updatedAt !== review.createdAt;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const imageUrls = review.images?.map((img) => img.imageUrl) || [];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {review.userPhotoUrl ? (
            <img
              src={review.userPhotoUrl}
              alt={review.userName || 'Usuário'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-5 h-5 text-gray-500" />
            </div>
          )}
          
          {/* User Info */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.userName || 'Usuário Trekko'}
              </span>
              {review.isVerified === 1 && (
                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Verificado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
              {wasEdited && <span className="text-gray-400">(editado)</span>}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        {isOwner && (onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Rating */}
      <div className="mb-3">
        <StarRatingDisplay rating={review.rating} size="sm" />
      </div>

      {/* Comment */}
      <p className="text-gray-700 whitespace-pre-wrap mb-4">{review.comment}</p>

      {/* Images */}
      {hasImages && (
        <div className="flex flex-wrap gap-2">
          {review.images!.slice(0, 4).map((img, index) => (
            <button
              key={img.id}
              onClick={() => openLightbox(index)}
              className={cn(
                'relative rounded-lg overflow-hidden',
                review.images!.length === 1 ? 'w-full max-w-md h-48' : 'w-24 h-24'
              )}
            >
              <img
                src={img.thumbnailUrl || img.imageUrl}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              />
              {/* Show "+X" overlay on 4th image if there are more */}
              {index === 3 && review.images!.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    +{review.images!.length - 4}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {hasImages && (
        <ImageLightbox
          images={imageUrls}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}
