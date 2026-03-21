import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { config } from '../config';
import { RegisterInput, LoginInput, User, AuthResponse } from '../types';
import { NextFunction } from 'express';
import type { SignOptions } from 'jsonwebtoken';

const SALT_ROUNDS: number = 10;

export async function register(
    body: RegisterInput,
    next: NextFunction,
): Promise<AuthResponse | void> {
    try {
        const existingUser = await prisma.users.findUnique({
            where: { email: body.email },
        });
        if (existingUser) {
            throw new Error('EMAIL_TAKEN');
        }

        const hashed: string = await bcrypt.hash(body.password, SALT_ROUNDS);

        const user = await prisma.users.create({
            data: {
                email: body.email,
                username: body.username,
                name: body.name, // required in your schema
                password: hashed,
            },
        });

        const token = signToken(user);
        return { token, user };
    } catch (err) {
        console.error(err);
        next(err);
        return;
    }
}

export async function login(data: LoginInput): Promise<AuthResponse> {
    const row = await prisma.users.findUnique({
        where: { email: data.email },
    });

    if (!row) throw new Error('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(data.password, row.password);
    if (!valid) throw new Error('INVALID_CREDENTIALS');

    const user = mapRow(row);
    const token = signToken(user);

    return { token, user };
}
export async function getMe(userId: string): Promise<User> {
    const row = await prisma.users.findUnique({
        where: { id: userId },
    });

    if (!row) throw new Error('USER_NOT_FOUND');

    return mapRow(row);
}

function mapRow(row: any): User {
    return {
        id: row.id,
        email: row.email,
        username: row.username,
        name: row.name,
        createdAt: row.createdAt.toISOString(),
    };
}

function signToken(user: User): string {
    return jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        config.JWT_SECRET as string,
        { expiresIn: config.JWT_EXPIRY as SignOptions['expiresIn'] },
    );
}

function verifyToken(token: string): User {
    try {
        return jwt.verify(token, config.JWT_SECRET) as User;
    } catch {
        throw new Error('INVALID_TOKEN');
    }
}
