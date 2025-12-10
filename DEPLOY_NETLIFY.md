# 🚀 Despliegue en Netlify

Esta aplicación ahora funciona completamente sin servidor backend. Todos los datos se guardan en `localStorage` del navegador, lo que la hace perfecta para Netlify.

## ✨ Características:

- ✅ **Sin servidor backend necesario** - Todo funciona en el navegador
- ✅ **Datos persistentes** - Se guardan en localStorage
- ✅ **Compatible con Netlify** - Puedes desplegarla directamente
- ✅ **Imágenes en Base64** - Las imágenes se guardan codificadas
- ✅ **Totalmente funcional** - Login, películas, comentarios, todo incluido

## 📋 Paso a paso para desplegar en Netlify:

### 1. Preparar el proyecto para Netlify

```bash
# Crear un archivo _redirects en la carpeta raíz (si necesitas enrutamiento)
echo "/*    /index.html   200" > _redirects
```

### 2. Crear una cuenta en Netlify

- Ve a [netlify.com](https://netlify.com)
- Regístrate con GitHub, GitLab o Bitbucket
- O usa tu email

### 3. Desplegar el proyecto

#### Opción A: Arrastra y suelta (más fácil)

1. Ve a [app.netlify.com](https://app.netlify.com)
2. Inicia sesión
3. Arrastra la carpeta `Pagina de Taller` al área de drop
4. ¡Listo! Tu sitio está en vivo

#### Opción B: Con Git (recomendado)

1. Sube el proyecto a GitHub:
```bash
git init
git add .
git commit -m "Primera versión de Ciné Filo"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cine-filo.git
git push -u origin main
```

2. En Netlify:
   - Haz clic en "New site from Git"
   - Conecta tu repositorio de GitHub
   - Configura:
     - **Base directory**: (dejar vacío)
     - **Build command**: (dejar vacío)
     - **Publish directory**: . (punto)
   - Haz clic en "Deploy"

### 4. Configuración adicional (Opcional)

#### Si quieres un dominio personalizado:

1. En Netlify, ve a **Site settings** → **Domain management**
2. Haz clic en "Add custom domain"
3. Sigue las instrucciones para configurar tu dominio

#### Variables de entorno (no necesarias para esta app):

1. Ve a **Site settings** → **Build & deploy** → **Environment**
2. Agrega las variables que necesites

## 🔄 Cómo mantener datos entre despliegues:

Los datos se guardan en `localStorage` del navegador, así que:
- Se mantienen cuando refrescas la página
- Se mantienen entre sesiones en el mismo navegador
- Se mantienen aunque re-despliegues la aplicación

## 📊 Exportar/Respaldar datos:

```javascript
// En la consola del navegador:
// Exportar todos los datos
const backup = JSON.stringify(StorageAPI.exportarDatos());
console.log(backup);

// Copiar el resultado y guardarlo en un archivo .json
```

## 📥 Restaurar datos:

```javascript
// En la consola del navegador:
const datosAntiguos = JSON.parse('PEGA_AQUI_EL_JSON_GUARDADO');
StorageAPI.importarDatos(datosAntiguos);
location.reload();
```

## 🛠️ Solucionar problemas:

### "No se ven los datos que agregué"
- Abre la consola (F12)
- Verifica que no haya errores
- Intenta limpiar localStorage: `localStorage.clear()`

### "Las imágenes no se guardan"
- Asegúrate de que el archivo sea una imagen válida
- Verifica el tamaño de localStorage (limite de ~5-10MB)

### "Obtengo errores de CORS"
- ¡No deberías! Como no usamos servidor backend, no hay problemas de CORS

## 📱 Consejos:

- **Respaldos regulares**: Exporta tus datos periódicamente
- **Múltiples navegadores**: Los datos son por navegador, no se sincronizan entre navegadores
- **Sincronización real**: Si necesitas sincronizar entre dispositivos, crea un backend simple en Firebase o Supabase

## 🎉 ¡Listo!

Tu aplicación está desplegada en Netlify y funcionando correctamente. ¡Que disfrutes! 🎬
