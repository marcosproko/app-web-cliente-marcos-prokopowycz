# Cambios: limpieza del inicio, catálogo dinámico y filtros reales

## 1. Qué saqué de `index.html`

Eliminé toda la sección **"Explorá por Categorías"**, o sea el bloque con las pastillas o chips de categorías que estaba entre el buscador y las ofertas.

También borré el CSS que ya no se usaba para esas pastillas (`.chip`, `.categorias-chips` y `.seccion-categorias-banner`), así no queda código muerto.

En `js/app.js` saqué las referencias a esa sección y los listeners de los chips:

- ya no se busca `#seccion-categorias`;
- ya no se seleccionan los `.chip`;
- ya no existe la variable `categoriaActiva` para los chips del inicio;
- ya no existe la función `filtrarPorCategoria` del inicio.

Gracias a esa limpieza, el buscador, "Ofertas Semanales" y "Nuevos Ingresos" siguen funcionando normalmente y no se rompen por intentar acceder a elementos que ya no están en el HTML.

## 2. Cómo quedó conectado `catalogo.html` con Supabase

Creé un archivo nuevo, `js/catalogo.js`, y lo vinculé desde `catalogo.html` con `defer`.

Ese script usa la misma URL y la misma clave anon (JWT) de Supabase que ya usaba el inicio. Hace un `fetch` asíncrono contra la API REST:

```js
`${SUPABASE_URL}/rest/v1/Productos?select=*&order=id.asc`
```

En los headers manda `apikey` y `Authorization: Bearer <clave anon>`. Cuando llega la respuesta, guarda los productos en un array y los dibuja uno por uno.

Las tarjetas viejas que estaban escritas a mano dentro de `.grid-inventario` se borraron del HTML. Ahora ese contenedor arranca vacío y se llena solo con JavaScript. Cada producto se muestra con la estructura `.card-compacta`:

- imagen (`imagen`);
- categoría (`categoria`);
- nombre (`nombre`);
- descripción (`descripcion`);
- precio formateado en pesos argentinos con `Intl.NumberFormat('es-AR', { currency: 'ARS' })`;
- botones de "Detalle" y "Agregar".

Además, los textos que vienen de la base se escapan antes de insertarlos en el HTML para evitar problemas con caracteres especiales.

Si Supabase falla, se muestra un mensaje de error en el estado del catálogo y el error queda en la consola.

## 3. Cómo funciona el filtrado por categoría

Los enlaces que antes tenían `href="#gpu"`, `href="#cpu"`, etc. ahora son botones reales con un atributo `data-categoria`.

Cada botón tiene la categoría tal cual viene en la base de datos, por ejemplo:

- `data-categoria="Placas de Video"`
- `data-categoria="Procesadores"`
- `data-categoria="Memorias RAM"`
- `data-categoria="Coolers"` (se muestra como "Refrigeración")
- `data-categoria="Teclados y Mouse"` (se muestra como "Periféricos")

Al hacer clic:

1. se lee la categoría del botón;
2. se aplica `.filter()` sobre el array completo de productos de Supabase;
3. se vuelve a dibujar `.grid-inventario` solo con los productos que coinciden.

El botón **"Todos los productos"** tiene `data-categoria=""`, así que al tocarlo se muestran de nuevo todos los productos sin filtrar. Si se hace clic otra vez sobre la categoría que ya está activa, también se vuelve al listado completo (se deselecciona).

El botón activo queda marcado visualmente con la clase `.activo` (fondo turquesa) y con `aria-pressed="true"` para que también lo entiendan los lectores de pantalla. Arriba de la grilla se muestra un texto con la cantidad de productos visibles o un aviso si la categoría no tiene productos.

## 4. Por qué la tarjeta se estiraba en el catálogo

Antes `.grid-inventario` usaba `repeat(auto-fit, minmax(220px, 1fr))`. Ese `1fr` significa "quedate con todo el espacio libre". Cuando se filtraba una sola categoría y quedaba un solo producto, la grilla armaba una única columna y esa columna se llevaba el 100% del ancho de la pantalla. Entonces la tarjeta se estiraba, la imagen quedaba gigante y todo se veía deformado. El problema no era la tarjeta en sí, sino la grilla que la obligaba a ocupar todo.

Ahora la grilla usa `repeat(auto-fit, minmax(240px, 1fr))`, con `gap: 1.5rem`, un `max-width: 1200px` centrado con `margin: 0 auto` y `width: 100%`. Eso quiere decir: armá columnas de al menos 240 píxeles que se reparten el espacio disponible, dentro de un contenedor de hasta 1200 px centrado en la pantalla. Además, a `.card-compacta` le puse `max-width: 280px` como un cinturón de seguridad extra para que la tarjeta no se estire de más. En celulares muy angostos la grilla pasa a una sola columna para que nada se salga de la pantalla.

## 5. Ficha de producto en dos columnas

En `detalle-producto.html` reemplacé el contenedor viejo por `.detalle-producto`. La parte de arriba ahora es un layout de dos columnas (`.detalle-superior`): a la izquierda la imagen dentro de `.detalle-imagen`, con un máximo de 360 px, fondo blanco y `object-fit: contain`; a la derecha el título, la categoría, la descripción, el precio y el botón "Agregar al carrito". La ficha técnica quedó debajo, ocupando todo el ancho del bloque. En pantallas chicas las dos columnas se apilan una arriba de la otra.

## Explicacion

"En el inicio saqué la sección de categorías porque era redundante y además tenía código JavaScript que ya no servía; con eso el buscador y las secciones de ofertas y nuevos ingresos quedan más limpios y sin errores.

En el catálogo, en vez de tener las tarjetas escritas a mano, el HTML arranca vacío y un script nuevo pide los productos a la API REST de Supabase con `fetch`. Cuando llegan, arma cada tarjeta `.card-compacta` con la imagen, categoría, nombre, descripción y el precio formateado en pesos argentinos.

Para los filtros, cada botón guarda su categoría en un atributo `data-categoria`. Al hacer clic, uso `.filter()` sobre el array de productos y redibujo la grilla solo con los que coinciden. El botón 'Todos los productos' limpia el filtro y muestra todo el inventario, y el botón que está activo se pinta distinto para que se vea cuál está seleccionado."

## 6. Buscador sin recargas y tarjetas con elevación

### Por qué se recargaba la página al buscar

El buscador del inicio está dentro de un `<form>`. Cuando se presiona **Enter** o se hace clic en **Buscar**, el navegador hace lo que hace todo formulario por defecto: enviar los datos y volver a cargar la página. Por eso el texto escrito se perdía y la búsqueda parecía reiniciarse.

La solución fue escuchar el evento `submit` de ese formulario en `js/app.js` y ejecutar `e.preventDefault()`. Esa línea le dice al navegador "no envíes el formulario ni recargues". Después se vuelve a filtrar con el texto que ya está en el input, así que la búsqueda funciona igual con Enter, con el botón o escribiendo en tiempo real.

### Por qué las tarjetas no se elevaban al pasar el mouse

Las tarjetas usan una animación de entrada llamada `fadeInUp`. Esa animación terminaba con `transform: translateY(0)` y se quedaba aplicada para siempre por el `forwards`. Como la animación tiene prioridad sobre el estilo normal, el `transform` del `:hover` (`translateY(-4px)`) nunca se veía: la tarjeta quedaba "congelada" en su posición final.

Ahora la animación mueve la propiedad `translate` en lugar de `transform`. Al terminar, `transform` queda libre y el selector `.card:hover` puede aplicar su elevación de `-4px` con la transición suave de siempre. El efecto visual de entrada se mantiene, pero ya no bloquea el hover.

### Enlaces del pie de página

En `contact.html` se agregaron las secciones con los ids `#preguntas-frecuentes`, `#envios` y `#terminos`, cada una con un texto breve. También se actualizaron los enlaces del footer en todas las páginas para que apunten a `contact.html#preguntas-frecuentes` y no queden enlaces muertos.

## 7. Carrito de compras persistente con localStorage

### 7.1. Un único módulo central: `js/carrito.js`

Toda la lógica del carrito vive en `js/carrito.js`, que se carga con `defer` en `index.html`, `catalogo.html`, `detalle-producto.html`, `carrito.html` y `contact.html` (para que el contador del menú también se actualice en esa vista). Al ejecutarse expone funciones globales reutilizables:

- `agregarAlCarrito(producto)`;
- `obtenerCarrito()`;
- `guardarCarrito(carrito)`;
- `calcularTotal(carrito)`;
- `actualizarContadorNav()`.

El estado se guarda en `localStorage` bajo la clave `carrito_wol`. El formato es siempre un array de objetos:

```js
[
  {
    id: 45,
    nombre: "Placa de video ASUS RTX 4070",
    precio: 1199250,
    imagen: "assets/img/4070.jpg",
    categoria: "Placas de Video",
    cantidad: 1
  }
]
```

### 7.2. Persistencia: `JSON.stringify` y `JSON.parse`

`localStorage` solamente puede guardar texto, no objetos de JavaScript. Por eso:

- al guardar, `guardarCarrito()` usa `JSON.stringify(carrito)` y escribe el resultado con `localStorage.setItem('carrito_wol', ...)`;
- al leer, `obtenerCarrito()` usa `localStorage.getItem('carrito_wol')` y convierte el texto de vuelta a un array con `JSON.parse(...)`.

Si la clave no existe, si el contenido está vacío o si el JSON guardado está dañado, `obtenerCarrito()` devuelve `[]` para que la aplicación nunca se rompa. La lectura y la escritura están envueltas en `try/catch` por ese motivo.

`agregarAlCarrito()` primero busca si el producto ya está en el array comparando los `id` como texto. Si existe, incrementa su `cantidad`; si no existe, agrega el objeto completo con `cantidad: 1`. Después guarda el array actualizado y dispara el evento personalizado `carrito-actualizado` sobre `document`, cuyo `detail` incluye el carrito y el total calculado.

### 7.3. Cálculo del total con `reduce()`

El monto final no se guarda en el storage: se calcula siempre a partir de los datos actuales. Para eso `calcularTotal()` usa `reduce()`:

```js
function calcularTotal(carrito) {
  return carrito.reduce(
    (total, producto) => total + producto.precio * producto.cantidad,
    0
  );
}
```

Cada iteración suma el subtotal del producto (`precio * cantidad`) al acumulador `total`, que arranca en `0`. Así el total siempre coincide con lo que se muestra en la tabla, incluso después de sumar, restar o eliminar unidades.

El contador del menú se obtiene de la misma forma, pero sumando solamente las cantidades con otro `reduce()`. `actualizarContadorNav()` busca el enlace a `carrito.html` dentro del `<header>`, actualiza el badge `.carrito-contador` y refresca su `aria-label` para que el número también sea comprensible con lector de pantalla.

### 7.4. Cómo se agregan productos desde las vistas

En `index.html` y `catalogo.html` las tarjetas se generan dinámicamente desde Supabase. Los botones "Agregar al carrito" y "Agregar" ya no son enlaces que recargan la página: son `<button type="button">` con atributos `data-*` que describen el producto:

```html
<button
  type="button"
  class="btn-comprar"
  data-agregar-carrito
  data-id="45"
  data-nombre="Placa de video ASUS RTX 4070"
  data-precio="1199250"
  data-imagen="assets/img/4070.jpg"
  data-categoria="Placas de Video"
>
  Agregar al carrito
</button>
```

`js/carrito.js` escucha los clics mediante delegación de eventos: busca el ancestro con `data-agregar-carrito`, lee sus atributos con `dataset`, arma el objeto y llama a `agregarAlCarrito()`. Esto funciona tanto con las tarjetas que se crean después de consultar la API como con el botón fijo de `detalle-producto.html`. Después muestra una notificación visual breve con el texto "Producto agregado al carrito".

### 7.5. Renderizado de `carrito.html`

La tabla ya no tiene filas escritas a mano. Su `<tbody>` arranca vacío y lo completa `js/carrito.js` leyendo el storage. Por cada producto se genera una fila con:

- miniatura de la imagen;
- nombre y categoría;
- precio unitario formateado en pesos con `Intl.NumberFormat('es-AR', { currency: 'ARS' })`;
- controles de cantidad `−`, el número y `+`;
- subtotal (`precio * cantidad`);
- botón para eliminar el producto.

Los controles usan delegación de eventos en el `<tbody>`: cada botón tiene `data-accion` (`sumar`, `restar` o `eliminar`) y `data-id`. Al hacer clic se modifica el array, se guarda en localStorage y se vuelve a renderizar la tabla. Si la cantidad llega a cero al restar, el producto se elimina automáticamente.

El total del `<tfoot>` se actualiza con `calcularTotal()`. Si el carrito no tiene productos, la tabla se oculta y aparece un bloque amigable con el mensaje **"Tu carrito está vacío"** y un botón **"Explorar catálogo"** que lleva a `catalogo.html`. En ese estado también se ocultan los botones de vaciar y finalizar.

### 7.6. Vaciar y finalizar compra

- **Vaciar carrito** elimina la clave `carrito_wol` de `localStorage`, vuelve a renderizar el estado vacío, actualiza el contador del menú y dispara `carrito-actualizado`.
- **Finalizar compra** calcula el total, borra el carrito, muestra el estado vacío y abre un modal accesible con el mensaje de éxito y el total abonado. El modal se puede cerrar con el botón, con un clic en el fondo o con la tecla `Escape`; al cerrarse devuelve el foco al elemento que lo abrió.

### 7.7. Estilos y accesibilidad

En `style.css` se agregaron:

- el badge circular `.carrito-contador`, cian cuando no hay unidades y rojo cuando hay productos, con texto oscuro o blanco para mantener el contraste;
- estilos para las miniaturas, los controles de cantidad y el botón de eliminar, con estados `:hover` y `:focus-visible`;
- un contenedor con `overflow-x: auto` para que la tabla se pueda desplazar horizontalmente en pantallas chicas sin romper el layout;
- estilos para el bloque de carrito vacío, la notificación breve y el modal de confirmación;
- ajustes responsive para que los botones de acción se apilen en celulares y la notificación ocupe el ancho disponible.

Además se agregó una regla global `[hidden] { display: none !important; }` para que los elementos que se muestran u ocultan desde JavaScript no queden visibles por culpa de otros `display` definidos en CSS.

## 8. Hero banner, navegación activa y accesibilidad semántica

### 8.1. Banner de bienvenida en la portada

En `index.html` se agregó una sección semántica `<section class="hero-banner">` antes del buscador, con:

- un `<h1>` llamativo: **"Hardware de Alto Rendimiento para tu Setup"**;
- una bajada breve que invita a recorrer el catálogo;
- un enlace destacado **"Explorar Catálogo"** hacia `catalogo.html`.

En `style.css` el banner usa una estética dark/gamer coherente con el resto del sitio: fondo oscuro con degradados cian y rojo, una grilla sutil, bordes redondeados, sombra, buen espaciado vertical y contenido centrado. El botón `.hero-cta` tiene contraste alto (texto oscuro sobre cian), estados `:hover` y `:focus-visible`, y en pantallas chicas ocupa el ancho disponible.

### 8.2. Jerarquía de encabezados y logo enlazado

El logo **WOL** del `<header>` ahora es un enlace `<a class="logo" href="index.html">` en todas las páginas, incluida la portada. De esta forma el `<h1>` queda reservado para el título principal de cada vista:

- `index.html`: el título del hero;
- `catalogo.html`: "Inventario General";
- `detalle-producto.html`: el nombre del producto;
- `carrito.html`: "Carrito de Compras";
- `contact.html`: "Contactanos".

Los títulos internos de cada sección se mantienen en `<h2>` y los nombres de las tarjetas en `<h3>`, así la estructura de encabezados no salta niveles y los lectores de pantalla pueden navegar por la página de forma ordenada.

### 8.3. Indicador de página activa con `aria-current`

En el `<nav>` principal de cada archivo HTML se agregó `aria-current="page"` y la clase `.link-activo` al enlace de la página actual. La regla `.nav-centrado a.link-activo` en `style.css` pinta el enlace con el cian de la marca y le agrega un borde inferior sutil. El atributo `aria-current` comunica la misma información a las tecnologías de asistencia, mientras que la clase lo hace visualmente.

### 8.4. `aria-label` descriptivos en los botones de compra

Las tarjetas generadas dinámicamente en `js/app.js` y `js/catalogo.js` ahora incluyen un `aria-label` específico en el botón de compra, por ejemplo:

```html
aria-label="Agregar Placa de video ASUS RTX 4070 al carrito"
```

Así, cuando un lector de pantalla recorre varias tarjetas, cada botón indica qué producto agrega en lugar de repetir un genérico "Agregar al carrito".

### 8.5. Descuento calculado dinámicamente

En `js/app.js`, al adaptar los productos de Supabase se calcula el porcentaje real de rebaja cuando existen `precioOriginal` y `precio`:

```js
Math.round(((precioOriginal - precio) / precioOriginal) * 100)
```

El resultado se muestra en el badge como `-${descuento}% OFF` en lugar del valor fijo anterior. Si un producto está marcado como oferta pero no tiene un precio original válido, el badge muestra "OFERTA" como respaldo.
