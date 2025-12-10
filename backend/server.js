import express from 'express';
import cors from 'cors';
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos de imágenes
app.use('/imagenes', express.static(path.join(__dirname, '../imagenes')));

// Crear carpeta de imágenes si no existe
const imageDir = path.join(__dirname, '../imagenes');
if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
}

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imageDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

// ========== RUTAS ==========

// Obtener todas las películas
app.get('/api/peliculas', (req, res) => {
    const dbFile = path.join(__dirname, 'peliculas.json');
    
    if (!fs.existsSync(dbFile)) {
        return res.json([]);
    }
    
    try {
        const data = fs.readFileSync(dbFile, 'utf-8');
        const peliculas = JSON.parse(data);
        res.json(peliculas);
    } catch (error) {
        console.error('Error al leer películas:', error);
        res.status(500).json({ error: 'Error al leer películas' });
    }
});

// Agregar nueva película con imagen
app.post('/api/peliculas', upload.single('imagen'), (req, res) => {
    try {
        const { nombre, categorias, tipo, duracion, satisfaccion, resena } = req.body;
        
        if (!nombre || !tipo || !duracion || !satisfaccion || !resena || !req.file) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Parsear categorias si viene como string
        let categoriasArray = categorias;
        if (typeof categorias === 'string') {
            categoriasArray = JSON.parse(categorias);
        }

        const pelicula = {
            id: Date.now(),
            nombre,
            categorias: categoriasArray,
            tipo,
            duracion: parseInt(duracion),
            satisfaccion,
            resena,
            imagen: `/imagenes/${req.file.filename}`,
            fecha: new Date().toISOString()
        };

        // Leer películas existentes
        const dbFile = path.join(__dirname, 'peliculas.json');
        let peliculas = [];
        
        if (fs.existsSync(dbFile)) {
            const data = fs.readFileSync(dbFile, 'utf-8');
            peliculas = JSON.parse(data);
        }

        // Agregar nueva película al inicio
        peliculas.unshift(pelicula);

        // Guardar en archivo
        fs.writeFileSync(dbFile, JSON.stringify(peliculas, null, 2));

        res.status(201).json({ 
            success: true, 
            message: 'Película agregada correctamente',
            pelicula 
        });
    } catch (error) {
        console.error('Error al agregar película:', error);
        res.status(500).json({ error: 'Error al agregar película' });
    }
});

// Eliminar película
app.delete('/api/peliculas/:id', (req, res) => {
    try {
        const { id } = req.params;
        const dbFile = path.join(__dirname, 'peliculas.json');

        if (!fs.existsSync(dbFile)) {
            return res.status(404).json({ error: 'No hay películas' });
        }

        const data = fs.readFileSync(dbFile, 'utf-8');
        let peliculas = JSON.parse(data);

        // Encontrar película a eliminar
        const peliculaIndex = peliculas.findIndex(p => p.id == id);
        if (peliculaIndex === -1) {
            return res.status(404).json({ error: 'Película no encontrada' });
        }

        const pelicula = peliculas[peliculaIndex];

        // Eliminar imagen
        const imagePath = path.join(__dirname, '..', pelicula.imagen);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Eliminar película
        peliculas.splice(peliculaIndex, 1);
        fs.writeFileSync(dbFile, JSON.stringify(peliculas, null, 2));

        res.json({ success: true, message: 'Película eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar película:', error);
        res.status(500).json({ error: 'Error al eliminar película' });
    }
});

// ========== INICIAR SERVIDOR ==========
app.listen(PORT, () => {
    console.log(`🎬 Servidor de Cine Filo corriendo en http://localhost:${PORT}`);
    console.log(`📁 Imágenes guardadas en: ${imageDir}`);
});
