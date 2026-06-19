import { type Request, type Response, type NextFunction, Router } from 'express';

const router = Router();


const METODO_PAGO = ['Efectivo', 'Transferencia', 'Debito', 'Credito'];

router.post('/', (req: Request, res: Response, _next: NextFunction) => {
    
    const { estudianteId, materias, periodoId, metodo_pago } = req.body;


    if (!estudianteId || !materias?.length || !periodoId || !metodo_pago) {
        console.error('Faltan campos obligatorios en la petición');
        return res.status(400).json({
            error: 'Campos requeridos: estudianteId, materias, periodoId, metodo_pago'
        });
    }

    if (!METODO_PAGO.includes(metodo_pago)) {
        console.error('El metodo de pago insertado no es valido');
        return res.status(400).json({
            error: "El metodo de pago insertado debe ser: Efectivo, Transferencia, Debito o Credito"
        });
    }


    return res.status(201).json({
        version: 'v2',
        message: {
            estudianteId, 
            materias, 
            periodoId, 
            metodo_pago
        }
    });
});

export default router;