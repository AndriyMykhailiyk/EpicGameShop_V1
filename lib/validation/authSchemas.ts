import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Некоректний email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Токен обов'язковий"),
  password: z.string().min(6, "Пароль повинен мати мінімум 6 символів"),
});

export const refundRequestSchema = z.object({
  orderId: z.string().uuid("Некоректний ID замовлення"),
  reason: z
    .string()
    .min(10, "Причина повинна мати мінімум 10 символів")
    .max(1000, "Причина не повинна перевищувати 1000 символів"),
});

export const refundStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminComment: z.string().max(500).optional(),
});
