import {
  createCalendarEvent,
  createGrade,
  createSchedule,
  createStudyGroup,
  createStudySession,
  createSubject,
  createTask,
  deleteCalendarEvent,
  deleteGrade,
  deleteSchedule,
  deleteSubject,
  deleteTask,
  ensureUserProfile,
  getGroupDetail,
  getGroupMatching,
  joinStudyGroup,
  loadAppData,
  updateTask,
  updateUserProfile,
} from "./services/data-service.js";
import {
  getCurrentUser,
  initializeAuth,
  loginWithEmail,
  logoutCurrentUser,
  registerWithEmail,
  subscribeToAuth,
} from "./services/auth-service.js";
import { initializeFirebase } from "./services/firebase-service.js";
import { buildRecommendations } from "./utils/recommendations.js";
import {
  renderAddScheduleScreen,
  renderAuthScreen,
  renderCalendarScreen,
  renderCreateGroupScreen,
  renderDashboardScreen,
  renderGradesScreen,
  renderGroupDetailScreen,
  renderGroupsScreen,
  renderLoadingScreen,
  renderMatchingScreen,
  renderProfileScreen,
  renderScheduleScreen,
  renderSidebar,
  renderTasksScreen,
  renderTopbar,
} from "./views/templates.js";

const state = {
  status: {
    loading: true,
    usingDemo: true,
  },
  authUser: null,
  profile: null,
  subjects: [],
  schedules: [],
  studyGroups: [],
  groupMembers: [],
  studySessions: [],
  tasks: [],
  grades: [],
  calendarEvents: [],
  recommendations: [],
};

const appRoot = document.getElementById("app");
const sidebarRoot = document.getElementById("sidebar");
const topbarRoot = document.getElementById("topbar");
const notificationRoot = document.getElementById("notification-root");
const overlay = document.getElementById("overlay");

function generateICS(state) {
  const events = state.schedules.map((s) => {
    const subject = state.subjects.find(sub => sub.id === s.subjectId);

    const dayMap = {
      monday: "MO",
      tuesday: "TU",
      wednesday: "WE",
      thursday: "TH",
      friday: "FR",
      saturday: "SA"
    };

    const start = s.startTime.replace(":", "");
    const end = s.endTime.replace(":", "");

    return `
  BEGIN:VEVENT
  SUMMARY:${subject?.name || "Clase"}
  DTSTART:20260501T${start}00
  DTEND:20260501T${end}00
  RRULE:FREQ=WEEKLY;BYDAY=${dayMap[s.dayOfWeek]}
  LOCATION:${s.location || "Uniandes"}
  END:VEVENT`;
    }).join("");

    return `BEGIN:VCALENDAR
  VERSION:2.0
  ${events}
  END:VCALENDAR`;
}

function downloadICS(state) {
  const content = generateICS(state);
  const blob = new Blob([content], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "horario.ics";
  a.click();

  URL.revokeObjectURL(url);
}

function getRouteParts() {
  const hash = window.location.hash.replace(/^#\//, "");
  return hash ? hash.split("/") : ["login"];
}

function getActiveRoute() {
  const [section] = getRouteParts();
  return section;
}

function isProtectedRoute(route) {
  return !["login", "register"].includes(route);
}

function getUserUid() {
  return state.authUser?.uid ?? state.authUser?.id ?? null;
}

function getSafeRoute() {
  const route = getActiveRoute();
  if (!state.authUser && isProtectedRoute(route)) return "login";
  if (state.authUser && ["login", "register"].includes(route)) return "dashboard";
  return route;
}

function navigateTo(route) {
  window.location.hash = `#/${route}`;
}

function showToast(message) {
  const toast = document.createElement("article");
  toast.className = "toast";
  toast.textContent = message;
  notificationRoot.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

async function refreshData() {
  if (!state.authUser) {
    state.status.loading = false;
    renderApp();
    return;
  }

  state.status.loading = true;
  renderApp();

  try {
    const data = await loadAppData(state.authUser);
    Object.assign(state, data);

    const membershipGroups = state.groupMembers.map((membership) => membership.groupId);
    const firstGroupId = membershipGroups[0];
    const freeBlocks = firstGroupId
      ? (await getGroupMatching(firstGroupId)).freeBlocks
      : [];

    state.recommendations = buildRecommendations({
      tasks: state.tasks,
      grades: state.grades,
      memberships: state.groupMembers,
      freeBlocks,
    });
  } catch (error) {
    console.error(error);
    showToast(error.message || "No fue posible cargar la información.");
  } finally {
    state.status.loading = false;
    renderApp();
  }
}

function hydrateShell() {
  const activeRoute = getSafeRoute();
  const showShell = Boolean(state.authUser);

  sidebarRoot.classList.toggle("hidden", !showShell);
  topbarRoot.classList.toggle("hidden", !showShell);

  if (!showShell) return;

  sidebarRoot.innerHTML = renderSidebar({
    activeRoute,
    profile: state.profile,
    memberships: state.groupMembers,
  });

  topbarRoot.innerHTML = renderTopbar({
    profile: state.profile,
    usingDemo: state.status.usingDemo,
  });
}

async function renderProtectedScreen() {
  const [section, detailId] = getRouteParts();

  if (state.status.loading) {
    return renderLoadingScreen();
  }

  switch (section) {
    case "dashboard":
      return renderDashboardScreen(state);
    case "schedule":
      return detailId === "new"
        ? renderAddScheduleScreen(state)
        : renderScheduleScreen(state);
    case "groups":
      if (detailId === "new") {
        return renderCreateGroupScreen(state);
      }
      if (detailId) {
        const detail = await getGroupDetail(detailId);
        const isMember = state.groupMembers.some((item) => item.groupId === detailId);
        return renderGroupDetailScreen(detail, isMember);
      }
      return renderGroupsScreen(state);
    case "matching":
      if (!detailId) return renderGroupsScreen(state);
      return renderMatchingScreen(await getGroupDetail(detailId), await getGroupMatching(detailId));
    case "grades":
      return renderGradesScreen(state);
    case "calendar":
      return renderCalendarScreen(state);
    case "tasks":
      return renderTasksScreen(state);
    case "profile":
      return renderProfileScreen(state);
    default:
      return renderDashboardScreen(state);
  }
}

async function renderApp() {
  hydrateShell();
  const route = getSafeRoute();

  if (route !== getActiveRoute()) {
    navigateTo(route);
    return;
  }

  if (!state.authUser) {
    appRoot.innerHTML = renderAuthScreen(route);
    return;
  }

  appRoot.innerHTML = await renderProtectedScreen();
}

function validateTimeRange(startTime, endTime) {
  return startTime < endTime;
}

function serializeForm(formElement) {
  return Object.fromEntries(new FormData(formElement).entries());
}

async function handleAuthSubmit(type, formElement) {
  const payload = serializeForm(formElement);

  if (type === "login") {
    await loginWithEmail(payload.email, payload.password);
    showToast("Sesión iniciada.");
    return;
  }

  const user = await registerWithEmail(payload);
  await ensureUserProfile(user, payload);
  showToast("Cuenta creada correctamente.");
}

async function handleFormSubmit(event) {
  const form = event.target.closest("form");
  if (!form) return;

  const type = form.dataset.form;
  if (!type) return;

  event.preventDefault();

  try {
    if (type === "login" || type === "register") {
      await handleAuthSubmit(type, form);
      navigateTo("dashboard");
      return;
    }

    const payload = serializeForm(form);
    const uid = getUserUid();

    switch (type) {
      case "subject":
        await createSubject({
          userId: uid,
          name: payload.name,
          code: payload.code,
          section: payload.section,
          color: payload.color,
        });
        showToast("Materia guardada.");
        break;
      case "schedule":
        if (!validateTimeRange(payload.startTime, payload.endTime)) {
          throw new Error("La hora de fin debe ser mayor a la hora de inicio.");
        }
        await createSchedule({
          userId: uid,
          subjectId: payload.subjectId,
          dayOfWeek: payload.dayOfWeek,
          startTime: payload.startTime,
          endTime: payload.endTime,
          location: payload.location,
          modality: payload.modality,
        });
        showToast("Bloque horario creado.");
        navigateTo("schedule");
        break;
      case "group":
        const subject = state.subjects.find(s => s.id === payload.subjectId);

        // 1. Crear grupo primero
        await createStudyGroup({
          name: payload.name,
          subjectId: payload.subjectId,
          subjectName: subject?.name || "Materia",
          description: payload.description,
          creatorId: uid,
          university: payload.university,
          createdAt: new Date().toISOString(),
        });

        // 2. Crear canales en Discord
        try {
          const discordResponse = await fetch("http://localhost:3000/create-discord-group", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              groupName: payload.name,
            }),
          });

          const discordData = await discordResponse.json();

          if (!discordData.ok) {
            throw new Error("Discord falló");
          }

          showToast("Grupo creado con Discord 🚀");
          

        } catch (error) {
          console.error(error);
          showToast("Grupo creado, pero Discord falló ⚠️");
        }


        navigateTo("groups");
        break;
      case "study-session":
        if (!validateTimeRange(payload.startTime, payload.endTime)) {
          throw new Error("La sesión debe terminar después de empezar.");
        }
        await createStudySession({
          groupId: form.dataset.groupId,
          title: payload.title,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          location: payload.location || "",
          meetingLink: payload.meetingLink || "",
          modality: payload.modality,
          participants: [],
        });
        showToast("Sesión creada.");
        break;
      case "grade":
        await createGrade({
          userId: uid,
          subjectId: payload.subjectId,
          itemName: payload.itemName,
          percentage: Number(payload.percentage),
          grade: Number(payload.grade),
          date: payload.date,
        });
        showToast("Nota agregada.");
        break;
      case "task":
        await createTask({
          userId: uid,
          subjectId: payload.subjectId,
          title: payload.title,
          description: payload.description,
          dueDate: payload.dueDate,
          priority: payload.priority,
          status: "todo",
        });
        showToast("Tarea creada.");
        break;
      case "calendar-event":
        if (payload.startTime && payload.endTime && !validateTimeRange(payload.startTime, payload.endTime)) {
          throw new Error("El rango horario del evento no es válido.");
        }
        await createCalendarEvent({
          userId: uid,
          title: payload.title,
          type: payload.type,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          subjectId: payload.subjectId || "",
          groupId: "",
        });
        showToast("Evento agregado.");
        break;
      case "profile":
        await updateUserProfile(uid, {
          name: payload.name,
          university: payload.university,
          program: payload.program,
          semester: Number(payload.semester),
          photoUrl: payload.photoUrl,
        });
        showToast("Perfil actualizado.");
        break;
      default:
        return;
    }

    form.reset();
    await refreshData();
  } catch (error) {
    console.error(error);
    showToast(error.message || "No pude guardar la información.");
  }
}

async function handleActionClick(event) {
  const actionTrigger = event.target.closest("[data-action]");
  if (!actionTrigger) return;

  const { action, id } = actionTrigger.dataset;

  try {
    switch (action) {
      case "toggle-sidebar":
        const isOpen = sidebarRoot.classList.toggle("sidebar-open");
        overlay.classList.toggle("hidden", !isOpen);
        return;
      case "export-ics":
        downloadICS(state);
        showToast("Calendario exportado.");
        return;
      case "logout":
        await logoutCurrentUser();
        navigateTo("login");
        showToast("Sesión cerrada.");
        return;
      case "delete-subject":
        await deleteSubject(id);
        showToast("Materia eliminada.");
        break;
      case "delete-schedule":
        await deleteSchedule(id);
        showToast("Bloque eliminado.");
        break;
      case "join-group":
        await joinStudyGroup(id, getUserUid());
        showToast("Ahora perteneces al grupo.");
        break;
      case "delete-grade":
        await deleteGrade(id);
        showToast("Nota eliminada.");
        break;
      case "toggle-task": {
        const task = state.tasks.find((item) => item.id === id);
        await updateTask(id, {
          status: task?.status === "done" ? "todo" : "done",
        });
        showToast("Tarea actualizada.");
        break;
      }
      case "delete-task":
        await deleteTask(id);
        showToast("Tarea eliminada.");
        break;
      case "delete-event":
        await deleteCalendarEvent(id);
        showToast("Evento eliminado.");
        break;
      default:
        return;
    }

    await refreshData();
  } catch (error) {
    console.error(error);
    showToast(error.message || "No pude ejecutar la acción.");
  }
}

function attachGlobalListeners() {
  document.addEventListener("submit", handleFormSubmit);
  document.addEventListener("click", handleActionClick);
  window.addEventListener("hashchange", renderApp);
  document.addEventListener("change", handleSessionModalityChange);
  overlay.addEventListener("click", () => {
  sidebarRoot.classList.remove("sidebar-open");
  overlay.classList.add("hidden");
});
}

function setupAuthObserver() {
  subscribeToAuth(async (user) => {
    state.authUser = user;

    if (!user) {
      state.profile = null;
      state.subjects = [];
      state.schedules = [];
      state.studyGroups = [];
      state.groupMembers = [];
      state.studySessions = [];
      state.tasks = [];
      state.grades = [];
      state.calendarEvents = [];
      state.recommendations = [];
      state.status.loading = false;
      renderApp();
      return;
    }

    await refreshData();
    if (!state.profile && getCurrentUser()) {
      await ensureUserProfile(user, {
        name: user.displayName || user.name || "Estudiante Expoandes",
        email: user.email,
        university: "Universidad de los Andes",
        program: payload.program || "Sin definir",
        semester: payload.semester || 1,
        createdAt: new Date().toISOString(),
      });
      await refreshData();
    }

    if (["login", "register"].includes(getActiveRoute())) {
      navigateTo("dashboard");
    }
  });
}

function bootstrap() {
  const firebaseStatus = initializeFirebase();
  state.status.usingDemo = firebaseStatus.usingDemo;
  attachGlobalListeners();
  setupAuthObserver();
  initializeAuth();
  renderApp();
}

bootstrap();

document.addEventListener("input", (e) => {
  if (e.target.id === "subject-color") {
    const preview = document.getElementById("color-preview");
    if (preview) preview.style.background = e.target.value;
  }
});

function handleSessionModalityChange(event) {
  if (!event.target.matches("[data-session-modality]")) return;

  const form = event.target.closest("form");
  const placeField = form.querySelector(".session-place-field");
  const linkField = form.querySelector(".session-link-field");

  const modality = event.target.value;

  placeField.classList.toggle("hidden", modality === "virtual");
  linkField.classList.toggle("hidden", modality === "presencial");
}