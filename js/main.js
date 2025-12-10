// ========== GESTIÓN DE PELÍCULAS ==========
let peliculas = [];
let currentIndex = 0;
let selectedMovie = null;
let filtroActual = 'all'; // Filtro actual: 'all', 'popular', o nombre de categoría
let peliculasFavoritas = []; // Array de IDs de películas favoritas

// Cargar películas desde localStorage
async function cargarPeliculas() {
    try {
        peliculas = StorageAPI.cargarPeliculas();
        cargarFavoritos();

    } catch (error) {
        console.error('Error al cargar películas:', error);
        peliculas = [];
    }
}

// Guardar película en localStorage
async function guardarPelicula(formData) {
    try {
        const nombre = formData.get('nombre');
        const categorias = JSON.parse(formData.get('categorias'));
        const tipo = formData.get('tipo');
        const contenido = formData.get('contenido');
        const duracion = parseInt(formData.get('duracion'));
        const satisfaccion = formData.get('satisfaccion');
        const resena = formData.get('resena');
        const file = formData.get('imagen');

        // Convertir imagen a base64
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
            reader.onload = function(e) {
                try {
                    const pelicula = {
                        id: Date.now(),
                        nombre,
                        categorias,
                        tipo,
                        contenido,
                        duracion,
                        satisfaccion,
                        resena,
                        imagen: e.target.result, // Base64 de la imagen
                        fecha: new Date().toISOString()
                    };

                    const result = StorageAPI.guardarPelicula(pelicula);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = function() {
                reject(new Error('Error al leer la imagen'));
            };

            reader.readAsDataURL(file);
        });
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Eliminar película de localStorage
async function eliminarPelicula(id) {
    try {
        return StorageAPI.eliminarPelicula(id);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Elementos del DOM
const modal = document.getElementById('modalAgregar');
const btnAgregar = document.getElementById('btnAgregar');
const closeModal = document.getElementById('closeModal');
const formPelicula = document.getElementById('formPelicula');
const carousel = document.getElementById('carousel');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const uploadArea = document.getElementById('uploadArea');
const imagenInput = document.getElementById('imagen');
const previewContainer = document.getElementById('previewContainer');
const filterButtons = document.querySelectorAll('.filter-btn');
const detailSection = document.getElementById('detailSection');
const topMovies = document.getElementById('topMovies');
const barChart = document.getElementById('barChart');
const btnEliminar = document.getElementById('btnEliminar');
const btnFavorito = document.getElementById('btnFavorito');

// ========== MODAL ==========
btnAgregar.addEventListener('click', () => {
    modal.classList.add('active');
    formPelicula.reset();
    previewContainer.innerHTML = '';
});

closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// ========== UPLOAD DE IMAGEN ==========
uploadArea.addEventListener('click', () => imagenInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(255, 68, 68, 0.2)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = 'rgba(255, 68, 68, 0.05)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(255, 68, 68, 0.05)';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        imagenInput.files = files;
        handleImagePreview();
    }
});

imagenInput.addEventListener('change', handleImagePreview);

function handleImagePreview() {
    const file = imagenInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// ========== ENVÍO DE FORMULARIO ==========
formPelicula.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categorias = Array.from(document.querySelectorAll('input[name="categoria"]:checked'))
        .map(cb => cb.value);

    if (categorias.length === 0) {
        alert('Selecciona al menos una categoría');
        return;
    }

    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipo').value;
    const contenido = document.getElementById('contenido').value;
    const duracion = document.getElementById('duracion').value;
    const satisfaccion = document.getElementById('satisfaccion').value;
    const resena = document.getElementById('resena').value;
    const file = imagenInput.files[0];

    if (!file) {
        alert('Por favor, sube una imagen');
        return;
    }

    // Crear FormData para enviar al backend
    const formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('categorias', JSON.stringify(categorias));
    formData.append('tipo', tipo);
    formData.append('contenido', contenido);
    formData.append('duracion', duracion);
    formData.append('satisfaccion', satisfaccion);
    formData.append('resena', resena);
    formData.append('imagen', file);

    try {
        // Mostrar mensaje de carga
        btnAgregar.disabled = true;
        const btnText = document.querySelector('.btn-submit');
        const originalText = btnText.textContent;
        btnText.textContent = 'Guardando...';

        // Enviar al backend
        await guardarPelicula(formData);

        // Recargar películas
        await cargarPeliculas();

        modal.classList.remove('active');
        formPelicula.reset();
        previewContainer.innerHTML = '';

        renderCarousel();
        updateStats();
        updateRankingSection();

        // Restaurar botón
        btnAgregar.disabled = false;
        btnText.textContent = originalText;

        mostrarResultado('✓ Película agregada', '¡Película guardada correctamente!');
    } catch (error) {
        mostrarResultado('✗ Error', 'Error: ' + error.message);
        btnAgregar.disabled = false;
        const btnText = document.querySelector('.btn-submit');
        btnText.textContent = 'Agregar Película';
    }
});

// ========== FUNCIONES DE FILTRADO ==========
function obtenerPelículasFiltradas() {
    let resultado = peliculas;
    
    if (filtroActual === 'all') {
        // Mostrar todas las películas con favoritos primero
        const favoritas = peliculas.filter(p => esFavorito(p.id));
        const noFavoritas = peliculas.filter(p => !esFavorito(p.id));
        resultado = [...favoritas, ...noFavoritas];
    } else if (filtroActual === 'popular') {
        // Mostrar solo películas favoritas (Popular)
        resultado = peliculas.filter(p => esFavorito(p.id));
    } else {
        // Filtrar por categoría (con favoritos primero)
        const porCategoria = peliculas.filter(pelicula => 
            pelicula.categorias.includes(filtroActual)
        );
        const favoritas = porCategoria.filter(p => esFavorito(p.id));
        const noFavoritas = porCategoria.filter(p => !esFavorito(p.id));
        resultado = [...favoritas, ...noFavoritas];
    }
    
    return resultado;
}

// ========== GESTIÓN DE FAVORITOS ==========
function cargarFavoritos() {
    try {
        const favoritos = localStorage.getItem('peliculasFavoritas');
        peliculasFavoritas = favoritos ? JSON.parse(favoritos) : [];
    } catch (error) {
        console.error('Error al cargar favoritos:', error);
        peliculasFavoritas = [];
    }
}

function guardarFavoritos() {
    try {
        localStorage.setItem('peliculasFavoritas', JSON.stringify(peliculasFavoritas));
    } catch (error) {
        console.error('Error al guardar favoritos:', error);
    }
}

function toggleFavorito(peliculaId) {
    const index = peliculasFavoritas.indexOf(peliculaId);
    if (index > -1) {
        peliculasFavoritas.splice(index, 1);
    } else {
        peliculasFavoritas.push(peliculaId);
    }
    guardarFavoritos();
    actualizarBtnFavorito();
}

function esFavorito(peliculaId) {
    return peliculasFavoritas.includes(peliculaId);
}

function actualizarBtnFavorito() {
    const btnFavorito = document.getElementById('btnFavorito');
    if (!btnFavorito || !selectedMovie) return;
    
    if (esFavorito(selectedMovie.id)) {
        btnFavorito.classList.add('active');
    } else {
        btnFavorito.classList.remove('active');
    }
}

// ========== CARRUSEL ==========
function renderCarousel() {
    carousel.innerHTML = '';
    
    // Obtener películas filtradas
    const peliculasFiltradas = obtenerPelículasFiltradas();

    if (peliculasFiltradas.length === 0) {
        carousel.innerHTML = `
            <div class="carousel-item">
                <div class="carousel-item-placeholder">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="2"/>
                        <circle cx="50" cy="40" r="8" fill="currentColor"/>
                        <path d="M20 70 L35 50 L50 65 L80 30 L80 80 Z" fill="currentColor" opacity="0.3"/>
                    </svg>
                </div>
            </div>
        `;
        actualizarSelectPeliculas();
        return;
    }

    peliculasFiltradas.forEach((pelicula, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.innerHTML = `
            <img src="${pelicula.imagen}" alt="${pelicula.nombre}">
        `;
        item.addEventListener('click', () => {
            selectedMovie = pelicula;
            updateDetailSection();
            updateStats();
            updateRankingSection();
            detailSection.scrollIntoView({ behavior: 'smooth' });
        });
        carousel.appendChild(item);
    });

    actualizarSelectPeliculas();
    updateCarouselPosition();
}

function updateCarouselPosition() {
    const itemWidth = 220;
    const gap = 32;
    const translateX = -(currentIndex * (itemWidth + gap));
    carousel.style.transform = `translateX(${translateX}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= peliculas.length - 1;
}

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarouselPosition();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < peliculas.length - 1) {
        currentIndex++;
        updateCarouselPosition();
    }
});

// ========== FILTROS ==========
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');
        filtroActual = filter; // Actualizar filtro global
        currentIndex = 0;
        renderCarousel(); // Renderizar con el nuevo filtro
        updateDetailSection();
        updateStats();
        updateRankingSection();
    });
});

// ========== BOTÓN FAVORITO ==========
btnFavorito.addEventListener('click', () => {
    if (!selectedMovie) {
        alert('Por favor, selecciona una película primero');
        return;
    }
    
    toggleFavorito(selectedMovie.id);
});

// ========== SECCIÓN DE DETALLE ==========
function updateDetailSection() {
    if (!selectedMovie) {
        document.getElementById('detailTitle').textContent = 'Selecciona una película';
        document.getElementById('detailResena').textContent = 'Las reseñas aparecerán aquí...';
        document.getElementById('posterImage').innerHTML = `
            <svg viewBox="0 0 300 400" width="100%" height="100%">
                <rect width="300" height="400" fill="#333"/>
                <text x="150" y="200" text-anchor="middle" fill="#666" font-size="20">Sin Imagen</text>
            </svg>
        `;
        btnEliminar.style.display = 'none';
        btnFavorito.style.display = 'none';
        return;
    }

    document.getElementById('detailTitle').textContent = selectedMovie.nombre;
    document.getElementById('detailResena').textContent = selectedMovie.resena;

    const posterDiv = document.getElementById('posterImage');
    posterDiv.innerHTML = `<img src="${selectedMovie.imagen}" alt="${selectedMovie.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`;

    document.getElementById('datoContenido').textContent = selectedMovie.contenido === 'pelicula' ? 'Película' : 'Serie';
    document.getElementById('datoCategoría').textContent = selectedMovie.categorias.join(', ');
    document.getElementById('datoTipo').textContent = selectedMovie.tipo;
    document.getElementById('datoDuracion').textContent = `${selectedMovie.duracion} min`;
    document.getElementById('datoSatisfaccion').textContent = selectedMovie.satisfaccion;
    
    // Mostrar botones cuando hay película seleccionada
    btnEliminar.style.display = 'block';
    btnFavorito.style.display = 'block';
    
    // Actualizar estado del botón favorito
    actualizarBtnFavorito();
}

// ========== ESTADÍSTICAS ==========
function updateStats() {
    updateTopMovies();
    updateBarChart();
}

function updateTopMovies() {
    topMovies.innerHTML = '';

    if (peliculas.length === 0) {
        topMovies.innerHTML = '<p style="color: #999;">No hay películas aún</p>';
        return;
    }

    // Ordenar por satisfacción, pero si tienen la misma satisfacción, mantener el orden de agregación
    const satisfaccionOrder = { 'alto': 3, 'medio': 2, 'bajo': 1 };
    const sorted = [...peliculas].sort((a, b) => {
        const diffSatisfaccion = satisfaccionOrder[b.satisfaccion] - satisfaccionOrder[a.satisfaccion];
        if (diffSatisfaccion === 0) {
            // Si tienen la misma satisfacción, mantener el orden de agregación (más reciente primero)
            return b.id - a.id;
        }
        return diffSatisfaccion;
    }).slice(0, 5);

    sorted.forEach((pelicula) => {
        const stars = getSatisfaccionStars(pelicula.satisfaccion);
        const starsHTML = Array(5)
            .fill()
            .map((_, i) => `<span class="star ${i < stars ? '' : 'empty'}">★</span>`)
            .join('');

        const rankDiv = document.createElement('div');
        rankDiv.className = 'movie-rank';
        rankDiv.innerHTML = `
            <span class="movie-rank-name">${pelicula.nombre}</span>
            <div class="movie-rank-stars">${starsHTML}</div>
        `;
        topMovies.appendChild(rankDiv);
    });
}

function getSatisfaccionStars(satisfaccion) {
    const stars = { 'alto': 5, 'medio': 3, 'bajo': 2 };
    return stars[satisfaccion] || 0;
}

function updateBarChart() {
    barChart.innerHTML = '';

    if (peliculas.length === 0) {
        barChart.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">No hay películas aún</p>';
        return;
    }

    // Ordenar por satisfacción, pero si tienen la misma satisfacción, mantener el orden de agregación
    const satisfaccionOrder = { 'alto': 3, 'medio': 2, 'bajo': 1 };
    const top5 = [...peliculas].sort((a, b) => {
        const diffSatisfaccion = satisfaccionOrder[b.satisfaccion] - satisfaccionOrder[a.satisfaccion];
        if (diffSatisfaccion === 0) {
            // Si tienen la misma satisfacción, mantener el orden de agregación (más reciente primero)
            return b.id - a.id;
        }
        return diffSatisfaccion;
    }).slice(0, 5);

    top5.forEach((pelicula) => {
        const barGroup = document.createElement('div');
        barGroup.className = 'bar-group';

        // Título con nombre de película
        const title = document.createElement('div');
        title.className = 'bar-group-title';
        title.textContent = pelicula.nombre;

        // Celda de Tipo de Contenido
        const cellContenido = document.createElement('div');
        cellContenido.className = 'data-cell';

        const labelContenido = document.createElement('div');
        labelContenido.className = 'data-label';
        labelContenido.textContent = 'Contenido';

        const valueContenido = document.createElement('div');
        valueContenido.className = 'data-value';
        valueContenido.textContent = pelicula.contenido === 'pelicula' ? '🎬 Película' : '📺 Serie';
        valueContenido.style.color = pelicula.contenido === 'pelicula' ? '#44ff88' : '#ff9944';

        cellContenido.appendChild(labelContenido);
        cellContenido.appendChild(valueContenido);

        // Celda de Tipo
        const cellTipo = document.createElement('div');
        cellTipo.className = 'data-cell';

        const labelTipo = document.createElement('div');
        labelTipo.className = 'data-label';
        labelTipo.textContent = 'Tipo';

        const valueTipo = document.createElement('div');
        valueTipo.className = `data-value tipo-${pelicula.tipo}`;
        valueTipo.textContent = pelicula.tipo === 'nueva' ? '✓ Nueva' : '↻ Repetida';

        cellTipo.appendChild(labelTipo);
        cellTipo.appendChild(valueTipo);

        // Celda de Satisfacción
        const cellSatisfaccion = document.createElement('div');
        cellSatisfaccion.className = 'data-cell';

        const labelSatisfaccion = document.createElement('div');
        labelSatisfaccion.className = 'data-label';
        labelSatisfaccion.textContent = 'Satisfacción';

        const valueSatisfaccion = document.createElement('div');
        valueSatisfaccion.className = `data-value satisfaccion-${pelicula.satisfaccion}`;
        
        if (pelicula.satisfaccion === 'alto') {
            valueSatisfaccion.textContent = '★★★ Alto';
        } else if (pelicula.satisfaccion === 'medio') {
            valueSatisfaccion.textContent = '★★ Medio';
        } else {
            valueSatisfaccion.textContent = '★ Bajo';
        }

        cellSatisfaccion.appendChild(labelSatisfaccion);
        cellSatisfaccion.appendChild(valueSatisfaccion);

        // Celda de Duración
        const cellDuracion = document.createElement('div');
        cellDuracion.className = 'data-cell';

        const labelDuracion = document.createElement('div');
        labelDuracion.className = 'data-label';
        labelDuracion.textContent = 'Duración';

        const valueDuracion = document.createElement('div');
        valueDuracion.className = 'data-value';
        valueDuracion.textContent = `${pelicula.duracion} min`;
        valueDuracion.style.color = '#ffaa44';

        cellDuracion.appendChild(labelDuracion);
        cellDuracion.appendChild(valueDuracion);

        barGroup.appendChild(title);
        barGroup.appendChild(cellContenido);
        barGroup.appendChild(cellTipo);
        barGroup.appendChild(cellSatisfaccion);
        barGroup.appendChild(cellDuracion);

        barChart.appendChild(barGroup);
    });

    // Agregar leyenda
    const legend = document.createElement('div');
    legend.className = 'bar-legend';
    legend.innerHTML = `
        <div class="legend-item">
            <div class="legend-color" style="background: #ff4444;"></div>
            <span><strong>Película #1:</strong> Top 1</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #44aaff;"></div>
            <span><strong>Película #2:</strong> Top 2</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #44ff88;"></div>
            <span><strong>Película #3:</strong> Top 3</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #ffaa44;"></div>
            <span><strong>Película #4:</strong> Top 4</span>
        </div>
        <div class="legend-item">
            <div class="legend-color" style="background: #cc44ff;"></div>
            <span><strong>Película #5:</strong> Top 5</span>
        </div>
    `;
    barChart.appendChild(legend);
}

// ========== RANKING DE COMENTARIOS ==========
function updateRankingSection() {
    updateTopCommenters();
    updateTopRatedMovies();
}

function updateTopCommenters() {
    const topCommenters = document.getElementById('topCommenters');
    if (!topCommenters) return;
    
    topCommenters.innerHTML = '';
    
    const comentarios = StorageAPI.cargarComentarios();
    
    if (comentarios.length === 0) {
        topCommenters.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No hay comentarios aún</p>';
        return;
    }
    
    // Contar comentarios por usuario
    const contadores = {};
    comentarios.forEach(comentario => {
        contadores[comentario.username] = (contadores[comentario.username] || 0) + 1;
    });
    
    // Ordenar y obtener top 5
    const top5 = Object.entries(contadores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    if (top5.length === 0) {
        topCommenters.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No hay comentarios aún</p>';
        return;
    }
    
    top5.forEach((entry, index) => {
        const [username, count] = entry;
        const initial = username.charAt(0).toUpperCase();
        
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item';
        rankItem.innerHTML = `
            <div class="rank-number">${index + 1}</div>
            <div class="rank-user-profile">${initial}</div>
            <div class="rank-user-info">
                <div class="rank-username">${username}</div>
                <div class="rank-count">${count} comentario${count !== 1 ? 's' : ''}</div>
            </div>
        `;
        topCommenters.appendChild(rankItem);
    });
}

function updateTopRatedMovies() {
    const topRatedMovies = document.getElementById('topRatedMovies');
    if (!topRatedMovies) return;
    
    topRatedMovies.innerHTML = '';
    
    const comentarios = StorageAPI.cargarComentarios();
    
    // Calcular promedio de calificación por película
    const promedios = {};
    const contadores = {};
    
    comentarios.forEach(comentario => {
        const pelicula = comentario.pelicula;
        promedios[pelicula] = (promedios[pelicula] || 0) + comentario.calificacion;
        contadores[pelicula] = (contadores[pelicula] || 0) + 1;
    });
    
    // Calcular promedios y ordenar
    const ratings = Object.entries(promedios)
        .map(([pelicula, total]) => ({
            pelicula,
            promedio: (total / contadores[pelicula]).toFixed(1),
            comentarios: contadores[pelicula]
        }))
        .sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio))
        .slice(0, 5);
    
    if (ratings.length === 0) {
        topRatedMovies.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">No hay calificaciones aún</p>';
        return;
    }
    
    ratings.forEach((item, index) => {
        const stars = Array(5)
            .fill()
            .map((_, i) => `<span class="star ${i < Math.round(item.promedio) ? '' : 'empty'}">★</span>`)
            .join('');
        
        const rankItem = document.createElement('div');
        rankItem.className = 'rank-item movie-rank';
        rankItem.innerHTML = `
            <div class="rank-number">${index + 1}</div>
            <div class="rank-movie-info">
                <div class="rank-movie-name">${item.pelicula}</div>
                <div class="rank-movie-rating">${stars}</div>
                <div class="rank-movie-count">${item.promedio}/5 (${item.comentarios} calificación${item.comentarios !== 1 ? 'es' : ''})</div>
            </div>
        `;
        topRatedMovies.appendChild(rankItem);
    });
}

// ========== GESTIÓN DE AUTENTICACIÓN ==========
let usuarioActual = null;

// Elementos de autenticación
const perfilBtn = document.getElementById('perfilBtn');
const perfilMenu = document.getElementById('perfilMenu');
const perfilUserInfo = document.getElementById('perfilUserInfo');
const perfilLogout = document.getElementById('perfilLogout');
const modalAutenticacion = document.getElementById('modalAutenticacion');
const closeModalAuth = document.getElementById('closeModalAuth');
const authTabs = document.querySelectorAll('.auth-tab');
const formLogin = document.getElementById('formLogin');
const formRegister = document.getElementById('formRegister');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

// Elementos para confirmación de eliminación
const modalConfirmEliminar = document.getElementById('modalConfirmEliminar');
const closeConfirmEliminar = document.getElementById('closeConfirmEliminar');
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
const confirmEliminarTitle = document.getElementById('confirmEliminarTitle');
const confirmEliminarMsg = document.getElementById('confirmEliminarMsg');

// Elementos para resultado de operación
const modalResultado = document.getElementById('modalResultado');
const closeModalResultado = document.getElementById('closeModalResultado');
const resultadoTitle = document.getElementById('resultadoTitle');
const resultadoMsg = document.getElementById('resultadoMsg');

let idPeliculaAEliminar = null;

// Elementos del foro
const formForo = document.getElementById('formForo');
const foroPelicula = document.getElementById('foroPelicula');
const foroCalificacion = document.getElementById('foroCalificacion');
const foroResena = document.getElementById('foroResena');
const btnEnviarForo = document.getElementById('btnEnviarForo');
const starsInput = document.getElementById('starsInput');
const forumComments = document.getElementById('forumComments');
const forumLoginMsg = document.getElementById('forumLoginMsg');
let calificacionSeleccionada = 0;

function cargarUsuarioLocal() {
    const user = StorageAPI.obtenerUsuarioActual();
    if (user) {
        usuarioActual = user;
        actualizarUIUsuario();
    }
}

// Guardar usuario en localStorage
function guardarUsuarioLocal(user) {
    StorageAPI.guardarUsuarioActual(user);
}

// Actualizar UI cuando hay usuario
function actualizarUIUsuario() {
    if (usuarioActual) {
        // Mostrar bienvenida
        perfilUserInfo.innerHTML = `
            <div class="perfil-user-welcome">¡Bienvenido!</div>
            <div class="perfil-user-name">${usuarioActual.username}</div>
        `;
        perfilLogout.classList.add('show');
    } else {
        // Volver a mostrar perfil vacío
        perfilUserInfo.innerHTML = '';
        perfilLogout.classList.remove('show');
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        authTabs[0].classList.add('active');
        authTabs[1].classList.remove('active');
        loginTab.style.display = 'block';
        registerTab.style.display = 'none';
    }
    // Actualizar UI del foro
    actualizarUIForo();
}

// Toggle del menú de perfil
perfilBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!usuarioActual) {
        // Si no hay usuario, abrir modal de autenticación
        modalAutenticacion.classList.add('active');
        perfilMenu.classList.remove('show');
    } else {
        // Si hay usuario, toggle el menú
        perfilMenu.classList.toggle('show');
    }
});

// Cerrar menú al hacer click afuera
document.addEventListener('click', (e) => {
    if (e.target !== perfilBtn && !perfilBtn.contains(e.target)) {
        perfilMenu.classList.remove('show');
    }
});

// Cerrar sesión
perfilLogout.addEventListener('click', () => {
    usuarioActual = null;
    StorageAPI.limpiarUsuarioActual();
    actualizarUIUsuario();
    perfilMenu.classList.remove('show');
});

// ========== MODAL DE AUTENTICACIÓN ==========
closeModalAuth.addEventListener('click', () => {
    modalAutenticacion.classList.remove('active');
});

modalAutenticacion.addEventListener('click', (e) => {
    if (e.target === modalAutenticacion) {
        modalAutenticacion.classList.remove('active');
    }
});

// Tabs en modal de autenticación
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        // Remove active class from all tabs
        authTabs.forEach(t => t.classList.remove('active'));
        loginTab.classList.remove('active');
        registerTab.classList.remove('active');
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        if (tabName === 'login') {
            loginTab.classList.add('active');
            loginTab.style.display = 'block';
            registerTab.style.display = 'none';
        } else {
            registerTab.classList.add('active');
            loginTab.style.display = 'none';
            registerTab.style.display = 'block';
        }
    });
});

// Inicializar tabs
loginTab.classList.add('active');
loginTab.style.display = 'block';
registerTab.style.display = 'none';

// Login
formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Verificar si el usuario existe en localStorage
    const usuariosGuardados = StorageAPI.cargarUsuarios();
    const usuarioEncontrado = usuariosGuardados.find(u => u.username === username && u.password === password);
    
    if (usuarioEncontrado) {
        usuarioActual = usuarioEncontrado;
        guardarUsuarioLocal(usuarioActual);
        actualizarUIUsuario();
        modalAutenticacion.classList.remove('active');
        formLogin.reset();
        mostrarResultado('✓ Bienvenido', `¡Sesión iniciada correctamente!\n${usuarioActual.username}`);
    } else {
        mostrarResultado('✗ Error', 'Usuario o contraseña incorrectos');
    }
});

// Registro
formRegister.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('registerNombre').value;
    const apellido = document.getElementById('registerApellido').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        mostrarResultado('✗ Error', 'Las contraseñas no coinciden');
        return;
    }
    
    // Verificar si el usuario ya existe
    const usuariosGuardados = StorageAPI.cargarUsuarios();
    if (usuariosGuardados.find(u => u.username === username)) {
        mostrarResultado('✗ Error', 'El nombre de usuario ya existe');
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        nombre,
        apellido,
        username,
        password
    };
    
    StorageAPI.guardarUsuario(nuevoUsuario);
    
    // Login automático
    usuarioActual = nuevoUsuario;
    guardarUsuarioLocal(usuarioActual);
    actualizarUIUsuario();
    modalAutenticacion.classList.remove('active');
    formRegister.reset();
    mostrarResultado('✓ Registro Exitoso', `¡Bienvenido ${username}!\nYa puedes comentar en el foro`);
});

// ========== MODAL CONFIRMACIÓN ELIMINACIÓN ==========
closeConfirmEliminar.addEventListener('click', () => {
    modalConfirmEliminar.classList.remove('active');
});

btnCancelarEliminar.addEventListener('click', () => {
    modalConfirmEliminar.classList.remove('active');
    idPeliculaAEliminar = null;
});

modalConfirmEliminar.addEventListener('click', (e) => {
    if (e.target === modalConfirmEliminar) {
        modalConfirmEliminar.classList.remove('active');
    }
});

// Event listener para cerrar modal de resultado
closeModalResultado.addEventListener('click', () => {
    modalResultado.classList.remove('active');
});

modalResultado.addEventListener('click', (e) => {
    if (e.target === modalResultado) {
        modalResultado.classList.remove('active');
    }
});

// Función para mostrar resultado
function mostrarResultado(titulo, mensaje) {
    resultadoTitle.textContent = titulo;
    resultadoMsg.textContent = mensaje;
    modalResultado.classList.add('active');
}

btnConfirmarEliminar.addEventListener('click', async () => {
    if (!idPeliculaAEliminar) return;
    
    try {
        btnConfirmarEliminar.disabled = true;
        btnConfirmarEliminar.textContent = '⏳ Eliminando...';
        
        await eliminarPelicula(idPeliculaAEliminar);
        await cargarPeliculas();
        
        selectedMovie = null;
        renderCarousel();
        updateStats();
        updateRankingSection();
        updateDetailSection();
        
        modalConfirmEliminar.classList.remove('active');
        btnConfirmarEliminar.disabled = false;
        btnConfirmarEliminar.textContent = 'Eliminar';
        idPeliculaAEliminar = null;
        
        // Mostrar resultado en modal
        mostrarResultado('✓ Éxito', '¡Película eliminada correctamente!');
    } catch (error) {
        btnConfirmarEliminar.disabled = false;
        btnConfirmarEliminar.textContent = 'Eliminar';
        // Mostrar error en modal
        mostrarResultado('✗ Error', 'Error al eliminar: ' + error.message);
    }
});

// Reemplazar el event listener del botón eliminar
btnEliminar.removeEventListener('click', () => {});
btnEliminar.addEventListener('click', () => {
    if (!selectedMovie) {
        alert('Por favor, selecciona una película primero');
        return;
    }
    
    idPeliculaAEliminar = selectedMovie.id;
    const tipoContenido = selectedMovie.contenido === 'pelicula' ? 'película' : 'serie';
    confirmEliminarMsg.textContent = `¿Estás seguro de que deseas eliminar toda la información de esta ${tipoContenido}?`;
    
    modalConfirmEliminar.classList.add('active');
});

// ========== GESTIÓN DEL FORO ==========
// Cargar comentarios desde localStorage
function cargarComentarios() {
    const comentarios = StorageAPI.cargarComentarios();
    mostrarComentarios(comentarios);
}

// Guardar comentarios en localStorage
function guardarComentario(comentario) {
    StorageAPI.guardarComentario(comentario);
}

// Mostrar comentarios en la UI
function mostrarComentarios(comentarios) {
    forumComments.innerHTML = '';
    
    if (comentarios.length === 0) {
        forumComments.innerHTML = '<div class="forum-empty">No hay comentarios aún. ¡Sé el primero en comentar!</div>';
        return;
    }
    
    comentarios.forEach(comentario => {
        const comentarioEl = document.createElement('div');
        comentarioEl.className = 'comment-item';
        
        // Generar initial del usuario
        const initial = comentario.username.charAt(0).toUpperCase();
        
        comentarioEl.innerHTML = `
            <div class="comment-header">
                <div class="comment-profile">${initial}</div>
                <div class="comment-info">
                    <div class="comment-username">${comentario.username}</div>
                    <div class="comment-movie">${comentario.pelicula}</div>
                    <div class="comment-stars">${'★'.repeat(comentario.calificacion)}${'☆'.repeat(5 - comentario.calificacion)}</div>
                </div>
            </div>
            <p class="comment-text">${comentario.resena}</p>
            <div class="comment-date">${new Date(comentario.fecha).toLocaleDateString('es-ES')}</div>
        `;
        
        forumComments.appendChild(comentarioEl);
    });
}

// Actualizar lista de películas en selector del foro
function actualizarSelectPeliculas() {
    foroPelicula.innerHTML = '<option value="">-- Elige una película --</option>';
    
    peliculas.forEach(pelicula => {
        const option = document.createElement('option');
        option.value = pelicula.nombre;
        option.textContent = pelicula.nombre;
        foroPelicula.appendChild(option);
    });
}

// Manejo de estrellas en el foro
const stars = starsInput.querySelectorAll('.star');
stars.forEach(star => {
    star.addEventListener('click', () => {
        calificacionSeleccionada = parseInt(star.getAttribute('data-value'));
        foroCalificacion.value = calificacionSeleccionada;
        
        // Actualizar UI de estrellas
        stars.forEach((s, index) => {
            if (index < calificacionSeleccionada) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    });
    
    // Hover effect
    star.addEventListener('mouseenter', () => {
        const value = parseInt(star.getAttribute('data-value'));
        stars.forEach((s, index) => {
            if (index < value) {
                s.style.color = '#ff4444';
            } else {
                s.style.color = '#555';
            }
        });
    });
});

starsInput.addEventListener('mouseleave', () => {
    stars.forEach((s, index) => {
        if (index < calificacionSeleccionada) {
            s.classList.add('active');
            s.style.color = '#ff4444';
        } else {
            s.classList.remove('active');
            s.style.color = '#555';
        }
    });
});

// Actualizar UI del foro según autenticación
function actualizarUIForo() {
    if (usuarioActual) {
        formForo.style.display = 'block';
        btnEnviarForo.disabled = false;
        forumLoginMsg.classList.remove('show');
    } else {
        formForo.style.display = 'none';
        btnEnviarForo.disabled = true;
        forumLoginMsg.classList.add('show');
    }
}

// Envío del formulario del foro
formForo.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!usuarioActual) {
        mostrarResultado('✗ No autorizado', 'Debes iniciar sesión para comentar');
        return;
    }
    
    if (!foroPelicula.value) {
        mostrarResultado('⚠ Campo requerido', 'Selecciona una película');
        return;
    }
    
    if (calificacionSeleccionada === 0) {
        mostrarResultado('⚠ Campo requerido', 'Selecciona una calificación');
        return;
    }
    
    if (!foroResena.value.trim()) {
        mostrarResultado('⚠ Campo requerido', 'Escribe un comentario');
        return;
    }
    
    // Crear objeto comentario
    const comentario = {
        username: usuarioActual.username,
        pelicula: foroPelicula.value,
        calificacion: calificacionSeleccionada,
        resena: foroResena.value,
        fecha: new Date().toISOString()
    };
    
    // Guardar comentario
    guardarComentario(comentario);
    
    // Recargar comentarios
    cargarComentarios();
    updateRankingSection();
    
    // Limpiar formulario
    formForo.reset();
    calificacionSeleccionada = 0;
    foroCalificacion.value = 0;
    stars.forEach(s => s.classList.remove('active'));
    
    mostrarResultado('✓ Comentario enviado', '¡Tu comentario ha sido agregado correctamente!');
});

// ========== INICIALIZACIÓN ==========
async function init() {
    cargarUsuarioLocal();
    await cargarPeliculas();
    actualizarSelectPeliculas();
    cargarComentarios();
    actualizarUIForo();
    renderCarousel();
    updateStats();
    updateRankingSection();
    if (peliculas.length > 0) {
        selectedMovie = peliculas[0];
        updateDetailSection();
    }
}

init();
