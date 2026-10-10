const productosOfertas = [
  {
    id: 1,
    nombre: "Placa de video ASUS RTX 4070",
    categoria: "PLACA DE VIDEO",
    imagen: "assets/img/4070.jpg",
    descripcion: "12 GB GDDR6X con soporte DLSS 3 para máxima fluidez en 1440p y 4K.",
    precio: 1199250,
    precioOriginal: 1599000,
    badge: "-25% OFF",
    badgeClass: "badge-oferta",
    enlaceDetalle: "detalle-producto.html",
    enlaceCarrito: "carrito.html"
  },
  {
    id: 2,
    nombre: "Procesador Intel i9",
    categoria: "PROCESADOR",
    imagen: "assets/img/i9.jpg",
    descripcion: "10 núcleos y 20 hilos optimizados para alto rendimiento y multitarea.",
    precio: 1019150,
    precioOriginal: 1199000,
    badge: "-15% OFF",
    badgeClass: "badge-oferta",
    enlaceDetalle: "detalle-producto.html",
    enlaceCarrito: "carrito.html"
  },
  {
    id: 3,
    nombre: "Memoria RAM Corsair DDR5",
    categoria: "MEMORIA",
    imagen: "assets/img/Memoria_Corsair_DDR5_64GB__2x32GB__6000MHz_Vengeance_XMP_3.0_RGB_96e9a386-grn.jpg",
    descripcion: "Kit 64 GB (2x32GB) a 6000 MHz con iluminación RGB integrada.",
    precio: 439200,
    precioOriginal: 549000,
    badge: "-20% OFF",
    badgeClass: "badge-oferta",
    enlaceDetalle: "detalle-producto.html",
    enlaceCarrito: "carrito.html"
  }
];

const productosNuevos = [
  {
    id: 4,
    nombre: "Cooler ASUS ROG RYUJIN III",
    categoria: "COOLER",
    imagen: "assets/img/Cooler_CPU_ASUS_ROG_RYUJIN_III_360_ARGB_EXTREME_cc784055-grn.jpg",
    descripcion: "Sistema de refrigeración líquida de 360 mm con pantalla LCD e iluminación ARGB.",
    precio: 199000,
    precioOriginal: null,
    badge: "NUEVO",
    badgeClass: "badge-nuevo",
    enlaceDetalle: "detalle-producto.html",
    enlaceCarrito: "carrito.html"
  },
  {
    id: 5,
    nombre: "Monitor Gamer 27\" Full HD",
    categoria: "MONITOR",
    imagen: "assets/img/monitor27.jpg",
    descripcion: "Panel IPS de 144 Hz con 1 ms de respuesta y compatibilidad FreeSync.",
    precio: 299000,
    precioOriginal: null,
    badge: "NUEVO",
    badgeClass: "badge-nuevo",
    enlaceDetalle: "detalle-producto.html",
    enlaceCarrito: "carrito.html"
  },
  {
    id: 6,
    nombre: "Auriculares Gamer Pro",
    categoria: "AURICULAR",
    imagen: "assets/img/Auriculares.jpg",
    descripcion: "Sonido envolvente 7.1 con cancelación activa de ruido y micrófono desmontable.",
    precio: 79000,
    precioOriginal: null,
    badge: "NUEVO",
    badgeClass: "badge-nuevo",
    enlaceDetalle: "detalle-producto.html",
    enlaceCarrito: "carrito.html"
  }
];

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio).replace('ARS', '$');
}

function crearTarjetaProducto(producto) {
  const article = document.createElement('article');
  article.className = 'card';

  const badgeHTML = producto.badge
    ? `<span class="badge ${producto.badgeClass}">${producto.badge}</span>`
    : '';

  const precioHTML = producto.precioOriginal
    ? `<p class="precio">${formatearPrecio(producto.precio)} <span class="precio-tachado">${formatearPrecio(producto.precioOriginal)}</span></p>`
    : `<p class="precio">${formatearPrecio(producto.precio)}</p>`;

  article.innerHTML = `
    ${badgeHTML}
    <figure>
      <img
        src="${producto.imagen}"
        alt="${producto.nombre}"
        loading="lazy"
      />
    </figure>
    <span class="tag-categoria">${producto.categoria}</span>
    <h3>${producto.nombre}</h3>
    <p>${producto.descripcion}</p>
    ${precioHTML}
    <a href="${producto.enlaceDetalle}" class="btn-detalle">Ver detalle →</a>
    <a href="${producto.enlaceCarrito}" class="btn-comprar">Agregar al carrito 🛒</a>
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

document.addEventListener('DOMContentLoaded', () => {
  renderizarProductos(productosOfertas, 'ofertas-grid');
  renderizarProductos(productosNuevos, 'nuevos-grid');

  const buscador = document.getElementById('buscador-productos');
  const ofertasGrid = document.getElementById('ofertas-grid');
  const nuevosGrid = document.getElementById('nuevos-grid');
  const sinResultados = document.getElementById('sin-resultados');
  const btnVerTodos = document.getElementById('btn-ver-todos');
  const seccionesMain = document.querySelectorAll('main > section');
  const seccionOfertas = document.getElementById('seccion-ofertas');
  const seccionNuevos = document.getElementById('seccion-nuevos');
  const seccionFiltrados = document.getElementById('seccion-filtrados');
  const filtradosGrid = document.getElementById('filtrados-grid');
  const tituloFiltrados = document.getElementById('titulo-filtrados');

  function filtrarProductos(termino) {
    const terminoLower = termino.toLowerCase().trim();
    const ofertasFiltradas = productosOfertas.filter(p =>
      p.nombre.toLowerCase().includes(terminoLower) || p.descripcion.toLowerCase().includes(terminoLower)
    );
    const nuevosFiltrados = productosNuevos.filter(p =>
      p.nombre.toLowerCase().includes(terminoLower) || p.descripcion.toLowerCase().includes(terminoLower)
    );

    renderizarProductos(ofertasFiltradas, 'ofertas-grid');
    renderizarProductos(nuevosFiltrados, 'nuevos-grid');

    const hayResultados = ofertasFiltradas.length > 0 || nuevosFiltrados.length > 0;

    seccionesMain.forEach(seccion => {
      seccion.style.display = hayResultados ? '' : 'none';
    });
    sinResultados.hidden = hayResultados;
  }

  buscador.addEventListener('input', (e) => {
    filtrarProductos(e.target.value);
    if (e.target.value.trim() !== '') {
      seccionOfertas.style.display = '';
      seccionNuevos.style.display = '';
      seccionFiltrados.style.display = 'none';
      categoriaActiva = null;
      chips.forEach(c => c.classList.remove('activo'));
    }
  });

  btnVerTodos.addEventListener('click', () => {
    buscador.value = '';
    renderizarProductos(productosOfertas, 'ofertas-grid');
    renderizarProductos(productosNuevos, 'nuevos-grid');
    seccionOfertas.style.display = '';
    seccionNuevos.style.display = '';
    seccionFiltrados.style.display = 'none';
    seccionesMain.forEach(seccion => {
      seccion.style.display = '';
    });
    sinResultados.hidden = true;
    categoriaActiva = null;
    chips.forEach(c => c.classList.remove('activo'));
  });

  const chips = document.querySelectorAll('.chip');
  let categoriaActiva = null;

  function filtrarPorCategoria(categoria) {
    if (categoria) {
      const todosProductos = [...productosOfertas, ...productosNuevos];
      const filtrados = todosProductos.filter(p => p.categoria === categoria);

      renderizarProductos(filtrados, 'filtrados-grid');
      tituloFiltrados.textContent = `Resultados para: ${categoria}`;

      seccionOfertas.style.display = 'none';
      seccionNuevos.style.display = 'none';
      seccionFiltrados.style.display = '';

      const hayResultados = filtrados.length > 0;
      sinResultados.hidden = hayResultados;
    } else {
      seccionOfertas.style.display = '';
      seccionNuevos.style.display = '';
      seccionFiltrados.style.display = 'none';
      sinResultados.hidden = true;
    }
  }

  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const textoChip = chip.textContent.trim();
      const mapaCategorias = {
        'Placas de Video': 'PLACA DE VIDEO',
        'Procesadores': 'PROCESADOR',
        'Memorias RAM': 'MEMORIA',
        'Gabinetes': 'GABINETE',
        'Teclados y Mouse': 'TECLADO',
        'Coolers': 'COOLER',
        'Monitores': 'MONITOR'
      };
      const categoria = mapaCategorias[textoChip];

      if (categoriaActiva === categoria) {
        categoriaActiva = null;
        chips.forEach(c => c.classList.remove('activo'));
        filtrarPorCategoria(null);
      } else {
        categoriaActiva = categoria;
        chips.forEach(c => c.classList.remove('activo'));
        chip.classList.add('activo');
        filtrarPorCategoria(categoria);
      }
    });
  });
});