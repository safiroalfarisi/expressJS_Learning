// src/middleware/role.middleware.ts
import { Response, NextFunction } from 'express';

export const authorizeRole = (allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        // req.user diisi oleh authenticateJWT
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Akses Ditolak: Anda tidak memiliki izin untuk fitur ini." 
            });
        }
        next();
    };
};