"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase/client";

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  game_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface GameRatingReviewsProps {
  gameId: string;
  gameTitle: string;
}

export default function GameRatingReviews({
  gameId,
  gameTitle,
}: GameRatingReviewsProps) {
  const { data: session, status } = useSession();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = status === "authenticated" && session?.user;
  const currentUser = session?.user
    ? {
        id: session.user.id || session.user.email || "unknown",
        name:
          session.user.name ||
          session.user.email?.split("@")[0] ||
          "Користувач",
      }
    : null;

  // Завантаження відгуків з бази даних
  useEffect(() => {
    loadReviews();
  }, [gameId]);

  // Завантаження рейтингу користувача
  useEffect(() => {
    if (currentUser) {
      loadUserRating();
    }
  }, [currentUser?.id, gameId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("game_reviews")
        .select("*")
        .eq("game_id", gameId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error("Помилка завантаження відгуків:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserRating = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from("game_reviews")
        .select("rating, comment")
        .eq("game_id", gameId)
        .eq("user_id", currentUser.id)
        .single();

      if (data) {
        setUserRating(data.rating);
        setComment(data.comment || "");
      }
    } catch (error) {
      // Відгук не знайдено - це нормально
    }
  };

  const handleRatingClick = (rating: number) => {
    if (!isAuthenticated) {
      alert("Увійдіть в акаунт, щоб поставити рейтинг");
      return;
    }
    setUserRating(rating);
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !currentUser) {
      alert("Увійдіть в акаунт, щоб залишити відгук");
      return;
    }

    if (!comment.trim()) {
      alert("Будь ласка, напишіть відгук");
      return;
    }

    if (userRating === 0) {
      alert("Будь ласка, поставте рейтинг");
      return;
    }

    setIsSubmitting(true);

    try {
      // Перевіряємо чи є вже відгук від цього користувача
      const { data: existingReview } = await supabase
        .from("game_reviews")
        .select("id")
        .eq("game_id", gameId)
        .eq("user_id", currentUser.id)
        .single();

      if (existingReview) {
        // Оновлюємо існуючий відгук
        const { error } = await supabase
          .from("game_reviews")
          .update({
            rating: userRating,
            comment: comment.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (error) throw error;
        alert("Відгук успішно оновлено!");
      } else {
        // Створюємо новий відгук
        const { error } = await supabase.from("game_reviews").insert({
          game_id: gameId,
          user_id: currentUser.id,
          user_name: currentUser.name,
          rating: userRating,
          comment: comment.trim(),
        });

        if (error) throw error;
        alert("Відгук успішно збережено!");
      }

      // Перезавантажуємо відгуки
      await loadReviews();
    } catch (error) {
      console.error("Помилка збереження відгуку:", error);
      alert("Помилка при збереженні відгуку. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number, isInteractive: boolean = false) => {
    return (
      <div className="flex flex-wrap gap-0.5 sm:gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            onClick={() => isInteractive && handleRatingClick(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
            disabled={!isInteractive}
            className={`text-xl sm:text-2xl transition-all p-1 ${
              isInteractive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default"
            }`}
          >
            {star <= (isInteractive ? hoverRating || rating : rating) ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-gray-600">☆</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="mt-12 border-t border-gray-700 pt-8">
        <div className="text-center text-gray-400">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t border-gray-700 pt-8">
      {/* Середній рейтинг */}
      <div className="mb-6 sm:mb-8 bg-gray-800 p-4 sm:p-6 rounded-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Рейтинг гри</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-yellow-400">
              {calculateAverageRating()}
            </div>
            <div className="text-gray-400 text-sm mt-1">з 10</div>
          </div>
          <div>
            <div className="text-gray-400 mb-2">Відгуків: {reviews.length}</div>
            {reviews.length > 0 &&
              renderStars(Math.round(parseFloat(calculateAverageRating())))}
          </div>
        </div>
      </div>

      {/* Форма оцінки та відгуку */}
      <div className="mb-6 sm:mb-8 bg-gray-800 p-4 sm:p-6 rounded-lg">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Ваша оцінка</h3>

        {!isAuthenticated ? (
          <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded mb-4">
            ⚠️{" "}
            <a href="/account" className="underline hover:text-yellow-100">
              Увійдіть в акаунт
            </a>
            , щоб залишити відгук та оцінку
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-400">
              Ви увійшли як:{" "}
              <span className="text-white font-semibold">
                {currentUser?.name}
              </span>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 mb-3">Поставте оцінку від 1 до 10:</p>
              {renderStars(userRating, true)}
              {userRating > 0 && (
                <p className="text-yellow-400 mt-2">
                  Ваша оцінка: {userRating}/10
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-400 mb-2">Ваш відгук:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Поділіться своїми враженнями про гру..."
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none min-h-32 resize-vertical"
                maxLength={1000}
                disabled={isSubmitting}
              />
              <div className="text-right text-gray-500 text-sm mt-1">
                {comment.length}/1000
              </div>
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? "Збереження..." : "Опублікувати відгук"}
            </button>
          </>
        )}
      </div>

      {/* Список відгуків */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Відгуки гравців</h3>
        {reviews.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            Поки що немає відгуків. Будьте першим!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-800 p-4 sm:p-6 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      {review.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{review.user_name}</div>
                      <div className="text-gray-400 text-sm">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-[52px] sm:ml-0">
                    <span className="text-yellow-400 font-bold text-lg">
                      {review.rating}/10
                    </span>
                    <span className="text-yellow-400 text-xl">★</span>
                  </div>
                </div>
                {renderStars(review.rating)}
                <p className="text-gray-300 mt-4 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
