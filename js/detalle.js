const SUPABASE_URL = 'https://bvleuscwhbgvtdekreqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGV1c2N3aGJndnRkZWtyZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ0NjYsImV4cCI6MjEwODM0MDQ2Nn0.w_FD5NRZ0B0FDZOnVq5mwYCkq0uEmWoEUPOUWj1X6QU';

const estadoDetalle = document.getElementById('detalle-estado');
const contenidoDetalle = document.getElementById('detalle-contenido');
const imagenDetalle = document.getElementById('detalle-imagen');
const categoriaDetalle = document.getElementById('detalle-categoria');
const badgeOfertaDetalle = document.getElementById('detalle-badge-oferta');
const tituloDetalle = document.getElementById('detalle-titulo');
const descripcionDetalle = document.getElementById('detalle-descripcion');
const precioDetalle = document.getElementById('detalle-precio');
const precioActualDetalle = document.getElementById('detalle-precio-actual');
const precioOriginalDetalle = document.getElementById('detalle-precio-original');
const btnAgregarCarrito = document.getElementById('btn-agregar-carrito');
const fichaCaption = document.getElementById('detalle-ficha-caption');
const especificaciones = document.getElementById('detalle-especificaciones');

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

function formatearPrecio(precio) {
  return `$ ${new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(precio) || 0)}`;
}

function mostrarMensaje(mensaje) {
  if (estadoDetalle) {
    estadoDetalle.textContent = mensaje;
    estadoDetalle.hidden = false;
  }

  if (contenidoDetalle) {
    contenidoDetalle.hidden = true;
  }
}

/**
 * Supabase puede devolver el campo `oferta` como booleano o como texto
 * según el tipo de columna. Normalizamos ambos casos.
 */
function esOferta(valor) {
  return valor === true || valor === 1 || valor === 'true' || valor === '1';
}

/**
 * Muestra u oculta el badge "OFERTA" que acompaña a la categoría.
 */
function actualizarBadgeOferta(tieneOferta) {
  let badge =
    document.getElementById('detalle-badge-oferta') || badgeOfertaDetalle;

  if (!badge && tieneOferta && categoriaDetalle) {
    badge = document.createElement('span');
    badge.id = 'detalle-badge-oferta';
    badge.className = 'badge badge-oferta badge-detalle';
    badge.textContent = 'OFERTA';
    categoriaDetalle.insertAdjacentElement('afterend', badge);
  }

  if (badge) {
    badge.hidden = !tieneOferta;
  }
}

/**
 * Renderiza el precio actual y, si existe un precio de lista, lo agrega
 * tachado al lado.
 */
function renderizarPrecio(producto) {
  if (!precioDetalle) {
    return;
  }

  const precio = Number(producto.precio) || 0;
  const precioOriginal = Number(producto.precioOriginal) || 0;

  if (precioActualDetalle) {
    precioActualDetalle.textContent = formatearPrecio(precio);

    if (precioOriginalDetalle) {
      precioOriginalDetalle.textContent = precioOriginal > 0 ? formatearPrecio(precioOriginal) : '';
      precioOriginalDetalle.hidden = precioOriginal <= 0;
    }

    return;
  }

  const precioActualHTML = escaparHTML(formatearPrecio(precio));

  if (precioOriginal > 0) {
    precioDetalle.innerHTML = `${precioActualHTML} <span class="precio-tachado">${escaparHTML(
      formatearPrecio(precioOriginal)
    )}</span>`;
  } else {
    precioDetalle.textContent = formatearPrecio(precio);
  }
}

function obtenerIdProducto() {
  const parametros = new URLSearchParams(window.location.search);
  return (parametros.get('id') || '').trim();
}

function crearFilaEspecificacion(etiqueta, valor) {
  return `
    <tr>
      <th scope="row">${escaparHTML(etiqueta)}</th>
      <td>${escaparHTML(valor)}</td>
    </tr>
  `;
}

function renderizarEspecificaciones(producto) {
  if (!especificaciones) {
    return;
  }

  const filas = [['Categoría', producto.categoria || 'Sin categoría']];

  if (producto.marca) {
    filas.push(['Marca', producto.marca]);
  }

  filas.push(['Estado', esOferta(producto.oferta) ? 'En oferta' : 'Disponible']);
  filas.push(['Garantía', producto.garantia || 'Garantía oficial WOL']);
  filas.push(['Código de producto', `#${producto.id ?? 'Sin código'}`]);

  especificaciones.innerHTML = filas
    .map(([etiqueta, valor]) => crearFilaEspecificacion(etiqueta, valor))
    .join('');
}

function renderizarProducto(producto) {
  const nombre = producto.nombre || 'Producto sin nombre';
  const categoria = producto.categoria || 'Sin categoría';
  const descripcion = producto.descripcion || 'Sin descripción disponible.';
  const tieneOferta = esOferta(producto.oferta);

  document.title = `${nombre} | WOL Hardware`;

  if (tituloDetalle) tituloDetalle.textContent = nombre;
  if (categoriaDetalle) categoriaDetalle.textContent = categoria;
  if (descripcionDetalle) descripcionDetalle.textContent = descripcion;

  actualizarBadgeOferta(tieneOferta);
  renderizarPrecio(producto);

  if (producto.imagen) {
    if (imagenDetalle) {
      imagenDetalle.src = producto.imagen;
      imagenDetalle.alt = nombre;
    }
  } else if (imagenDetalle) {
    imagenDetalle.removeAttribute('src');
    imagenDetalle.alt = 'Imagen no disponible';
  }

  if (fichaCaption) {
    fichaCaption.textContent = `Especificaciones técnicas de ${nombre}`;
  }

  renderizarEspecificaciones(producto);

  if (btnAgregarCarrito) {
    btnAgregarCarrito.dataset.id = String(producto.id ?? '');
    btnAgregarCarrito.dataset.nombre = nombre;
    btnAgregarCarrito.dataset.precio = String(producto.precio ?? '');
    btnAgregarCarrito.dataset.categoria = categoria;
    btnAgregarCarrito.setAttribute('aria-label', `Agregar ${nombre} al carrito`);
  }

  if (estadoDetalle) estadoDetalle.hidden = true;
  if (contenidoDetalle) contenidoDetalle.hidden = false;
}

async function cargarProducto() {
  const id = obtenerIdProducto();

  if (!id) {
    // La ficha incluye un producto de referencia en el HTML: se conserva
    // como contenido estático de respaldo cuando no hay id en la URL.
    if (estadoDetalle) estadoDetalle.hidden = true;
    if (contenidoDetalle) contenidoDetalle.hidden = false;
    return;
  }

  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    document.title = 'Producto no válido | WOL Hardware';
    mostrarMensaje('El identificador del producto no es válido. Volvé al catálogo para elegir uno.');
    return;
  }

  mostrarMensaje('Cargando producto...');

  try {
    const respuesta = await fetch(
      `${SUPABASE_URL}/rest/v1/Productos?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!respuesta.ok) {
      throw new Error(`Error en el servidor: ${respuesta.status}`);
    }

    const productos = await respuesta.json();

    if (!Array.isArray(productos) || productos.length === 0) {
      document.title = 'Producto no encontrado | WOL Hardware';
      mostrarMensaje('No encontramos el producto solicitado. Puede que ya no esté disponible.');
      return;
    }

    renderizarProducto(productos[0]);
  } catch (error) {
    console.error('Fallo al cargar el detalle del producto:', error);
    document.title = 'Error al cargar el producto | WOL Hardware';
    mostrarMensaje('No pudimos cargar el producto. Intentá nuevamente más tarde.');
  }
}

cargarProducto();
