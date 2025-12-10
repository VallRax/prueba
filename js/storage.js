// ========== GESTIÓN DE ALMACENAMIENTO LOCAL ==========
// Este módulo maneja todo el almacenamiento de datos sin necesidad de backend

const StorageAPI = {
    // Claves de localStorage
    KEYS: {
        PELICULAS: 'cinefilo_peliculas',
        COMENTARIOS: 'cinefilo_comentarios',
        USUARIOS: 'cinefilo_usuarios',
        USUARIO_ACTUAL: 'cinefilo_usuario_actual'
    },

    // Cargar todas las películas
    cargarPeliculas() {
        try {
            const data = localStorage.getItem(this.KEYS.PELICULAS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al cargar películas:', error);
            return [];
        }
    },

    // Guardar película
    guardarPelicula(pelicula) {
        try {
            const peliculas = this.cargarPeliculas();
            peliculas.push(pelicula);
            localStorage.setItem(this.KEYS.PELICULAS, JSON.stringify(peliculas));
            return pelicula;
        } catch (error) {
            console.error('Error al guardar película:', error);
            throw error;
        }
    },

    // Eliminar película
    eliminarPelicula(id) {
        try {
            const peliculas = this.cargarPeliculas();
            const filtradas = peliculas.filter(p => p.id !== id);
            localStorage.setItem(this.KEYS.PELICULAS, JSON.stringify(filtradas));
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar película:', error);
            throw error;
        }
    },

    // Cargar comentarios
    cargarComentarios() {
        try {
            const data = localStorage.getItem(this.KEYS.COMENTARIOS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
            return [];
        }
    },

    // Guardar comentario
    guardarComentario(comentario) {
        try {
            const comentarios = this.cargarComentarios();
            comentarios.unshift(comentario);
            localStorage.setItem(this.KEYS.COMENTARIOS, JSON.stringify(comentarios));
            return comentario;
        } catch (error) {
            console.error('Error al guardar comentario:', error);
            throw error;
        }
    },

    // Cargar usuarios registrados
    cargarUsuarios() {
        try {
            const data = localStorage.getItem(this.KEYS.USUARIOS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            return [];
        }
    },

    // Guardar usuario
    guardarUsuario(usuario) {
        try {
            const usuarios = this.cargarUsuarios();
            usuarios.push(usuario);
            localStorage.setItem(this.KEYS.USUARIOS, JSON.stringify(usuarios));
            return usuario;
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            throw error;
        }
    },

    // Obtener usuario actual
    obtenerUsuarioActual() {
        try {
            const data = localStorage.getItem(this.KEYS.USUARIO_ACTUAL);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            return null;
        }
    },

    // Guardar usuario actual
    guardarUsuarioActual(usuario) {
        try {
            localStorage.setItem(this.KEYS.USUARIO_ACTUAL, JSON.stringify(usuario));
        } catch (error) {
            console.error('Error al guardar usuario actual:', error);
            throw error;
        }
    },

    // Limpiar usuario actual
    limpiarUsuarioActual() {
        try {
            localStorage.removeItem(this.KEYS.USUARIO_ACTUAL);
        } catch (error) {
            console.error('Error al limpiar usuario actual:', error);
        }
    },

    // Exportar datos (para backup)
    exportarDatos() {
        return {
            peliculas: this.cargarPeliculas(),
            comentarios: this.cargarComentarios(),
            usuarios: this.cargarUsuarios(),
            fecha: new Date().toISOString()
        };
    },

    // Importar datos (para restaurar backup)
    importarDatos(datos) {
        try {
            if (datos.peliculas) {
                localStorage.setItem(this.KEYS.PELICULAS, JSON.stringify(datos.peliculas));
            }
            if (datos.comentarios) {
                localStorage.setItem(this.KEYS.COMENTARIOS, JSON.stringify(datos.comentarios));
            }
            if (datos.usuarios) {
                localStorage.setItem(this.KEYS.USUARIOS, JSON.stringify(datos.usuarios));
            }
        } catch (error) {
            console.error('Error al importar datos:', error);
            throw error;
        }
    }
};
