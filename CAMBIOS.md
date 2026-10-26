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

## 9. Backoffice / Gestión de Productos (`admin.html`)

### 9.1. Arquitectura del panel

Se agregó una vista administrativa nueva, `admin.html`, que reutiliza la misma cabecera, el logo **WOL**, el `<nav>` principal y el pie de página del resto del sitio. El enlace **Admin** queda marcado con `aria-current="page"` y la clase `.link-activo`, así se ve como la sección actual y también lo detectan los lectores de pantalla.

La página se divide en dos bloques:

1. **Alta de productos**: un formulario accesible `#form-nuevo-producto` con los campos nombre, categoría, precio, precio original/listado, URL de imagen, descripción y un switch de oferta.
2. **Inventario**: una tabla `.tabla-admin` con las columnas Miniatura, Nombre, Categoría, Precio y Acciones.

La lógica está separada por completo del HTML en `js/admin.js`, vinculado con `defer` para que el DOM esté disponible antes de ejecutarse. El script reutiliza las constantes `SUPABASE_URL` y `SUPABASE_KEY` con la URL del proyecto y la clave **anon** pública de Supabase.

### 9.2. Listado: `GET` a la API REST

La función `listarProductosAdmin()` consulta:

```js
`${SUPABASE_URL}/rest/v1/Productos?select=*&order=id.desc`
```

- `select=*` trae todas las columnas de cada producto.
- `order=id.desc` muestra primero los productos más nuevos, que son los que interesan en un backoffice.
- Se envía con `method: 'GET'` y los encabezados `apikey` y `Authorization: Bearer <anon>`.

El resultado se recorre y se arma una fila por producto. Todos los textos que vienen de la base pasan por `escaparHTML()` antes de insertarse con `innerHTML`, de modo que un nombre o una descripción con `<`, `>` o comillas no pueda romper la tabla ni inyectar HTML. Los precios se formatean con `Intl.NumberFormat('es-AR', { currency: 'ARS' })`. Si la tabla está vacía se muestra una fila informativa con `colspan="5"`; si falla la conexión se muestra un mensaje de error y el detalle queda en la consola.

### 9.3. Alta: método `POST`

El formulario escucha el evento `submit` y lo intercepta con `e.preventDefault()` para que el navegador no recargue la página. Después:

1. valida los campos con `checkValidity()` y `reportValidity()`;
2. lee los valores con `FormData`;
3. convierte `precio` y `precioOriginal` a número;
4. arma el objeto JSON con las columnas de la tabla: `nombre`, `categoria`, `precio`, `imagen`, `descripcion` y `oferta` (booleano). `precioOriginal` solo se incluye si el usuario cargó un valor, porque es opcional;
5. envía el `fetch()` a `${SUPABASE_URL}/rest/v1/Productos`.

La petición usa `method: 'POST'` y este conjunto de cabeceras:

```js
headers: {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation'
}
```

- **`apikey`**: identifica el proyecto de Supabase.
- **`Authorization: Bearer <anon>`**: autoriza la operación con la clave pública; los permisos reales dependen de las políticas RLS configuradas en Supabase.
- **`Content-Type: application/json`**: le indica a la API que el cuerpo es JSON, imprescindible para que se parsee correctamente.
- **`Prefer: return=representation`**: hace que Supabase devuelva el registro insertado en la respuesta, útil para confirmar el alta y conocer el `id` generado.

En el `<select>` de categorías, la opción visible **"Coolers / Refrigeración"** guarda el valor `Refrigeración` para que coincida con las categorías existentes y con el filtro de `catalogo.html`.

Si el esquema de la base todavía no tiene la columna opcional `precioOriginal`, Supabase responde con un error `400`. Para que el alta no se bloquee por un dato opcional, el script detecta ese caso y reintenta el `POST` sin `precioOriginal`; en ese caso muestra un aviso ámbar explicando que el producto se guardó pero sin el precio de lista.

Mientras se envía la petición el botón **Guardar Producto** queda deshabilitado con el texto "Guardando..." para evitar envíos duplicados. Si la respuesta es `ok`, se resetea el formulario, se muestra un mensaje verde de éxito con `role="status"` y `aria-live="polite"`, y se vuelve a llamar a `listarProductosAdmin()` para que el producto aparezca en la tabla. Si falla, se muestra un mensaje rojo y el error se registra en la consola.

### 9.4. Baja: método `DELETE`

La eliminación usa **delegación de eventos** sobre el `<tbody>`: un único listener escucha los clics y detecta el botón `.btn-danger` con el atributo `data-eliminar`. Antes de borrar se muestra un `window.confirm()` nativo con el nombre del producto, para evitar eliminaciones accidentales.

Si el usuario confirma, se envía:

```js
fetch(`${SUPABASE_URL}/rest/v1/Productos?id=eq.${encodeURIComponent(id)}`, {
  method: 'DELETE',
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: 'return=minimal'
  }
});
```

El filtro `?id=eq.${id}` es la sintaxis de PostgREST para indicar "donde `id` es igual a este valor". El identificador se codifica con `encodeURIComponent()` para que no pueda alterar la URL. `Prefer: return=minimal` evita que Supabase devuelva el cuerpo del registro borrado, ya que el frontend no lo necesita.

La fila se quita del DOM cuando llega una respuesta HTTP `ok` y después se refresca la tabla con `listarProductosAdmin()` para mantener el orden y el contador actualizados. Si la respuesta no es `ok`, se conserva la fila, se restaura el botón y se muestra un mensaje de error.

### 9.5. Estilos del backoffice

En `style.css` se agregó un bloque exclusivo para `admin.html`:

- los paneles usan fondo `#0f172a`, borde azulado y la sombra de las tarjetas del sitio;
- el formulario usa CSS Grid de dos columnas que pasa a una sola columna en pantallas de hasta 700 px;
- los inputs, selects y textareas tienen fondo oscuro, borde `#334155` y foco cian con `box-shadow` y `outline` para que el indicador sea visible también con teclado;
- el switch de oferta se construye con un checkbox real oculto visualmente y un control estilizado, manteniendo el foco visible y el atributo `role="switch"`;
- la tabla administrativa queda dentro de `.tabla-admin-contenedor` con `overflow-x: auto`, de modo que en celulares se pueda desplazar horizontalmente sin romper el layout;
- las miniaturas tienen fondo blanco y `object-fit: contain` para no deformar las imágenes;
- los productos en oferta muestran un badge rojo `.badge-admin-oferta` y, si tienen precio original, se muestra tachado debajo del precio actual;
- el botón de baja usa la clase `.btn-danger` con fondo `#ef4444`, hover más oscuro y estados `:focus-visible` y `:disabled`.

### 9.6. Cómo probar el flujo completo

1. Abrir `admin.html` desde el navegador (o con Live Server).
2. Verificar que la tabla cargue los productos existentes en orden descendente por `id`.
3. Completar el formulario y presionar **Guardar Producto**; debería aparecer el mensaje de éxito y la fila nueva arriba de la tabla.
4. Confirmar que el producto se vea también en `catalogo.html`.
5. Presionar **Eliminar** sobre una fila, aceptar el `confirm()` y comprobar que la fila desaparezca y que el producto ya no esté en la tienda.

### 9.7. Requisito de políticas RLS en Supabase

La clave **anon** no saltea las políticas de seguridad a nivel de fila (RLS). Con la configuración actual del proyecto, la lectura funciona, pero un `POST` válido devuelve:

```json
{
  "code": "42501",
  "message": "new row violates row-level security policy for table \"Productos\""
}
```

Eso significa que la tabla tiene RLS activo y que no existe una política que permita `INSERT` (y probablemente tampoco `DELETE`) para el rol `anon`. Para que el backoffice pueda dar de alta y eliminar productos hay que crear las políticas correspondientes en Supabase, por ejemplo desde **Authentication → Policies** o con SQL:

```sql
create policy "Permitir alta desde el backoffice"
on "Productos" for insert
to anon
with check (true);

create policy "Permitir baja desde el backoffice"
on "Productos" for delete
to anon
using (true);
```

En un sitio real esas políticas no deberían quedar abiertas a cualquiera: lo correcto es agregar autenticación, restringir el panel a usuarios administradores y escribir políticas que validen el rol. Para esta entrega académica alcanza con dejar documentado el requisito y mantener la clave **anon** en el frontend, sin exponer nunca la `service_role`.
