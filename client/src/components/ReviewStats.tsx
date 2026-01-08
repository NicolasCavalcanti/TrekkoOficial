import { StarRatingDisplay } from './StarRating';
import { Star, Camera } from 'lucide-react';

interface ReviewStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    reviewsWithPhotos: number;
  };
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { averageRating, totalReviews, distribution, reviewsWithPhotos } = stats;

  // Calculate max count for bar scaling
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <div className="bg-gray-50 rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Average Rating */}
        <div className="flex flex-col items-center sm:items-start">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {totalReviews > 0 ? averageRating.toFixed(1) : '-'}
          </div>
          <StarRatingDisplay rating={averageRating} size="md" />
          <div className="text-sm text-gray-500 mt-2">
            {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
          </div>
          {reviewsWithPhotos > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Camera className="w-4 h-4" />
              {reviewsWithPhotos} com fotos
            </div>
          )}
        </div>

        {/* Distribution Bars */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as keyof typeof distribution];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const barWidth = totalReviews > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={stars} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm text-gray-600">{stars}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-gray-500">
                  {count > 0 ? `${percentage.toFixed(0)}%` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
