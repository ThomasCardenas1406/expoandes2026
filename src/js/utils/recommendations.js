export function buildRecommendations({ tasks, grades, memberships, freeBlocks }) {
  const recommendations = [];

  const overdueTasks = tasks.filter(
    (task) => task.status !== "done" && new Date(task.dueDate) < new Date()
  );
  if (overdueTasks.length) {
    recommendations.push(
      `Tienes ${overdueTasks.length} tarea(s) vencidas. Prioriza hoy las de prioridad alta.`
    );
  }

  const lowGrades = grades.filter(
    (grade) => Number(grade.grade) > 0 && Number(grade.grade) < 3.5
  );
  if (lowGrades.length) {
    recommendations.push(
      "Hay notas por debajo de 3.5. Usa el matching para agendar una sesión de refuerzo."
    );
  }

  if (!memberships.length) {
    recommendations.push(
      "Aún no perteneces a grupos de estudio. Crea uno o únete a uno para compartir horarios."
    );
  }

  if (freeBlocks.length) {
    recommendations.push(
      `Encontré ${freeBlocks.length} día(s) con espacios libres comunes. Conviene programar una sesión corta esta semana.`
    );
  }

  if (!recommendations.length) {
    recommendations.push(
      "Tu carga académica está balanceada. Mantén actualizado el calendario y revisa tus porcentajes de notas."
    );
  }

  return recommendations;
}
