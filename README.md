# SportyStyle - Tienda Virtual Deportiva

Este repositorio contiene el código fuente de la minitienda virtual "SportyStyle", desarrollada como parte de la evaluación para el ramo **Taller de Desarrollo Web**.

## 1. Flujo de Autenticación con Auth0

El proyecto integra **Auth0** para manejar la autenticación y sesiones de usuario de manera segura utilizando el SDK `@auth0/auth0-spa-js`.

### ¿Cómo funciona?
1. Al cargar la página (`window.onload`), la aplicación inicializa la librería Auth0 configurada con las credenciales `AUTH0_DOMAIN` y `AUTH0_CLIENT_ID`.
2. Cuando el usuario hace clic en **"Iniciar Sesión"**, es redirigido a la página segura (Universal Login) alojada por Auth0, donde puede utilizar su cuenta de **Google**.
3. Una vez autenticado, Auth0 redirige al usuario de vuelta a la aplicación. El SDK detecta los parámetros en la URL e inicia la sesión interna sin necesidad de validaciones o tokens JWT manuales por parte del backend.
4. El botón "Iniciar Sesión" se oculta, y en su lugar se muestra un saludo personalizado con el nombre del usuario y la opción de "Cerrar Sesión".

> **Nota:** Para que el proyecto funcione en local, debes actualizar las variables `AUTH0_DOMAIN` y `AUTH0_CLIENT_ID` en las primeras líneas de `app.js` con las credenciales de tu aplicación Auth0.

## 2. Proceso de Selección de Productos

La tienda cuenta con productos agrupados por categorías (Camisetas, Pantalones y Accesorios).
- Los productos se renderizan dinámicamente usando **JavaScript** al iniciarse la página.
- El usuario puede filtrar por categorías usando botones interactivos.
- Al hacer clic en **"Agregar al carrito"**, el sistema evalúa si el producto ya existe en el carrito. De ser así, se incrementa la cantidad; si no, se agrega un nuevo ítem a la lista en memoria `cart` (cuyo estado inicial refleja el `Session Storage`).

El carrito de compras calculará en tiempo real el precio total de acuerdo con el cambio de cantidades, mostrando un resumen que permite finalmente "Proceder al Pago".

## 3. Protección de la sesión con Session Storage

Para evitar perder los productos seleccionados si la página se recarga, se utiliza **Session Storage**, el cual es un espacio temporal alojado en el navegador vinculado a la sesión de la pestaña actual.

- **Persistencia**: Cada vez que se agrega, remueve o actualiza un producto del carrito, JavaScript ejecuta la función `saveCartToSession()` que convierte el array a formato JSON y lo guarda en `sessionStorage.setItem('sportyCart', ...)`.
- **Carga de Datos**: Al ingresar a la página, la función `loadCartFromSession()` extrae el historial del `Session Storage` si este existe.
- **Limpieza (Logout/Checkout)**: Para proteger la sesión, al hacer clic en **"Cerrar Sesión"** o una vez que el usuario confirma la compra y ve la pantalla de éxito, se dispara `sessionStorage.removeItem('sportyCart')`, borrando los productos elegidos temporalmente.

## Instalación y Uso

1. Clona este repositorio o descarga los archivos.
2. Abre el archivo `app.js` y conéctalo con tu cuenta cambiando `AUTH0_DOMAIN` y `AUTH0_CLIENT_ID`.
3. Levanta los archivos a través de un servidor local (por ejemplo usando la extensión *Live Server* de VSCode).
4. Navega, agrega productos y completa el flujo de autenticación y compra.
