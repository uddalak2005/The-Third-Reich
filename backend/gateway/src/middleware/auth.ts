import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

async function auth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send('No token provided');
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string,
        ) as JwtPayload;

        req.user = {
            userId: decoded.userId as string,
        };

        next();
    } catch (err) {
        console.log(err);
        res.status(401).send('No token provided');
    }
}

export default auth;
