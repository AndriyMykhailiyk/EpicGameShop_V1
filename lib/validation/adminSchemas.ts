import { z } from "zod";

export const orderItemInputSchema = z.object({
  gameId: z.string().min(1),
  gameTitle: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
  activationKey: z.string().optional(),
});

export const createOrderSchema = z.object({
  email: z.string().email(),
  userId: z.string().min(1).optional().nullable(),
  status: z.enum(["paid", "pending"]).default("paid"),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  total: z.number().nonnegative(),
  orderNumber: z.string().min(4),
  items: z.array(orderItemInputSchema).min(1),
});

export const gameUpsertBodySchema = z.object({
  id: z.string().min(1).max(128),
  title: z.string().min(1).max(500),
  originalPrice: z.string().max(200),
  discountedPrice: z.string().max(200),
  discount: z.number().int().min(0).max(100).optional(),
  imageUrl: z.string().min(1).max(2000),
  tags: z.array(z.string()).optional(),
  developer: z.string().max(300).optional(),
  publisher: z.string().max(300).optional(),
  platforms: z.array(z.string()).optional(),
  description: z.string().max(20000).optional(),
  isMegaSale: z.boolean().optional(),
  saleEndsAt: z.union([z.string().max(64), z.null()]).optional(),
});

export const userBlockSchema = z.object({
  blocked: z.boolean(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["paid", "pending"]),
});

export const analyticsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  granularity: z.enum(["day", "month"]).default("day"),
});
