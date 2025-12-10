# Backend Cine Filo - Node.js

Este es el servidor backend para la aplicación Cine Filo que maneja el almacenamiento de películas e imágenes.

## Requisitos

- **Node.js** (v14 o superior)
- **npm** (incluido con Node.js)

## Instalación

### 1. Instalar Node.js

Si no tienes Node.js instalado:
- Descarga desde: https://nodejs.org/
- Instala la versión LTS (recomendado)

### 2. Instalar dependencias del backend

Abre PowerShell en la carpeta `backend` y ejecuta:

```powershell
npm install
```

Esto instalará todas las dependencias necesarias (express, cors, multer, etc.)

## Iniciar el servidor

Desde la carpeta `backend`, ejecuta:

```powershell
npm start
```

O para desarrollo con auto-reload:

```powershell
npm run dev
```

Verás un mensaje como:
```
🎬 Servidor de Cine Filo corriendo en http://localhost:5000
📁 Imágenes guardadas en: [ruta]/imagenes
```

## ¿Cómo funciona?

1. El frontend (HTML/CSS/JS) se abre normalmente en el navegador
2. Cuando agregas una película:
   - La imagen se sube al servidor
   - Se guarda en la carpeta `/imagenes`
   - Los datos se guardan en `/backend/peliculas.json`
3. Al recargar la página, todo se carga automáticamente

## Estructura de archivos

```
backend/
├── server.js          # Código del servidor
├── package.json       # Configuración de dependencias
└── peliculas.json    # Base de datos de películas (se crea automáticamente)

imagenes/            # Carpeta donde se guardan las imágenes (se crea automáticamente)
```

## Solución de problemas

**Error: "No se puede conectar a localhost:5000"**
- Asegúrate de que el servidor está corriendo (`npm start`)
- Verifica que el puerto 5000 esté disponible

**Error: "ENOENT: no such file or directory"**
- El servidor creará automáticamente las carpetas necesarias
- Si persiste, crea manualmente la carpeta `/imagenes`

**Las imágenes no se guardan**
- Verifica que la carpeta `/imagenes` existe y tiene permisos de escritura
- Revisa la consola del servidor para más detalles

## APIs disponibles

### GET /api/peliculas
Obtiene la lista de todas las películas guardadas

### POST /api/peliculas
Agrega una nueva película (con multipart/form-data para la imagen)

### DELETE /api/peliculas/:id
Elimina una película por ID

---

**Nota:** Mantén el servidor ejecutándose mientras uses la aplicación.
