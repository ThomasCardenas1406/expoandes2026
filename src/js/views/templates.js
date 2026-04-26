import { DAY_OPTIONS, formatDate, formatDateTime, getTodayKey, sortByDate } from "../utils/date-utils.js";

function createNavLink(route, label, activeRoute) {
  return `
    <a class="nav-link ${activeRoute === route ? "active" : ""}" href="#/${route}">
      <span>${label}</span>
      <span>›</span>
    </a>
  `;
}

function getPriorityBadge(priority) {
  const map = {
    high: "danger",
    medium: "warning",
    low: "info",
  };
  return map[priority] ?? "info";
}

function getTaskStatusLabel(status) {
  const labels = {
    todo: "Pendiente",
    doing: "En progreso",
    done: "Completada",
  };
  return labels[status] ?? "Pendiente";
}

function getTypeLabel(type) {
  const labels = {
    class: "Clase",
    exam: "Examen",
    task: "Entrega",
    study: "Sesión",
  };
  return labels[type] ?? "Evento";
}

export function renderSidebar({ activeRoute, profile, memberships }) {
  return `
    <div class="brand-lockup">
      <span>Expoandes MVP</span>
      <h1>Time2Study Uniandes</h1>
      <small class="support-copy">${
        profile?.program
          ? `${profile.program} · semestre ${profile.semester}`
          : "Organiza clases, grupos y notas en un solo lugar"
      }</small>
    </div>

    <nav class="nav-list">
      ${createNavLink("dashboard", "Resumen", activeRoute)}
      ${createNavLink("schedule", "Horarios", activeRoute)}
      ${createNavLink("groups", "Grupos", activeRoute)}
      ${createNavLink("grades", "Calificaciones", activeRoute)}
      ${createNavLink("calendar", "Calendario", activeRoute)}
      ${createNavLink("tasks", "Tareas", activeRoute)}
      ${createNavLink("profile", "Perfil", activeRoute)}
    </nav>

    <div class="item-card dark">
      <div>
        <strong>${profile?.name ?? "Sin perfil"}</strong>
        <p class="meta">${profile?.university ?? "Configura tu universidad"}</p>
      </div>
      <div class="chip-row">
        <span class="badge info">${memberships.length} grupo(s)</span>
      </div>
    </div>
  `;
}

export function renderTopbar({ profile, usingDemo }) {
  return `
    <div class="topbar-card">
      <div>
        <strong>${profile?.name ?? "Invitado"}</strong>
        <div class="meta">${profile?.email ?? "Sin sesión"}</div>
      </div>
    </div>
    <div class="topbar-card">
      <span class="status-pill ${usingDemo ? "demo" : "live"}">
        ${usingDemo ? "Modo demo local" : "Firebase conectado"}
      </span>
      <button class="btn btn-secondary" data-action="logout">Salir</button>
    </div>
  `;
}

export function renderAuthScreen(screen) {
  const isLogin = screen === "login";
  return `
    <section class="auth-shell">
      <article class="auth-card">
        <div class="screen-header">
          <div>
            <h2>${isLogin ? "LoginScreen" : "RegisterScreen"}</h2>
            <p>${isLogin ? "Ingresa para continuar con tu agenda académica." : "Crea un usuario y empieza a cargar materias, horarios y grupos."}</p>
          </div>
        </div>

        <form class="form-grid" data-form="${isLogin ? "login" : "register"}">
          ${isLogin
            ? `
              <div class="field">
                <label for="login-email">Correo</label>
                <input id="login-email" name="email" type="email" placeholder="tu@correo.edu.co" required />
              </div>
              <div class="field">
                <label for="login-password">Contraseña</label>
                <input id="login-password" name="password" type="password" placeholder="••••••••" required />
              </div>
            `
            : `
              <div class="form-grid two-columns">
                <div class="field">
                  <label for="register-name">Nombre</label>
                  <input id="register-name" name="name" type="text" required />
                </div>
                <div class="field">
                  <label for="register-email">Correo</label>
                  <input id="register-email" name="email" type="email" required />
                </div>
                <div class="field">
                  <label for="register-university">Universidad</label>
                  <input id="register-university" name="university" type="text" value="Universidad de los Andes" required />
                </div>
                <div class="field">
                  <label for="register-program">Carrera</label>
                  <input id="register-program" name="program" type="text" placeholder="Ingeniería de Sistemas" required />
                </div>
                <div class="field">
                  <label for="register-semester">Semestre</label>
                  <input id="register-semester" name="semester" type="number" min="1" max="12" value="1" required />
                </div>
                <div class="field">
                  <label for="register-password">Contraseña</label>
                  <input id="register-password" name="password" type="password" minlength="6" required />
                </div>
              </div>
            `}
          <div class="button-row">
            <button class="btn btn-primary" type="submit">${isLogin ? "Entrar" : "Crear cuenta"}</button>
            <a class="btn-link" href="${isLogin ? "#/register" : "#/login"}">
              ${isLogin ? "Crear cuenta nueva" : "Ya tengo cuenta"}
            </a>
          </div>
        </form>
      </article>

      <article class="auth-hero glass-panel">
        <div class="auth-hero-copy">
          <span>Expoandes 2026</span>
          <h1>Tu vida académica, coordinada en tiempo real.</h1>
          <p>
            Registra horarios, encuentra espacios libres con tus compañeros, controla tareas y
            calcula notas sin depender de frameworks pesados.
          </p>
        </div>

        <div class="auth-stats">
          <article>
            <div class="meta">Horarios</div>
            <strong>6 días</strong>
          </article>
          <article>
            <div class="meta">Matching</div>
            <strong>1 hora mínimo</strong>
          </article>
          <article>
            <div class="meta">Base</div>
            <strong>Firebase</strong>
          </article>
        </div>
      </article>
    </section>
  `;
}

export function renderDashboardScreen(state) {
  const todayKey = getTodayKey();
  const todayClasses = state.schedules.filter((item) => item.dayOfWeek === todayKey);
  const pendingTasks = state.tasks.filter((item) => item.status !== "done");
  const memberships = state.groupMembers;
  const nextSessions = sortByDate(state.studySessions, "date").slice(0, 3);
  const upcomingTasks = sortByDate(pendingTasks, "dueDate").slice(0, 3);

  return `
    <section class="screen">
      <div class="hero-card">
        <div class="screen-header">
          <div>
            <h2>Mi resumen en Uniandes</h2>
            <p>Resumen rápido de clases, compromisos y grupos activos.</p>
          </div>
          <div class="screen-actions">
            <a class="btn btn-secondary" href="#/schedule">Ver horarios</a>
            <a class="btn btn-primary" href="#/groups">Explorar grupos</a>
          </div>
        </div>
      </div>

      <div class="grid metrics">
        <article class="metric-card">
          <span class="meta">Clases hoy</span>
          <strong>${todayClasses.length}</strong>
        </article>
        <article class="metric-card">
          <span class="meta">Tareas pendientes</span>
          <strong>${pendingTasks.length}</strong>
        </article>
        <article class="metric-card">
          <span class="meta">Grupos activos</span>
          <strong>${memberships.length}</strong>
        </article>
        <article class="metric-card">
          <span class="meta">Materias registradas</span>
          <strong>${state.subjects.length}</strong>
        </article>
      </div>

      <div class="grid two">
        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Próximas sesiones</h2>
              <p>Study sessions creadas en tus grupos.</p>
            </div>
          </div>
          <div class="list-stack">
            ${nextSessions.length
              ? nextSessions
                  .map(
                    (session) => `
                      <article class="item-card">
                        <div class="item-header">
                          <div>
                            <strong>${session.title}</strong>
                            <div class="meta">${formatDate(session.date)} · ${session.startTime} - ${session.endTime}</div>
                          </div>
                          <span class="badge">${session.modality ?? "Sin modalidad"}</span>
                        </div>
                        <div class="meta">${session.location ?? "Ubicación por definir"}</div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">Todavía no hay sesiones de estudio programadas.</div>`}
          </div>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Próximas tareas</h2>
              <p>Entregas más cercanas por fecha límite.</p>
            </div>
          </div>
          <div class="list-stack">
            ${upcomingTasks.length
              ? upcomingTasks
                  .map(
                    (task) => `
                      <article class="item-card">
                        <div class="item-header">
                          <div>
                            <strong>${task.title}</strong>
                            <div class="meta">${formatDate(task.dueDate)}</div>
                          </div>
                          <span class="badge ${getPriorityBadge(task.priority)}">${task.priority}</span>
                        </div>
                        <div class="meta">${task.description || "Sin descripción"}</div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">No hay tareas pendientes registradas.</div>`}
          </div>
        </article>
      </div>

      <article class="list-card">
        <div class="screen-header">
          <div>
            <h2 class="section-title">Recomendaciones básicas</h2>
            <p>Sugerencias rápidas generadas con la información del MVP.</p>
          </div>
        </div>
        <div class="collection-list">
          ${state.recommendations
            .map(
              (recommendation) => `
                <article class="item-card">
                  <strong>${recommendation}</strong>
                </article>
              `
            )
            .join("")}
        </div>
      </article>
    </section>
  `;
}

export function renderScheduleScreen(state) {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Horario</h2>
          <p>Gestiona materias y horarios académicos por bloque.</p>
        </div>
        <div class="screen-actions">
          <a class="btn btn-primary" href="#/schedule/new">Añadir Horario</a>
        </div>
      </div>

      <div class="grid two">
        <article class="form-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Nueva materia</h2>
              <p>La materia queda disponible para horarios, tareas y notas.</p>
            </div>
          </div>
          <form class="form-grid" data-form="subject">
            <div class="form-grid two-columns">
              <div class="field">
                <label for="subject-name">Nombre</label>
                <input id="subject-name" name="name" type="text" required />
              </div>
              <div class="field">
                <label for="subject-code">Código</label>
                <input id="subject-code" name="code" type="text" required />
              </div>
              <div class="field">
                <label for="subject-professor">Profesor</label>
                <input id="subject-professor" name="professor" type="text" />
              </div>
              <div class="field">
                <label for="subject-color">Color</label>
                <input id="subject-color" name="color" type="color" value="#0d8a7a" />
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Guardar materia</button>
          </form>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Materias registradas</h2>
              <p>Base académica del resto del sistema.</p>
            </div>
          </div>
          <div class="list-stack">
            ${state.subjects.length
              ? state.subjects
                  .map(
                    (subject) => `
                      <article class="item-card">
                        <div class="item-header">
                          <div class="inline-actions">
                            <span class="subject-dot" style="background:${subject.color || "#0d8a7a"}"></span>
                            <div>
                              <strong>${subject.name}</strong>
                              <div class="meta">${subject.code} · ${subject.professor || "Profesor pendiente"}</div>
                            </div>
                          </div>
                          <button class="btn btn-secondary" data-action="delete-subject" data-id="${subject.id}">Eliminar</button>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">Aún no hay materias cargadas.</div>`}
          </div>
        </article>
      </div>

      <article class="list-card">
        <div class="screen-header">
          <div>
            <h2 class="section-title">Bloques de horario</h2>
            <p>Horario académico semanal visible para el matching.</p>
          </div>
        </div>
        <div class="collection-list">
          ${state.schedules.length
            ? state.schedules
                .map((schedule) => {
                  const subject = state.subjects.find((item) => item.id === schedule.subjectId);
                  return `
                    <article class="list-row">
                      <div>
                        <strong>${subject?.name ?? "Materia eliminada"}</strong>
                        <div class="meta">${subject?.code ?? "Sin código"}</div>
                      </div>
                      <div>${DAY_OPTIONS.find((day) => day.value === schedule.dayOfWeek)?.label ?? schedule.dayOfWeek}</div>
                      <div>${schedule.startTime} - ${schedule.endTime}</div>
                      <div>${schedule.location || "Sin ubicación"}</div>
                      <button class="btn btn-secondary" data-action="delete-schedule" data-id="${schedule.id}">Eliminar</button>
                    </article>
                  `;
                })
                .join("")
            : `<div class="empty-state">Todavía no has agregado bloques de horario.</div>`}
        </div>
      </article>
    </section>
  `;
}

export function renderAddScheduleScreen(state) {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Añadir Horario</h2>
          <p>Crea un bloque semanal por materia.</p>
        </div>
        <a class="btn btn-secondary" href="#/schedule">Volver a horarios</a>
      </div>

      <article class="form-card">
        ${
          state.subjects.length
            ? `
              <form class="form-grid" data-form="schedule">
                <div class="form-grid two-columns">
                  <div class="field">
                    <label for="schedule-subject">Materia</label>
                    <select id="schedule-subject" name="subjectId" required>
                      <option value="">Selecciona una materia</option>
                      ${state.subjects
                        .map(
                          (subject) =>
                            `<option value="${subject.id}">${subject.name} · ${subject.code}</option>`
                        )
                        .join("")}
                    </select>
                  </div>
                  <div class="field">
                    <label for="schedule-day">Día</label>
                    <select id="schedule-day" name="dayOfWeek" required>
                      ${DAY_OPTIONS.map(
                        (day) => `<option value="${day.value}">${day.label}</option>`
                      ).join("")}
                    </select>
                  </div>
                  <div class="field">
                    <label for="schedule-start">Hora inicio</label>
                    <input id="schedule-start" name="startTime" type="time" required />
                  </div>
                  <div class="field">
                    <label for="schedule-end">Hora fin</label>
                    <input id="schedule-end" name="endTime" type="time" required />
                  </div>
                  <div class="field">
                    <label for="schedule-location">Lugar</label>
                    <input id="schedule-location" name="location" type="text" placeholder="ML-123 o Zoom" />
                  </div>
                  <div class="field">
                    <label for="schedule-modality">Modalidad</label>
                    <select id="schedule-modality" name="modality">
                      <option value="presencial">Presencial</option>
                      <option value="virtual">Virtual</option>
                      <option value="híbrida">Híbrida</option>
                    </select>
                  </div>
                </div>
                <div class="button-row">
                  <button class="btn btn-primary" type="submit">Guardar bloque</button>
                </div>
              </form>
            `
            : `<div class="empty-state">Primero registra al menos una materia desde ScheduleScreen.</div>`
        }
      </article>
    </section>
  `;
}

export function renderGroupsScreen(state) {
  const membershipIds = new Set(state.groupMembers.map((item) => item.groupId));
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Grupos</h2>
          <p>Crea grupos o únete a uno para compartir disponibilidad.</p>
        </div>
        <div class="screen-actions">
          <a class="btn btn-primary" href="#/groups/new">Crear Grupos</a>
        </div>
      </div>

      <div class="collection-list">
        ${state.studyGroups.length
          ? state.studyGroups
              .map((group) => {
                const joined = membershipIds.has(group.id);
                return `
                  <article class="item-card">
                    <div class="item-header">
                      <div>
                        <strong>${group.name}</strong>
                        <div class="meta">${group.subjectName} · ${group.university}</div>
                      </div>
                      <div class="chip-row">
                        <span class="badge info">${joined ? "Ya eres miembro" : "Abierto"}</span>
                        <a class="btn btn-secondary" href="#/groups/${group.id}">Ver detalle</a>
                      </div>
                    </div>
                    <div class="meta">${group.description || "Sin descripción"}</div>
                    <div class="button-row">
                      ${
                        joined
                          ? `<a class="btn btn-primary" href="#/matching/${group.id}">Ver matching</a>`
                          : `<button class="btn btn-primary" data-action="join-group" data-id="${group.id}">Unirme</button>`
                      }
                    </div>
                  </article>
                `;
              })
              .join("")
          : `<div class="empty-state">No hay grupos creados todavía.</div>`}
      </div>
    </section>
  `;
}

export function renderCreateGroupScreen() {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Crear Grupos</h2>
          <p>Registra un grupo de estudio simple y visible para otros estudiantes.</p>
        </div>
        <a class="btn btn-secondary" href="#/groups">Volver a grupos</a>
      </div>

      <article class="form-card">
        <form class="form-grid" data-form="group">
          <div class="form-grid two-columns">
            <div class="field">
              <label for="group-name">Nombre del grupo</label>
              <input id="group-name" name="name" type="text" required />
            </div>
            <div class="field">
              <label for="group-subject">Materia</label>
              <input id="group-subject" name="subjectName" type="text" required />
            </div>
            <div class="field">
              <label for="group-university">Universidad</label>
              <input id="group-university" name="university" type="text" value="Universidad de los Andes" required />
            </div>
            <div class="field">
              <label for="group-discord">Discord / enlace</label>
              <input id="group-discord" name="discordLink" type="url" placeholder="https://discord.gg/..." />
            </div>
          </div>
          <div class="field">
            <label for="group-description">Descripción</label>
            <textarea id="group-description" name="description" placeholder="Objetivo, dinámica y frecuencia."></textarea>
          </div>
          <button class="btn btn-primary" type="submit">Crear grupo</button>
        </form>
      </article>
    </section>
  `;
}

export function renderGroupDetailScreen(groupDetail, isMember) {
  if (!groupDetail.group) {
    return `
      <section class="screen">
        <div class="empty-state">No encontré el grupo solicitado.</div>
      </section>
    `;
  }

  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Detalles del Grupo/h2>
          <p>${groupDetail.group.name} · ${groupDetail.group.subjectName}</p>
        </div>
        <div class="screen-actions">
          <a class="btn btn-secondary" href="#/groups">Volver</a>
          ${
            isMember
              ? `<a class="btn btn-primary" href="#/matching/${groupDetail.group.id}">MatchingScheduleScreen</a>`
              : ""
          }
        </div>
      </div>

      <div class="grid two">
        <article class="list-card">
          <div class="card-stack">
            <div>
              <strong>${groupDetail.group.name}</strong>
              <div class="meta">${groupDetail.group.university}</div>
            </div>
            <p>${groupDetail.group.description || "Grupo sin descripción detallada."}</p>
            <div class="chip-row">
              <span class="badge">${groupDetail.members.length} integrante(s)</span>
              ${
                groupDetail.group.discordLink
                  ? `<a class="btn-link" href="${groupDetail.group.discordLink}" target="_blank" rel="noreferrer">Abrir enlace</a>`
                  : `<span class="meta">Sin enlace externo</span>`
              }
            </div>
            ${
              !isMember
                ? `<button class="btn btn-primary" data-action="join-group" data-id="${groupDetail.group.id}">Unirme al grupo</button>`
                : ""
            }
          </div>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Integrantes</h2>
              <p>Base para el algoritmo de matching.</p>
            </div>
          </div>
          <div class="list-stack">
            ${groupDetail.members
              .map(
                (member) => `
                  <article class="item-card">
                    <div class="item-header">
                      <strong>${member.profile?.name ?? "Integrante"}</strong>
                      <span class="badge info">${member.role}</span>
                    </div>
                    <div class="meta">${member.profile?.program ?? "Programa pendiente"} · semestre ${member.profile?.semester ?? "-"}</div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>
      </div>

      <div class="grid two">
        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Próximas sesiones</h2>
              <p>Sesiones planeadas por el grupo.</p>
            </div>
          </div>
          <div class="list-stack">
            ${groupDetail.sessions.length
              ? sortByDate(groupDetail.sessions, "date")
                  .map(
                    (session) => `
                      <article class="item-card">
                        <strong>${session.title}</strong>
                        <div class="meta">${formatDate(session.date)} · ${session.startTime} - ${session.endTime}</div>
                        <div class="meta">${session.location || "Ubicación pendiente"} · ${session.modality || "Sin modalidad"}</div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">No hay sesiones creadas para este grupo.</div>`}
          </div>
        </article>

        ${
          isMember
            ? `
              <article class="form-card">
                <div class="screen-header">
                  <div>
                    <h2 class="section-title">Nueva sesión</h2>
                    <p>Registra una reunión rápida de estudio.</p>
                  </div>
                </div>
                <form class="form-grid" data-form="study-session" data-group-id="${groupDetail.group.id}">
                  <div class="form-grid two-columns">
                    <div class="field">
                      <label for="session-title">Título</label>
                      <input id="session-title" name="title" type="text" required />
                    </div>
                    <div class="field">
                      <label for="session-date">Fecha</label>
                      <input id="session-date" name="date" type="date" required />
                    </div>
                    <div class="field">
                      <label for="session-start">Hora inicio</label>
                      <input id="session-start" name="startTime" type="time" required />
                    </div>
                    <div class="field">
                      <label for="session-end">Hora fin</label>
                      <input id="session-end" name="endTime" type="time" required />
                    </div>
                    <div class="field">
                      <label for="session-location">Lugar</label>
                      <input id="session-location" name="location" type="text" />
                    </div>
                    <div class="field">
                      <label for="session-modality">Modalidad</label>
                      <select id="session-modality" name="modality">
                        <option value="presencial">Presencial</option>
                        <option value="virtual">Virtual</option>
                        <option value="híbrida">Híbrida</option>
                      </select>
                    </div>
                  </div>
                  <button class="btn btn-primary" type="submit">Crear sesión</button>
                </form>
              </article>
            `
            : `<article class="list-card"><div class="empty-state">Únete al grupo para proponer study sessions y revisar el matching.</div></article>`
        }
      </div>
    </section>
  `;
}

export function renderMatchingScreen(groupDetail, matching) {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Horario compatible</h2>
          <p>Bloques libres comunes entre lunes y sábado, de 7:00 a.m. a 8:00 p.m.</p>
        </div>
        <div class="screen-actions">
          <a class="btn btn-secondary" href="#/groups/${groupDetail.group.id}">Volver al grupo</a>
        </div>
      </div>

      <div class="grid two">
        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Integrantes evaluados</h2>
              <p>${matching.members.length} persona(s) consideradas por el algoritmo.</p>
            </div>
          </div>
          <div class="list-stack">
            ${matching.members
              .map(
                (member) => `
                  <article class="item-card">
                    <div class="item-header">
                      <strong>${member.name}</strong>
                      <span class="badge info">${member.role}</span>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Bloques comunes</h2>
              <p>Se muestran solo espacios con duración mínima de 1 hora.</p>
            </div>
          </div>
          <div class="mini-calendar">
            ${matching.freeBlocks.length
              ? matching.freeBlocks
                  .map(
                    (day) => `
                      <article class="calendar-day">
                        <strong>${day.dayLabel}</strong>
                        ${day.blocks
                          .map(
                            (block) => `
                              <div class="calendar-slot">
                                <span>${block.startTime} - ${block.endTime}</span>
                                <span class="badge">${block.durationHours}h</span>
                              </div>
                            `
                          )
                          .join("")}
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">No encontré bloques libres comunes con el horario actual.</div>`}
          </div>
        </article>
      </div>
    </section>
  `;
}

export function renderCalendarScreen(state) {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Calendario</h2>
          <p>Eventos académicos consolidados: clases, entregas, exámenes y sesiones.</p>
        </div>
      </div>

      <div class="grid two">
        <article class="form-card">
          <form class="form-grid" data-form="calendar-event">
            <div class="form-grid two-columns">
              <div class="field">
                <label for="event-title">Título</label>
                <input id="event-title" name="title" type="text" required />
              </div>
              <div class="field">
                <label for="event-type">Tipo</label>
                <select id="event-type" name="type">
                  <option value="class">Clase</option>
                  <option value="exam">Examen</option>
                  <option value="task">Entrega</option>
                  <option value="study">Sesión de estudio</option>
                </select>
              </div>
              <div class="field">
                <label for="event-date">Fecha</label>
                <input id="event-date" name="date" type="date" required />
              </div>
              <div class="field">
                <label for="event-subject">Materia</label>
                <select id="event-subject" name="subjectId">
                  <option value="">Sin materia</option>
                  ${state.subjects
                    .map(
                      (subject) => `<option value="${subject.id}">${subject.name}</option>`
                    )
                    .join("")}
                </select>
              </div>
              <div class="field">
                <label for="event-start">Inicio</label>
                <input id="event-start" name="startTime" type="time" />
              </div>
              <div class="field">
                <label for="event-end">Fin</label>
                <input id="event-end" name="endTime" type="time" />
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Agregar evento</button>
          </form>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Próximos eventos</h2>
              <p>Vista cronológica simple para el MVP.</p>
            </div>
          </div>
          <div class="collection-list">
            ${state.calendarEvents.length
              ? sortByDate(state.calendarEvents, "date")
                  .map(
                    (event) => `
                      <article class="list-row calendar-row">
                        <div>
                          <strong>${event.title}</strong>
                          <div class="meta">${getTypeLabel(event.type)}</div>
                        </div>
                        <div>${formatDate(event.date)}</div>
                        <div>${event.startTime || "--:--"} - ${event.endTime || "--:--"}</div>
                        <div>${state.subjects.find((subject) => subject.id === event.subjectId)?.name ?? "General"}</div>
                        <button class="btn btn-secondary" data-action="delete-event" data-id="${event.id}">Eliminar</button>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">No hay eventos creados todavía.</div>`}
          </div>
        </article>
      </div>
    </section>
  `;
}

export function renderGradesScreen(state) {
  const grouped = state.subjects.map((subject) => {
    const grades = state.grades.filter((grade) => grade.subjectId === subject.id);
    const finalGrade = grades.reduce((total, item) => {
      return total + (Number(item.percentage) / 100) * Number(item.grade || 0);
    }, 0);
    const totalPercentage = grades.reduce(
      (total, item) => total + Number(item.percentage || 0),
      0
    );
    return { subject, grades, finalGrade, totalPercentage };
  });

  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Calificaciones</h2>
          <p>Calculadora de nota final por materia, con porcentajes acumulados.</p>
        </div>
      </div>

      <div class="grid two">
        <article class="form-card">
          ${
            state.subjects.length
              ? `
                <form class="form-grid" data-form="grade">
                  <div class="form-grid two-columns">
                    <div class="field">
                      <label for="grade-subject">Materia</label>
                      <select id="grade-subject" name="subjectId" required>
                        <option value="">Selecciona</option>
                        ${state.subjects
                          .map(
                            (subject) =>
                              `<option value="${subject.id}">${subject.name}</option>`
                          )
                          .join("")}
                      </select>
                    </div>
                    <div class="field">
                      <label for="grade-item">Ítem</label>
                      <input id="grade-item" name="itemName" type="text" required />
                    </div>
                    <div class="field">
                      <label for="grade-percentage">Porcentaje</label>
                      <input id="grade-percentage" name="percentage" type="number" min="1" max="100" required />
                    </div>
                    <div class="field">
                      <label for="grade-value">Nota</label>
                      <input id="grade-value" name="grade" type="number" min="0" max="5" step="0.1" required />
                    </div>
                    <div class="field">
                      <label for="grade-date">Fecha</label>
                      <input id="grade-date" name="date" type="date" required />
                    </div>
                  </div>
                  <button class="btn btn-primary" type="submit">Agregar nota</button>
                </form>
              `
              : `<div class="empty-state">Registra materias antes de calcular notas.</div>`
          }
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Resumen por materia</h2>
              <p>Promedio ponderado acumulado para la feria.</p>
            </div>
          </div>
          <div class="list-stack">
            ${grouped.length
              ? grouped
                  .map(
                    ({ subject, grades, finalGrade, totalPercentage }) => `
                      <article class="item-card">
                        <div class="item-header">
                          <div>
                            <strong>${subject.name}</strong>
                            <div class="meta">${subject.code}</div>
                          </div>
                          <span class="badge ${finalGrade < 3.5 && grades.length ? "danger" : "info"}">Final: ${finalGrade.toFixed(2)}</span>
                        </div>
                        <div class="meta">Porcentaje cubierto: ${totalPercentage}%</div>
                        <div class="list-stack">
                          ${
                            grades.length
                              ? grades
                                  .map(
                                    (grade) => `
                                      <div class="item-card">
                                        <div class="item-header">
                                          <div>
                                            <strong>${grade.itemName}</strong>
                                            <div class="meta">${grade.percentage}% · nota ${grade.grade}</div>
                                          </div>
                                          <button class="btn btn-secondary" data-action="delete-grade" data-id="${grade.id}">Eliminar</button>
                                        </div>
                                      </div>
                                    `
                                  )
                                  .join("")
                              : `<div class="meta">Sin ítems registrados todavía.</div>`
                          }
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">No hay materias para calcular todavía.</div>`}
          </div>
        </article>
      </div>
    </section>
  `;
}

export function renderTasksScreen(state) {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Tareas</h2>
          <p>To-do list académica con prioridad y fecha límite.</p>
        </div>
      </div>

      <div class="grid two">
        <article class="form-card">
          <form class="form-grid" data-form="task">
            <div class="form-grid two-columns">
              <div class="field">
                <label for="task-title">Título</label>
                <input id="task-title" name="title" type="text" required />
              </div>
              <div class="field">
                <label for="task-subject">Materia</label>
                <select id="task-subject" name="subjectId">
                  <option value="">Sin materia</option>
                  ${state.subjects
                    .map(
                      (subject) => `<option value="${subject.id}">${subject.name}</option>`
                    )
                    .join("")}
                </select>
              </div>
              <div class="field">
                <label for="task-priority">Prioridad</label>
                <select id="task-priority" name="priority">
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <div class="field">
                <label for="task-due">Fecha límite</label>
                <input id="task-due" name="dueDate" type="date" required />
              </div>
            </div>
            <div class="field">
              <label for="task-description">Descripción</label>
              <textarea id="task-description" name="description"></textarea>
            </div>
            <button class="btn btn-primary" type="submit">Crear tarea</button>
          </form>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Tareas activas</h2>
              <p>Vista rápida para seguimiento semanal.</p>
            </div>
          </div>
          <div class="collection-list">
            ${state.tasks.length
              ? sortByDate(state.tasks, "dueDate")
                  .map(
                    (task) => `
                      <article class="list-row task-row">
                        <div>
                          <strong>${task.title}</strong>
                          <div class="meta">${task.description || "Sin descripción"}</div>
                        </div>
                        <div>${formatDate(task.dueDate)}</div>
                        <div><span class="badge ${getPriorityBadge(task.priority)}">${task.priority}</span></div>
                        <div>${getTaskStatusLabel(task.status)}</div>
                        <div class="inline-actions">
                          <button class="btn btn-secondary" data-action="toggle-task" data-id="${task.id}">
                            ${task.status === "done" ? "Reabrir" : "Completar"}
                          </button>
                          <button class="btn btn-secondary" data-action="delete-task" data-id="${task.id}">Eliminar</button>
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : `<div class="empty-state">No hay tareas registradas.</div>`}
          </div>
        </article>
      </div>
    </section>
  `;
}

export function renderProfileScreen(state) {
  return `
    <section class="screen">
      <div class="screen-header">
        <div>
          <h2>Perfil</h2>
          <p>Datos básicos del estudiante para personalizar grupos y contexto.</p>
        </div>
      </div>

      <div class="grid two">
        <article class="form-card">
          <form class="form-grid" data-form="profile">
            <div class="form-grid two-columns">
              <div class="field">
                <label for="profile-name">Nombre</label>
                <input id="profile-name" name="name" type="text" value="${state.profile?.name ?? ""}" required />
              </div>
              <div class="field">
                <label for="profile-email">Correo</label>
                <input id="profile-email" name="email" type="email" value="${state.profile?.email ?? ""}" disabled />
              </div>
              <div class="field">
                <label for="profile-university">Universidad</label>
                <input id="profile-university" name="university" type="text" value="${state.profile?.university ?? ""}" />
              </div>
              <div class="field">
                <label for="profile-program">Carrera</label>
                <input id="profile-program" name="program" type="text" value="${state.profile?.program ?? ""}" />
              </div>
              <div class="field">
                <label for="profile-semester">Semestre</label>
                <input id="profile-semester" name="semester" type="number" min="1" max="12" value="${state.profile?.semester ?? 1}" />
              </div>
              <div class="field">
                <label for="profile-photo">Foto URL</label>
                <input id="profile-photo" name="photoUrl" type="url" value="${state.profile?.photoUrl ?? ""}" />
              </div>
            </div>
            <button class="btn btn-primary" type="submit">Guardar perfil</button>
          </form>
        </article>

        <article class="list-card">
          <div class="screen-header">
            <div>
              <h2 class="section-title">Snapshot del perfil</h2>
              <p>Datos que se usan para mostrarte en grupos y dashboard.</p>
            </div>
          </div>
          <div class="item-card">
            <strong>${state.profile?.name ?? "Sin nombre"}</strong>
            <div class="meta">${state.profile?.email ?? "Sin correo"}</div>
            <div class="meta">${state.profile?.university ?? "Universidad no definida"}</div>
            <div class="meta">${state.profile?.program ?? "Carrera no definida"} · semestre ${state.profile?.semester ?? "-"}</div>
          </div>
        </article>
      </div>
    </section>
  `;
}

export function renderLoadingScreen(message = "Cargando información...") {
  return `
    <section class="screen">
      <article class="hero-card">
        <strong>${message}</strong>
      </article>
    </section>
  `;
}
