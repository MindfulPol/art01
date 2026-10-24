# ritto · Portfolio de rittt.0

Prototipo local de la tatuadora Inés. Integrado como página independiente bajo `/ritto/`, con recursos y fuentes locales. La página existente en la raíz del repositorio conserva su contenido.

- `index.html`: entrada con las criaturas de la selección original.
- `abstracto.html`: entrada alternativa con un fondo abstracto original animado, inspirado en la referencia del usuario.

Ambas comparten secuencia de scroll: imaginario → trazo floral → fotografía alineada → blackwork → galería → contacto. No contienen carrusel, formularios que envíen mensajes ni fechas/disponibilidad inventadas.

## Vista previa

Desde la raíz del repositorio: `python3 -m http.server 4174 --bind 127.0.0.1`

Abrir `http://127.0.0.1:4174/ritto/` o `http://127.0.0.1:4174/ritto/abstracto.html`.

Enlaces relativos compatibles con hospedaje en subdirectorio. No requiere instalación ni compilación.

## Material y límites

Fotografías proporcionadas por el usuario. Pies de obra descriptivos. En `sources.json` se documenta la procedencia. El fondo abstracto es una composición generada para el diseño, no una obra de Inés. La referencia adjunta se conserva sólo como documentación; su autoría está pendiente. Prompt y procedencia en `docs/abstract-background-prompt.md`.

El trazado floral vectorial deriva del tatuaje real:128 trayectorias suavizadas, conservando la alineación con la foto. La animación representa una transición de presentación, no el orden real en que se tatuó.

## Accesibilidad y alcance

Saltos directos a galería/contacto, foco visible, ampliación con Escape/flechas, lectura de la escena activa y tres escenas estáticas con `prefers-reduced-motion`, fondo con control de pausa. Contenido y fotografías disponibles aun sin el efecto de scroll.

Esta es una iteración de diseño para revisar. No se ha configurado despliegue ni publicación.
