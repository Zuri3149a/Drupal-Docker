# Guía de Instalación Rápida (Post-Clonación)

Sigue estos pasos para poner en marcha el entorno de desarrollo local (Backend Drupal + Frontend React) en tu máquina.

---

## 1. Requisitos del Sistema
Antes de empezar, asegúrate de tener instalado:
* Docker Desktop (con WSL2 habilitado en Windows).
* Node.js (v18 o superior).
* Git.

---

## 2. Clonar y Levantar el Proyecto

### Paso A: Obtener el código

git clone ``` https://github.com/Zuri3149a/Drupal-Docker.git ```
abrir carpeta```  cd Drupal```

### Paso B: Levantar el Backend (Docker)

Docker configurará automáticamente el servidor web PHP y la base de datos MariaDB.

Entra a la carpeta del backend:

cd backend

Levanta los contenedores:

docker compose up -d

Instalación de Drupal:
Ve a http://localhost:8080 y completa el asistente.

Configuración de la base de datos:
BD: drupal_db  
Usuario: drupal_user  
Password: drupal_password  
Host: db

---

### Paso C: Levantar el Frontend (React)

Abre una nueva terminal en la carpeta frontend-inventario.

Instala dependencias y ejecuta el proyecto:

npm install
npm run dev

El sitio estará disponible en:
http://localhost:5173

---

## 3. Configuraciones Críticas Obligatorias

Para que el sistema funcione, debes realizar estos ajustes manuales en tu instalación local.

---

###  Habilitar CORS y Escritura

En Drupal:

Ve a:
Configuración > Servicios Web > JSON:API

Cambia a:
Accept all JSON:API create, read, update, and delete operations

---

### Editar archivo services.yml

Debes editar el archivo:

web/sites/default/services.yml

dentro del contenedor para habilitar CORS.

Contenido:

cors.config:
  enabled: true

  allowedOrigins: ['http://localhost:5173']

  allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']

Importante:
Vacía todas las cachés en Drupal después de editar el archivo.

Ruta:
Configuración > Rendimiento

---

###  Autenticación de la API

El archivo BalletInventory.tsx utiliza Basic Auth.

Si cambias tu contraseña de administrador en la instalación local, recuerda actualizar las credenciales en el código:

btoa('tu_usuario:tu_password')

const credenciales = btoa('admin:password123');

---

##  Puertos en uso

Drupal: 8080  
MariaDB: 3306  
React (Vite): 5173