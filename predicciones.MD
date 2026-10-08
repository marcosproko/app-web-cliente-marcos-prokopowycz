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
