// ============================================
// PUZZLE MASTER - VERSIÓN TÁCTIL OPTIMIZADA
// Las piezas se mueven al tocarlas (toque y colocación)
// ============================================

class PuzzleMaster {
    constructor() {
        // Elementos del DOM
        this.tablero = document.getElementById('tablero');
        this.piezasContainer = document.getElementById('piezasContainer');
        this.previewImage = document.getElementById('previewImage');
        this.boardOverlay = document.getElementById('boardOverlay');
        this.victoryModal = document.getElementById('victoryModal');
        
        // Lista de imágenes
        this.imagenes = [
            {
                id: 1,
                nombre: 'Clínica IMOX',
                archivo: 'imagenes/rompecabezas1.png',
                impactos: [
                    { personas: '412', texto: '84% de las personas participantes tienen bienestar emocional' },
                    { personas: '412', texto: '75% mejoran sus relaciones interpersonales' },
                    { personas: '119', texto: '87% cumplen objetivo terapéutico' }
                ],
                descripcion: 'Fortalecer el bienestar emocional, psicológico y social en niñez, juventudes y mujeres de la zona oriente del Valle de México.'
            },
            {
                id: 2,
                nombre: 'Sociolaboral',
                archivo: 'imagenes/rompecabezas2.png',
                impactos: [
                    { personas: '500', texto: '72% acceden a capacitaciones gratuitas' },
                    { personas: '486', texto: '76% acceden por primera vez a capacitaciones' },
                    { personas: '500', texto: '72% mejoran oportunidades laborales' },
                    { personas: '500', texto: '82% podrían mejorar sus ingresos' }
                ],
                descripcion: 'Promover la empleabilidad en juventudes y mujeres de la zona Oriente del Valle de México.'
            },
            {
                id: 3,
                nombre: 'Tecnología',
                archivo: 'imagenes/rompecabezas3.png',
                impactos: [
                    { personas: '645', texto: '66% se alfabetizan digitalmente' },
                    { personas: '125', texto: '69% muestran apropiación tecnológica' },
                    { personas: '645', texto: '80% acceden por primera vez a capacitación tecnológica' }
                ],
                descripcion: 'Fomentar el desarrollo de habilidades y competencias digitales.'
            },
            {
                id: 4,
                nombre: 'Sociocomunitario',
                archivo: 'imagenes/rompecabezas4.png',
                impactos: [
                    { personas: '609', texto: '61% acceden por primera vez a derechos culturales' },
                    { personas: '271', texto: '74% fortalecen identidad comunitaria' }
                ],
                descripcion: 'Favorecer el desarrollo fomentando la cultura comunitaria y educación no formal.'
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
        this.tiempoSpan = document.getElementById('tiempo');
        this.movimientosSpan = document.getElementById('movimientos');
        
        // Inicializar
        this.inicializar();
    }
    
    inicializar() {
        this.crearTablero();
        this.cargarSelectorImagenes();
        this.configurarEventos();
        this.cargarUltimaImagen();
        this.agregarAnimaciones();
        this.crearModalInfo();
    }
    
    crearTablero() {
        if (!this.tablero) return;
        this.tablero.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const celda = document.createElement('div');
            celda.className = 'board-cell empty';
            celda.dataset.posicion = i;
            
            // Evento táctil para colocar pieza
            celda.addEventListener('click', (e) => this.manejarToqueEnCelda(e, celda));
            celda.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.manejarToqueEnCelda(e, celda);
            });
            
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
        if (!this.piezasContainer || !this.imagenActual) return;
        
        this.piezasContainer.innerHTML = '';
        this.piezas = [];
        
        // Crear array de posiciones y mezclarlo
        const posiciones = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        this.mezclarArray(posiciones);
        
        // Obtener tamaño del tablero para calcular el tamaño de las piezas
        const tableroSize = this.tablero ? this.tablero.offsetWidth : 300;
        const tamanoPieza = tableroSize / 3;
        
        posiciones.forEach((pos, index) => {
            if (!this.piezasColocadas[pos]) {
                const pieza = document.createElement('div');
                pieza.className = 'piece';
                pieza.dataset.posicion = pos;
                
                // Calcular la posición del fragmento
                const fila = Math.floor(pos / 3);
                const columna = pos % 3;
                
                pieza.style.backgroundImage = `url('${this.imagenActual}')`;
                pieza.style.backgroundSize = `${tableroSize}px ${tableroSize}px`;
                pieza.style.backgroundRepeat = 'no-repeat';
                
                const posX = -columna * tamanoPieza;
                const posY = -fila * tamanoPieza;
                pieza.style.backgroundPosition = `${posX}px ${posY}px`;
                
                pieza.style.width = `${tamanoPieza}px`;
                pieza.style.height = `${tamanoPieza}px`;
                
                // Eventos táctiles
                pieza.addEventListener('click', (e) => this.seleccionarPieza(e, pieza));
                pieza.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.seleccionarPieza(e, pieza);
                });
                
                // Animación
                pieza.style.animation = `slideIn 0.3s ease ${index * 0.05}s both`;
                
                this.piezasContainer.appendChild(pieza);
                this.piezas.push(pieza);
            }
        });
    }
    
    seleccionarPieza(e, pieza) {
        e.preventDefault();
        e.stopPropagation();
        
        // Si el juego está completado, no hacer nada
        if (this.juegoCompletado) return;
        
        // Si ya hay una pieza seleccionada, desseleccionarla
        if (this.piezaSeleccionada) {
            this.piezaSeleccionada.classList.remove('selected-for-move');
        }
        
        // Seleccionar la nueva pieza
        this.piezaSeleccionada = pieza;
        pieza.classList.add('selected-for-move');
        
        // Resaltar las celdas vacías disponibles
        this.resaltarCeldasVacias();
    }
    
    resaltarCeldasVacias() {
        document.querySelectorAll('.board-cell').forEach(celda => {
            if (!celda.hasChildNodes()) {
                celda.style.background = 'rgba(72, 187, 120, 0.2)';
                celda.style.borderColor = '#48bb78';
                celda.style.borderWidth = '3px';
            }
        });
    }
    
    quitarResaltadoCeldas() {
        document.querySelectorAll('.board-cell').forEach(celda => {
            celda.style.background = '';
            celda.style.borderColor = '';
            celda.style.borderWidth = '';
        });
    }
    
    manejarToqueEnCelda(e, celda) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.piezaSeleccionada || this.juegoCompletado) return;
        
        const posicionCelda = parseInt(celda.dataset.posicion);
        const posicionPieza = parseInt(this.piezaSeleccionada.dataset.posicion);
        
        this.quitarResaltadoCeldas();
        
        if (posicionCelda === posicionPieza && !celda.hasChildNodes()) {
            this.colocarPieza(celda, posicionPieza);
        } else {
            this.mostrarError();
            // Desseleccionar la pieza
            if (this.piezaSeleccionada) {
                this.piezaSeleccionada.classList.remove('selected-for-move');
                this.piezaSeleccionada = null;
            }
        }
    }
    
    colocarPieza(celda, posicion) {
        // Mover la pieza al tablero
        celda.appendChild(this.piezaSeleccionada);
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
        
        // Desseleccionar
        this.piezaSeleccionada.classList.remove('selected-for-move');
        this.piezaSeleccionada = null;
        
        this.verificarVictoria();
    }
    
    mostrarError() {
        this.movimientos++;
        this.actualizarEstadisticas();
        
        // Mostrar animación de error en la pieza seleccionada
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
            
            // Guardar información de la imagen actual
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
        for (let i = 0; i < 30; i++) {
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
            }, i * 30);
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
            
            // Desseleccionar cualquier pieza
            if (this.piezaSeleccionada) {
                this.piezaSeleccionada.classList.remove('selected-for-move');
                this.piezaSeleccionada = null;
            }
            this.quitarResaltadoCeldas();
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
        
        // Desseleccionar cualquier pieza
        if (this.piezaSeleccionada) {
            this.piezaSeleccionada.classList.remove('selected-for-move');
            this.piezaSeleccionada = null;
        }
        this.quitarResaltadoCeldas();
        
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
        if (!this.tiempoSpan) return;
        this.tiempoInicio = Date.now();
        this.temporizador = setInterval(() => {
            if (!this.juegoCompletado) {
                const tiempo = Math.floor((Date.now() - this.tiempoInicio) / 1000);
                const minutos = Math.floor(tiempo / 60);
                const segundos = tiempo % 60;
                this.tiempoSpan.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
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
        if (this.movimientosSpan) {
            this.movimientosSpan.textContent = this.movimientos;
        }
    }
    
    mezclarArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    crearModalInfo() {
        if (document.getElementById('infoModal')) return;
        
        const modalInfo = document.createElement('div');
        modalInfo.id = 'infoModal';
        modalInfo.className = 'info-modal';
        
        modalInfo.innerHTML = `
            <div class="info-modal-content">
                <button class="info-modal-close" id="closeInfoModal">&times;</button>
                <h2 class="info-modal-title">Información del área</h2>
                
                <img src="" alt="Imagen" class="info-modal-image" id="infoImagenModal">
                
                <div id="infoImpactosModal"></div>
                
                <div class="info-description">
                    <h3>📝 Descripción</h3>
                    <p id="infoDescripcionModal">Cargando descripción...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalInfo);
        
        document.getElementById('closeInfoModal').addEventListener('click', () => {
            document.getElementById('infoModal').classList.remove('show');
        });
        
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
        
        const info = this.imagenInfo || this.imagenes[0];
        
        const imgModal = document.getElementById('infoImagenModal');
        if (imgModal) imgModal.src = this.imagenActual || info.archivo;
        
        const impactosContainer = document.getElementById("infoImpactosModal");
        if (impactosContainer) {
            impactosContainer.innerHTML = "";
            if (info.impactos) {
                info.impactos.forEach(item => {
                    const bloque = document.createElement("div");
                    bloque.className = "impact-item";
                    bloque.innerHTML = `
                        <div class="impact-personas">👥 ${item.personas} personas</div>
                        <div class="impact-texto">📊 ${item.texto}</div>
                    `;
                    impactosContainer.appendChild(bloque);
                });
            }
        }
        
        const descripcionModal = document.getElementById('infoDescripcionModal');
        if (descripcionModal) {
            descripcionModal.textContent = info.descripcion || 'Información no disponible.';
        }
        
        modal.classList.add('show');
    }
    
    configurarEventos() {
        // Botones de control
        const btnMezclar = document.getElementById('btnMezclar');
        if (btnMezclar) {
            btnMezclar.addEventListener('click', () => this.mezclarPiezas());
            btnMezclar.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mezclarPiezas();
            });
        }
        
        const btnReiniciar = document.getElementById('btnReiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', () => this.reiniciarJuego());
            btnReiniciar.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.reiniciarJuego();
            });
        }
        
        const btnPista = document.getElementById('btnPista');
        if (btnPista) {
            btnPista.addEventListener('click', () => this.darPista());
            btnPista.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.darPista();
            });
        }
        
        const btnRevelar = document.getElementById('btnRevelar');
        if (btnRevelar) {
            btnRevelar.addEventListener('click', () => this.revelarImagen());
            btnRevelar.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.revelarImagen();
            });
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
        
        // Prevenir scroll mientras se arrastra en móvil
        document.addEventListener('touchmove', (e) => {
            if (this.piezaSeleccionada) {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    agregarAnimaciones() {
        if (!document.querySelector('#puzzle-animations')) {
            const style = document.createElement('style');
            style.id = 'puzzle-animations';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                    20%, 40%, 60%, 80% { transform: translateX(3px); }
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(50px);
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
