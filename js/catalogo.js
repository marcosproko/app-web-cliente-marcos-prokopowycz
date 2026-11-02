/**
 * Catálogo rediseñado de WOL Hardware.
 *
 * Fuente de datos: API REST de Supabase. Si la base no responde o devuelve
 * una lista vacía, se usa un catálogo local de respaldo con 17 productos de
 * hardware para que la vista siempre tenga contenido demostrable.
 *
 * La vista se actualiza con dos métodos funcionales:
 *  - .filter() para aplicar la búsqueda por nombre y las categorías tildadas.
 *  - .sort()   para ordenar por precio según el <select>.
 */

const SUPABASE_URL = 'https://bvleuscwhbgvtdekreqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGV1c2N3aGJndnRkZWtyZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ0NjYsImV4cCI6MjEwODM0MDQ2Nn0.w_FD5NRZ0B0FDZOnVq5mwYCkq0uEmWoEUPOUWj1X6QU';

const gridInventario = document.getElementById('grid-inventario');
const estadoCatalogo = document.getElementById('catalogo-estado');
const buscadorNombre = document.getElementById('buscar-nombre');
const selectOrden = document.getElementById('orden-precio');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const checkboxesCategoria = Array.from(
  document.querySelectorAll('input[name="categoria"]')
);

/* Catálogo local de respaldo: 17 productos variados de hardware. */
const PRODUCTOS_RESPALDO = [
  {
    id: 'local-1',
    nombre: 'Placa de Video ASUS RTX 4070',
    categoria: 'Placas de Video',
    precio: 1199250,
    precioOriginal: 1399000,
    imagen: 'assets/img/4070.jpg',
    descripcion: '12 GB GDDR6X, DLSS 3 y ray tracing para gaming en 1440p.',
    oferta: true
  },
  {
    id: 'local-2',
    nombre: 'AMD Radeon RX 7800 XT 16GB',
    categoria: 'Placas de Video',
    precio: 980000,
    precioOriginal: 1150000,
    imagen: 'assets/img/7800-xt-16gb.jpg',
    descripcion: '16 GB GDDR6, arquitectura RDNA 3 y alto rendimiento en 4K.',
    oferta: true
  },
  {
    id: 'local-3',
    nombre: 'AMD Ryzen 7 7800X3D',
    categoria: 'Procesadores',
    precio: 540000,
    precioOriginal: 0,
    imagen: 'assets/img/AMD ryzen 7 7800.jpg',
    descripcion: '8 núcleos, 16 hilos y 3D V-Cache para el mejor rendimiento gamer.',
    oferta: false
  },
  {
    id: 'local-4',
    nombre: 'Intel Core i9-14900K',
    categoria: 'Procesadores',
    precio: 899000,
    precioOriginal: 0,
    imagen: 'assets/img/i9.jpg',
    descripcion: '24 núcleos y hasta 6.0 GHz para productividad y gaming extremo.',
    oferta: false
  },
  {
    id: 'local-5',
    nombre: 'Intel Core i5-13400F',
    categoria: 'Procesadores',
    precio: 289000,
    precioOriginal: 320000,
    imagen: 'assets/img/I5 13400.jpg',
    descripcion: '10 núcleos y 16 hilos, la opción equilibrada para tu primer build.',
    oferta: true
  },
  {
    id: 'local-6',
    nombre: 'Kingston Fury Beast 16GB DDR5',
    categoria: 'Memorias RAM',
    precio: 85000,
    precioOriginal: 0,
    imagen: 'assets/img/Memoria RAM Kingston Fury Beast 16GB.webp',
    descripcion: 'Módulo DDR5 de 16 GB a 6000 MHz con disipador de aluminio.',
    oferta: false
  },
  {
    id: 'local-7',
    nombre: 'TeamGroup T-Force 32GB DDR5',
    categoria: 'Memorias RAM',
    precio: 145000,
    precioOriginal: 165000,
    imagen: 'assets/img/Memoria RAM TeamGroup T-Force 32GB.jpg',
    descripcion: 'Kit de alto rendimiento con RGB y perfil EXPO/XMP.',
    oferta: true
  },
  {
    id: 'local-8',
    nombre: 'Corsair Vengeance 64GB DDR5',
    categoria: 'Memorias RAM',
    precio: 260000,
    precioOriginal: 0,
    imagen: 'assets/img/Memoria_Corsair_DDR5_64GB.jpg',
    descripcion: '64 GB para estaciones de trabajo, edición y multitarea pesada.',
    oferta: false
  },
  {
    id: 'local-9',
    nombre: 'ASUS ROG Ryujin III 360 ARGB',
    categoria: 'Refrigeración',
    precio: 410000,
    precioOriginal: 0,
    imagen: 'assets/img/Cooler_CPU_ASUS_ROG_RYUJIN_III.jpg',
    descripcion: 'Refrigeración líquida de 360 mm con pantalla LCD y ARGB.',
    oferta: false
  },
  {
    id: 'local-10',
    nombre: 'DeepCool AK620 Digital',
    categoria: 'Refrigeración',
    precio: 95000,
    precioOriginal: 110000,
    imagen: 'assets/img/Cooler CPU DeepCool AK620 Digital.jpg',
    descripcion: 'Disipador de doble torre con pantalla digital de temperatura.',
    oferta: true
  },
  {
    id: 'local-11',
    nombre: 'Gabinete Gamer Beast Pro RGB',
    categoria: 'Gabinetes',
    precio: 130000,
    precioOriginal: 0,
    imagen: 'assets/img/beastpro.jpg',
    descripcion: 'Mid tower con panel de vidrio templado y ventilación ARGB.',
    oferta: false
  },
  {
    id: 'local-12',
    nombre: 'Gabinete ATX Airflow',
    categoria: 'Gabinetes',
    precio: 75000,
    precioOriginal: 0,
    imagen: 'assets/img/gabinete.jpg',
    descripcion: 'Frente mesh, buen flujo de aire y espacio para GPUs largas.',
    oferta: false
  },
  {
    id: 'local-13',
    nombre: 'Monitor Samsung Odyssey G25',
    categoria: 'Monitores',
    precio: 450000,
    precioOriginal: 499000,
    imagen: 'assets/img/Odyssey25.jpg',
    descripcion: '24.5" Full HD, 240 Hz y 1 ms para competitivo.',
    oferta: true
  },
  {
    id: 'local-14',
    nombre: 'Monitor Gamer 27" 165Hz',
    categoria: 'Monitores',
    precio: 320000,
    precioOriginal: 0,
    imagen: 'assets/img/monitor27.jpg',
    descripcion: 'Panel IPS QHD de 27 pulgadas con 165 Hz y FreeSync.',
    oferta: false
  },
  {
    id: 'local-15',
    nombre: 'Teclado Mecánico Corsair K65',
    categoria: 'Periféricos',
    precio: 110000,
    precioOriginal: 0,
    imagen: 'assets/img/Teclado_Mecanico_Corsair_K65.jpg',
    descripcion: 'Formato compacto, switches mecánicos y chasis de aluminio.',
    oferta: false
  },
  {
    id: 'local-16',
    nombre: 'Mouse Logitech G502 X Lightspeed',
    categoria: 'Periféricos',
    precio: 95000,
    precioOriginal: 105000,
    imagen: 'assets/img/Mouse Gamer Logitech G502 X Lightspeed.jpg',
    descripcion: 'Mouse inalámbrico con sensor HERO 25K y 13 botones.',
    oferta: true
  },
  {
    id: 'local-17',
    nombre: 'Auriculares Gamer 7.1 RGB',
    categoria: 'Periféricos',
    precio: 68000,
    precioOriginal: 0,
    imagen: 'assets/img/Auriculares.jpg',
    descripcion: 'Sonido envolvente 7.1, micrófono con cancelación y RGB.',
    oferta: false
  }
];

/* Alias para unificar categorías que pueden venir con otro nombre desde la BD. */
const ALIAS_CATEGORIA = {
  refrigeracion: 'Refrigeración',
  coolers: 'Refrigeración',
  cooler: 'Refrigeración',
  perifericos: 'Periféricos',
  periferico: 'Periféricos',
  'teclados y mouse': 'Periféricos',
  'teclado y mouse': 'Periféricos',
  teclados: 'Periféricos',
  mouse: 'Periféricos',
  'placas de video': 'Placas de Video',
  procesadores: 'Procesadores',
  'memorias ram': 'Memorias RAM',
  gabinetes: 'Gabinetes',
  monitores: 'Monitores'
};

let productosBase = [];
let terminoBusqueda = '';
let categoriasSeleccionadas = new Set();
let ordenActual = 'relevancia';

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
    maximumFractionDigits: 2
  }).format(Number(precio) || 0);
}

function normalizarCategoria(categoria) {
  const texto = String(categoria ?? '').trim();
  const clave = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return ALIAS_CATEGORIA[clave] || texto;
}

function crearTarjetaCompacta(producto) {
  const article = document.createElement('article');
  article.className = 'card-compacta';

  const imagen = producto.imagen || 'assets/img/product_7dac42a2_mirakl_image_1_large.webp';
  const precio = Number(producto.precio) || 0;
  const precioOriginal = Number(producto.precioOriginal) || 0;
  const categoria = normalizarCategoria(producto.categoria);

  const precioOriginalHTML =
    precioOriginal > precio
      ? `<span class="precio-tachado">${formatearPrecio(precioOriginal)}</span>`
      : '';

  article.innerHTML = `
    <figure>
      <img
        src="${escaparHTML(imagen)}"
        alt="${escaparHTML(producto.nombre)}"
        loading="lazy"
      />
    </figure>
    <span class="tag-categoria">${escaparHTML(categoria)}</span>
    <h3>${escaparHTML(producto.nombre)}</h3>
    <p>${escaparHTML(producto.descripcion)}</p>
    <p class="precio">
      ${formatearPrecio(precio)}
      ${precioOriginalHTML}
    </p>
    <div class="card-acciones">
      <a
        href="detalle-producto.html?id=${encodeURIComponent(producto.id)}"
        class="btn-detalle"
        aria-label="Ver detalle de ${escaparHTML(producto.nombre)}"
      >Detalle</a>
      <button
        type="button"
        class="btn-comprar"
        data-agregar-carrito
        aria-label="Agregar ${escaparHTML(producto.nombre)} al carrito"
        data-id="${escaparHTML(producto.id)}"
        data-nombre="${escaparHTML(producto.nombre)}"
        data-precio="${precio}"
        data-imagen="${escaparHTML(imagen)}"
        data-categoria="${escaparHTML(categoria)}"
      >
        Agregar
      </button>
    </div>
  `;

  return article;
}

/**
 * Dibuja las tarjetas .card-compacta en la grilla.
 * Si la lista llega vacía, muestra un mensaje amigable estilizado.
 */
function renderizarCatalogo(productos) {
  if (!gridInventario) return;

  gridInventario.innerHTML = '';

  if (!Array.isArray(productos) || productos.length === 0) {
    gridInventario.innerHTML = `
      <div class="sin-resultados" role="status">
        <span class="sin-resultados-icono" aria-hidden="true">🔎</span>
        <p>No encontramos productos con esos filtros.</p>
        <p class="sin-resultados-ayuda">
          Probá con otro nombre o quitá alguna categoría seleccionada.
        </p>
        <button type="button" data-limpiar-filtros>Limpiar filtros</button>
      </div>
    `;

    if (estadoCatalogo) {
      estadoCatalogo.textContent = '0 productos encontrados.';
    }
    return;
  }

  const fragmento = document.createDocumentFragment();
  productos.forEach((producto) => {
    fragmento.appendChild(crearTarjetaCompacta(producto));
  });
  gridInventario.appendChild(fragmento);

  if (estadoCatalogo) {
    estadoCatalogo.textContent = `Mostrando ${productos.length} producto${
      productos.length === 1 ? '' : 's'
    }.`;
  }
}

/**
 * Aplica .filter() (búsqueda + categorías) y .sort() (precio) y devuelve
 * una nueva lista lista para renderizar.
 */
function obtenerProductosFiltrados() {
  const termino = terminoBusqueda.trim().toLowerCase();

  const resultado = productosBase.filter((producto) => {
    const coincideNombre =
      termino === '' ||
      String(producto.nombre || '')
        .toLowerCase()
        .includes(termino);

    const coincideCategoria =
      categoriasSeleccionadas.size === 0 ||
      categoriasSeleccionadas.has(normalizarCategoria(producto.categoria));

    return coincideNombre && coincideCategoria;
  });

  if (ordenActual === 'menor-mayor') {
    resultado.sort((a, b) => Number(a.precio) - Number(b.precio));
  } else if (ordenActual === 'mayor-menor') {
    resultado.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  return resultado;
}

function actualizarCatalogo() {
  renderizarCatalogo(obtenerProductosFiltrados());
}

function limpiarFiltros() {
  terminoBusqueda = '';
  categoriasSeleccionadas = new Set();
  ordenActual = 'relevancia';

  if (buscadorNombre) buscadorNombre.value = '';
  checkboxesCategoria.forEach((checkbox) => {
    checkbox.checked = false;
  });
  if (selectOrden) selectOrden.value = 'relevancia';

  actualizarCatalogo();
}

/* ----------------------------- Eventos ----------------------------- */

if (buscadorNombre) {
  buscadorNombre.addEventListener('input', (evento) => {
    terminoBusqueda = evento.target.value;
    actualizarCatalogo();
  });
}

checkboxesCategoria.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    categoriasSeleccionadas = new Set(
      checkboxesCategoria
        .filter((categoria) => categoria.checked)
        .map((categoria) => categoria.value)
    );
    actualizarCatalogo();
  });
});

if (selectOrden) {
  selectOrden.addEventListener('change', (evento) => {
    ordenActual = evento.target.value;
    actualizarCatalogo();
  });
}

if (btnLimpiarFiltros) {
  btnLimpiarFiltros.addEventListener('click', limpiarFiltros);
}

if (gridInventario) {
  gridInventario.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-limpiar-filtros]')) {
      limpiarFiltros();
    }
  });
}

/* --------------------------- Carga inicial --------------------------- */

async function cargarProductos() {
  const parametros = new URLSearchParams(window.location.search);
  const busquedaUrl = parametros.get('q');

  try {
    const respuesta = await fetch(
      `${SUPABASE_URL}/rest/v1/Productos?select=*&order=id.asc`,
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

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('La base de datos no devolvió productos.');
    }

    productosBase = datos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio) || 0,
      precioOriginal: Number(producto.precioOriginal) || 0
    }));
  } catch (error) {
    console.warn('Catálogo: se usa el catálogo local de respaldo.', error);
    productosBase = PRODUCTOS_RESPALDO;
  }

  if (busquedaUrl) {
    terminoBusqueda = busquedaUrl;
    if (buscadorNombre) buscadorNombre.value = busquedaUrl;
  }

  actualizarCatalogo();
}

cargarProductos();
