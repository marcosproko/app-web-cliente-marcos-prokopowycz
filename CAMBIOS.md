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

## 2. Cómo quedó conectado `Catalogo.html` con Supabase

Creé un archivo nuevo, `js/catalogo.js`, y lo vinculé desde `Catalogo.html` con `defer`.

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

## 7. Detalle de producto dinámico con `URLSearchParams`

### Un solo HTML para todos los productos

Antes `detalle-producto.html` era una página fija: siempre mostraba la misma placa de video escrita a mano. Ahora esa misma página sirve para cualquiera de los 18 productos, sin necesidad de crear un archivo HTML por producto.

La clave está en la URL. Los botones **"Detalle"** del inicio (`js/app.js`) y del catálogo (`js/catalogo.js`) ya no apuntan siempre al mismo lugar, sino que arman el enlace con el `id` del producto que se está dibujando:

```js
`detalle-producto.html?id=${encodeURIComponent(producto.id)}`
```

Entonces, si un producto tiene `id = 45`, el botón lleva a:

```text
detalle-producto.html?id=45
```

Y si otro tiene `id = 52`, lleva a:

```text
detalle-producto.html?id=52
```

El archivo HTML es siempre el mismo; lo único que cambia es el dato que viaja después del signo `?`.

### Qué hace `URLSearchParams`

`URLSearchParams` es una herramienta del navegador que lee la parte de la URL que viene después de `?` (la llamada *query string*) y la convierte en pares clave/valor.

En `js/detalle.js` se usa así:

```js
const parametros = new URLSearchParams(window.location.search);
const id = parametros.get('id');
```

- `window.location.search` devuelve `"?id=45"`.
- `new URLSearchParams(...)` interpreta ese texto.
- `parametros.get('id')` devuelve `"45"`.

Con ese `id`, el script pide a Supabase solamente ese producto:

```js
`${SUPABASE_URL}/rest/v1/Productos?id=eq.${id}&select=*`
```

El filtro `id=eq.45` lo resuelve la base de datos, así que la respuesta trae un array con un único producto. El script toma ese primer elemento y completa la página.

### Qué se completa en el DOM

Cuando llega la respuesta, `js/detalle.js` actualiza:

- el `<title>` de la pestaña y el `<h1>` con el nombre del producto;
- la imagen principal (`src` y `alt`) dentro de `.detalle-imagen`;
- la categoría en la etiqueta `.tag-categoria`;
- la descripción detallada;
- el precio formateado en pesos argentinos con `Intl.NumberFormat('es-AR')`;
- las filas de la ficha técnica: categoría, estado de oferta, garantía oficial y código de producto.

Todos los textos que vienen de Supabase pasan por `escaparHTML()` antes de insertarse en el HTML, igual que en el catálogo, para evitar inyecciones de código (XSS). Además, el `id` se valida y se codifica con `encodeURIComponent()` antes de armar la consulta.

### Si no hay `id` o el producto no existe

Si alguien entra a `detalle-producto.html` sin parámetros, la página no se rompe: muestra un mensaje amigable indicando que no se seleccionó ningún producto. Lo mismo pasa si el `id` no es válido, si Supabase falla o si el producto ya no existe.

En todos los casos, el botón **"← Volver al catálogo"** lleva a `catalogo.html` para que la persona pueda elegir otro producto.

### Botón "Agregar al carrito"

El botón mantiene la clase `.btn-comprar` y el enlace a `carrito.html`. Además, al cargar el producto se le agregan atributos `data-id`, `data-nombre`, `data-precio` y `data-categoria` con los datos reales. Esos atributos quedan preparados para que, más adelante, el carrito pueda leer qué producto se quiere agregar sin modificar la estructura de la página.
