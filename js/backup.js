// ========== UTILIDADES DE RESPALDO ==========
// Este archivo proporciona funciones para respaldar y restaurar datos

const BackupUtils = {
    // Descargar datos como archivo JSON
    descargarBackup() {
        try {
            const datos = StorageAPI.exportarDatos();
            const json = JSON.stringify(datos, null, 2);
            
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cine-filo-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✓ Respaldo descargado correctamente');
        } catch (error) {
            console.error('✗ Error al descargar respaldo:', error);
        }
    },

    // Restaurar datos desde un archivo
    restaurarBackup(file) {
        try {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const datos = JSON.parse(e.target.result);
                    StorageAPI.importarDatos(datos);
                    console.log('✓ Respaldo restaurado correctamente');
                    location.reload();
                } catch (error) {
                    console.error('✗ Error al parsear el respaldo:', error);
                }
            };
            
            reader.onerror = function() {
                console.error('✗ Error al leer el archivo');
            };
            
            reader.readAsText(file);
        } catch (error) {
            console.error('✗ Error al restaurar respaldo:', error);
        }
    },

    // Obtener tamaño aproximado de los datos en localStorage
    obtenerTamano() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    },

    // Limpiar todos los datos (con confirmación)
    limpiarTodo() {
        if (confirm('⚠️ ¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
            localStorage.clear();
            console.log('✓ Todos los datos han sido eliminados');
            location.reload();
        }
    },

    // Mostrar estadísticas
    mostrarEstadisticas() {
        const peliculas = StorageAPI.cargarPeliculas();
        const comentarios = StorageAPI.cargarComentarios();
        const usuarios = StorageAPI.cargarUsuarios();
        
        console.log('📊 ESTADÍSTICAS DE DATOS:');
        console.log('========================');
        console.log(`Total de películas: ${peliculas.length}`);
        console.log(`Total de comentarios: ${comentarios.length}`);
        console.log(`Total de usuarios: ${usuarios.length}`);
        console.log(`Espacio usado: ${this.obtenerTamano()}`);
        console.log(`Usuario actual: ${StorageAPI.obtenerUsuarioActual()?.username || 'Ninguno'}`);
        console.log('========================');
    }
};

// Mostrar en consola cómo usar estas utilidades
console.log('%c🎬 CINÉ FILO - Utilidades de Respaldo', 'color: #ff4444; font-size: 16px; font-weight: bold;');
console.log('Usa estas funciones en la consola:');
console.log('  • BackupUtils.descargarBackup() - Descargar respaldo como archivo JSON');
console.log('  • BackupUtils.restaurarBackup(archivo) - Restaurar desde un archivo');
console.log('  • BackupUtils.obtenerTamano() - Ver tamaño de datos');
console.log('  • BackupUtils.limpiarTodo() - Eliminar todos los datos');
console.log('  • BackupUtils.mostrarEstadisticas() - Ver estadísticas');
