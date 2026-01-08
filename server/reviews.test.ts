import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';

describe('Reviews API', () => {
  // Test data
  const testTargetType = 'trail';
  const testTargetId = 30017; // Monte Roraima
  let testReviewId: number;

  describe('getRatingStats', () => {
    it('should return rating stats structure for a trail', async () => {
      const stats = await db.getRatingStats('trail', testTargetId);
      
      expect(stats).toHaveProperty('averageRating');
      expect(stats).toHaveProperty('totalReviews');
      expect(stats).toHaveProperty('distribution');
      expect(stats).toHaveProperty('reviewsWithPhotos');
      
      expect(typeof stats.averageRating).toBe('number');
      expect(typeof stats.totalReviews).toBe('number');
      expect(stats.distribution).toHaveProperty('1');
      expect(stats.distribution).toHaveProperty('2');
      expect(stats.distribution).toHaveProperty('3');
      expect(stats.distribution).toHaveProperty('4');
      expect(stats.distribution).toHaveProperty('5');
    });

    it('should return zero stats for non-existent target', async () => {
      const stats = await db.getRatingStats('trail', 999999);
      
      expect(stats.averageRating).toBe(0);
      expect(stats.totalReviews).toBe(0);
    });
  });

  describe('getReviews', () => {
    it('should return reviews list structure', async () => {
      const result = await db.getReviews({
        targetType: 'trail',
        targetId: testTargetId,
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('reviews');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('totalPages');
      expect(Array.isArray(result.reviews)).toBe(true);
    });

    it('should support pagination', async () => {
      const page1 = await db.getReviews({
        targetType: 'trail',
        targetId: testTargetId,
        page: 1,
        limit: 5,
      });

      expect(page1.page).toBe(1);
    });

    it('should support sorting by recent', async () => {
      const result = await db.getReviews({
        targetType: 'trail',
        targetId: testTargetId,
        sortBy: 'recent',
      });

      expect(result).toHaveProperty('reviews');
    });

    it('should support sorting by best rating', async () => {
      const result = await db.getReviews({
        targetType: 'trail',
        targetId: testTargetId,
        sortBy: 'best',
      });

      expect(result).toHaveProperty('reviews');
    });

    it('should support filtering by stars', async () => {
      const result = await db.getReviews({
        targetType: 'trail',
        targetId: testTargetId,
        filterStars: 5,
      });

      expect(result).toHaveProperty('reviews');
    });
  });

  describe('createReview', () => {
    it('should create a review and return the ID', async () => {
      // Create a test review
      testReviewId = await db.createReview({
        userId: 1, // Assuming user ID 1 exists
        targetType: testTargetType,
        targetId: testTargetId,
        rating: 5,
        comment: 'Esta é uma avaliação de teste para verificar o sistema de reviews.',
      });

      expect(typeof testReviewId).toBe('number');
      expect(testReviewId).toBeGreaterThan(0);
    });

    it('should retrieve the created review', async () => {
      if (!testReviewId) return;

      const review = await db.getReviewById(testReviewId);
      
      expect(review).not.toBeNull();
      expect(review?.rating).toBe(5);
      expect(review?.comment).toContain('avaliação de teste');
    });
  });

  describe('updateReview', () => {
    it('should update an existing review', async () => {
      if (!testReviewId) return;

      await db.updateReview(testReviewId, {
        rating: 4,
        comment: 'Avaliação atualizada para teste do sistema de reviews.',
      });

      const review = await db.getReviewById(testReviewId);
      expect(review?.rating).toBe(4);
      expect(review?.comment).toContain('atualizada');
    });
  });

  describe('addReviewImages', () => {
    it('should add images to a review', async () => {
      if (!testReviewId) return;

      const testImageUrls = [
        'https://example.com/test-image-1.jpg',
        'https://example.com/test-image-2.jpg',
      ];

      await db.addReviewImages(testReviewId, testImageUrls);

      const images = await db.getReviewImages(testReviewId);
      expect(images.length).toBe(2);
    });
  });

  describe('getUserReview', () => {
    it('should find user review for a target', async () => {
      const review = await db.getUserReview(1, testTargetType, testTargetId);
      
      // May or may not exist depending on test order
      if (review) {
        expect(review).toHaveProperty('id');
        expect(review).toHaveProperty('rating');
        expect(review).toHaveProperty('comment');
      }
    });
  });

  describe('updateRatingStats', () => {
    it('should update rating stats for a target', async () => {
      await db.updateRatingStats(testTargetType, testTargetId);

      const stats = await db.getRatingStats(testTargetType, testTargetId);
      expect(stats).toHaveProperty('averageRating');
      expect(stats).toHaveProperty('totalReviews');
    });
  });

  describe('deleteReview', () => {
    it('should delete a review and its images', async () => {
      if (!testReviewId) return;

      await db.deleteReview(testReviewId);

      const review = await db.getReviewById(testReviewId);
      expect(review).toBeNull();

      const images = await db.getReviewImages(testReviewId);
      expect(images.length).toBe(0);
    });
  });
});
