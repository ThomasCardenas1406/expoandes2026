const LONG_DATE = new Intl.DateTimeFormat("es-CO", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const DATETIME = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export const DAY_OPTIONS = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
];

export function formatDate(dateString) {
  if (!dateString) return "Sin fecha";
  return LONG_DATE.format(new Date(dateString));
}

export function formatDateTime(dateString) {
  if (!dateString) return "Sin fecha";
  return DATETIME.format(new Date(dateString));
}

export function getTodayKey() {
  const day = new Date().getDay();
  const map = {
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };

  return map[day] ?? "monday";
}

export function sortByDate(items, field) {
  return [...items].sort(
    (left, right) => new Date(left[field]).getTime() - new Date(right[field]).getTime()
  );
}
