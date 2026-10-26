const SUPABASE_URL = 'https://bvleuscwhbgvtdekreqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGV1c2N3aGJndnRkZWtyZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ0NjYsImV4cCI6MjEwODM0MDQ2Nn0.w_FD5NRZ0B0FDZOnVq5mwYCkq0uEmWoEUPOUWj1X6QU';

const gridInventario = document.getElementById('grid-inventario');
const estadoCatalogo = document.getElementById('catalogo-estado');
const botonesFiltro = document.querySelectorAll('.btn-filtro');

let productos = [];
let categoriaActiva = '';

const GRUPOS_CATEGORIA = [
  ['refrigeracion', 'coolers', 'cooler'],
  ['perifericos', 'periferico', 'teclados y mouse', 'teclado y mouse', 'teclados', 'mouse']
];

const CATEGORIAS_TODAS = new Set(['todos', 'todos los productos', 'todas', 'todas las categorias']);

function normalizarCategoria(texto) {
  return String(texto ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function obtenerGrupoCategoria(texto) {
  const normalizada = normalizarCategoria(texto);
  return GRUPOS_CATEGORIA.find((grupo) => grupo.includes(normalizada)) || null;
}

function sonCategoriasEquivalentes(categoriaA, categoriaB) {
  const normalizadaA = normalizarCategoria(categoriaA);
  const normalizadaB = normalizarCategoria(categoriaB);

  if (normalizadaA === normalizadaB) return true;
  if (!normalizadaA || !normalizadaB) return false;

  const grupoA = obtenerGrupoCategoria(normalizadaA);
  const grupoB = obtenerGrupoCategoria(normalizadaB);

  return Boolean(grupoA && grupoA === grupoB);
}

function esCategoriaTodas(categoria) {
  return CATEGORIAS_TODAS.has(normalizarCategoria(categoria));
}

function obtenerCategoriaBoton(boton) {
  const desdeDataset = boton.dataset.categoria;

  if (typeof desdeDataset === 'string' && desdeDataset.trim() !== '') {
    return desdeDataset.trim();
  }

  return (boton.textContent || '').trim();
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
        Agregar
      </button>
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
  categoriaActiva = esCategoriaTodas(categoria) ? '' : String(categoria ?? '').trim();

  const productosFiltrados = categoriaActiva
    ? productos.filter((producto) => sonCategoriasEquivalentes(producto.categoria, categoriaActiva))
    : productos;

  renderizarProductos(productosFiltrados);

  botonesFiltro.forEach((boton) => {
    const categoriaBoton = obtenerCategoriaBoton(boton);
    const esActivo = categoriaActiva === ''
      ? esCategoriaTodas(categoriaBoton)
      : sonCategoriasEquivalentes(categoriaBoton, categoriaActiva);

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
    const categoria = obtenerCategoriaBoton(boton);

    if (esCategoriaTodas(categoria)) {
      aplicarFiltro('');
    } else if (sonCategoriasEquivalentes(categoria, categoriaActiva)) {
      aplicarFiltro('');
    } else {
      aplicarFiltro(categoria);
    }
  });
});

obtenerProductos();
