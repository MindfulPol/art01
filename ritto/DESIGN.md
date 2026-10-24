# rittt.0 · B y entrada abstracta

## Verdad del producto
Inés: tatuaje y dibujo; blackwork, dark floral y abstracción. En estudio en Reus, también en Talavera de la Reina. CTA «Cuéntame tu idea» lleva a una conversación por Instagram. Dirección, fechas, disponibilidad y condiciones pendientes.

## Sistema
- Superficie gris fría #939a9f, luz #aeb4b8 y sombra #858d93, tinta #15191c y blanco frío #f0f1f2. El gris se aproxima visualmente al fondo de liquid-arm.jpg y a la referencia monocroma adjunta por el usuario.
- Luz amplia y caída de sombra suave, sin textura sintética. La galería y el contacto dejan ver el mismo campo continuo del cuerpo; las escenas usan sus mismos tonos. La cabecera es transparente sobre la misma escena: empieza negra con texto claro y cambia a tinta oscura al aparecer el gris, evitando repetir el degradado en una franja separada. Las fotografías y el fondo abstracto conservan sus colores originales.
- Unbounded400 para firma; Barlow Condensed400/500 en títulos; Manrope400/500/600 para lectura.
- Fotografías de obra originales, sin filtros. El fondo decorativo de la alternativa abstracta es generado y se documenta separado de la obra.
- La entrada abstracta cubre la pantalla con masas de tinta y hueso. Un campo de desplazamiento WebGL las deforma lentamente; el texto se mantiene quieto y el scroll retira el fondo.

## Movimiento
Tres escenas dentro de un marco sticky: criaturas/fondo abstracto, trazado real que se dibuja y encuentra su fotografía, blackwork que abre el encuadre. Un RAF bajo demanda controla el avance, reversible con scroll. Sin ciclo automático ni secuestro del scroll. La cabecera vive dentro del marco; al llegar a la galería sale con él. Movimiento reducido despliega escenas estáticas. La secuencia ocupa 480svh (500 en móvil): la fotografía floral llega al 66%, permanece hasta el 76% y el paso a blackwork ocupa del 76 al 94%, con una disolución compartida entre ambas escenas. El fondo animado se detiene al quedar oculto o salir de la primera escena.

## Galería y contacto
Ocho imágenes, cuatro parejas de escalas desiguales; fotografías completas ampliables. Contacto breve, ciudades confirmadas y datos pendientes expresos. Los pies de obra son descriptivos. El fondo generado es decorativo y no forma parte de la galería de la artista.

## Integración de la cabecera y trazo ambiental
La composición animada cubre ahora toda la primera pantalla, también detrás de la cabecera. Una sombra gradual mantiene el contraste de las letras sin separar la cabecera en un bloque. En galería y contacto aparece un fragmento del trazado real, ampliado, recortado por el margen y desenfocado 3px (2px en móvil), al 6% de opacidad. No es una ilustración nueva ni se anima de forma independiente.

## Titular y primera transición
«Tatuaje, dibujo y cerámica» explica las disciplinas; «Blackwork, dark floral y abstracción» precisa el lenguaje visual. Cerámica confirmada por el usuario durante esta iteración. La primera transición WebGL retira la abstracción por sus propios canales y luminancia: se abre el gris y permanecen las masas claras con sus contornos antes del trazado. La fotografía estática conserva un fundido como respaldo. La deformación continua se amplía aproximadamente un 50%, manteniendo inmóvil el texto. La pausa congela el flujo, pero permite que el retiro avance con el scroll.
