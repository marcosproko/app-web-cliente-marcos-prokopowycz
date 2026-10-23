# Cambios en la pantalla de inicio

## Qué problemas había

- El buscador solo miraba los productos que estaban escritos a mano en el archivo. Los productos que llegaban desde Supabase se mostraban en pantalla, pero el buscador no los tenía en cuenta.
- Cuando una búsqueda no encontraba productos en una sección, igual quedaba el título "Ofertas Semanales" o "Nuevos Ingresos" sin ninguna tarjeta debajo.
- El bloque de categorías seguía visible mientras se estaba buscando, aunque no tenía sentido mostrarlo en ese momento.
- El cartel de "Producto no disponible" aparecía en situaciones en las que no correspondía.

## Archivos que toqué

- `js/app.js`: está toda la lógica de la búsqueda y de mostrar u ocultar las secciones.
- `index.html`: le agregué un identificador a la sección de categorías y una pequeña mejora para que el cartel de "sin resultados" pueda ser leído por lectores de pantalla.
- `CAMBIOS.md`: este mismo archivo, para explicar lo que se hizo.

## Qué hace cada cambio

### 1. Una sola lista con todos los productos

Ahora hay una lista general llamada `todosLosProductos`. Al principio tiene los productos de ejemplo y, cuando terminan de llegar los productos de Supabase, se reemplaza con esa lista completa.

El buscador ya no revisa dos listas separadas: revisa siempre esa lista general. De cada producto mira el **nombre** y la **descripción**. Si el texto buscado aparece en cualquiera de esos dos lugares, el producto se muestra.

Además, si la persona ya estaba escribiendo cuando terminan de cargar los productos de Supabase, la búsqueda se vuelve a aplicar automáticamente. Así no se pierde lo que había escrito.

### 2. Las secciones vacías desaparecen

Después de buscar, el programa separa los resultados en dos grupos: los que son ofertas y los que son nuevos ingresos.

- Si hay resultados en "Ofertas Semanales", esa sección se muestra.
- Si no hay resultados en "Ofertas Semanales", se oculta la sección entera, con su título y todo.
- Lo mismo pasa con "Nuevos Ingresos".

Para ocultarlas se usa `style.display = 'none'`, que hace que la sección desaparezca de la pantalla. De esta forma nunca queda un título solo, sin tarjetas abajo.

### 3. Las categorías se ocultan mientras se busca

Mientras el buscador tenga texto escrito, la sección "Explorá por Categorías" se oculta.

Cuando se borra todo el texto del buscador, o cuando se toca el botón "Ver todos los productos", las categorías vuelven a aparecer, junto con todas las ofertas y todos los nuevos ingresos.

### 4. El cartel de "sin resultados"

El mensaje `#sin-resultados` ahora aparece solamente cuando la búsqueda no encuentra ningún producto en toda la tienda.

Cuando eso pasa:

- se ocultan "Ofertas Semanales";
- se ocultan "Nuevos Ingresos";
- se oculta el bloque de categorías;
- se muestra el cartel con el botón "Ver todos los productos".

Si hay al menos un resultado en alguna de las dos secciones, el cartel no aparece.

### 5. El botón "Ver todos"

El botón "Ver todos los productos" hace tres cosas:

1. vacía el buscador;
2. vuelve a mostrar todos los productos;
3. vuelve a mostrar las categorías.

## Cómo explicarlo al profesor

"Antes el buscador no conocía los productos que venían de Supabase porque solo revisaba una lista escrita a mano. Ahora la pantalla guarda todos los productos en una lista general y busca ahí, comparando el nombre y la descripción.

También corregí la parte visual: si una sección queda sin productos, se oculta completa, incluyendo el título. Mientras el usuario escribe, se esconden las categorías para que la pantalla quede más limpia. El cartel de 'sin resultados' aparece únicamente si no hay coincidencias en ninguna parte de la tienda. Y cuando se borra la búsqueda o se toca 'Ver todos', todo vuelve a mostrarse como al principio."
