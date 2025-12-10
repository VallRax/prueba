# Página de Reseñas de Películas - Guía de Uso

## 📝 Descripción

Esta es una aplicación web completa para publicar y gestionar reseñas de películas y series. Incluye un carrusel interactivo, formulario modal para agregar películas, y gráficos estadísticos.

```
Pagina de Taller/
├── index.html          # Archivo HTML principal
├── css/
│   └── styles.css      # Estilos CSS
├── js/
│   └── main.js         # Lógica JavaScript
├── images/             # Carpeta para imágenes de películas
├── videos/             # Carpeta para el video de fondo
└── README.md           # Este archivo
```



1. **Obtener un video**: Descarga o crea un video de personas viendo películas en cine (idealmente en blanco y negro para coincidir con el diseño)
   
2. **Convertir el video**: El video debe ser un archivo MP4 o WebM
   - Recomendado: 1920x1080 o superior
   - Duración: 10-30 segundos para que sea fluido

3. **Guardar el video**: 
   - Coloca el archivo en la carpeta `videos/`
   - Nómbralo como `background.mp4` (o `background.webm` para mayor compatibilidad)

4. **Alternativas de video**:
   - Puedes usar servicios como:
     - Pexels (pexels.com)
     - Pixabay (pixabay.com)
     - Unsplash (unsplash.com)
   - Busca videos de cine, películas, personas en salas de cine

## ✨ Características Principales

### 1. **Modal de Agregar Película**
   - Clic en botón "AGREGAR"
   - Rellena:
     - Nombre de la película/serie
     - Categoría (puedes seleccionar varias: Acción, Comedia, Drama, Terror, Thriller, Otros)
     - Tipo: Nueva o Repetida
     - Duración en minutos
     - Satisfacción: Alto, Medio, Bajo
     - Reseña (descripción personal)
     - Imagen (la más importante)

### 2. **Carrusel de Películas**
   - Desplázate con los botones `<` y `>`
   - Haz clic en cualquier película para verla en la sección de detalle
   - Las películas se muestran con sus imágenes

### 3. **Sección de Detalle**
   - Se actualiza al seleccionar una película del carrusel
   - Muestra:
     - Imagen de la película
     - Nombre
     - Reseña completa
     - Datos: Categoría, Tipo, Duración, Satisfacción

### 4. **Gráficos Estadísticos**
   - **Izquierda (Top 5)**: Muestra las 5 películas mejor calificadas con estrellas doradas
   - **Derecha (Gráfico de Barras)**: Muestra estadísticas en formato de barras verticales

## 💾 Almacenamiento de Datos

Los datos se guardan automáticamente en **localStorage** del navegador:
- No necesitas una base de datos
- Los datos persisten aunque cierres el navegador
- Para limpiar los datos, abre la consola del navegador y ejecuta:
  ```javascript
  localStorage.clear()
  ```

## 🎨 Personalización

### Colores
Edita `css/styles.css` y busca:
- `#ff4444` - Color rojo principal
- `#222` - Color gris oscuro del fondo

### Tipografía
- Font principal: Segoe UI
- Puedes cambiar en `body { font-family: ... }`

### Video de Fondo
- Altura de la sección héroe: busca `.hero-section { height: 60vh }`
- Opacidad del overlay: busca `.video-overlay { background: rgba(0, 0, 0, 0.6) }`

## 🚀 Cómo Usar

1. **Abre `index.html`** en un navegador web

2. **Agrega una película**:
   - Clic en "AGREGAR"
   - Rellena el formulario
   - Clic en "Agregar Película"

3. **Selecciona una película**:
   - Clic en su imagen en el carrusel
   - Se mostrará la información completa abajo

4. **Revisa estadísticas**:
   - El gráfico de estrellas muestra las mejores 5
   - El gráfico de barras muestra conteos

## 📱 Responsive

La página es completamente responsive:
- Desktop: ✅ Funciona perfectamente
- Tablet: ✅ Ajustado
- Mobile: ✅ Optimizado

## 🐛 Solución de Problemas

### El video de fondo no aparece
- Verifica que el archivo esté en `videos/`
- Asegúrate que se llame `background.mp4`
- Intenta con un archivo WebM: `background.webm`

### Las imágenes no se guardan
- El navegador tiene permisos para usar localStorage
- Intenta limpiar el caché del navegador
- Usa otro navegador para verificar

### El carrusel no se mueve
- Asegúrate de que JavaScript está activado
- Verifica la consola del navegador para errores

## 📧 Notas

- Todos los datos se guardan localmente en el navegador
- Para compartir datos entre dispositivos, necesitarías una base de datos
- Las imágenes se convierten a Base64, por lo que archivos muy grandes pueden causar problemas

## 🎯 Próximas Mejoras Posibles

- [ ] Integración con base de datos (Firebase, MongoDB)
- [ ] Sistema de filtrado avanzado
- [ ] Exportar/Importar datos
- [ ] Modo oscuro/claro
- [ ] Integración con IMDb API
- [ ] Sistema de comentarios

---

¡Disfruta usando la aplicación! 🎬
