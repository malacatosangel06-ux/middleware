import { type Request, type Response, Router } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
    const { estudianteId, materias, periodoid } = req.body;

    if (!estudianteId || !materias || !materias.length || !periodoid) { 
        return res.status(400).json({
            error: 'campos requeridos: estudianteId, materias, periodoid'
        });
    }

    return res.status(201).json({
        version: 'v1',
        message: {
            estudianteId,materias,periodoid
        }
    });
});

export default router;




