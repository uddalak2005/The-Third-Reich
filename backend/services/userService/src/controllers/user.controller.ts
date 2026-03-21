import { register, login, getMe } from '../services/auth.service';
import {AuthRequest, AuthResponse, LoginInput, LoginSchema, RegisterInput, RegisterSchema} from '../types';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export async function registerUser(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    try {
        const payload = req.body;

        console.log(payload);

        const parsed = RegisterSchema.safeParse(payload);

        if (parsed.error) {
            const tree = z.treeifyError(parsed.error);

            console.log('Tree Error:\n', JSON.stringify(tree, null, 2));

            throw new Error('Error: ' + JSON.stringify(tree, null, 2));
        }

        const response: AuthResponse | void = (await register(
            parsed.data,
            next,
        )) as AuthResponse;

        res.status(201).json({
            token: response.token,
            user: response.user,
        });

        return;
    } catch (err) {
        console.error(err);
        next(err);
    }
}

export async function loginUser(
    req: Request<{}, {}, LoginInput>,
    res: Response,
    next: NextFunction
) {
    try {
        const payload = req.body;

        console.log(payload);

        const parsed = LoginSchema.safeParse(payload);

        if (parsed.error) {
            const tree = z.treeifyError(parsed.error);

            console.log('Tree Error:\n', JSON.stringify(tree, null, 2));

            throw new Error('Error: ' + JSON.stringify(tree, null, 2));
        }

        const result = await login(parsed.data as LoginInput)
        return res.status(200).json(result)
    } catch (err: any) {
        if (err.message === 'INVALID_CREDENTIALS') {
            return res.status(401).json({
                code:    'INVALID_CREDENTIALS',
                message: 'Email or password is incorrect'
            })
        }
        next(err)
    }
}

export async function getUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const user = await getMe(req.user!.userId);
        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}
