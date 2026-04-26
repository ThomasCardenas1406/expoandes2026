# Modelo de datos MVP

## users

- `uid`: string
- `name`: string
- `email`: string
- `university`: string
- `program`: string
- `semester`: number
- `photoUrl`: string
- `createdAt`: ISO string

## subjects

- `id`: string
- `userId`: string
- `name`: string
- `code`: string
- `professor`: string
- `color`: string

## schedules

- `id`: string
- `userId`: string
- `subjectId`: string
- `dayOfWeek`: `monday` | `tuesday` | `wednesday` | `thursday` | `friday` | `saturday`
- `startTime`: `HH:mm`
- `endTime`: `HH:mm`
- `location`: string
- `modality`: `presencial` | `virtual` | `híbrida`

## studyGroups

- `id`: string
- `name`: string
- `subjectName`: string
- `description`: string
- `creatorId`: string
- `university`: string
- `discordLink`: string
- `createdAt`: ISO string

## groupMembers

- `id`: string
- `groupId`: string
- `userId`: string
- `role`: `admin` | `member`
- `joinedAt`: ISO string

## studySessions

- `id`: string
- `groupId`: string
- `title`: string
- `date`: ISO string o `YYYY-MM-DD`
- `startTime`: `HH:mm`
- `endTime`: `HH:mm`
- `location`: string
- `modality`: `presencial` | `virtual` | `híbrida`
- `participants`: string[]

## tasks

- `id`: string
- `userId`: string
- `subjectId`: string
- `title`: string
- `description`: string
- `dueDate`: `YYYY-MM-DD`
- `priority`: `high` | `medium` | `low`
- `status`: `todo` | `doing` | `done`

## grades

- `id`: string
- `userId`: string
- `subjectId`: string
- `itemName`: string
- `percentage`: number
- `grade`: number
- `date`: `YYYY-MM-DD`

## calendarEvents

- `id`: string
- `userId`: string
- `title`: string
- `type`: `class` | `exam` | `task` | `study`
- `date`: `YYYY-MM-DD`
- `startTime`: `HH:mm`
- `endTime`: `HH:mm`
- `subjectId`: string
- `groupId`: string
