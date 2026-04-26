const DAYS = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
];

const START_HOUR = 7;
const END_HOUR = 20;

function timeToDecimal(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours + minutes / 60;
}

function decimalToTime(value) {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isSlotBusy(schedule, start, end) {
  const scheduleStart = timeToDecimal(schedule.startTime);
  const scheduleEnd = timeToDecimal(schedule.endTime);
  return scheduleStart < end && scheduleEnd > start;
}

export function findCommonFreeBlocks(members, schedules) {
  if (!members.length) {
    return [];
  }

  return DAYS.map((day) => {
    const slots = [];
    let currentStart = null;

    // Recorremos la franja oficial del MVP en bloques de una hora
    // y nos quedamos solo con los espacios libres para todos.
    for (let hour = START_HOUR; hour < END_HOUR; hour += 1) {
      const slotStart = hour;
      const slotEnd = hour + 1;

      const everyoneFree = members.every((member) => {
        const memberSchedules = schedules.filter(
          (schedule) =>
            schedule.userId === member.uid && schedule.dayOfWeek === day.key
        );

        return !memberSchedules.some((schedule) =>
          isSlotBusy(schedule, slotStart, slotEnd)
        );
      });

      if (everyoneFree && currentStart === null) {
        currentStart = slotStart;
      }

      if (!everyoneFree && currentStart !== null) {
        slots.push({
          startTime: decimalToTime(currentStart),
          endTime: decimalToTime(slotStart),
          durationHours: slotStart - currentStart,
        });
        currentStart = null;
      }
    }

    if (currentStart !== null) {
      slots.push({
        startTime: decimalToTime(currentStart),
        endTime: decimalToTime(END_HOUR),
        durationHours: END_HOUR - currentStart,
      });
    }

    return {
      dayKey: day.key,
      dayLabel: day.label,
      blocks: slots.filter((slot) => slot.durationHours >= 1),
    };
  }).filter((day) => day.blocks.length > 0);
}
