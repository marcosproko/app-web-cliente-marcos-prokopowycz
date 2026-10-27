## 1. Estructura base y Maquetado Semántico
-  Espero estructurar un layout HTML5 semántico utilizando header, nav, main, section y footer, garantizando que el catálogo se organice mediante 6 etiquetas article independientes para cada producto de hardware.

## 2. Especificaciones de Producto y Botonera
-  Espero modelar las cards de producto incorporando imágenes con texto alternativo (alt), bloques descriptivos para CPU/GPU/RAM, selectores de compra y precios, asegurando una jerarquía de títulos h1 a h3 correcta.

## 3. Vistas secundarias: Carrito y Contacto
- Espero construir la estructura de tabla semántica (table, thead, tbody, tfoot) para el resumen de compras en carrito.html, y un formulario accesible en contact.html con campos name, email y mensaje vinculando labels e inputs mediante for e id.

## 4. Sistema de Diseño con Variables CSS
-  Espero definir un sistema de diseño en :root con al menos 10 variables nativas para colores oscuros, acentos (#06B6D4), tipografías y radios de borde, reutilizándolas en toda la hoja style.css para asegurar consistencia visual.

## 5. Layout híbrido con CSS Grid y Flexbox
-  Espero maquetar la cabecera en una dimensión mediante Flexbox y el catálogo general en dos dimensiones con CSS Grid usando repeat(auto-fit, minmax(280px, 1fr)) para lograr una grilla fluida sin desbordes.

## 6. Posicionamiento y Microinteracciones UI
-  Espero superponer las etiquetas de descuento (-25% OFF) aplicando la regla de padre position: relative e hijo position: absolute, junto con un estado :hover en las cards que utilice transform: translateY(-4px) acelerado por hardware.

## 7. Accesibilidad y Validación Nativa HTML5
-  Espero implementar validaciones nativas en los inputs (required, type="email", minlength) sin requerir JavaScript, junto con aria-labels descriptivos para lectores de pantalla.

## 8. Correcciones de Entrega y Refactorización
-  Espero eliminar etiquetas duplicadas en los footers de vistas secundarias, corregir la vinculación de estilos y normalizar los nombres de archivos para evitar errores 404 en el servidor de despliegue.

## 9. Animaciones CSS y Adaptabilidad Responsive (Mejoras Parcial 1)
-  Espero incorporar animaciones @keyframes (fadeInUp para cards y pulsoOferta para badges) y definir media queries explícitas (@media max-width: 768px y 480px) para reorganizar el menú, hacer fluido el buscador y permitir navegación táctil en los filtros móviles.

## 10. Renderizado dinámico de productos desde JS
- Predicción: Espero sacar los productos fijos del HTML, guardarlos en un array de objetos en un archivo JS e insertarlos dinámicamente en el contenedor al cargar la página.

## 11. Buscador interactivo y estado no disponible
- Predicción: Espero capturar el evento 'input' en el buscador para filtrar en tiempo real las tarjetas que coincidan con el término por nombre o descripción. Si no hay coincidencias, se ocultará el catálogo y se mostrará un mensaje de producto no disponible con opción de restablecer la lista.
- mover el contenedor `#sin-resultados` arriba de las secciones principales y hacer que al no haber coincidencias se oculten las secciones del catálogo para que el mensaje aparezca centrado arriba, debajo del buscador.

## 12. Filtro interactivo por categorías
- Predicción: Espero capturar el evento 'click' en los enlaces de categorías (.chip) para filtrar el catálogo en pantalla mostrando únicamente los productos que coincidan con la categoría seleccionada, o el catálogo completo si se elige una opción general.

## 13. Integración de Supabase y Catálogo Dinámico
- Predicción: Espero conectar la tienda a una base de datos PostgreSQL en la nube (Supabase) mediante la Fetch API nativa y el endpoint REST (/rest/v1/Productos). La función asíncrona deberá consultar los registros remotos, adaptar las propiedades de las tarjetas y poblar la grilla de productos en el DOM sin depender de arrays estáticos locales.

## 15. Refactorización del Buscador y Limpieza de UI en Inicio
- Predicción: Espero modificar app.js para que el buscador filtre sobre la totalidad de los productos obtenidos de Supabase y no sobre listas locales. Además, implementaré control dinámico del DOM para ocultar secciones vacías ('Ofertas Semanales' o 'Nuevos Ingresos'), ocultar la botonera de categorías durante la búsqueda y mostrar el mensaje 'sin resultados' únicamente cuando no existan coincidencias en toda la tienda.

## 16. Limpieza de Inicio y Catálogo Dinámico con Supabase
- Predicción: Espero remover la sección redundante de 'Explorá por Categorías' en index.html para simplificar la vista principal. En Catalogo.html vincularé la llamada asíncrona a la API de Supabase para obtener la totalidad de los productos y renderizarlos en la grilla (.grid-inventario) con tarjetas compactas (.card-compacta). Asimismo, implementaré el filtrado real por categoría mediante el método filter() de JavaScript para que, al presionar un botón de categoría, la interfaz muestre exclusivamente los artículos pertenecientes a dicho rubro sin depender de anclas de scroll estáticas.

## 17. Corrección de Enlaces 404, Submit del Buscador y Parpadeo de Portada
- Predicción: Espero prevenir la recarga involuntaria de index.html al presionar Enter en el formulario del buscador mediante event.preventDefault(), limpiar los arrays estáticos de app.js para evitar el parpadeo inicial frente a Supabase, estandarizar las rutas a catalogo.html en minúsculas para prevenir errores 404 en Linux y restaurar el efecto hover de elevación en las tarjetas resolviendo el conflicto de transform con las animaciones de carga.

## 19. Carrito de Compras Persistente con LocalStorage
- Predicción: Espero conectar los botones 'Agregar al carrito' de la portada, el catálogo y la ficha de detalle para almacenar los productos seleccionados en localStorage como array de objetos. En carrito.html renderizaré dinámicamente la tabla leyendo ese storage, permitiendo sumar, restar o eliminar ítems individuales mediante delegación de eventos, calculando subtotales y total con reduce(), implementando el botón de vaciar carrito, estado de carrito vacío y actualizando un contador visual en el menú de navegación en todas las páginas.

## 20. Pulido de UI, Accesibilidad Semántica y Hero Banner
- Predicción: Espero estructurar un banner de bienvenida (hero section) semántico en index.html con llamado a la acción hacia catalogo.html para mejorar la entrada visual. En la navegación principal, implementaré la clase activa dinámica o estática según la página para orientar al usuario. En accesibilidad, sustituiré el uso de h1 en logos de páginas secundarias por contenedores semánticos con texto descriptivo, agregaré aria-labels específicos en los botones interactivos de compra y optimizaré el cálculo visual de los badges de oferta para que reflejen dinámicamente el porcentaje de descuento si existe un precio original.

## 21. Panel de Backoffice y Gestión de Productos (CRUD) con Supabase
- Predicción: Espero crear una vista administrativa (admin.html y js/admin.js) que permita dar de alta productos nuevos mediante una petición POST con fetch() a Supabase, validar que los campos obligatorios (nombre, precio, categoría, imagen y descripción) no estén vacíos, y renderizar una tabla de gestión con los 18 productos existentes donde cada fila incluya un botón interactivo para eliminar productos (DELETE) con confirmación previa y refresco dinámico en pantalla, respondiendo a la observación de la cátedra sobre gestión de productos.

## 22. Corrección de Cálculo en Precios con Decimales, UX de Portada y Feedback Accesible
- Predicción: Espero normalizar la extracción de precios numéricos en carrito.js admitiendo decimales mediante parseFloat sin eliminar el separador decimal, incorporar un estado visual de carga y mensaje de error amigable en app.js frente a caídas de Supabase, dotar de estilos a la clase .sin-resultados en style.css, añadir aria-label contextual a los botones de detalle de las tarjetas, declarar aria-live="polite" en las alertas de contacto para tecnologías asistivas, transparentar el texto del modal como simulación de compra y documentar en admin.html el alcance pedagógico sin autenticación.

## 24.  Modal Accesible, Confirmación de Vaciado y Ficha de Oferta
- Predicción: Espero implementar una confirmación interactiva previa al vaciar el carrito para evitar pérdidas accidentales de datos, asegurar la gestión accesible del foco dentro del modal de compra finalizada (atrapando el tabulado y cerrando con tecla Escape), reflejar el estado de oferta y precio anterior en detalle-producto.html cuando corresponda, y añadir los datos de contacto y retiro en texto explícito en contact.html, completando todas las observaciones de auditoría.

## 25. Corrección en Ficha de Detalle Dinámica y Restauración de Metadatos
- Predicción: Espero restaurar los enlaces dinámicos en las tarjetas de inicio (js/app.js) y catálogo (js/catalogo.js) para que viajen con el parámetro ?id=${producto.id}. En detalle-producto.html, removeré la RTX 4070 estática de respaldo reemplazándola por contenedores vacíos con estados de carga/error dinámicos gestionados por js/detalle.js. Asimismo, reincorporaré en el head de los 6 HTML la meta descripción y el favicon SVG, y actualizaré el mensaje de contacto en contact.html con una aclaración honesta de simulación.