import { z } from 'zod';
import {Request} from 'express';

export const RegisterSchema = z.object({
    email: z.email(),
    name: z.string(),
    username: z.string(),
    password: z.string(),
});

export const LoginSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export interface User {
    id: string;
    email: string;
    username: string;
    name: string;
    createdAt: Date;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}