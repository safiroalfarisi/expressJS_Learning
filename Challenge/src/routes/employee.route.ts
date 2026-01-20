import { Router } from 'express';
import { upload } from '../middleware/upload.middleware';
import { authenticateJWT } from '../middleware/auth.middleware'; // Import middleware autentikasi Anda
import { 
    getAllEmployees, 
    createEmployee, 
    updateEmployee, 
    deleteEmployee,
    importEmployees,
    exportEmployees 
} from '../controllers/employee.controller';
import { authorizeRole } from '../middleware/role.middleware';

const router = Router();

/**
 * Semua rute di bawah ini sekarang terproteksi.
 * Pengguna harus menyertakan Token JWT di Header (Authorization: Bearer <token>)
 */

// Standard CRUD routes
router.get('/', authenticateJWT, getAllEmployees); // Admin & Staff bisa melihat
router.post('/', authenticateJWT, authorizeRole(['admin']), createEmployee); // Hanya Admin
router.put('/:id', authenticateJWT, authorizeRole(['admin']), updateEmployee); // Hanya Admin
router.delete('/:id', authenticateJWT, authorizeRole(['admin']), deleteEmployee); // Hanya Admin

// Challenge Task: Import/Export routes
router.post('/import', authenticateJWT, authorizeRole(['admin']), upload.single('file'), importEmployees);
router.get('/export', authenticateJWT, exportEmployees); // Admin & Staff bisa export

export default router;