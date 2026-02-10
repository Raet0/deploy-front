## Guia sencilla para entender el codigo

Esta guia esta pensada para principiantes. Explica que hace cada endpoint, cuando se llama y en que archivo esta.

---

## 1) Donde esta cada cosa (mapa rapido)

Backend (controladores REST):

* [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/AuthController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/AuthController.java)
* [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/UserProfileController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/UserProfileController.java)
* [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/AdminController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/AdminController.java)
* [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/ReportController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/ReportController.java)
* [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/ProgrammerController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/ProgrammerController.java)
* [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/PublicController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/PublicController.java)

Frontend (servicios y paginas que consumen endpoints):

* [icc-portafolio-frontend/src/app/core/services/auth.service.ts](icc-portafolio-frontend/src/app/core/services/auth.service.ts)
* [icc-portafolio-frontend/src/app/core/services/programmer.service.ts](icc-portafolio-frontend/src/app/core/services/programmer.service.ts)
* [icc-portafolio-frontend/src/app/core/services/report.service.ts](icc-portafolio-frontend/src/app/core/services/report.service.ts)
* [icc-portafolio-frontend/src/app/core/services/notifications.ts](icc-portafolio-frontend/src/app/core/services/notifications.ts)
* [icc-portafolio-frontend/src/app/pages/user-page/user-page.ts](icc-portafolio-frontend/src/app/pages/user-page/user-page.ts)
* [icc-portafolio-frontend/src/app/pages/programmer-page/programmer-page.ts](icc-portafolio-frontend/src/app/pages/programmer-page/programmer-page.ts)
* [icc-portafolio-frontend/src/app/pages/notifications-page/notifications-page.ts](icc-portafolio-frontend/src/app/pages/notifications-page/notifications-page.ts)

---

## 2) Endpoints explicados (que hacen y cuando se llaman)

### Autenticacion

Backend: [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/AuthController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/AuthController.java)
Frontend: [icc-portafolio-frontend/src/app/core/services/auth.service.ts](icc-portafolio-frontend/src/app/core/services/auth.service.ts)

* `POST /api/auth/login`
  * Que hace: valida email y password, devuelve un JWT.
  * Cuando se llama: al iniciar sesion normal.

* `POST /api/auth/google`
  * Que hace: valida el idToken de Google y devuelve un JWT.
  * Cuando se llama: al hacer login con Google.

* `POST /api/auth/register-admin`
  * Que hace: crea el primer admin del sistema.
  * Cuando se llama: al usar la pantalla de registro (solo una vez).

---

### Perfil de usuario autenticado

Backend: [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/UserProfileController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/user/controller/UserProfileController.java)
Frontend: [icc-portafolio-frontend/src/app/core/services/user.service.ts](icc-portafolio-frontend/src/app/core/services/user.service.ts)

* `GET /api/users/me`
  * Que hace: trae el perfil del usuario logueado.
  * Cuando se llama: al abrir el perfil de usuario.

* `PUT /api/users/me`
  * Que hace: actualiza datos del perfil.
  * Cuando se llama: al guardar cambios en el perfil.

---

### Administracion de usuarios (solo admin)

Backend: [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/AdminController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/AdminController.java)
Frontend: [icc-portafolio-frontend/src/app/core/services/user.service.ts](icc-portafolio-frontend/src/app/core/services/user.service.ts)

* `POST /api/admin/users`
  * Que hace: crea un usuario nuevo.
  * Cuando se llama: al crear usuario en el dashboard admin.

* `GET /api/admin/users?page=&size=`
  * Que hace: lista usuarios con paginacion.
  * Cuando se llama: al cargar la lista de usuarios.

* `PUT /api/admin/users/{id}`
  * Que hace: edita un usuario.
  * Cuando se llama: al guardar la edicion.

* `DELETE /api/admin/users/{id}`
  * Que hace: elimina un usuario.
  * Cuando se llama: al confirmar eliminar.

---

### Reportes (PDF y Excel)

Backend: [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/ReportController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/admin/controller/ReportController.java)
Frontend: [icc-portafolio-frontend/src/app/core/services/report.service.ts](icc-portafolio-frontend/src/app/core/services/report.service.ts)

* `GET /api/reports/advisories?from=&to=&status=`
  * Que hace: devuelve resumen de asesorias.
  * Cuando se llama: al aplicar filtros en el dashboard admin.

* `GET /api/reports/projects`
  * Que hace: devuelve resumen de proyectos activos.
  * Cuando se llama: al abrir el dashboard admin.

* `GET /api/reports/advisories/pdf`
  * Que hace: genera PDF de asesorias.
  * Cuando se llama: al descargar el PDF.

* `GET /api/reports/projects/excel`
  * Que hace: genera Excel de proyectos.
  * Cuando se llama: al descargar el Excel.

Como se descargan PDF y Excel:

* En el frontend se usa `responseType: 'blob'` para recibir el archivo.
* Luego el navegador puede abrirlo o descargarlo.

---

### Programador (privado)

Backend: [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/ProgrammerController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/ProgrammerController.java)
Frontend: [icc-portafolio-frontend/src/app/core/services/programmer.service.ts](icc-portafolio-frontend/src/app/core/services/programmer.service.ts)

* `GET /api/programmer/me`
  * Que hace: trae el perfil del programador logueado.
  * Cuando se llama: al abrir el panel de programador.

* `PUT /api/programmer/profile`
  * Que hace: actualiza el perfil del programador.
  * Cuando se llama: al guardar cambios de perfil.

* `POST /api/programmer/projects`
  * Que hace: crea un proyecto.
  * Cuando se llama: al guardar un proyecto nuevo.

* `GET /api/programmer/projects`
  * Que hace: lista proyectos del programador.
  * Cuando se llama: al cargar la seccion de proyectos.

* `PUT /api/programmer/projects/{id}`
  * Que hace: edita un proyecto.
  * Cuando se llama: al guardar edicion.

* `DELETE /api/programmer/projects/{id}`
  * Que hace: elimina un proyecto.
  * Cuando se llama: al confirmar eliminar.

* `POST /api/programmer/availability`
  * Que hace: agrega disponibilidad.
  * Cuando se llama: al agregar un horario.

* `GET /api/programmer/availability`
  * Que hace: lista la disponibilidad.
  * Cuando se llama: al cargar la seccion de disponibilidad.

* `DELETE /api/programmer/availability/{id}`
  * Que hace: elimina un horario.
  * Cuando se llama: al confirmar eliminar.

* `GET /api/programmer/advisories`
  * Que hace: lista asesorias recibidas por el programador.
  * Cuando se llama: al abrir la seccion de asesorias.

* `PATCH /api/programmer/advisories/{id}`
  * Que hace: aprueba o rechaza una asesoria y guarda respuesta.
  * Cuando se llama: al aprobar o rechazar en el panel.

* `GET /api/programmer/advisories/requester`
  * Que hace: lista asesorias del usuario logueado.
  * Cuando se llama: desde notificaciones o panel de usuario.

---

### Publico (landing y perfil publico)

Backend: [icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/PublicController.java](icc-portafolio-backend/src/main/java/ec/edu/ups/icc/portafolio_backend/programmer/controller/PublicController.java)
Frontend: [icc-portafolio-frontend/src/app/core/services/programmer.service.ts](icc-portafolio-frontend/src/app/core/services/programmer.service.ts)

* `GET /api/programmers?page=&size=`
  * Que hace: lista programadores publicos.
  * Cuando se llama: en landing y en la lista de perfiles.

* `GET /api/programmers/{id}`
  * Que hace: muestra el perfil publico de un programador.
  * Cuando se llama: al abrir un perfil publico.

* `GET /api/programmers/{id}/projects`
  * Que hace: lista proyectos publicos del programador.
  * Cuando se llama: dentro del perfil publico.

* `GET /api/programmers/{id}/availability`
  * Que hace: lista disponibilidad publica.
  * Cuando se llama: al seleccionar un programador para asesoria.

* `POST /api/advisories`
  * Que hace: crea una solicitud de asesoria.
  * Cuando se llama: al enviar el formulario de asesoria.

* `GET /api/advisories?email=`
  * Que hace: lista asesorias de un email.
  * Cuando se llama: al cargar el estado de solicitudes.

---

## 3) Panel de notificaciones (explicado sencillo)

Archivos:

* Servicio: [icc-portafolio-frontend/src/app/core/services/notifications.ts](icc-portafolio-frontend/src/app/core/services/notifications.ts)
* Pantalla: [icc-portafolio-frontend/src/app/pages/notifications-page/notifications-page.ts](icc-portafolio-frontend/src/app/pages/notifications-page/notifications-page.ts)

Como funciona:

* Si el usuario es programador, el servicio pide `/api/programmer/advisories` y muestra solo las PENDIENTE.
* Si el usuario es user, el servicio pide `/api/programmer/advisories/requester` y muestra solo las que ya cambiaron de estado.
* Las notificaciones se construyen en el frontend, no hay un endpoint exclusivo de notificaciones.
* En la pantalla hay un TODO: aun no se envia la respuesta al backend desde esa vista.

---

## 4) Validacion de fecha de solicitudes

Donde se valida ahora:

* En el frontend, antes de crear la asesoria.
* Archivo: [icc-portafolio-frontend/src/app/pages/user-page/user-page.ts](icc-portafolio-frontend/src/app/pages/user-page/user-page.ts)

Que se valida:

* Que la fecha sea futura.
* Que la fecha este dentro de la disponibilidad del programador.

Por que deberia validarse tambien en backend:

* Un usuario puede saltarse el frontend usando Postman o modificando el navegador.
* Si el backend valida, se evita guardar asesorias con fechas invalidas.
* La seguridad real siempre debe estar en el servidor.

---

## 5) Rutas del frontend que activan los endpoints

Definidas en: [icc-portafolio-frontend/src/app/app.routes.ts](icc-portafolio-frontend/src/app/app.routes.ts)

* `/admin` (solo admin)
* `/programmer` (solo programmer)
* `/user` (solo user)
* `/notifications` (cualquier usuario autenticado)
