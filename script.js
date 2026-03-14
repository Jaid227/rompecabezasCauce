// ============================================
// PUZZLE MASTER - VERSIÓN CORREGIDA
// Las piezas muestran EXACTAMENTE el fragmento correcto
// ============================================

class PuzzleMaster {
    constructor() {
        // Elementos del DOM
        this.tablero = document.getElementById('tablero');
        this.piezasContainer = document.getElementById('piezasContainer');
        this.progreso = document.getElementById('progreso');
        this.tiempoSpan = document.getElementById('tiempo');
        this.movimientosSpan = document.getElementById('movimientos');
        this.piezasRestantes = document.getElementById('piezasRestantes');
        this.progressBar = document.getElementById('progressBar');
        this.previewImage = document.getElementById('previewImage');
        this.boardOverlay = document.getElementById('boardOverlay');
        this.completionMessage = document.getElementById('completionMessage');
        this.victoryModal = document.getElementById('victoryModal');
        this.modalTiempo = document.getElementById('modalTiempo');
        this.modalMovimientos = document.getElementById('modalMovimientos');
        
        // Lista de tus imágenes (deben estar en la carpeta /imagenes/)
        this.imagenes = [
            { 
                id: 1, 
                nombre: 'Salud Mental', 
                archivo: 'imagenes/rompecabezas1.png',
                tamaño: '245 KB',
                formato: 'PNG',
                descripcion: 'Una emocionante imagen de aventura con paisajes montañosos. Perfecta para poner a prueba tu habilidad.'
            },
            { 
                id: 2, 
                nombre: 'Sociolaboral', 
                archivo: 'imagenes/rompecabezas2.png',
                tamaño: '312 KB',
                formato: 'PNG',
                descripcion: 'Hermosa imagen de la naturaleza con bosques frondosos. Conecta con la naturaleza mientras armas este puzzle.'
            },
            { 
                id: 3, 
                nombre: 'Tecnología e innovación', 
                archivo: 'imagenes/rompecabezas3.png',
                tamaño: '289 KB',
                formato: 'PNG',
                descripcion: 'Moderna imagen urbana con rascacielos. Disfruta de la vida citadina en este desafiante rompecabezas.'
            },
            { 
                id: 4, 
                nombre: 'Sociocomunitario', 
                archivo: 'imagenes/rompecabezas4.png',
                tamaño: '298 KB',
                formato: 'PNG',
                descripcion: 'Fascinante imagen del espacio exterior con galaxias y estrellas.'
            },
            { 
                id: 5, 
                nombre: 'Fundación', 
                archivo: 'imagenes/rompecabezas5.png',
                tamaño: '423 KB',
                formato: 'PNG',
                descripcion: 'Colorida obra de arte abstracto con formas y patrones únicos.'
            }
        ];
        
        // Estado del juego
        this.imagenActual = null;
        this.imagenInfo = null;
        this.piezas = [];
        this.piezasColocadas = new Array(9).fill(false);
        this.piezaSeleccionada = null;
        this.movimientos = 0;
        this.tiempoInicio = null;
        this.temporizador = null;
        this.juegoCompletado = false;
        
        // Inicializar
        this.inicializar();
    }
    
    inicializar() {
        this.crearTablero();
        this.cargarSelectorImagenes();
        this.configurarEventos();
        this.cargarUltimaImagen();
        this.agregarAnimaciones();
        this.crearModalInfo(); // Crear modal de información al inicio
    }
    
    crearTablero() {
        this.tablero.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const celda = document.createElement('div');
            celda.className = 'board-cell empty';
            celda.dataset.posicion = i;
            
            // Eventos drag & drop
            celda.addEventListener('dragover', (e) => e.preventDefault());
            celda.addEventListener('dragenter', () => {
                if (!celda.hasChildNodes()) {
                    celda.style.background = 'rgba(72, 187, 120, 0.2)';
                }
            });
            celda.addEventListener('dragleave', () => {
                celda.style.background = '';
            });
            celda.addEventListener('drop', (e) => this.soltarPieza(e, celda));
            
            this.tablero.appendChild(celda);
        }
    }
    
    cargarSelectorImagenes() {
        const imageGrid = document.getElementById('imageGrid');
        if (!imageGrid) return;
        
        imageGrid.innerHTML = '';
        
        this.imagenes.forEach(img => {
            const opcion = document.createElement('div');
            opcion.className = 'image-option';
            opcion.dataset.imagen = img.archivo;
            opcion.dataset.id = img.id;
            
            const imgElement = document.createElement('img');
            imgElement.src = img.archivo;
            imgElement.alt = img.nombre;
            imgElement.loading = 'lazy';
            
            const span = document.createElement('span');
            span.textContent = img.nombre;
            
            opcion.appendChild(imgElement);
            opcion.appendChild(span);
            
            opcion.addEventListener('click', () => {
                document.querySelectorAll('.image-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                opcion.classList.add('selected');
                this.cambiarImagen(img.archivo, img.id);
            });
            
            imageGrid.appendChild(opcion);
        });
    }
    
    cambiarImagen(archivo, id) {
        this.imagenActual = archivo;
        this.imagenInfo = this.imagenes.find(img => img.id == id);
        if (this.previewImage) {
            this.previewImage.src = archivo;
        }
        this.reiniciarJuego();
    }
    
    cargarUltimaImagen() {
        if (this.imagenes.length > 0) {
            const primeraOpcion = document.querySelector('.image-option');
            if (primeraOpcion) {
                primeraOpcion.classList.add('selected');
                this.cambiarImagen(this.imagenes[0].archivo, this.imagenes[0].id);
            }
        }
    }
    
    crearPiezas() {
        if (!this.piezasContainer) return;
        
        this.piezasContainer.innerHTML = '';
        this.piezas = [];
        
        // Crear array de posiciones y mezclarlo
        const posiciones = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        this.mezclarArray(posiciones);
        
        // Tamaño de cada pieza en píxeles
        // calcular tamaño según el tablero (RESPONSIVE REAL)
const tableroSize = this.tablero.offsetWidth;
const tamanoPieza = tableroSize / 3;
        
        posiciones.forEach((pos, index) => {
            if (!this.piezasColocadas[pos]) {
                const pieza = document.createElement('div');
                pieza.className = 'piece';
                pieza.draggable = true;
                pieza.dataset.posicion = pos;
                
                // Calcular la posición exacta del fragmento
                const fila = Math.floor(pos / 3);
                const columna = pos % 3;
                
                // La imagen completa es de 300x300, cada pieza debe mostrar 100x100
                pieza.style.backgroundImage = `url('${this.imagenActual}')`;
                pieza.style.backgroundSize = `${tableroSize}px ${tableroSize}px`;
                pieza.style.backgroundRepeat = 'no-repeat';
                
                // Posición del fragmento (en negativo)
                const posX = -columna * tamanoPieza;
                const posY = -fila * tamanoPieza;
                pieza.style.backgroundPosition = `${posX}px ${posY}px`;
                
                // Asegurar que la pieza muestre solo 100x100
                pieza.style.width = `${tamanoPieza}px`;
pieza.style.height = `${tamanoPieza}px`;
                
                // Eventos
                pieza.addEventListener('dragstart', (e) => this.arrastrarPieza(e, pieza));
                pieza.addEventListener('dragend', () => this.terminarArrastre());
                
                // Animación de entrada
                pieza.style.animation = `slideIn 0.3s ease ${index * 0.05}s both`;
                
                this.piezasContainer.appendChild(pieza);
                this.piezas.push(pieza);
            }
        });
        
        this.actualizarContadorPiezas();
    }
    
    arrastrarPieza(e, pieza) {
        this.piezaSeleccionada = pieza;
        pieza.classList.add('dragging');
        e.dataTransfer.setData('text/plain', pieza.dataset.posicion);
        
        // Resaltar casillas vacías
        document.querySelectorAll('.board-cell.empty').forEach(celda => {
            celda.style.background = 'rgba(72, 187, 120, 0.1)';
            celda.style.borderColor = '#48bb78';
        });
    }
    
    terminarArrastre() {
        if (this.piezaSeleccionada) {
            this.piezaSeleccionada.classList.remove('dragging');
            this.piezaSeleccionada = null;
        }
        
        // Restaurar casillas
        document.querySelectorAll('.board-cell').forEach(celda => {
            celda.style.background = '';
            celda.style.borderColor = '';
        });
    }
    
    soltarPieza(e, celda) {
        e.preventDefault();
        
        if (!this.piezaSeleccionada || this.juegoCompletado) return;
        
        const posicionCelda = parseInt(celda.dataset.posicion);
        const posicionPieza = parseInt(this.piezaSeleccionada.dataset.posicion);
        
        celda.style.background = '';
        
        if (posicionCelda === posicionPieza && !celda.hasChildNodes()) {
            this.colocarPieza(celda, posicionPieza);
        } else {
            this.mostrarError();
        }
    }
    
    colocarPieza(celda, posicion) {
        // Mover la pieza al tablero
        celda.appendChild(this.piezaSeleccionada);
        this.piezaSeleccionada.draggable = false;
        this.piezaSeleccionada.style.cursor = 'default';
        this.piezaSeleccionada.classList.remove('dragging');
        
        // Ajustar la pieza dentro de la celda
        this.piezaSeleccionada.style.width = '100%';
        this.piezaSeleccionada.style.height = '100%';
        
        // Actualizar estado
        this.piezasColocadas[posicion] = true;
        celda.classList.remove('empty');
        celda.classList.add('occupied');
        
        this.movimientos++;
        this.actualizarEstadisticas();
        
        // Efecto visual
        this.piezaSeleccionada.style.animation = 'pulse 0.5s';
        setTimeout(() => {
            this.piezaSeleccionada.style.animation = '';
        }, 500);
        
        this.verificarVictoria();
    }
    
    mostrarError() {
        this.movimientos++;
        this.actualizarEstadisticas();
        
        if (this.piezaSeleccionada) {
            this.piezaSeleccionada.style.animation = 'shake 0.5s';
            setTimeout(() => {
                this.piezaSeleccionada.style.animation = '';
            }, 500);
        }
    }
    
    verificarVictoria() {
        const completadas = this.piezasColocadas.filter(v => v).length;
        
        if (completadas === 9 && !this.juegoCompletado) {
            this.juegoCompletado = true;
            this.detenerTemporizador();
            
            if (this.boardOverlay) {
                this.boardOverlay.classList.add('show');
            }
            
            // Actualizar estadísticas del modal
            if (this.modalTiempo) {
                this.modalTiempo.textContent = this.tiempoSpan.textContent;
            }
            if (this.modalMovimientos) {
                this.modalMovimientos.textContent = this.movimientos;
            }
            
            // Guardar la información de la imagen actual
            const imagenSeleccionada = document.querySelector('.image-option.selected');
            if (imagenSeleccionada) {
                const id = imagenSeleccionada.dataset.id;
                this.imagenInfo = this.imagenes.find(img => img.id == id);
            }
            
            // Mostrar modal de victoria
            if (this.victoryModal) {
                this.victoryModal.classList.add('show');
            }
            
            this.lanzarConfetti();
        }
    }
    
    lanzarConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.innerHTML = ['🎉', '🎊', '✨', '⭐', '🎈'][Math.floor(Math.random() * 5)];
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-20px';
                confetti.style.fontSize = (Math.random() * 20 + 20) + 'px';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                confetti.style.animation = `confettiFall ${Math.random() * 2 + 1}s linear`;
                document.body.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 3000);
            }, i * 20);
        }
    }
    
    mezclarPiezas() {
        if (!this.juegoCompletado) {
            // Limpiar tablero
            document.querySelectorAll('.board-cell').forEach(celda => {
                while (celda.firstChild) {
                    this.piezasContainer.appendChild(celda.firstChild);
                }
                celda.classList.remove('occupied');
                celda.classList.add('empty');
            });
            
            // Resetear estado
            this.piezasColocadas = new Array(9).fill(false);
            
            // Recrear piezas mezcladas
            this.crearPiezas();
            
            // Actualizar contadores
            this.actualizarEstadisticas();
        }
    }
    
    reiniciarJuego() {
        // Resetear estado
        this.piezasColocadas = new Array(9).fill(false);
        this.movimientos = 0;
        this.juegoCompletado = false;
        
        // Limpiar tablero
        document.querySelectorAll('.board-cell').forEach(celda => {
            while (celda.firstChild) {
                celda.removeChild(celda.firstChild);
            }
            celda.classList.remove('occupied');
            celda.classList.add('empty');
        });
        
        // Ocultar overlay y modal
        if (this.boardOverlay) {
            this.boardOverlay.classList.remove('show');
        }
        if (this.victoryModal) {
            this.victoryModal.classList.remove('show');
        }
        
        // Ocultar modal de información si está abierto
        const infoModal = document.getElementById('infoModal');
        if (infoModal) {
            infoModal.classList.remove('show');
        }
        
        // Crear nuevas piezas
        this.crearPiezas();
        
        // Reiniciar temporizador
        this.detenerTemporizador();
        this.iniciarTemporizador();
        
        // Actualizar estadísticas
        this.actualizarEstadisticas();
    }
    
    darPista() {
        const vacias = [];
        for (let i = 0; i < 9; i++) {
            if (!this.piezasColocadas[i]) {
                vacias.push(i);
            }
        }
        
        if (vacias.length > 0) {
            const pista = vacias[Math.floor(Math.random() * vacias.length)];
            const celda = document.querySelector(`.board-cell[data-posicion="${pista}"]`);
            if (celda) {
                celda.classList.add('highlight');
                setTimeout(() => {
                    celda.classList.remove('highlight');
                }, 2000);
            }
        }
    }
    
    revelarImagen() {
        if (!this.tablero || !this.imagenActual) return;
        
        // Mostrar la imagen completa en el tablero temporalmente
        const overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundImage = `url('${this.imagenActual}')`;
        overlay.style.backgroundSize = 'cover';
        overlay.style.backgroundPosition = 'center';
        overlay.style.borderRadius = '16px';
        overlay.style.opacity = '0.9';
        overlay.style.zIndex = '20';
        overlay.style.pointerEvents = 'none';
        overlay.style.transition = 'opacity 0.3s';
        
        this.tablero.parentElement.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }, 1500);
    }
    
    iniciarTemporizador() {
        this.tiempoInicio = Date.now();
        this.temporizador = setInterval(() => {
            if (!this.juegoCompletado) {
                const tiempo = Math.floor((Date.now() - this.tiempoInicio) / 1000);
                const minutos = Math.floor(tiempo / 60);
                const segundos = tiempo % 60;
                if (this.tiempoSpan) {
                    this.tiempoSpan.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }
    
    detenerTemporizador() {
        if (this.temporizador) {
            clearInterval(this.temporizador);
            this.temporizador = null;
        }
    }
    
    actualizarEstadisticas() {
        const completadas = this.piezasColocadas.filter(v => v).length;
        if (this.progreso) {
            this.progreso.textContent = `${completadas}/9`;
        }
        if (this.progressBar) {
            this.progressBar.style.width = `${(completadas / 9) * 100}%`;
        }
        if (this.movimientosSpan) {
            this.movimientosSpan.textContent = this.movimientos;
        }
        this.actualizarContadorPiezas();
    }
    
    actualizarContadorPiezas() {
        const disponibles = 9 - this.piezasColocadas.filter(v => v).length;
        if (this.piezasRestantes) {
            this.piezasRestantes.textContent = `${disponibles} disponibles`;
        }
    }
    
    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // ===== FUNCIONES PARA LA INFORMACIÓN DE LA IMAGEN =====
    
    crearModalInfo() {
        // Verificar si ya existe
        if (document.getElementById('infoModal')) return;
        
        const modalInfo = document.createElement('div');
        modalInfo.id = 'infoModal';
        modalInfo.className = 'info-modal';
        
        modalInfo.innerHTML = `
            <div class="info-modal-content">
                <button class="info-modal-close" id="closeInfoModal">&times;</button>
                <h2 class="info-modal-title">Información de la imagen</h2>
                
                <img src="" alt="Imagen" class="info-modal-image" id="infoImagenModal">
                
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-card-icon">📛</div>
                        <div class="info-card-content">
                            <span class="info-card-label">Nombre</span>
                            <span class="info-card-value" id="infoNombreModal">-</span>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-card-icon">📏</div>
                        <div class="info-card-content">
                            <span class="info-card-label">Dimensiones</span>
                            <span class="info-card-value" id="infoDimensionesModal">300x300</span>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-card-icon">📦</div>
                        <div class="info-card-content">
                            <span class="info-card-label">Tamaño</span>
                            <span class="info-card-value" id="infoTamañoModal">-</span>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <div class="info-card-icon">🎨</div>
                        <div class="info-card-content">
                            <span class="info-card-label">Formato</span>
                            <span class="info-card-value" id="infoFormatoModal">PNG</span>
                        </div>
                    </div>
                </div>
                
                <div class="info-description">
                    <h3>📝 Descripción</h3>
                    <p id="infoDescripcionModal">Cargando descripción...</p>
                </div>
                
                <div class="info-achievements">
                    <h3>🏅 Tus logros</h3>
                    <div class="achievement-item">
                        <span class="achievement-icon">⏱️</span>
                        <span class="achievement-text" id="logroTiempoModal">Tiempo: 00:00</span>
                    </div>
                    <div class="achievement-item">
                        <span class="achievement-icon">🔄</span>
                        <span class="achievement-text" id="logroMovimientosModal">Movimientos: 0</span>
                    </div>
                    <div class="achievement-item">
                        <span class="achievement-icon">🏆</span>
                        <span class="achievement-text">¡Rompecabezas completado!</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalInfo);
        
        // Cerrar modal
        document.getElementById('closeInfoModal').addEventListener('click', () => {
            document.getElementById('infoModal').classList.remove('show');
        });
        
        // Cerrar al hacer clic fuera
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('infoModal');
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    mostrarInfoImagen() {
        const modal = document.getElementById('infoModal');
        if (!modal) return;
        
        // Obtener información de la imagen actual
        const info = this.imagenInfo || {
            nombre: this.imagenActual ? this.imagenActual.split('/').pop().split('.')[0] : 'Sin nombre',
            tamaño: '250 KB',
            formato: 'PNG',
            descripcion: 'Esta imagen forma parte de tu colección de rompecabezas.'
        };
        
        // Actualizar el modal con la información
        const imgModal = document.getElementById('infoImagenModal');
        if (imgModal) imgModal.src = this.imagenActual || '';
        
        const nombreModal = document.getElementById('infoNombreModal');
        if (nombreModal) nombreModal.textContent = info.nombre || 'Sin nombre';
        
        const dimensionesModal = document.getElementById('infoDimensionesModal');
        if (dimensionesModal) dimensionesModal.textContent = '300x300';
        
        const tamañoModal = document.getElementById('infoTamañoModal');
        if (tamañoModal) tamañoModal.textContent = info.tamaño || '250 KB';
        
        const formatoModal = document.getElementById('infoFormatoModal');
        if (formatoModal) formatoModal.textContent = info.formato || 'PNG';
        
        const descripcionModal = document.getElementById('infoDescripcionModal');
        if (descripcionModal) descripcionModal.textContent = info.descripcion || 'Imagen de rompecabezas.';
        
        // Actualizar logros
        const logroTiempo = document.getElementById('logroTiempoModal');
        if (logroTiempo && this.tiempoSpan) {
            logroTiempo.textContent = `Tiempo: ${this.tiempoSpan.textContent}`;
        }
        
        const logroMovimientos = document.getElementById('logroMovimientosModal');
        if (logroMovimientos) {
            logroMovimientos.textContent = `Movimientos: ${this.movimientos}`;
        }
        
        // Mostrar modal
        modal.classList.add('show');
    }
    
    configurarEventos() {
        // Botones del juego
        const btnMezclar = document.getElementById('btnMezclar');
        if (btnMezclar) {
            btnMezclar.addEventListener('click', () => this.mezclarPiezas());
        }
        
        const btnReiniciar = document.getElementById('btnReiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', () => this.reiniciarJuego());
        }
        
        const btnPista = document.getElementById('btnPista');
        if (btnPista) {
            btnPista.addEventListener('click', () => this.darPista());
        }
        
        const btnRevelar = document.getElementById('btnRevelar');
        if (btnRevelar) {
            btnRevelar.addEventListener('click', () => this.revelarImagen());
        }
        
        // Modal de victoria
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (this.victoryModal) {
                    this.victoryModal.classList.remove('show');
                }
            });
        }
        
        const modalReiniciar = document.getElementById('modalReiniciar');
        if (modalReiniciar) {
            modalReiniciar.addEventListener('click', () => {
                if (this.victoryModal) {
                    this.victoryModal.classList.remove('show');
                }
                this.reiniciarJuego();
            });
        }
        
        // NUEVO: Botón para ver información
        const btnVerInfo = document.getElementById('btnVerInfo');
        if (btnVerInfo) {
            btnVerInfo.addEventListener('click', () => {
                if (this.victoryModal) {
                    this.victoryModal.classList.remove('show');
                }
                this.mostrarInfoImagen();
            });
        }
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.victoryModal) {
                this.victoryModal.classList.remove('show');
            }
        });
    }
    
    agregarAnimaciones() {
        // Verificar si ya existen las animaciones
        if (!document.querySelector('#puzzle-animations')) {
            const style = document.createElement('style');
            style.id = 'puzzle-animations';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes confettiFall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleMaster();
});
