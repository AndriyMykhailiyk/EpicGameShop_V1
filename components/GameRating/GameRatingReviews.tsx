"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface GameRatingReviewsProps {
  gameId: string;
  gameTitle: string;
}

export default function GameRatingReviews({
  gameId,
  gameTitle,
}: GameRatingReviewsProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Завантаження даних при монтуванні компонента
  useEffect(() => {
    // Перевірка авторизації
    const checkAuth = () => {
      const user = localStorage.getItem("currentUser");
      const authToken = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");

      // Перевіряємо різні варіанти збереження користувача
      if (user) {
        try {
          const userData = JSON.parse(user);
          setIsAuthenticated(true);
          setCurrentUser(userData);
          return userData;
        } catch (e) {
          console.error("Помилка парсингу currentUser:", e);
        }
      } else if (authToken || (userId && userName)) {
        // Якщо є токен або окремі дані користувача
        const userData = {
          id: userId || authToken || Date.now().toString(),
          name: userName || "Користувач",
        };
        setIsAuthenticated(true);
        setCurrentUser(userData);
        return userData;
      }
      return null;
    };

    const userData = checkAuth();

    // Завантаження всіх відгуків для гри
    loadReviews();

    // Завантаження рейтингу поточного користувача
    if (userData) {
      loadUserRating(userData);
    }
  }, [gameId]);

  const loadReviews = () => {
    const allReviews = JSON.parse(localStorage.getItem("gameReviews") || "{}");
    const gameReviews = allReviews[gameId] || [];
    setReviews(gameReviews);
  };

  const loadUserRating = (userData: { id: string; name: string }) => {
    const userRatings = JSON.parse(localStorage.getItem("userRatings") || "{}");
    const savedRating = userRatings[`${userData.id}_${gameId}`];
    if (savedRating) {
      setUserRating(savedRating);
    }
  };

  const handleRatingClick = (rating: number) => {
    if (!isAuthenticated) {
      alert("Увійдіть в акаунт, щоб поставити рейтинг");
      return;
    }

    setUserRating(rating);

    // Зберігаємо рейтинг користувача
    const userRatings = JSON.parse(localStorage.getItem("userRatings") || "{}");
    userRatings[`${currentUser?.id}_${gameId}`] = rating;
    localStorage.setItem("userRatings", JSON.stringify(userRatings));
  };

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
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

    const newReview: Review = {
      id: Date.now().toString(),
      userId: currentUser!.id,
      userName: currentUser!.name,
      rating: userRating,
      comment: comment.trim(),
      date: new Date().toLocaleDateString("uk-UA"),
    };

    // Зберігаємо відгук
    const allReviews = JSON.parse(localStorage.getItem("gameReviews") || "{}");
    if (!allReviews[gameId]) {
      allReviews[gameId] = [];
    }

    // Перевіряємо, чи користувач вже залишав відгук
    const existingReviewIndex = allReviews[gameId].findIndex(
      (review: Review) => review.userId === currentUser!.id
    );

    if (existingReviewIndex !== -1) {
      // Оновлюємо існуючий відгук
      allReviews[gameId][existingReviewIndex] = newReview;
    } else {
      // Додаємо новий відгук
      allReviews[gameId].push(newReview);
    }

    localStorage.setItem("gameReviews", JSON.stringify(allReviews));

    setComment("");
    loadReviews();
    alert("Відгук успішно збережено!");
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const renderStars = (rating: number, isInteractive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            onClick={() => isInteractive && handleRatingClick(star)}
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
            disabled={!isInteractive}
            className={`text-2xl transition-all ${
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

  return (
    <div className="mt-12 border-t border-gray-700 pt-8">
      {/* Середній рейтинг */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Рейтинг гри</h2>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-yellow-400">
              {calculateAverageRating()}
            </div>
            <div className="text-gray-400 text-sm mt-1">з 10</div>
          </div>
          <div>
            <div className="text-gray-400 mb-2">Відгуків: {reviews.length}</div>
            {reviews.length > 0 &&
              renderStars(Math.round(calculateAverageRating()))}
          </div>
        </div>
      </div>

      {/* Форма оцінки та відгуку */}
      <div className="mb-8 bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Ваша оцінка</h3>

        {!isAuthenticated ? (
          <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded mb-4">
            ⚠️ Увійдіть в акаунт, щоб залишити відгук та оцінку
          </div>
        ) : (
          <>
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
              />
              <div className="text-right text-gray-500 text-sm mt-1">
                {comment.length}/1000
              </div>
            </div>

            <button
              onClick={handleSubmitReview}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Опублікувати відгук
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
              <div key={review.id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{review.userName}</div>
                      <div className="text-gray-400 text-sm">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
