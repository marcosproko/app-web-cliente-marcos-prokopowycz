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

Ahora la grilla usa `repeat(auto-fill, minmax(240px, 280px))`, con `gap: 1.5rem` y `justify-content: start`. Eso quiere decir: armá columnas de entre 240 y 280 píxeles y alinealas a la izquierda. Si hay un solo producto, se dibuja una columna de 280 px y listo, no se estira más. Además, a `.card-compacta` le puse `max-width: 280px` como un cinturón de seguridad extra. En celulares muy angostos la grilla pasa a una sola columna para que nada se salga de la pantalla.

## 5. Ficha de producto en dos columnas

En `detalle-producto.html` reemplacé el contenedor viejo por `.detalle-producto`. La parte de arriba ahora es un layout de dos columnas (`.detalle-superior`): a la izquierda la imagen dentro de `.detalle-imagen`, con un máximo de 360 px, fondo blanco y `object-fit: contain`; a la derecha el título, la categoría, la descripción, el precio y el botón "Agregar al carrito". La ficha técnica quedó debajo, ocupando todo el ancho del bloque. En pantallas chicas las dos columnas se apilan una arriba de la otra.

## Explicacion

"En el inicio saqué la sección de categorías porque era redundante y además tenía código JavaScript que ya no servía; con eso el buscador y las secciones de ofertas y nuevos ingresos quedan más limpios y sin errores.

En el catálogo, en vez de tener las tarjetas escritas a mano, el HTML arranca vacío y un script nuevo pide los productos a la API REST de Supabase con `fetch`. Cuando llegan, arma cada tarjeta `.card-compacta` con la imagen, categoría, nombre, descripción y el precio formateado en pesos argentinos.

Para los filtros, cada botón guarda su categoría en un atributo `data-categoria`. Al hacer clic, uso `.filter()` sobre el array de productos y redibujo la grilla solo con los que coinciden. El botón 'Todos los productos' limpia el filtro y muestra todo el inventario, y el botón que está activo se pinta distinto para que se vea cuál está seleccionado."
