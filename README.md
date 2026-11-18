# Prototipo web — Consejo Comunitario Zanjón de Garrapatero

## Abrir

1. Mantener `index.html`, `styles.css` y `script.js` en la misma carpeta.
2. Abrir `index.html` en un navegador moderno. No requiere servidor para la vista.
3. Para una prueba local con servidor (opcional), desde esta carpeta:
   `python -m http.server 8000`
   y visitar `http://localhost:8000`.

## Cambios de la versión 2

- Franja azul de una sola columna, sin saltos forzados en el título y sin imagen lateral visible.
- Espaciado superior de 55 px e inferior de 65 px en escritorio; 35/55 px en móvil. Cambiar `--hero-space-top` y `--hero-space-bottom` al final de `styles.css`.
- Escudo en el menú: 55 × 55 px en escritorio, 45 × 45 px en móvil, con fondo blanco y sin deformación.
- **Reemplazar `imagenes/escudo.png` por el archivo original del escudo.** El PNG incluido es un marcador provisional de iniciales CC/ZG, no el escudo oficial. Si se usa otra extensión, actualizar ambas rutas en `index.html`.
- La ilustración lateral está oculta mediante el atributo `hidden`; si se retira dicho atributo, se mostrará el escudo centrado, sobre blanco, debajo del texto.
- `script_codigo_para_ver.txt` es una copia de `script.js` para visualizar el código si el navegador bloquea descargas JS.

## Identidad visual

- **60 % azul**: identidad institucional, navegación, cabeceras, fondos y botones principales.
- **30 % café**: organización, territorio y tarjetas de proyectos.
- **10 % amarillo**: llamados a la acción, íconos, detalles y estados destacados.

La proporción es **una guía de jerarquía visual**, no una fracción de píxeles calculada dinámicamente. Los blancos y fondos claros pertenecen a las escalas cromáticas. Se incluyen tres variantes: Original, Suave y Profunda. Todas se definen mediante variables CSS; las preferencias se conservan en `localStorage`.

**Una tipografía en todo el prototipo:** Manrope, servida por Google Fonts. Si no hay Internet, se utiliza la fuente de respaldo del sistema.

## Funcionalidades demostrables

- Menú adaptable a móvil, navegación a secciones y pestañas de noticias/eventos/comunicados.
- Gestor de publicaciones de **demostración** con crear, editar, eliminar y filtrado. Las publicaciones se guardan únicamente en el navegador, **sin usuarios ni autenticación**.
- Formulario de censo en tres pasos con validaciones HTML y JavaScript. **No almacena, transmite ni procesa los datos o archivos en un servidor.** Nunca ingresar datos personales reales en este prototipo.
- Mapa **conceptual**, sin límites ni ubicaciones reales. Requiere datos territoriales oficiales para implementarse correctamente.
- Organigrama, misión, visión, proyectos y contacto son secciones de estructura con contenido pendiente de aprobación; los datos no se han inventado.

## Paso a producción con Laravel

- Sustituir `localStorage` por un CMS autenticado con usuarios, roles y permisos en Laravel.
- Diseñar backend seguro para censo, base de datos, revisión de solicitudes y trazabilidad.
- Definir política de tratamiento de datos, conservación, acceso, consentimiento, y protección reforzada de los datos sensibles y documentos de identidad.
- Almacenar archivos fuera del acceso público, con validación de tipos y tamaño y controles de acceso.
- Incorporar mapa real después de validar coordenadas y límites territoriales.
- Configurar HTTPS, copias de seguridad, monitoreo y pruebas de seguridad.
- Incorporar información institucional oficial, imágenes y canales de contacto autorizados.

Este es un **prototipo visual y funcional de frontend**, no un sistema productivo de censos ni un CMS seguro.

## Versión 3: inicio de sesión administrativo

- `login.html`, `login.css` y `login.js` contienen la nueva vista de acceso, disponible desde el menú principal y el enlace de administración de contenidos.
- Hereda la paleta guardada y Manrope; usar `imagenes/escudo.png` para el escudo definitivo.
- La vista valida campos, permite mostrar/ocultar contraseña y muestra información de recuperación. No autentica, no guarda credenciales, no realiza solicitudes de red con ellas y no redirige a un panel privado. Usar únicamente valores ficticios. Los campos no tienen atributo `name` deliberadamente en la maqueta.
- El botón público del CMS fue sustituido por un enlace a login. El código del gestor anterior continúa en el prototipo como referencia, sin acceso visible; no constituye protección. Retirar el diálogo y la lógica demo antes de producción.
- En Laravel: convertir a Blade, definir una ruta POST protegida con CSRF, asignar `name="documento"` y `name="password"`, usar autenticación del servidor y hash de contraseña, regenerar la sesión, limitar intentos y proteger todas las rutas administrativas mediante middleware y autorización por roles. Implementar recuperación con tokens de un solo uso y expiración. No reutilizar la lógica de envío de la maqueta en producción.

## Versión 4: panel administrativo

- Abrir `login.html` y pulsar «Explorar panel de demostración» o abrir `admin.html` directamente. No hay autenticación: la navegación no simula una sesión segura.
- Dashboard con indicadores calculados sobre registros de ejemplo; no son estadísticas oficiales.
- Noticias, eventos y comunicados: altas, edición, eliminación, filtro por estado y búsqueda. Los registros publicados se reflejan en el portal; los borradores no. Se comparten a través de localStorage en el mismo origen.
- Proyectos, galería, documentos, páginas institucionales, censo y perfiles: CRUD ficticio en memoria, se reinicia al recargar. No hay carga de archivos, gestión real de usuarios ni modificación de esas secciones públicas. No ingresar datos reales.
- Configuración de paleta compartida con el portal.
- Para probar la comunicación entre vistas de forma fiable: desde esta carpeta ejecutar `python -m http.server 8000` y abrir `http://localhost:8000/`. El almacenamiento entre archivos abiertos con file:// depende del navegador.
- Reemplazar `imagenes/escudo.png` por el escudo oficial.
- Para producción, implementar autenticación, autorización, persistencia segura, protección de datos y archivos privados en Laravel. Retirar las funciones demo.
