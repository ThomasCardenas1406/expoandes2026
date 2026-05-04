import { getFirebaseContext, firestoreApi } from "./firebase-service.js";
import { findCommonFreeBlocks } from "./matching-service.js";

const COLLECTION_KEYS = [
  "users",
  "subjects",
  "schedules",
  "studyGroups",
  "groupMembers",
  "studySessions",
  "tasks",
  "grades",
  "calendarEvents",
  "lessons",
  "userLessonProgress",
  "userGamification",
  "groupLeaderboard",
];

const LOCAL_PREFIX = "expoandes_mvp_";

function localKey(collectionName) {
  return `${LOCAL_PREFIX}${collectionName}`;
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function readLocalCollection(collectionName) {
  return JSON.parse(localStorage.getItem(localKey(collectionName)) ?? "[]");
}

function writeLocalCollection(collectionName, data) {
  localStorage.setItem(localKey(collectionName), JSON.stringify(data));
}

function mapFirestoreDocs(snapshot) {
  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

async function addRemote(collectionName, data, customId = null) {
  const { db } = getFirebaseContext();

  if (customId) {
    await firestoreApi.setDoc(firestoreApi.doc(db, collectionName, customId), data);
    return { id: customId, ...data };
  }

  const reference = await firestoreApi.addDoc(
    firestoreApi.collection(db, collectionName),
    data
  );
  return { id: reference.id, ...data };
}

async function updateRemote(collectionName, id, data) {
  const { db } = getFirebaseContext();
  await firestoreApi.updateDoc(firestoreApi.doc(db, collectionName, id), data);
}

async function deleteRemote(collectionName, id) {
  const { db } = getFirebaseContext();
  await firestoreApi.deleteDoc(firestoreApi.doc(db, collectionName, id));
}

function addLocal(collectionName, data, customId = null) {
  const collection = readLocalCollection(collectionName);
  const record = {
    id: customId ?? createId(collectionName),
    ...data,
  };
  collection.push(record);
  writeLocalCollection(collectionName, collection);
  return record;
}

function updateLocal(collectionName, id, data) {
  const collection = readLocalCollection(collectionName).map((item) =>
    item.id === id ? { ...item, ...data } : item
  );
  writeLocalCollection(collectionName, collection);
}

function deleteLocal(collectionName, id) {
  const collection = readLocalCollection(collectionName).filter((item) => item.id !== id);
  writeLocalCollection(collectionName, collection);
}

function getUserUid(user) {
  return user?.uid ?? user?.id ?? null;
}

export async function ensureUserProfile(user, profilePayload) {
  const { db, firebaseReady } = getFirebaseContext();
  const uid = getUserUid(user);
  const payload = {
    uid,
    name: profilePayload.name,
    email: user.email ?? profilePayload.email,
    university: profilePayload.university,
    program: profilePayload.program,
    semester: profilePayload.semester,
    photoUrl: profilePayload.photoUrl ?? "",
    createdAt: profilePayload.createdAt ?? new Date().toISOString(),
    discordJoined: false,
    discordInviteUrl: "https://discord.gg/p3w3VkEaq",
  };

  if (firebaseReady) {
    await firestoreApi.setDoc(firestoreApi.doc(db, "users", uid), payload, { merge: true });
    return payload;
  }

  const users = readLocalCollection("users");
  const existing = users.find((item) => item.uid === uid);
  if (existing) {
    writeLocalCollection(
      "users",
      users.map((item) => (item.uid === uid ? { ...item, ...payload } : item))
    );
  } else {
    users.push(payload);
    writeLocalCollection("users", users);
  }
  return payload;
}

export async function updateUserProfile(uid, data) {
  const { db, firebaseReady } = getFirebaseContext();

  // 👇 Defaults controlados
  const safeData = {
    ...data,
    discordJoined: data.discordJoined ?? false,
    discordInviteUrl: "https://discord.gg/p3w3VkEaq",
  };

  if (firebaseReady) {
    await firestoreApi.setDoc(
      firestoreApi.doc(db, "users", uid),
      safeData,
      { merge: true } // 👈 clave: no borra lo anterior
    );
    return;
  }

  const users = readLocalCollection("users").map((item) =>
    item.uid === uid
      ? {
          ...item,
          ...safeData,
          discordJoined: safeData.discordJoined ?? item.discordJoined ?? false,
          discordInviteUrl: safeData.discordInviteUrl ?? item.discordInviteUrl,
        }
      : item
  );

  writeLocalCollection("users", users);
}

async function getRemoteProfile(uid) {
  const { db } = getFirebaseContext();
  const document = await firestoreApi.getDoc(firestoreApi.doc(db, "users", uid));
  return document.exists() ? { id: document.id, ...document.data() } : null;
}

async function getRemoteCollection(collectionName, field = null, value = null) {
  const { db } = getFirebaseContext();
  const reference = firestoreApi.collection(db, collectionName);
  if (!field) {
    return mapFirestoreDocs(await firestoreApi.getDocs(reference));
  }
  const snapshot = await firestoreApi.getDocs(
    firestoreApi.query(reference, firestoreApi.where(field, "==", value))
  );
  return mapFirestoreDocs(snapshot);
}

async function getStudySessionsForGroupIds(groupIds) {
  if (!groupIds.length) return [];
  const { firebaseReady } = getFirebaseContext();

  if (!firebaseReady) {
    return readLocalCollection("studySessions").filter((item) =>
      groupIds.includes(item.groupId)
    );
  }

  const { db } = getFirebaseContext();
  const sessions = await Promise.all(
    groupIds.map(async (groupId) => {
      const snapshot = await firestoreApi.getDocs(
        firestoreApi.query(
          firestoreApi.collection(db, "studySessions"),
          firestoreApi.where("groupId", "==", groupId)
        )
      );
      return mapFirestoreDocs(snapshot);
    })
  );
  return sessions.flat();
}

export async function loadAppData(user) {
  const { firebaseReady } = getFirebaseContext();
  const uid = getUserUid(user);

  // Unificamos la carga del estado para mantener las vistas simples
  // y evitar lógica de consultas repartida por toda la interfaz.
  if (firebaseReady) {
    const [profile, subjects, schedules, groups, memberships, tasks, grades, events] =
      await Promise.all([
        getRemoteProfile(uid),
        getRemoteCollection("subjects", "userId", uid),
        getRemoteCollection("schedules", "userId", uid),
        getRemoteCollection("studyGroups"),
        getRemoteCollection("groupMembers", "userId", uid),
        getRemoteCollection("tasks", "userId", uid),
        getRemoteCollection("grades", "userId", uid),
        getRemoteCollection("calendarEvents", "userId", uid),
      ]);

    const studySessions = await getStudySessionsForGroupIds(
      memberships.map((membership) => membership.groupId)
    );

    return {
      profile,
      subjects,
      schedules,
      studyGroups: groups,
      groupMembers: memberships,
      studySessions,
      tasks,
      grades,
      calendarEvents: events,
    };
  }

  const profile =
    readLocalCollection("users").find((item) => item.uid === uid || item.id === uid) ?? null;
  const studyGroups = readLocalCollection("studyGroups");
  const groupMembers = readLocalCollection("groupMembers").filter((item) => item.userId === uid);

  return {
    profile,
    subjects: readLocalCollection("subjects").filter((item) => item.userId === uid),
    schedules: readLocalCollection("schedules").filter((item) => item.userId === uid),
    studyGroups,
    groupMembers,
    studySessions: readLocalCollection("studySessions").filter((item) =>
      groupMembers.some((membership) => membership.groupId === item.groupId)
    ),
    tasks: readLocalCollection("tasks").filter((item) => item.userId === uid),
    grades: readLocalCollection("grades").filter((item) => item.userId === uid),
    calendarEvents: readLocalCollection("calendarEvents").filter((item) => item.userId === uid),
  };
}

export async function createSubject(payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady
    ? addRemote("subjects", payload)
    : addLocal("subjects", payload);
}

export async function deleteSubject(subjectId) {
  const { firebaseReady } = getFirebaseContext();
  if (firebaseReady) {
    await deleteRemote("subjects", subjectId);
    return;
  }
  deleteLocal("subjects", subjectId);
}

export async function createSchedule(payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady
    ? addRemote("schedules", payload)
    : addLocal("schedules", payload);
}

export async function deleteSchedule(scheduleId) {
  const { firebaseReady } = getFirebaseContext();
  if (firebaseReady) {
    await deleteRemote("schedules", scheduleId);
    return;
  }
  deleteLocal("schedules", scheduleId);
}

export async function createStudyGroup(payload) {
  const { firebaseReady } = getFirebaseContext();
  const group = firebaseReady
    ? await addRemote("studyGroups", payload)
    : addLocal("studyGroups", payload);

  const creatorMembership = {
    groupId: group.id,
    userId: payload.creatorId,
    role: "admin",
    joinedAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    await addRemote("groupMembers", creatorMembership);
  } else {
    addLocal("groupMembers", creatorMembership);
  }

  return group;
}

export async function joinStudyGroup(groupId, userId) {
  const { firebaseReady } = getFirebaseContext();
  const membership = {
    groupId,
    userId,
    role: "member",
    joinedAt: new Date().toISOString(),
  };

  if (firebaseReady) {
    const { db } = getFirebaseContext();
    const snapshot = await firestoreApi.getDocs(
      firestoreApi.query(
        firestoreApi.collection(db, "groupMembers"),
        firestoreApi.where("groupId", "==", groupId),
        firestoreApi.where("userId", "==", userId)
      )
    );

    if (!snapshot.empty) return;
    await addRemote("groupMembers", membership);
    return;
  }

  const alreadyJoined = readLocalCollection("groupMembers").some(
    (item) => item.groupId === groupId && item.userId === userId
  );
  if (!alreadyJoined) {
    addLocal("groupMembers", membership);
  }
}

export async function getGroupDetail(groupId) {
  const { db, firebaseReady } = getFirebaseContext();

  if (firebaseReady) {
    const groupDoc = await firestoreApi.getDoc(firestoreApi.doc(db, "studyGroups", groupId));
    const membersSnapshot = await firestoreApi.getDocs(
      firestoreApi.query(
        firestoreApi.collection(db, "groupMembers"),
        firestoreApi.where("groupId", "==", groupId)
      )
    );
    const sessionsSnapshot = await firestoreApi.getDocs(
      firestoreApi.query(
        firestoreApi.collection(db, "studySessions"),
        firestoreApi.where("groupId", "==", groupId)
      )
    );

    const members = await Promise.all(
      mapFirestoreDocs(membersSnapshot).map(async (membership) => {
        const profile = await getRemoteProfile(membership.userId);
        return { ...membership, profile };
      })
    );

    return {
      group: groupDoc.exists() ? { id: groupDoc.id, ...groupDoc.data() } : null,
      members,
      sessions: mapFirestoreDocs(sessionsSnapshot),
    };
  }

  const group = readLocalCollection("studyGroups").find((item) => item.id === groupId) ?? null;
  const users = readLocalCollection("users");
  const members = readLocalCollection("groupMembers")
    .filter((item) => item.groupId === groupId)
    .map((membership) => ({
      ...membership,
      profile: users.find((user) => user.uid === membership.userId) ?? null,
    }));
  const sessions = readLocalCollection("studySessions").filter(
    (item) => item.groupId === groupId
  );

  return { group, members, sessions };
}

export async function createStudySession(payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady
    ? addRemote("studySessions", payload)
    : addLocal("studySessions", payload);
}

export async function createTask(payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady ? addRemote("tasks", payload) : addLocal("tasks", payload);
}

export async function updateTask(taskId, data) {
  const { firebaseReady } = getFirebaseContext();
  if (firebaseReady) {
    await updateRemote("tasks", taskId, data);
    return;
  }
  updateLocal("tasks", taskId, data);
}

export async function deleteTask(taskId) {
  const { firebaseReady } = getFirebaseContext();
  if (firebaseReady) {
    await deleteRemote("tasks", taskId);
    return;
  }
  deleteLocal("tasks", taskId);
}

export async function createGrade(payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady ? addRemote("grades", payload) : addLocal("grades", payload);
}

export async function deleteGrade(gradeId) {
  const { firebaseReady } = getFirebaseContext();
  if (firebaseReady) {
    await deleteRemote("grades", gradeId);
    return;
  }
  deleteLocal("grades", gradeId);
}

export async function createCalendarEvent(payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady
    ? addRemote("calendarEvents", payload)
    : addLocal("calendarEvents", payload);
}

export async function deleteCalendarEvent(eventId) {
  const { firebaseReady } = getFirebaseContext();
  if (firebaseReady) {
    await deleteRemote("calendarEvents", eventId);
    return;
  }
  deleteLocal("calendarEvents", eventId);
}

export async function getGroupMatching(groupId) {
  const { db, firebaseReady } = getFirebaseContext();

  if (firebaseReady) {
    const membershipsSnapshot = await firestoreApi.getDocs(
      firestoreApi.query(
        firestoreApi.collection(db, "groupMembers"),
        firestoreApi.where("groupId", "==", groupId)
      )
    );

    const memberships = mapFirestoreDocs(membershipsSnapshot);
    const members = await Promise.all(
      memberships.map(async (membership) => {
        const profile = await getRemoteProfile(membership.userId);
        return {
          uid: membership.userId,
          name: profile?.name ?? "Integrante",
          role: membership.role,
        };
      })
    );

    const schedulesPerUser = await Promise.all(
      memberships.map(async (membership) => {
        const snapshot = await firestoreApi.getDocs(
          firestoreApi.query(
            firestoreApi.collection(db, "schedules"),
            firestoreApi.where("userId", "==", membership.userId)
          )
        );
        return mapFirestoreDocs(snapshot);
      })
    );

    const schedules = schedulesPerUser.flat();
    return {
      members,
      schedules,
      // El cálculo del matching vive separado del acceso a datos
      // para mantener la lógica desacoplada y reutilizable.
      freeBlocks: findCommonFreeBlocks(members, schedules),
    };
  }

  const memberships = readLocalCollection("groupMembers").filter(
    (item) => item.groupId === groupId
  );
  const users = readLocalCollection("users");
  const members = memberships.map((membership) => ({
    uid: membership.userId,
    name: users.find((user) => user.uid === membership.userId)?.name ?? "Integrante",
    role: membership.role,
  }));
  const schedules = readLocalCollection("schedules").filter((item) =>
    memberships.some((membership) => membership.userId === item.userId)
  );

  return {
    members,
    schedules,
    freeBlocks: findCommonFreeBlocks(members, schedules),
  };
}

export function clearDemoCollections() {
  COLLECTION_KEYS.forEach((collectionName) => {
    localStorage.removeItem(localKey(collectionName));
  });
}
