/**
 * Backoffice de WOL Hardware.
 *
 * Se conecta a la API REST de Supabase para listar, crear y eliminar
 * productos de la tabla `Productos`. La clave utilizada es la anon key que
 * ya usan el resto de las vistas del sitio.
 */

const SUPABASE_URL = 'https://bvleuscwhbgvtdekreqn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2bGV1c2N3aGJndnRkZWtyZXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3NjQ0NjYsImV4cCI6MjEwODM0MDQ2Nn0.w_FD5NRZ0B0FDZOnVq5mwYCkq0uEmWoEUPOUWj1X6QU';

const formNuevoProducto = document.getElementById('form-nuevo-producto');
const adminTbody = document.getElementById('admin-tbody');
const adminTablaEstado = document.getElementById('admin-tabla-estado');
const adminMensaje = document.getElementById('admin-mensaje');
const botonGuardar = formNuevoProducto
  ? formNuevoProducto.querySelector('button[type="submit"]')
  : null;

let temporizadorMensaje = null;

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

/**
 * Muestra un aviso visual de éxito o error debajo del formulario.
 */
function mostrarMensaje(texto, tipo = 'exito') {
  if (!adminMensaje) return;

  const clases = {
    exito: 'admin-mensaje-exito',
    error: 'admin-mensaje-error',
    advertencia: 'admin-mensaje-advertencia'
  };

  adminMensaje.textContent = texto;
  adminMensaje.className = `admin-mensaje ${
    clases[tipo] || clases.exito
  }`;
  adminMensaje.hidden = false;

  window.clearTimeout(temporizadorMensaje);
  temporizadorMensaje = window.setTimeout(() => {
    adminMensaje.hidden = true;
  }, 7000);
}

/**
 * Arma una fila de la tabla con todos los datos escapados.
 */
function crearFilaProducto(producto) {
  const fila = document.createElement('tr');
  const id = escaparHTML(producto.id);
  const nombre = escaparHTML(producto.nombre || 'Producto sin nombre');
  const categoria = escaparHTML(producto.categoria || 'Sin categoría');
  const precio = Number(producto.precio) || 0;
  const precioOriginal = Number(producto.precioOriginal) || 0;
  const enOferta = Boolean(producto.oferta);

  const imagenHTML = producto.imagen
    ? `<img
        class="admin-miniatura"
        src="${escaparHTML(producto.imagen)}"
        alt="${nombre}"
        loading="lazy"
      />`
    : '<span class="admin-miniatura admin-miniatura-vacia" aria-hidden="true">?</span>';

  const ofertaHTML = enOferta
    ? '<span class="badge-admin-oferta">OFERTA</span>'
    : '';

  const precioOriginalHTML =
    precioOriginal > precio
      ? `<span class="precio-admin-original">${formatearPrecio(precioOriginal)}</span>`
      : '';

  fila.innerHTML = `
    <td class="admin-celda-miniatura">${imagenHTML}</td>
    <td class="admin-celda-nombre">${nombre}</td>
    <td>${categoria}</td>
    <td class="admin-celda-precio">
      <span class="precio-admin">${formatearPrecio(precio)}</span>
      ${ofertaHTML}
      ${precioOriginalHTML}
    </td>
    <td class="admin-celda-acciones">
      <button
        type="button"
        class="btn-danger"
        data-eliminar="${id}"
        data-nombre="${nombre}"
        aria-label="Eliminar ${nombre}"
      >
        Eliminar
      </button>
    </td>
  `;

  return fila;
}

/**
 * GET a Supabase y renderizado de la tabla administrativa.
 */
async function listarProductosAdmin() {
  if (!adminTbody) return;

  adminTablaEstado.hidden = false;
  adminTablaEstado.textContent = 'Cargando productos...';

  try {
    const respuesta = await fetch(
      `${SUPABASE_URL}/rest/v1/Productos?select=*&order=id.desc`,
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

    if (!Array.isArray(productos)) {
      throw new Error('La respuesta de Supabase no es una lista de productos.');
    }

    adminTbody.innerHTML = '';

    if (productos.length === 0) {
      const filaVacia = document.createElement('tr');
      filaVacia.className = 'admin-fila-vacia';
      filaVacia.innerHTML =
        '<td colspan="5">No hay productos cargados todavía. Usá el formulario para agregar el primero.</td>';
      adminTbody.appendChild(filaVacia);
      adminTablaEstado.textContent = 'No hay productos registrados.';
      return;
    }

    const fragmento = document.createDocumentFragment();
    productos.forEach((producto) => {
      fragmento.appendChild(crearFilaProducto(producto));
    });
    adminTbody.appendChild(fragmento);

    const cantidad = productos.length;
    adminTablaEstado.textContent = `${cantidad} producto${
      cantidad === 1 ? '' : 's'
    } registrado${cantidad === 1 ? '' : 's'}.`;
  } catch (error) {
    console.error('Fallo al cargar los productos para el backoffice:', error);

    adminTbody.innerHTML =
      '<tr><td colspan="5" class="admin-tabla-error">No se pudieron cargar los productos. Revisá la conexión e intentá nuevamente.</td></tr>';
    adminTablaEstado.textContent =
      'No se pudo conectar con Supabase. Intentá nuevamente más tarde.';
  }
}

/**
 * POST a Supabase para insertar un producto nuevo.
 */
async function guardarProducto(evento) {
  evento.preventDefault();

  if (!formNuevoProducto.checkValidity()) {
    formNuevoProducto.reportValidity();
    return;
  }

  const datos = new FormData(formNuevoProducto);

  const nombre = String(datos.get('nombre') || '').trim();
  const categoria = String(datos.get('categoria') || '').trim();
  const imagen = String(datos.get('imagen') || '').trim();
  const descripcion = String(datos.get('descripcion') || '').trim();
  const precio = Number(datos.get('precio'));
  const precioOriginalTexto = String(datos.get('precioOriginal') || '').trim();

  if (
    !nombre ||
    !categoria ||
    !imagen ||
    !descripcion ||
    !Number.isFinite(precio) ||
    precio < 1
  ) {
    mostrarMensaje(
      'Revisá los campos: el nombre, la categoría, la imagen, la descripción y un precio mayor a cero son obligatorios.',
      'error'
    );
    return;
  }

  const nuevoProducto = {
    nombre,
    categoria,
    precio,
    imagen,
    descripcion,
    oferta: datos.get('oferta') === 'on'
  };

  if (precioOriginalTexto !== '') {
    const precioOriginal = Number(precioOriginalTexto);

    if (!Number.isFinite(precioOriginal) || precioOriginal < 1) {
      mostrarMensaje(
        'El precio original debe ser un número mayor a cero o quedar vacío.',
        'error'
      );
      return;
    }

    nuevoProducto.precioOriginal = precioOriginal;
  }

  const textoBoton = botonGuardar ? botonGuardar.textContent : '';

  if (botonGuardar) {
    botonGuardar.disabled = true;
    botonGuardar.textContent = 'Guardando...';
  }

  const insertarProducto = (producto) =>
    fetch(`${SUPABASE_URL}/rest/v1/Productos`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(producto)
    });

  try {
    let respuesta = await insertarProducto(nuevoProducto);
    let precioOriginalOmitido = false;

    /*
     * Compatibilidad con esquemas que todavía no tienen la columna opcional
     * `precioOriginal`: si Supabase rechaza el alta por ese dato, se reintenta
     * sin él para no bloquear el guardado del resto del producto.
     */
    if (
      !respuesta.ok &&
      respuesta.status === 400 &&
      Object.prototype.hasOwnProperty.call(nuevoProducto, 'precioOriginal')
    ) {
      const productoSinPrecioOriginal = { ...nuevoProducto };
      delete productoSinPrecioOriginal.precioOriginal;

      respuesta = await insertarProducto(productoSinPrecioOriginal);
      precioOriginalOmitido = respuesta.ok;
    }

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new Error(
        `Error ${respuesta.status} al guardar el producto${detalle ? `: ${detalle}` : ''}`
      );
    }

    formNuevoProducto.reset();

    if (precioOriginalOmitido) {
      mostrarMensaje(
        `Producto "${nombre}" guardado. La base de datos no tiene la columna Precio original, así que ese dato no se guardó.`,
        'advertencia'
      );
    } else {
      mostrarMensaje(`Producto "${nombre}" guardado correctamente.`, 'exito');
    }

    await listarProductosAdmin();
  } catch (error) {
    console.error('Fallo al guardar el producto:', error);
    mostrarMensaje(
      'No se pudo guardar el producto. Verificá los datos e intentá nuevamente.',
      'error'
    );
  } finally {
    if (botonGuardar) {
      botonGuardar.disabled = false;
      botonGuardar.textContent = textoBoton;
    }
  }
}

/**
 * DELETE con delegación de eventos en el tbody de la tabla.
 */
async function eliminarProducto(evento) {
  const boton = evento.target.closest('.btn-danger[data-eliminar]');

  if (!boton) return;

  const id = boton.dataset.eliminar;
  const nombre = boton.dataset.nombre || 'este producto';

  if (!id) return;

  const confirmado = window.confirm(
    `¿Seguro que querés eliminar "${nombre}"? Esta acción no se puede deshacer.`
  );

  if (!confirmado) return;

  const textBoton = boton.textContent;
  boton.disabled = true;
  boton.textContent = 'Eliminando...';

  try {
    const respuesta = await fetch(
      `${SUPABASE_URL}/rest/v1/Productos?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal'
        }
      }
    );

    if (!respuesta.ok) {
      throw new Error(`Error ${respuesta.status} al eliminar el producto`);
    }

    const fila = boton.closest('tr');
    if (fila) {
      fila.remove();
    }

    mostrarMensaje(`Producto "${nombre}" eliminado correctamente.`, 'exito');
    await listarProductosAdmin();
  } catch (error) {
    console.error('Fallo al eliminar el producto:', error);
    mostrarMensaje(
      'No se pudo eliminar el producto. Intentá nuevamente más tarde.',
      'error'
    );
    boton.disabled = false;
    boton.textContent = textBoton;
  }
}

if (formNuevoProducto) {
  formNuevoProducto.addEventListener('submit', guardarProducto);
}

if (adminTbody) {
  adminTbody.addEventListener('click', eliminarProducto);
}

document.addEventListener('DOMContentLoaded', listarProductosAdmin);
