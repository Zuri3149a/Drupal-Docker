# Documentación Oficial

Este documento detalla la arquitectura, requisitos, instalación y solución de problemas para **Drupal 10 (Backend)** y **React + TypeScript (Frontend)**, ejecutado bajo contenedores **Docker**.

---

# 1. Requisitos Previos y Entorno

## Físicos y Conectividad

- Energía eléctrica estable.
- Conexión a Internet de banda ancha (esencial para descargar imágenes de Docker y paquetes de Node.js).
- Computadora con **Windows 10 o Windows 11** (versiones Pro, Enterprise o Education recomendadas para mejor soporte de virtualización, aunque Home funciona con WSL2).

## Requisitos de Hardware Mínimos

- **Memoria RAM:** 8 GB (16 GB altamente recomendado para correr Docker y herramientas de desarrollo en simultáneo).
- **Almacenamiento:** Al menos 20 GB de espacio libre en disco (SSD preferiblemente).
- **Procesador:** 64-bit con soporte de virtualización de hardware habilitado en la BIOS/UEFI.

## Requisitos de Software

- **WSL2 (Windows Subsystem for Linux):** Habilitado en Windows para el rendimiento óptimo de Docker.
- **Docker Desktop:** Motor de contenedores.
- **Node.js (versión 18 o superior):** Entorno de ejecución para el frontend.
- **Navegador Web:** Chrome, Firefox o Edge actualizados.
- **Editor de Código:** Visual Studio Code (recomendado).

---

# 2. Instalación de Herramientas Base

## Paso 1: Instalar Docker Desktop en Windows

1. Descarga el instalador desde la página oficial de Docker.
2. Ejecuta el archivo y asegúrate de dejar marcada la opción:

```
Use WSL 2 instead of Hyper-V
```

3. Reinicia tu computadora si el instalador lo solicita.
4. Abre Docker Desktop y acepta los términos.
5. Espera a que el ícono de la ballena esté en verde (indicando que el motor está corriendo).

---

## Paso 2: Instalar Node.js

1. Descarga el instalador **LTS (Long Term Support)** desde la página de Node.js.
2. Sigue el asistente de instalación dejando las opciones por defecto.
3. Abre una terminal y verifica la instalación ejecutando:

```bash
node -v
npm -v
```

---

# 3. Configuración del Backend (Drupal 10 + MariaDB)

## Levantar la Infraestructura

Crea una carpeta llamada:

```
backend-drupal
```

Dentro crea un archivo llamado:

```
docker-compose.yml
```

### Contenido del archivo

```yaml
services:
  drupal:
    image: drupal:10-apache
    ports:
      - "8080:80"
    volumes:
      - drupal_sites:/opt/drupal/web/sites
      - drupal_modules:/opt/drupal/web/modules
      - drupal_themes:/opt/drupal/web/themes
    restart: always
    depends_on:
      - db

  db:
    image: mariadb:10.11
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: drupal_db
      MYSQL_USER: drupal_user
      MYSQL_PASSWORD: drupal_password
    volumes:
      - db_data:/var/lib/mysql
    restart: always

volumes:
  drupal_sites:
  drupal_modules:
  drupal_themes:
  db_data:
```

Luego ejecuta en la terminal dentro de la carpeta:

```bash
docker compose up -d
```

---

# Instalación Inicial de Drupal

1. Ingresa a:

```
http://localhost:8080
```

2. Selecciona el perfil **Estándar**.

3. Configura la base de datos expandiendo **Opciones avanzadas**:

| Campo | Valor |
|------|------|
| Nombre | drupal_db |
| Usuario | drupal_user |
| Contraseña | drupal_password |
| Servidor (Host) | db |

⚠ **Importante:** el host debe ser `db`.

4. Completa la creación del usuario administrador.

---

# Configuración Headless (Módulos)

Ir a:

```
Ampliar (Extend)
```

En la sección **Web Services**, activar:

- JSON:API
- Serialization
- HTTP Basic Authentication

Luego hacer clic en **Instalar**.

---

# Creación de la Estructura de Datos

Ir a:

```
Estructura > Tipos de contenido > Añadir tipo de contenido
```

Nombre del tipo de contenido:

```
Elemento de Inventario
```

Agregar los siguientes campos:

| Campo | Tipo |
|------|------|
| Código Único | Texto sin formato |
| Cantidad de Stock | Número entero |
| Disponible para Préstamo | Booleano |

⚠ Prestar atención a los **Nombres de máquina** generados automáticamente.

---

# 4. Configuración de Seguridad y CORS (Cruce de Dominios)

Para permitir que el frontend se comunique con el backend.

---

## Habilitar Escritura en JSON:API

Ir a:

```
Configuración > Servicios Web > JSON:API
```

Cambiar:

```
Solo lectura
```

por:

```
Accept all JSON:API create, read, update, and delete operations
```

Guardar cambios.

---

# Configurar CORS en services.yml

Entrar al contenedor Drupal:

```bash
docker compose exec drupal bash
```

Instalar nano:

```bash
apt-get update && apt-get install nano -y
```

Ir al directorio:

```bash
cd web/sites/default
```

Copiar el archivo base:

```bash
cp default.services.yml services.yml
```

Dar permisos:

```bash
chmod 666 services.yml
```

Editar archivo:

```bash
nano services.yml
```

Buscar la sección **cors.config** y dejarla así:

```yaml
parameters:
  cors.config:
    enabled: true
    allowedHeaders: ['*']
    allowedMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    allowedOrigins: ['http://localhost:5173']
    exposedHeaders: false
    maxAge: false
    supportsCredentials: false
```

Guardar, salir del contenedor:

```bash
exit
```

Luego vaciar caché en Drupal:

```
Configuración > Rendimiento > Vaciar todas las cachés
```

---

# 5. Configuración del Frontend (React + Vite + TypeScript)

Crear proyecto:

```bash
npm create vite@latest frontend-inventario -- --template react-ts
```

Entrar al directorio:

```bash
cd frontend-inventario
```

Instalar dependencias:

```bash
npm install
```

---

# Crear componente principal

Crear carpeta:

```
src/components
```

Crear archivo:

```
BalletInventory.tsx
```

Importante:

- Codificar en **Base64** las credenciales de administrador de Drupal en la petición POST.
- Los nombres de los atributos deben coincidir exactamente con los **nombres de máquina de Drupal**.

---

# Arrancar servidor de desarrollo

```bash
npm run dev
```

Frontend disponible en:

```
http://localhost:5173
```

---

# 6. Guía de Solución de Problemas Frecuentes

---

## Error: CORS policy

### Síntoma

Bloqueo rojo en la consola del navegador.

### Causa

El navegador bloquea la petición por seguridad entre puertos:

```
5173 → 8080
```

### Solución

Verificar que `services.yml` tenga:

```yaml
enabled: true
allowedOrigins: ['http://localhost:5173']
```

Luego **vaciar caché de Drupal**.

---

## Error 405 Method Not Allowed

### Causa

JSON:API está protegido de fábrica y solo permite lectura.

### Solución

Ir a la configuración de JSON:API y permitir:

- Create
- Read
- Update
- Delete

---

## Error 422 Unprocessable Content

### Causa

El JSON enviado desde React **no coincide con los nombres de campo en Drupal**.

### Solución

1. Abrir consola del navegador.
2. Expandir el error.
3. Revisar la propiedad:

```
detail
```

Luego verificar en Drupal:

```
Estructura > Tipos de contenido > Gestionar campos
```

Ejemplo típico:

Incorrecto:

```
field_cantidad_en_stock
```

Correcto:

```
field_cantida_de_stock
```

Corregir en:

```
BalletInventory.tsx
```

---

# Arquitectura del Sistema

```
React + Vite (Frontend)
        │
        │ JSON API
        ▼
Drupal 10 (Headless CMS)
        │
        ▼
MariaDB
        │
        ▼
Docker Containers
```

---

# Fin de la Documentación