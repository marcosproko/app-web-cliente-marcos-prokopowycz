let productosOfertas = [];
let productosNuevos =[];
let todosLosProductos = [];

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(precio).replace('ARS', '$');
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

function crearTarjetaProducto(producto) {
  const article = document.createElement('article');
  article.className = 'card';

  const badgeHTML = producto.badge
    ? `<span class="badge ${escaparHTML(producto.badgeClass)}">${escaparHTML(producto.badge)}</span>`
    : '';

  const precioHTML = producto.precioOriginal
    ? `<p class="precio">${formatearPrecio(producto.precio)} <span class="precio-tachado">${formatearPrecio(producto.precioOriginal)}</span></p>`
    : `<p class="precio">${formatearPrecio(producto.precio)}</p>`;

  article.innerHTML = `
    ${badgeHTML}
    <figure>
      <img
        src="${escaparHTML(producto.imagen)}"
        alt="${escaparHTML(producto.nombre)}"
        loading="lazy"
      />
    </figure>
    <span class="tag-categoria">${escaparHTML(producto.categoria)}</span>
    <h3>${escaparHTML(producto.nombre)}</h3>
    <p>${escaparHTML(producto.descripcion)}</p>
    ${precioHTML}
    <a
      href="detalle-producto.html?id=${encodeURIComponent(producto.id)}"
      class="btn-detalle"
      aria-label="Ver detalle de ${escaparHTML(producto.nombre)}"
    >Ver detalle →</a>
    <button
      type="button"
      class="btn-comprar"
      data-agregar-carrito
      aria-label="Agregar ${escaparHTML(producto.nombre)} al carrito"
      data-id="${escaparHTML(producto.id)}"
      data-nombre="${escaparHTML(producto.nombre)}"
      data-precio="${Number(producto.precio) || 0}"
      data-imagen="${escaparHTML(producto.imagen)}"
      data-categoria="${escaparHTML(producto.categoria)}"
    >
      Agregar al carrito 🛒
    </button>
  `;

  return article;
}

function renderizarProductos(productos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = '';
  productos.forEach(producto => {
    const tarjeta = crearTarjetaProducto(producto);
    contenedor.appendChild(tarjeta);
  });
}

function mostrarCargandoProductos(contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = `
    <p class="cargando-productos" role="status">
      Cargando productos...
    </p>
  `;
}

function prepararCargaPortada() {
  const sinResultados = document.getElementById('sin-resultados');

  ['seccion-ofertas', 'seccion-nuevos'].forEach((id) => {
    const seccion = document.getElementById(id);
    if (seccion) seccion.style.display = '';
  });

  if (sinResultados) sinResultados.hidden = true;

  mostrarCargandoProductos('ofertas-grid');
  mostrarCargandoProductos('nuevos-grid');
}

function mostrarErrorCargaProductos() {
  const mensaje =
    'No pudimos conectar con el catálogo en este momento. Intente más tarde.';

  ['seccion-ofertas', 'seccion-nuevos'].forEach((id) => {
    const seccion = document.getElementById(id);
    if (seccion) seccion.style.display = '';
  });

  ['ofertas-grid', 'nuevos-grid'].forEach((id) => {
    const contenedor = document.getElementById(id);
    if (!contenedor) return;

    contenedor.innerHTML = `
      <p class="alerta-error" role="alert">
        ${mensaje}
      </p>
    `;
  });

  const sinResultados = document.getElementById('sin-resultados');
  if (sinResultados) sinResultados.hidden = true;
}

document.addEventListener('DOMContentLoaded', () => {
  const buscador = document.getElementById('buscador-productos');
  const sinResultados = document.getElementById('sin-resultados');
  const btnVerTodos = document.getElementById('btn-ver-todos');
  const seccionOfertas = document.getElementById('seccion-ofertas');
  const seccionNuevos = document.getElementById('seccion-nuevos');

  function mostrarTodosLosProductos() {
    renderizarProductos(productosOfertas, 'ofertas-grid');
    renderizarProductos(productosNuevos, 'nuevos-grid');

    seccionOfertas.style.display = productosOfertas.length > 0 ? '' : 'none';
    seccionNuevos.style.display = productosNuevos.length > 0 ? '' : 'none';
    sinResultados.hidden = true;
  }

  function filtrarProductos(termino) {
    const terminoLower = termino.toLowerCase().trim();

    if (terminoLower === '') {
      mostrarTodosLosProductos();
      return;
    }

    const coincidencias = todosLosProductos.filter(p =>
      (p.nombre || '').toLowerCase().includes(terminoLower) ||
      (p.descripcion || '').toLowerCase().includes(terminoLower)
    );

    const ofertasFiltradas = coincidencias.filter(p => p.oferta === true);
    const nuevosFiltrados = coincidencias.filter(p => p.oferta === false);

    renderizarProductos(ofertasFiltradas, 'ofertas-grid');
    renderizarProductos(nuevosFiltrados, 'nuevos-grid');

    const hayOfertas = ofertasFiltradas.length > 0;
    const hayNuevos = nuevosFiltrados.length > 0;
    const hayResultados = hayOfertas || hayNuevos;

    seccionOfertas.style.display = hayOfertas ? '' : 'none';
    seccionNuevos.style.display = hayNuevos ? '' : 'none';
    sinResultados.hidden = hayResultados;
  }

  function aplicarVistaSegunBusqueda() {
    if (buscador.value.trim() !== '') {
      filtrarProductos(buscador.value);
    } else {
      mostrarTodosLosProductos();
    }
  }

  buscador.addEventListener('input', (e) => {
    filtrarProductos(e.target.value);
  });

  const formBuscador = document.querySelector('.search-centrado');
  if (formBuscador) {
    formBuscador.addEventListener('submit', (e) => {
      e.preventDefault();
      filtrarProductos(buscador.value);
    });
  }

  btnVerTodos.addEventListener('click', () => {
    buscador.value = '';
    mostrarTodosLosProductos();
  });

  window.addEventListener('productos-cargados', aplicarVistaSegunBusqueda);

  mostrarTodosLosProductos();
});
const SUPABASE_URL = 'https://bvleuscwhbgvtdekreqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGV1c2N3aGJndnRkZWtyZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ0NjYsImV4cCI6MjEwODM0MDQ2Nn0.w_FD5NRZ0B0FDZOnVq5mwYCkq0uEmWoEUPOUWj1X6QU';

async function obtenerProductos() {
  prepararCargaPortada();

  try {
    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/Productos?select=*`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!respuesta.ok) {
      throw new Error(`Error en el servidor: ${respuesta.status}`);
    }

    const productos = await respuesta.json();

  
    const productosAdaptados = productos.map(p => {
      const precio = Number(p.precio) || 0;
      const precioOriginal = Number(p.precioOriginal) || 0;
      const tieneOferta = Boolean(p.oferta);
      const descuento = tieneOferta && precioOriginal > 0 && precio > 0 && precioOriginal > precio
        ? Math.round(((precioOriginal - precio) / precioOriginal) * 100)
        : 0;

      return {
        ...p,
        precio,
        precioOriginal: precioOriginal > 0 ? precioOriginal : null,
        oferta: tieneOferta,
        badge: tieneOferta
          ? (descuento > 0 ? `-${descuento}% OFF` : 'OFERTA')
          : 'NUEVO',
        badgeClass: tieneOferta ? 'badge-oferta' : 'badge-nuevo'
      };
    });

    todosLosProductos = productosAdaptados;
    productosOfertas = productosAdaptados.filter(p => p.oferta === true).slice(0, 3);
    productosNuevos = productosAdaptados.filter(p => p.oferta === false).slice(0, 3);
    renderizarProductos(productosOfertas, 'ofertas-grid');
    renderizarProductos(productosNuevos, 'nuevos-grid');

    window.dispatchEvent(new Event('productos-cargados'));

  } catch (error) {
    console.error('Fallo al conectar con Supabase:', error);
    mostrarErrorCargaProductos();
  }
}

document.addEventListener('DOMContentLoaded', obtenerProductos);
