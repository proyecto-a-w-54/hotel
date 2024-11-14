## Iniciar el proyecto

Para ejecutar este proyecto, necesita tener instaladas dos aplicaciones clave: **Node.js** y **SQL Server Management Studio**.

### Paso 1: Configurar la Base de Datos
1. Dirígete a la carpeta **/query_BD** dentro de **/public** y carga el archivo en SQL Server Management Studio.
2. Ejecuta la consulta para crear las tablas necesarias en la base de datos.

### Paso 2: Crear el Usuario Maestro 
1. Abre el archivo `create-master-user.js` en la carpeta `/src` y configura la conexión a la base de datos de acuerdo con tus credenciales de SQL Server:

   ```javascript
   const connection = mysql.createConnection({
       host: 'localhost',    // Cambia por el nombre del host o la IP de tu equipo
       user: 'root',         // Cambia por el usuario configurado en SQL Server
       password: '12345',    // Cambia por la contraseña configurada en SQL Server
       database: 'BD_Proaula'
   });
  
2.   Para personalizar el usuario maestro, modifica las siguientes líneas:
Cambia la contraseña en const password = '12345';.  
Actualiza el correo en 'master@gmail.com'con el que prefieres.

3. Ejecuta el archivo desde la consola ubicada en `/src`: node create-master-user.js

### Paso 3: Configurar el Servidor

1. Abra el archivo server.js en la raíz del proyecto y configure nuevamente la conexión a la base de datos, siguiendo las mismas instrucciones del paso anterior:

   ```javascript
   const connection = mysql.createConnection({
       host: 'localhost',    // Cambia por el nombre del host o la IP de tu equipo
       user: 'root',         // Cambia por el usuario configurado en SQL Server
       password: '12345',    // Cambia por la contraseña configurada en SQL Server
       database: 'BD_Proaula'
   });    


2. Una vez configurado, abre la consola en `/src` y ejecuta: node server.js
Esto confirmará la conexión exitosa a la base de datos y el servidor se iniciará en **http://localhost:3000**.  
#### Ya puedes acceder a la aplicación web para gestionar reservas de habitaciones en el proyecto Staiin.
   
