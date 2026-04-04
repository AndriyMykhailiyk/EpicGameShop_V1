import { z } from "zod";

export const feedbackTypes = ["bug", "suggestion", "question"] as const;
export type FeedbackType = (typeof feedbackTypes)[number];

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: "Помилка",
  suggestion: "Пропозиція",
  question: "Питання",
};

export const feedbackSchema = z.object({
  name: z
    .string()
    .min(2, "Ім'я повинно мати мінімум 2 символи")
    .max(100, "Ім'я не повинно перевищувати 100 символів"),
  email: z.string().email("Некоректний email"),
  telegram: z
    .string()
    .max(100, "Telegram username занадто довгий")
    .optional()
    .or(z.literal("")),
  type: z.enum(feedbackTypes, {
    required_error: "Оберіть тип повідомлення",
  }),
  message: z
    .string()
    .min(10, "Повідомлення повинно мати мінімум 10 символів")
    .max(2000, "Повідомлення не повинно перевищувати 2000 символів"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
