# Time2Study

MVP web para Expoandes, construido con HTML, CSS y JavaScript, con integración preparada para Firebase Authentication y Firestore.

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
- Matching de horarios entre integrantes de un grupo
- Modo demo local cuando Firebase no está configurado

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

## Colecciones de Firestore

La implementación cuenta con estas colecciones:

- `users`
- `subjects`
- `schedules`
- `studyGroups`
- `groupMembers`
- `studySessions`
- `tasks`
- `grades`
- `calendarEvents`


## Algoritmo de matching

El algoritmo está en [src/js/services/matching-service.js]

- Evalúa lunes a sábado.
- Revisa bloques entre `07:00` y `20:00`.
- Marca cada hora ocupada o libre por integrante.
- Intersecta la disponibilidad de todos.
- Retorna bloques comunes de mínimo 1 hora.

