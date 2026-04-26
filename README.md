# Expoandes Académica MVP

MVP web para Expoandes, construido con HTML, CSS y JavaScript vanilla, con integración preparada para Firebase Authentication y Firestore.

## Qué incluye

- `LoginScreen` y `RegisterScreen`
- `DashboardScreen`
- `ScheduleScreen` y `AddScheduleScreen`
- `GroupsScreen`, `GroupDetailScreen` y `CreateGroupScreen`
- `MatchingScheduleScreen`
- `CalendarScreen`
- `GradesScreen`
- `TasksScreen`
- `ProfileScreen`
- CRUD básico para materias, horarios, grupos, sesiones, tareas, eventos y notas
- Matching de horarios entre integrantes de un grupo
- Modo demo local cuando Firebase no está configurado
- Documento de modelo de datos en [DATA_MODEL.md](/Users/thomascardenas/Documents/Codex/2026-04-25/act-a-como-desarrollador-senior-full/DATA_MODEL.md)

## Estructura

```text
.
├── index.html
├── firebase.json
├── README.md
└── src
    ├── css
    │   └── main.css
    └── js
        ├── app.js
        ├── firebase-config.js
        ├── services
        │   ├── auth-service.js
        │   ├── data-service.js
        │   ├── firebase-service.js
        │   └── matching-service.js
        ├── utils
        │   ├── date-utils.js
        │   └── recommendations.js
        └── views
            └── templates.js
```

## Ejecución local

1. Abre una terminal en la raíz del proyecto.
2. Levanta un servidor estático:

```bash
python3 -m http.server 5500
```

3. Entra a `http://localhost:5500`.

## Configurar Firebase

Edita [src/js/firebase-config.js](/Users/thomascardenas/Documents/Codex/2026-04-25/act-a-como-desarrollador-senior-full/src/js/firebase-config.js) con las credenciales de tu proyecto:

```js
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROYECTO.firebasestorage.app",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
};
```

Si dejas esos valores vacíos, la app entra en modo demo con `localStorage`.

## Colecciones de Firestore

La implementación ya está alineada con estas colecciones:

- `users`
- `subjects`
- `schedules`
- `studyGroups`
- `groupMembers`
- `studySessions`
- `tasks`
- `grades`
- `calendarEvents`

## Reglas sugeridas de Firestore

- `users/{uid}` solo editable por el usuario autenticado dueño del documento.
- Las colecciones con `userId` deben validar `request.auth.uid == resource.data.userId`.
- `groupMembers` debe validar que el usuario pueda crear su propia membresía.
- `studySessions` debe validar que quien crea la sesión pertenezca al grupo.

## Algoritmo de matching

El algoritmo está en [src/js/services/matching-service.js](/Users/thomascardenas/Documents/Codex/2026-04-25/act-a-como-desarrollador-senior-full/src/js/services/matching-service.js).

- Evalúa lunes a sábado.
- Revisa bloques entre `07:00` y `20:00`.
- Marca cada hora ocupada o libre por integrante.
- Intersecta la disponibilidad de todos.
- Retorna bloques comunes de mínimo 1 hora.

## Qué falta por mejorar

- Reglas de seguridad reales de Firebase y validación de roles por grupo.
- Más control de errores y validaciones visuales.
- Mejor UX para editar registros existentes.
- Vista calendario mensual real en lugar de lista cronológica.
- Recomendaciones más inteligentes.
- Manejo de sesiones con participantes confirmados.
- Tests y seed data para demostraciones repetibles.
