# Verificación · 2026-10-24

- Navegador integrado, escritorio 1440×900 y móvil 390×844: firma, ciudades y CTA legibles; sin desbordamiento horizontal en las vistas comprobadas.
- Entrada abstracta: contexto WebGL inicializado, textura visible, botón de pausa y reanudación comprobados. Imagen original como respaldo cuando WebGL no esté disponible.
- Dibujo floral: trazado y fotografía alineados. Fotografía completa a partir del 66% del recorrido; blackwork comienza al 76% y completa al 94%. La disolución compartida ocupa aproximadamente 616px en escritorio de 900px y 608px en móvil de 844px.
- Blackwork móvil: fotografía completa, ampliación y cierre comprobados. Entrada con criaturas revisada en escritorio.
- Recursos relativos y sintaxis de los scripts comprobados. Sin errores de consola en la vista revisada.
- Movimiento reducido implementado mediante media query y matchMedia; no se ha cambiado la preferencia del sistema para probarla.
- No se ha configurado ni ejecutado despliegue.

Capturas en `../captures/`.

## Iteración de gris frío

Sustituido el beige por una superficie gris fría (#939a9f) con iluminación amplia (#aeb4b8) y sombra suave (#7d858b), inspirada visualmente en el fondo del brazo y la nueva referencia adjunta. Contacto y pie comparten la superficie de la galería; texto oscuro con contraste mínimo calculado de 4.71:1 sobre el extremo de sombra. Comprobadas vistas de 525×763, 1280×720 y 1440×900. Capturas nuevas con prefijo `gray-`.

Durante la revisión se corrigió la reserva de proporciones de las imágenes diferidas: la regla anterior `aspect-ratio:auto` anulaba la proporción de los atributos HTML y algunas fotos pendientes de carga tenían altura cero, desplazando los destinos de navegación. Cada imagen conserva ahora explícitamente su proporción original antes de cargarse.

## Cabecera y retirada orgánica

La abstracción ocupa ahora también la zona de navegación, con protección gradual del texto integrada en el shader. La cabecera ya no dibuja un degradado separado. La salida sigue los canales negros y los contornos claros del fondo, y es reversible con scroll; la pausa del flujo conserva el avance de la retirada. Titular actualizado a «Tatuaje, dibujo y cerámica» tras confirmación del usuario. Fondo gris con fragmento difuminado del trazado real.

La integración alojable vive en `craftmanship42/lince`, `web/site/ritto/`, y usa su configuración Cloudflare existente.
