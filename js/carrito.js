/**
 * Carrito de compras persistente de WOL Hardware.
 *
 * El estado se guarda en localStorage con la clave `carrito_wol` como un
 * array de objetos: [{ id, nombre, precio, imagen, categoria, cantidad }].
 */
(function () {
  'use strict';

  const CLAVE_CARRITO = 'carrito_wol';
  const EVENTO_CARRITO = 'carrito-actualizado';
  let temporizadorNotificacion = null;

  /**
   * Lee el carrito desde localStorage y devuelve siempre un array.
   */
  function obtenerCarrito() {
    try {
      const datosGuardados = localStorage.getItem(CLAVE_CARRITO);

      if (!datosGuardados) {
        return [];
      }

      const carrito = JSON.parse(datosGuardados);
      return Array.isArray(carrito) ? carrito : [];
    } catch (error) {
      console.error('No se pudo leer el carrito guardado:', error);
      return [];
    }
  }

  /**
   * Serializa el carrito y lo persiste en localStorage.
   */
  function guardarCarrito(carrito) {
    const carritoAGuardar = Array.isArray(carrito) ? carrito : [];
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carritoAGuardar));
    return carritoAGuardar;
  }

  /**
   * Calcula el monto final sumando precio * cantidad con reduce().
   */
  function calcularTotal(carrito) {
    return (Array.isArray(carrito) ? carrito : []).reduce(
      (total, producto) => {
        const precio = normalizarPrecio(producto && producto.precio);
        const cantidad = Number(producto && producto.cantidad) || 0;
        return total + precio * cantidad;
      },
      0
    );
  }

  /**
   * Suma la cantidad de unidades de todos los productos.
   */
  function calcularUnidades(carrito) {
    return (Array.isArray(carrito) ? carrito : []).reduce(
      (total, producto) => total + (Number(producto && producto.cantidad) || 0),
      0
    );
  }

  function normalizarId(id) {
    return String(id ?? '');
  }

  function normalizarPrecio(valor) {
    if (typeof valor === 'number') {
      return Number.isFinite(valor) ? valor : 0;
    }

    const texto = String(valor ?? '').trim();

    if (!texto) {
      return 0;
    }

    // Acepta formatos como "1.599.000", "$ 1.599.000" o "1599,50".
    const limpio = texto
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    return Number(limpio) || 0;
  }

  function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(precio) || 0);
  }

  function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (caracter) => {
      const reemplazos = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return reemplazos[caracter];
    });
  }

  function actualizarContadorNav() {
    const totalUnidades = calcularUnidades(obtenerCarrito());
    const enlacesCarrito = Array.from(document.querySelectorAll('header a[href]')).filter(
      (enlace) => {
        const href = enlace.getAttribute('href') || '';
        return href.split('/').pop().toLowerCase() === 'carrito.html';
      }
    );

    enlacesCarrito.forEach((enlace) => {
      let contador = enlace.querySelector('[data-carrito-contador]');

      if (!contador) {
        contador = document.createElement('span');
        contador.className = 'carrito-contador';
        contador.dataset.carritoContador = '';
        enlace.appendChild(contador);
      }

      contador.textContent = String(totalUnidades);
      contador.setAttribute('aria-hidden', 'true');
      enlace.setAttribute(
        'aria-label',
        `Carrito: ${totalUnidades} ${totalUnidades === 1 ? 'unidad' : 'unidades'}`
      );
      enlace.classList.toggle('nav-carrito-con-productos', totalUnidades > 0);
    });
  }

  /**
   * Notifica a la interfaz que el carrito cambió y refresca el contador.
   */
  function notificarActualizacion(carrito) {
    actualizarContadorNav();

    document.dispatchEvent(
      new CustomEvent(EVENTO_CARRITO, {
        detail: {
          carrito,
          total: calcularTotal(carrito)
        }
      })
    );
  }

  /**
   * Agrega un producto o incrementa su cantidad si ya estaba en el carrito.
   */
  function agregarAlCarrito(producto) {
    if (!producto || producto.id === undefined || producto.id === null || producto.id === '') {
      return null;
    }

    const carrito = obtenerCarrito();
    const indice = carrito.findIndex(
      (item) => item && normalizarId(item.id) === normalizarId(producto.id)
    );

    if (indice >= 0) {
      carrito[indice].cantidad = (Number(carrito[indice].cantidad) || 0) + 1;
    } else {
      carrito.push({
        id: producto.id,
        nombre: String(producto.nombre ?? 'Producto'),
        precio: normalizarPrecio(producto.precio),
        imagen: String(producto.imagen ?? ''),
        categoria: String(producto.categoria ?? ''),
        cantidad: 1
      });
    }

    guardarCarrito(carrito);
    notificarActualizacion(carrito);
    return carrito;
  }

  function mostrarNotificacion(mensaje) {
    let notificacion = document.getElementById('notificacion-carrito');

    if (!notificacion) {
      notificacion = document.createElement('div');
      notificacion.id = 'notificacion-carrito';
      notificacion.className = 'notificacion-carrito';
      notificacion.setAttribute('role', 'status');
      notificacion.setAttribute('aria-live', 'polite');
      notificacion.setAttribute('aria-atomic', 'true');
      document.body.appendChild(notificacion);
    }

    notificacion.textContent = mensaje;
    notificacion.classList.add('notificacion-carrito-visible');

    window.clearTimeout(temporizadorNotificacion);
    temporizadorNotificacion = window.setTimeout(() => {
      notificacion.classList.remove('notificacion-carrito-visible');
    }, 2500);
  }

  /**
   * Delegación de eventos: cualquier botón con data-agregar-carrito
   * agrega el producto descripto por sus atributos data-*.
   */
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-agregar-carrito]');

    if (!boton) {
      return;
    }

    evento.preventDefault();

    const producto = {
      id: boton.dataset.id,
      nombre: boton.dataset.nombre,
      precio: boton.dataset.precio,
      imagen: boton.dataset.imagen,
      categoria: boton.dataset.categoria
    };

    agregarAlCarrito(producto);
    mostrarNotificacion('Producto agregado al carrito');
  });

  function crearFilaCarrito(producto) {
    const id = escaparHTML(producto.id);
    const nombre = escaparHTML(producto.nombre || 'Producto');
    const categoria = escaparHTML(producto.categoria || '');
    const precio = Number(producto.precio) || 0;
    const cantidad = Math.max(1, Math.floor(Number(producto.cantidad) || 1));
    const subtotal = precio * cantidad;

    const miniatura = producto.imagen
      ? `<img
          class="carrito-miniatura"
          src="${escaparHTML(producto.imagen)}"
          alt="${nombre}"
          loading="lazy"
        />`
      : '<span class="carrito-miniatura carrito-miniatura-vacia" aria-hidden="true">?</span>';

    return `
      <tr data-id="${id}">
        <td>
          <div class="carrito-producto">
            ${miniatura}
            <div class="carrito-producto-info">
              <span class="carrito-producto-nombre">${nombre}</span>
              ${categoria ? `<span class="carrito-producto-categoria">${categoria}</span>` : ''}
            </div>
          </div>
        </td>
        <td class="carrito-precio-unitario">${formatearPrecio(precio)}</td>
        <td>
          <div class="carrito-cantidad" role="group" aria-label="Cantidad de ${nombre}">
            <button
              type="button"
              class="btn-cantidad btn-restar"
              data-accion="restar"
              data-id="${id}"
              aria-label="Restar una unidad de ${nombre}"
            >−</button>
            <span class="carrito-cantidad-numero" aria-live="polite">${cantidad}</span>
            <button
              type="button"
              class="btn-cantidad btn-sumar"
              data-accion="sumar"
              data-id="${id}"
              aria-label="Sumar una unidad de ${nombre}"
            >+</button>
          </div>
        </td>
        <td class="carrito-subtotal">${formatearPrecio(subtotal)}</td>
        <td class="carrito-acciones-celda">
          <button
            type="button"
            class="btn-eliminar"
            data-accion="eliminar"
            data-id="${id}"
            aria-label="Eliminar ${nombre} del carrito"
            title="Eliminar producto"
          >🗑️</button>
        </td>
      </tr>
    `;
  }

  function inicializarPaginaCarrito() {
    const tabla = document.getElementById('tabla-carrito');

    if (!tabla) {
      return;
    }

    const tbody = document.getElementById('carrito-tbody');
    const totalCarrito = document.getElementById('carrito-total');
    const carritoVacio = document.getElementById('carrito-vacio');
    const acciones = document.getElementById('carrito-acciones');
    const botonVaciar = document.getElementById('btn-vaciar-carrito');
    const botonFinalizar = document.getElementById('btn-finalizar-compra');
    const modal = document.getElementById('modal-compra');
    const modalTotal = document.getElementById('modal-compra-total');
    let ultimoElementoConFoco = null;

    function renderizarCarrito() {
      const carrito = obtenerCarrito();
      const hayProductos = carrito.length > 0;

      tabla.hidden = !hayProductos;

      if (carritoVacio) {
        carritoVacio.hidden = hayProductos;
      }

      if (acciones) {
        acciones.hidden = !hayProductos;
      }

      if (!hayProductos) {
        if (tbody) tbody.innerHTML = '';
        if (totalCarrito) totalCarrito.textContent = formatearPrecio(0);
        actualizarContadorNav();
        return;
      }

      if (tbody) {
        tbody.innerHTML = carrito.map(crearFilaCarrito).join('');
      }

      if (totalCarrito) {
        totalCarrito.textContent = formatearPrecio(calcularTotal(carrito));
      }

      actualizarContadorNav();
    }

    function abrirModal(total) {
      if (!modal) {
        window.alert(`¡Compra realizada con éxito! Total abonado: ${formatearPrecio(total)}`);
        return;
      }

      ultimoElementoConFoco = document.activeElement;

      if (modalTotal) {
        modalTotal.textContent = formatearPrecio(total);
      }

      modal.hidden = false;

      const botonCerrar = modal.querySelector('.modal-carrito-contenido [data-cerrar-modal]');
      if (botonCerrar) {
        botonCerrar.focus();
      }
    }

    function cerrarModal() {
      if (!modal || modal.hidden) {
        return;
      }

      modal.hidden = true;

      if (ultimoElementoConFoco && typeof ultimoElementoConFoco.focus === 'function') {
        ultimoElementoConFoco.focus();
      }
    }

    function vaciarCarrito() {
      localStorage.removeItem(CLAVE_CARRITO);
      notificarActualizacion([]);
    }

    if (tbody) {
      tbody.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button[data-accion]');

        if (!boton) {
          return;
        }

        const accion = boton.dataset.accion;
        const id = boton.dataset.id;
        const carrito = obtenerCarrito();
        const indice = carrito.findIndex(
          (item) => item && normalizarId(item.id) === normalizarId(id)
        );

        if (indice === -1) {
          return;
        }

        if (accion === 'sumar') {
          carrito[indice].cantidad = (Number(carrito[indice].cantidad) || 0) + 1;
        } else if (accion === 'restar') {
          carrito[indice].cantidad = (Number(carrito[indice].cantidad) || 0) - 1;

          if (carrito[indice].cantidad <= 0) {
            carrito.splice(indice, 1);
          }
        } else if (accion === 'eliminar') {
          carrito.splice(indice, 1);
        } else {
          return;
        }

        guardarCarrito(carrito);
        notificarActualizacion(carrito);
      });
    }

    if (botonVaciar) {
      botonVaciar.addEventListener('click', vaciarCarrito);
    }

    if (botonFinalizar) {
      botonFinalizar.addEventListener('click', () => {
        const carrito = obtenerCarrito();

        if (carrito.length === 0) {
          return;
        }

        const total = calcularTotal(carrito);
        localStorage.removeItem(CLAVE_CARRITO);
        notificarActualizacion([]);
        abrirModal(total);
      });
    }

    document.addEventListener(EVENTO_CARRITO, () => {
      renderizarCarrito();
    });

    if (modal) {
      modal.addEventListener('click', (evento) => {
        if (evento.target.closest('[data-cerrar-modal]')) {
          cerrarModal();
        }
      });

      document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
          cerrarModal();
        }
      });
    }

    window.addEventListener('storage', (evento) => {
      if (evento.key === CLAVE_CARRITO || evento.key === null) {
        renderizarCarrito();
      }
    });

    renderizarCarrito();
  }

  // Mantiene sincronizado el contador si el carrito cambia en otra pestaña.
  window.addEventListener('storage', (evento) => {
    if (evento.key === CLAVE_CARRITO || evento.key === null) {
      actualizarContadorNav();
    }
  });

  function inicializar() {
    actualizarContadorNav();
    inicializarPaginaCarrito();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
  } else {
    inicializar();
  }

  // API global reutilizable por el resto de las vistas.
  window.agregarAlCarrito = agregarAlCarrito;
  window.obtenerCarrito = obtenerCarrito;
  window.guardarCarrito = guardarCarrito;
  window.calcularTotal = calcularTotal;
  window.actualizarContadorNav = actualizarContadorNav;
})();
