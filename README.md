# Buscador de libros PWA
Esta aplicación es una PWA (Progressive Web Application) que permite la búsqueda de libros mediante la API de “Google Books”. Además esta aplicación permite funcionar en modo “offline” donde se pueden ver los libros guardados en cada categoría y una pestaña con los últimos 5 libros guardados.
## 1.Arquitectura de la aplicación
La aplicación es una PWA implementada como una SPA que se ha desarrollado con React. 

Para construir la aplicación se usó la herramienta de React + Vite que permite crear proyectos de React de manera sencilla (vimos que el comando npx create-react-app estaba “deprecated” en varios foros). Vite es una herramienta que además de generar una estructura básica de proyecto nos simplifica el desarrollo de la aplicación por ejemplo sin tener que crear Service Workers, ya que al construir la aplicación con vite build nos genera un sw.js funcional.

Guardamos los archivos necesarios para ejecutar la aplicación en la caché del service worker generado por Vite (archivos html, css js…) y los datos del usuario en localStorage que son las últimas 5 búsquedas realizadas y las categorías con sus libros asignados.
## Despliegue de la aplicación
El despliegue de la aplicación se ha realizado mediante GitHub Pages, que es una funcionalidad de GitHub que permite alojar directamente desde un repositorio de GitHub aplicaciones estáticas que contengan archivos HTML, CSS y JavaScript. 

- Para poder utilizar el servicio de GitHub pages instalamos en el servidor el paquete de gh-pages. 

- Una vez instalado el paquete y con una versión de código funcional, ejecutando el comando npm build vite, que crea una carpeta “dist” con la versión de producción de la aplicación además de otros archivos que nos facilita vite como son el sw.js (nuestro service worker) ya configurado. 

- Y para finalizar y lanzar nuestra aplicación se ejecuta el comando npm gh-pages -d dist siendo dist el archivo generado anteriormente. Para comprobar que funciona correctamente se puede ver accediendo al link  “https://melendo.github.io/BuscadorLibrosPWA/”.
