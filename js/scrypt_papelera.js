// ==========================================
// SISTEMA DE PAPELERA
// ==========================================

let elementosPapelera = [];
let elementoEnEspera = null;
let accionEnEspera = null;
let filtroActual = 'todos';

// Cargar elementos en papelera
async function cargarPapelera() {
    try {
        const response = await fetch('../Connection/papelera_obtener.php');
        const data = await response.json();

        if (data.success) {
            elementosPapelera = data.elementos;
            actualizarEstadisticas();
            mostrarPapelera();
        } else {
            mostrarError(data.message || 'Error al cargar la papelera');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar la papelera');
    }
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const total = elementosPapelera.length;
    const publicaciones = elementosPapelera.filter(e => e.tipo === 'publicacion').length;
    const noticias = elementosPapelera.filter(e => e.tipo === 'noticia').length;

    document.getElementById('totalItems').textContent = total;
    document.getElementById('publicacionesCount').textContent = publicaciones;
    document.getElementById('noticiasCount').textContent = noticias;
}

// Mostrar papelera
function mostrarPapelera() {
    const grid = document.getElementById('papeleraGrid');

    let elementosFiltrados = elementosPapelera;
    if (filtroActual !== 'todos') {
        elementosFiltrados = elementosPapelera.filter(e => e.tipo === filtroActual);
    }

    if (elementosFiltrados.length === 0) {
        grid.innerHTML = `
            <div class="papelera-empty" style="grid-column: 1 / -1;">
                <div class="papelera-empty-icon">🗑️</div>
                <div class="papelera-empty-text">La papelera está vacía</div>
                <div class="papelera-empty-subtext">Los elementos eliminados aparecerán aquí</div>
            </div>
        `;
        return;
    }

    grid.innerHTML = elementosFiltrados.map((elemento, index) => {
        const fechaEliminacion = new Date(elemento.fecha_eliminacion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let preview = '';
        let tipoEtiqueta = '';

        if (elemento.tipo === 'publicacion') {
            tipoEtiqueta = '📝 Publicación';
            if (elemento.media) {
                const extension = elemento.media.split('.').pop().toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                    preview = `<img src="${elemento.media}" alt="">`;
                } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
                    preview = `<video controls><source src="${elemento.media}"></video>`;
                }
            }
            if (!preview) {
                preview = `<div class="papelera-item-preview-texto">${elemento.contenido.substring(0, 150)}</div>`;
            }
        } else {
            tipoEtiqueta = '📰 Noticia';
            if (elemento.imagen) {
                preview = `<img src="${elemento.imagen}" alt="">`;
            } else {
                preview = `<div class="papelera-item-preview-texto">${elemento.descripcion.substring(0, 150)}</div>`;
            }
        }

        return `
            <div class="papelera-item" data-id="${elemento.id}" data-tipo="${elemento.tipo}">
                <div class="papelera-item-preview">
                    ${preview || '<span>📋</span>'}
                </div>
                <div class="papelera-item-header">
                    <div class="papelera-item-tipo">${tipoEtiqueta}</div>
                    <div class="papelera-item-titulo">${elemento.titulo || elemento.contenido.substring(0, 50)}</div>
                    <div class="papelera-item-area">${elemento.area}</div>
                </div>
                <div class="papelera-item-content">
                    <div class="papelera-item-info">
                        <div class="papelera-item-info-row">
                            <span class="papelera-item-info-label">📅 Eliminado</span>
                            <span class="papelera-item-info-value">${fechaEliminacion}</span>
                        </div>
                        <div class="papelera-item-info-row">
                            <span class="papelera-item-info-label">👤 Por</span>
                            <span class="papelera-item-info-value">${elemento.eliminado_por || 'Sistema'}</span>
                        </div>
                    </div>
                    <div class="papelera-item-actions">
                        <button class="btn-restaurar" onclick="restaurarElemento('${elemento.id}', '${elemento.tipo}')">
                            ↩️ Restaurar
                        </button>
                        <button class="btn-eliminar-permanente" onclick="eliminarPermanente('${elemento.id}', '${elemento.tipo}')">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Filtrar papelera
function filtrarPapelera(tipo) {
    filtroActual = tipo;

    // Actualizar botones activos
    document.querySelectorAll('.btn-filtro-papelera').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    mostrarPapelera();
}

// Restaurar elemento
async function restaurarElemento(id, tipo) {
    elementoEnEspera = { id, tipo };
    accionEnEspera = 'restaurar';

    mostrarModalConfirmacion(
        'Restaurar elemento',
        '¿Deseas restaurar este elemento? Se volverá a mostrar en su ubicación original.',
        'Restaurar'
    );
}

// Eliminar permanente
async function eliminarPermanente(id, tipo) {
    elementoEnEspera = { id, tipo };
    accionEnEspera = 'eliminar';

    mostrarModalConfirmacion(
        'Eliminar permanentemente',
        '⚠️ Esta acción no se puede deshacer. El elemento será eliminado permanentemente de la base de datos.',
        'Eliminar'
    );
}

// Confirmar acción
async function confirmarAccion() {
    if (!elementoEnEspera || !accionEnEspera) return;

    const { id, tipo } = elementoEnEspera;
    const endpoint = accionEnEspera === 'restaurar' 
        ? '../Connection/papelera_restaurar.php'
        : '../Connection/papelera_eliminar_permanente.php';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, tipo })
        });

        const data = await response.json();

        if (data.success) {
            // Animar eliminación
            const elemento = document.querySelector(`[data-id="${id}"]`);
            if (elemento) {
                elemento.classList.add('removing');
                setTimeout(() => {
                    cargarPapelera();
                }, 300);
            } else {
                cargarPapelera();
            }

            const mensaje = accionEnEspera === 'restaurar' 
                ? 'Elemento restaurado correctamente'
                : 'Elemento eliminado permanentemente';

            showNotification(mensaje, 'success');
        } else {
            showNotification(data.message || 'Error al procesar la acción', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al procesar la acción', 'error');
    }

    cerrarModal();
    elementoEnEspera = null;
    accionEnEspera = null;
}

// Vaciar papelera
async function vaciarPapelera() {
    if (elementosPapelera.length === 0) {
        showNotification('La papelera ya está vacía', 'info');
        return;
    }

    elementoEnEspera = null;
    accionEnEspera = 'vaciar';

    mostrarModalConfirmacion(
        'Vaciar papelera',
        `⚠️ Esto eliminará permanentemente ${elementosPapelera.length} elemento(s). Esta acción no se puede deshacer.`,
        'Vaciar'
    );
}

// Modal de confirmación
function mostrarModalConfirmacion(titulo, texto, accion) {
    const modal = document.getElementById('modalConfirmar');
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('modalTexto').textContent = texto;
    
    const btnConfirmar = document.getElementById('btnConfirmar');
    btnConfirmar.textContent = accion;

    modal.classList.add('active');
}

function cerrarModal() {
    document.getElementById('modalConfirmar').classList.remove('active');
}

// Vaciar papelera confirmado
async function vaciarPapeleraConfirmado() {
    try {
        const response = await fetch('../Connection/papelera_vaciar.php', {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            cargarPapelera();
            showNotification('Papelera vaciada correctamente', 'success');
        } else {
            showNotification(data.message || 'Error al vaciar la papelera', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al vaciar la papelera', 'error');
    }

    cerrarModal();
}

// Manejar confirmación
document.addEventListener('DOMContentLoaded', function() {
    const btnConfirmar = document.getElementById('btnConfirmar');
    
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function() {
            if (accionEnEspera === 'vaciar') {
                vaciarPapeleraConfirmado();
            } else {
                confirmarAccion();
            }
        });
    }

    cargarPapelera();

    // Recargar cada 30 segundos
    setInterval(cargarPapelera, 30000);
});

// Helpers
function mostrarError(mensaje) {
    const grid = document.getElementById('papeleraGrid');
    grid.innerHTML = `
        <div class="papelera-empty" style="grid-column: 1 / -1;">
            <div class="papelera-empty-icon">❌</div>
            <div class="papelera-empty-text">Error</div>
            <div class="papelera-empty-subtext">${mensaje}</div>
        </div>
    `;
}