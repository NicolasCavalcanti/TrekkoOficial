import { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  targetType: 'trail' | 'guide';
  targetId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export function ReviewForm({ targetType, targetId, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate();
      utils.reviews.getStats.invalidate();
      utils.reviews.hasReviewed.invalidate();
      onSuccess?.();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check total count
    if (images.length + files.length > 5) {
      setError('Máximo de 5 fotos permitidas');
      return;
    }

    // Validate each file
    const validFiles: ImagePreview[] = [];
    for (const file of files) {
      // Check type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Formato inválido. Use JPG, PNG ou WEBP');
        continue;
      }
      // Check size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Cada imagem deve ter no máximo 5MB');
        continue;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [...prev, ...validFiles]);
    setError('');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (rating === 0) {
      setError('Selecione uma nota de 1 a 5 estrelas');
      return;
    }
    if (comment.length < 10) {
      setError('Comentário deve ter pelo menos 10 caracteres');
      return;
    }
    if (comment.length > 1000) {
      setError('Comentário deve ter no máximo 1000 caracteres');
      return;
    }

    // Convert images to base64
    const imageData: { base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }[] = [];
    for (const img of images) {
      const base64 = await fileToBase64(img.file);
      imageData.push({
        base64,
        mimeType: img.file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      });
    }

    createReview.mutate({
      targetType,
      targetId,
      rating,
      comment,
      images: imageData.length > 0 ? imageData : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sua avaliação *
        </label>
        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seu comentário * <span className="text-gray-400 font-normal">({comment.length}/1000)</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sua experiência... (mínimo 10 caracteres)"
          rows={4}
          maxLength={1000}
          className="resize-none"
        />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fotos <span className="text-gray-400 font-normal">(opcional, máx. 5)</span>
        </label>
        
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {images.length < 5 && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              Adicionar fotos
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createReview.isPending}
          className="bg-[#2D6A4F] hover:bg-[#1B4332]"
        >
          {createReview.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar avaliação'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

// Helper function to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
