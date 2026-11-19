import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede exceder 80 caracteres"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "El email es obligatorio")
    .email("El email no tiene un formato válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
