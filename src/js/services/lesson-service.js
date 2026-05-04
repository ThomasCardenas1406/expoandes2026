import {
  SEEDED_LESSONS,
  getLessonSubjectKey,
  getSeededLessonsForSubject,
  isSeededSubject,
  normalizeLessonText,
} from "../data/seed-lessons.js";
import {
  calculateNextStreak,
  evaluateLessonAnswers,
  getLessonStatuses,
  getTodayDateKey,
  mergeCompletedLessonIds,
} from "../utils/gamification.js";
import { getFirebaseContext, firestoreApi } from "./firebase-service.js";
import { getGroupDetail } from "./data-service.js";

const LOCAL_PREFIX = "expoandes_mvp_";
const LESSONS_COLLECTION = "lessons";
const USER_PROGRESS_COLLECTION = "userLessonProgress";
const USER_GAMIFICATION_COLLECTION = "userGamification";
const GROUP_LEADERBOARD_COLLECTION = "groupLeaderboard";
let remoteSeedAttempted = false;

function localKey(collectionName) {
  return `${LOCAL_PREFIX}${collectionName}`;
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

function slugify(value) {
  return normalizeLessonText(value).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function sortLessons(lessons) {
  return [...lessons].sort((left, right) => Number(left.order ?? 0) - Number(right.order ?? 0));
}

function isGroupForSubject(group, subject) {
  return group?.subjectId === subject?.id || normalizeLessonText(group?.subjectName) === normalizeLessonText(subject?.name);
}

function getLessonIds(lessons) {
  return new Set(lessons.map((lesson) => lesson.id));
}

function syncLocalSeededLessons() {
  const collection = readLocalCollection(LESSONS_COLLECTION);
  const nonSeededLessons = collection.filter(
    (item) => !SEEDED_LESSONS.some((lesson) => lesson.id === item.id)
  );

  writeLocalCollection(LESSONS_COLLECTION, [...nonSeededLessons, ...SEEDED_LESSONS]);
}

async function getRemoteLessons(subjectKey) {
  const { db } = getFirebaseContext();
  const snapshot = await firestoreApi.getDocs(
    firestoreApi.query(
      firestoreApi.collection(db, LESSONS_COLLECTION),
      firestoreApi.where("subjectName", "==", subjectKey)
    )
  );

  return sortLessons(mapFirestoreDocs(snapshot));
}

async function seedRemoteLessonsIfPossible() {
  const { firebaseReady, db } = getFirebaseContext();

  if (!firebaseReady || remoteSeedAttempted) return;

  remoteSeedAttempted = true;

  try {
    await Promise.all(
      SEEDED_LESSONS.map((lesson) =>
        firestoreApi.setDoc(firestoreApi.doc(db, LESSONS_COLLECTION, lesson.id), lesson)
      )
    );
  } catch (error) {
    console.warn("No pude sembrar lessons en Firestore; continúo con seed local.", error);
  }
}

async function getLessonsForSubject(subject) {
  const subjectKey = getLessonSubjectKey(subject);
  const fallbackLessons = getSeededLessonsForSubject(subject);
  const { firebaseReady } = getFirebaseContext();

  if (!firebaseReady) {
    syncLocalSeededLessons();
    const localLessons = readLocalCollection(LESSONS_COLLECTION).filter(
      (lesson) => lesson.subjectName === subjectKey
    );
    return sortLessons(localLessons.length ? localLessons : fallbackLessons);
  }

  try {
    if (isSeededSubject(subject)) {
      await seedRemoteLessonsIfPossible();
    }

    const remoteLessons = await getRemoteLessons(subjectKey);
    return remoteLessons.length ? remoteLessons : fallbackLessons;
  } catch (error) {
    console.warn("No pude leer lessons desde Firestore; uso seed local.", error);
    return fallbackLessons;
  }
}

async function getUserProgressRecords(userId) {
  const { firebaseReady, db } = getFirebaseContext();

  if (!firebaseReady) {
    return readLocalCollection(USER_PROGRESS_COLLECTION).filter((item) => item.userId === userId);
  }

  const snapshot = await firestoreApi.getDocs(
    firestoreApi.query(
      firestoreApi.collection(db, USER_PROGRESS_COLLECTION),
      firestoreApi.where("userId", "==", userId)
    )
  );

  return mapFirestoreDocs(snapshot);
}

async function getUserGamificationRecords(userId) {
  const { firebaseReady, db } = getFirebaseContext();

  if (!firebaseReady) {
    return readLocalCollection(USER_GAMIFICATION_COLLECTION).filter((item) => item.userId === userId);
  }

  const snapshot = await firestoreApi.getDocs(
    firestoreApi.query(
      firestoreApi.collection(db, USER_GAMIFICATION_COLLECTION),
      firestoreApi.where("userId", "==", userId)
    )
  );

  return mapFirestoreDocs(snapshot);
}

function upsertLocalRecord(collectionName, id, payload) {
  const collection = readLocalCollection(collectionName);
  const recordIndex = collection.findIndex((item) => item.id === id);
  const record = { id, ...payload };

  if (recordIndex >= 0) {
    collection[recordIndex] = record;
  } else {
    collection.push(record);
  }

  writeLocalCollection(collectionName, collection);
  return record;
}

async function upsertRemoteRecord(collectionName, id, payload) {
  const { db } = getFirebaseContext();
  await firestoreApi.setDoc(firestoreApi.doc(db, collectionName, id), payload);
  return { id, ...payload };
}

async function upsertRecord(collectionName, id, payload) {
  const { firebaseReady } = getFirebaseContext();
  return firebaseReady
    ? upsertRemoteRecord(collectionName, id, payload)
    : upsertLocalRecord(collectionName, id, payload);
}

function buildProgressRecordId(userId, lessonId) {
  return `${userId}_${lessonId}`;
}

function buildGamificationRecordId(userId, subjectName) {
  return `${userId}_${slugify(subjectName)}`;
}

function buildLeaderboardRecordId(groupId, userId) {
  return `${groupId}_${userId}`;
}

function resolveSubjectProgress(progressRecords, lessons) {
  const lessonIds = getLessonIds(lessons);
  return progressRecords.filter((record) => lessonIds.has(record.lessonId));
}

function resolveSubjectGamification(gamificationRecords, subjectName) {
  return gamificationRecords.find(
    (record) => normalizeLessonText(record.subjectName) === normalizeLessonText(subjectName)
  );
}

function buildSubjectSummary(subject, lessons, progressRecords, gamification) {
  const completedLessonIds = progressRecords
    .filter((record) => record.completed)
    .map((record) => record.lessonId);
  const completedCount = completedLessonIds.length;
  const totalLessons = lessons.length;

  return {
    subject,
    lessons,
    completedLessonIds,
    completedCount,
    totalLessons,
    completionPercent: totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0,
    totalXp: Number(gamification?.totalXp ?? 0),
    streak: Number(gamification?.streak ?? 0),
    gamification,
  };
}

async function getLeaderboardRowsForGroup(groupId) {
  const { firebaseReady, db } = getFirebaseContext();

  if (!firebaseReady) {
    return readLocalCollection(GROUP_LEADERBOARD_COLLECTION).filter(
      (record) => record.groupId === groupId
    );
  }

  const snapshot = await firestoreApi.getDocs(
    firestoreApi.query(
      firestoreApi.collection(db, GROUP_LEADERBOARD_COLLECTION),
      firestoreApi.where("groupId", "==", groupId)
    )
  );

  return mapFirestoreDocs(snapshot);
}

function compareLeaderboardRows(left, right) {
  return (
    Number(right.totalXp ?? 0) - Number(left.totalXp ?? 0) ||
    Number(right.streak ?? 0) - Number(left.streak ?? 0) ||
    Number(right.completedLessons ?? 0) - Number(left.completedLessons ?? 0) ||
    `${left.userName ?? ""}`.localeCompare(`${right.userName ?? ""}`, "es")
  );
}

function getRelevantGroups(subject, memberships, studyGroups) {
  const membershipIds = new Set((memberships ?? []).map((item) => item.groupId));
  return (studyGroups ?? []).filter(
    (group) => membershipIds.has(group.id) && isGroupForSubject(group, subject)
  );
}

export async function getLessonsOverview({ userId, subjects }) {
  const [progressRecords, gamificationRecords, lessonsPerSubject] = await Promise.all([
    getUserProgressRecords(userId),
    getUserGamificationRecords(userId),
    Promise.all((subjects ?? []).map((subject) => getLessonsForSubject(subject))),
  ]);

  return (subjects ?? []).map((subject, index) => {
    const lessons = lessonsPerSubject[index];
    const subjectProgress = resolveSubjectProgress(progressRecords, lessons);
    const gamification = resolveSubjectGamification(gamificationRecords, subject.name);

    return buildSubjectSummary(subject, lessons, subjectProgress, gamification);
  });
}

export async function getLessonRoadmap({ userId, subject }) {
  const [lessons, progressRecords, gamificationRecords] = await Promise.all([
    getLessonsForSubject(subject),
    getUserProgressRecords(userId),
    getUserGamificationRecords(userId),
  ]);

  const subjectProgress = resolveSubjectProgress(progressRecords, lessons);
  const gamification = resolveSubjectGamification(gamificationRecords, subject.name);
  const summary = buildSubjectSummary(subject, lessons, subjectProgress, gamification);
  const lessonsWithStatus = getLessonStatuses(lessons, summary.completedLessonIds);

  return {
    ...summary,
    lessons: lessonsWithStatus,
  };
}

export async function getLessonPlayer({ userId, subject, lessonId }) {
  const roadmap = await getLessonRoadmap({ userId, subject });
  const lesson = roadmap.lessons.find((item) => item.id === lessonId) ?? null;
  const progress = roadmap.completedLessonIds.includes(lessonId);

  if (!lesson) {
    return {
      ...roadmap,
      lesson: null,
      currentProgress: null,
      alreadyCompleted: false,
    };
  }

  const progressRecords = await getUserProgressRecords(userId);
  const currentProgress = progressRecords.find((item) => item.lessonId === lessonId) ?? null;

  return {
    ...roadmap,
    lesson,
    currentProgress,
    alreadyCompleted: progress,
  };
}

export async function submitLessonAttempt({
  user,
  profile,
  subject,
  lessonId,
  answers,
  memberships,
  studyGroups,
}) {
  const userId = user?.uid ?? user?.id;
  const roadmap = await getLessonRoadmap({ userId, subject });
  const lesson = roadmap.lessons.find((item) => item.id === lessonId);

  if (!lesson) {
    throw new Error("No encontré la lección seleccionada.");
  }

  if (lesson.status === "locked") {
    throw new Error("Completa la lección disponible antes de desbloquear esta.");
  }

  const evaluation = evaluateLessonAnswers(lesson, answers);
  const nowIso = new Date().toISOString();
  const todayKey = getTodayDateKey();
  const currentGamification = roadmap.gamification ?? null;
  const existingProgress = roadmap.completedLessonIds.includes(lessonId)
    ? (await getUserProgressRecords(userId)).find((item) => item.lessonId === lessonId) ?? null
    : null;
  const awardedXp = existingProgress?.completed ? 0 : evaluation.xpEarned;
  const updatedCompletedLessonIds = mergeCompletedLessonIds(
    currentGamification?.completedLessonIds,
    lessonId
  );
  const updatedStreak = calculateNextStreak(
    currentGamification?.lastStudyDate,
    Number(currentGamification?.streak ?? 0),
    todayKey
  );
  const updatedTotalXp = Number(currentGamification?.totalXp ?? 0) + awardedXp;

  await upsertRecord(USER_PROGRESS_COLLECTION, buildProgressRecordId(userId, lessonId), {
    userId,
    lessonId,
    subjectName: subject.name,
    completed: true,
    score: Math.max(Number(existingProgress?.score ?? 0), evaluation.score),
    xpEarned: Number(existingProgress?.xpEarned ?? awardedXp),
    completedAt: existingProgress?.completedAt ?? nowIso,
  });

  await upsertRecord(USER_GAMIFICATION_COLLECTION, buildGamificationRecordId(userId, subject.name), {
    userId,
    subjectName: subject.name,
    totalXp: updatedTotalXp,
    streak: updatedStreak,
    lastStudyDate: todayKey,
    completedLessonIds: updatedCompletedLessonIds,
  });

  const relevantGroups = getRelevantGroups(subject, memberships, studyGroups);
  const userName =
    profile?.name ?? user?.displayName ?? user?.name ?? user?.email ?? "Estudiante";

  await Promise.all(
    relevantGroups.map((group) =>
      upsertRecord(GROUP_LEADERBOARD_COLLECTION, buildLeaderboardRecordId(group.id, userId), {
        groupId: group.id,
        subjectName: group.subjectName ?? subject.name,
        userId,
        userName,
        totalXp: updatedTotalXp,
        streak: updatedStreak,
        completedLessons: updatedCompletedLessonIds.length,
        updatedAt: nowIso,
      })
    )
  );

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    lessonId,
    lessonTitle: lesson.title,
    score: evaluation.score,
    correctCount: evaluation.correctCount,
    totalQuestions: evaluation.totalQuestions,
    perfect: evaluation.perfect,
    bonusXp: evaluation.bonusXp,
    awardedXp,
    potentialXp: evaluation.xpEarned,
    alreadyCompleted: Boolean(existingProgress?.completed),
    streak: updatedStreak,
    totalXp: updatedTotalXp,
    completedLessons: updatedCompletedLessonIds.length,
    results: evaluation.results,
  };
}

export async function getSubjectLeaderboards({
  currentUserId,
  subject,
  memberships,
  studyGroups,
}) {
  const relevantGroups = getRelevantGroups(subject, memberships, studyGroups);

  if (!relevantGroups.length) {
    return [];
  }

  const groupsWithRows = await Promise.all(
    relevantGroups.map(async (group) => {
      const [groupDetail, leaderboardRows] = await Promise.all([
        getGroupDetail(group.id),
        getLeaderboardRowsForGroup(group.id),
      ]);

      const rowsByUser = new Map(leaderboardRows.map((row) => [row.userId, row]));

      const rankedMembers = (groupDetail.members ?? [])
        .map((member) => {
          const row = rowsByUser.get(member.userId);

          return {
            userId: member.userId,
            userName: row?.userName ?? member.profile?.name ?? "Integrante",
            totalXp: Number(row?.totalXp ?? 0),
            streak: Number(row?.streak ?? 0),
            completedLessons: Number(row?.completedLessons ?? 0),
            updatedAt: row?.updatedAt ?? null,
            role: member.role,
            isCurrentUser: member.userId === currentUserId,
          };
        })
        .sort(compareLeaderboardRows)
        .map((row, index) => ({
          ...row,
          rank: index + 1,
        }));

      return {
        group,
        members: rankedMembers,
      };
    })
  );

  return groupsWithRows;
}
