const SUPABASE_URL = 'https://bvleuscwhbgvtdekreqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGV1c2N3aGJndnRkZWtyZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ0NjYsImV4cCI6MjEwODM0MDQ2Nn0.w_FD5NRZ0B0FDZOnVq5mwYCkq0uEmWoEUPOUWj1X6QU';

const gridInventario = document.getElementById('grid-inventario');
const estadoCatalogo = document.getElementById('catalogo-estado');
const botonesFiltro = document.querySelectorAll('.btn-filtro');

let productos = [];
let categoriaActiva = '';

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
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Number(precio) || 0);
}

function crearTarjetaCompacta(producto) {
  const article = document.createElement('article');
  article.className = 'card-compacta';

  article.innerHTML = `
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
    <p class="precio">${formatearPrecio(producto.precio)}</p>
    <div class="card-acciones">
      <a href="detalle-producto.html" class="btn-detalle">Detalle</a>
      <a href="carrito.html" class="btn-comprar">Agregar</a>
    </div>
  `;

  return article;
}

function renderizarProductos(lista) {
  gridInventario.innerHTML = '';

  if (lista.length === 0) {
    estadoCatalogo.textContent = 'No hay productos disponibles en esta categoría.';
    return;
  }

  const fragmento = document.createDocumentFragment();
  lista.forEach((producto) => {
    fragmento.appendChild(crearTarjetaCompacta(producto));
  });
  gridInventario.appendChild(fragmento);

  estadoCatalogo.textContent = `Mostrando ${lista.length} producto${lista.length === 1 ? '' : 's'}.`;
}

function aplicarFiltro(categoria) {
  categoriaActiva = categoria;

  const productosFiltrados = categoria
    ? productos.filter((producto) => producto.categoria === categoria)
    : productos;

  renderizarProductos(productosFiltrados);

  botonesFiltro.forEach((boton) => {
    const esActivo = boton.dataset.categoria === categoria;
    boton.classList.toggle('activo', esActivo);
    boton.setAttribute('aria-pressed', String(esActivo));
  });
}

async function obtenerProductos() {
  try {
    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/Productos?select=*&order=id.asc`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!respuesta.ok) {
      throw new Error(`Error en el servidor: ${respuesta.status}`);
    }

    productos = await respuesta.json();
    aplicarFiltro(categoriaActiva);
  } catch (error) {
    console.error('Fallo al conectar con Supabase:', error);
    estadoCatalogo.textContent = 'No se pudieron cargar los productos. Intentá nuevamente más tarde.';
  }
}

botonesFiltro.forEach((boton) => {
  boton.addEventListener('click', () => {
    const categoria = boton.dataset.categoria;

    if (categoria === categoriaActiva) {
      aplicarFiltro('');
    } else {
      aplicarFiltro(categoria);
    }
  });
});

obtenerProductos();
