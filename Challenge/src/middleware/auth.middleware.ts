import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Mengambil token dari "Bearer <token>"
        const secret = process.env.JWT_SECRET || 'secret_key_anda';

        jwt.verify(token, secret, (err, user) => {
            if (err) return res.status(403).json({ message: "Token tidak valid" });
            (req as any).user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Anda harus login terlebih dahulu" });
    }
};