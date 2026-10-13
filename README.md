# Los quince de Melani

Invitación digital estática con apertura de sobre, cuenta regresiva, ubicación, calendario y confirmación por WhatsApp.

## Editar la invitación

- `index.html`: textos, secciones, lugar y datos que ve el invitado.
- `styles.css`: colores, fuentes, tamaños y animaciones.
- `app.js`: fecha de la cuenta regresiva, precio, alias, número de WhatsApp y comportamiento de los botones.
- `melani.ics`: fecha y lugar para guardar el evento en el calendario.
- `assets/`: ilustración, fuentes y licencias de las tipografías.

Al cambiar datos del evento, actualizar también sus referencias en `index.html`, `app.js` y `melani.ics`.

## Publicación

GitHub Pages publica la raíz de la rama `main`. Cada cambio guardado en esa rama actualiza la invitación después de que termina el despliegue.

No requiere instalación ni compilación. Para probarla en una computadora, servir esta carpeta con un servidor web local.

El formulario prepara un mensaje: el invitado debe enviarlo por WhatsApp para completar su confirmación. No almacena respuestas en una base de datos.

Las fuentes incluyen sus licencias OFL en `assets/`. La ilustración se conserva de la invitación original.
