import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, getDocs,
  query, where, orderBy, limit, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

/** Niveles válidos (compartido con board.js/DIFICULTAD). */
export const NIVELES = ['facil', 'normal', 'dificil'];

export function nivelValido(nivel) {
  return NIVELES.includes(nivel) ? nivel : 'normal';
}

// ---- Configuración Firebase (proyecto "memorycard") ----
// Pega aquí la config de Console → Project settings → Your apps (Web).
const firebaseConfig = {
  apiKey: 'AIzaSyBUUR7gOK7Ikqd1vVjA447Dj2M-V4YDnnI',
  authDomain: 'memorycard-ef8b4.firebaseapp.com',
  projectId: 'memorycard-ef8b4',
};

const CONFIGURADO = !firebaseConfig.apiKey.startsWith('PEGA_AQUI');

let db = null;
if (CONFIGURADO) {
  db = getFirestore(initializeApp(firebaseConfig));
}

// ---- Fallback local (siempre disponible, aunque caiga la nube) ----
// Una clave por nivel para no mezclar rankings.
const claveLocal = (nivel) => `memorycard_scores_v1_${nivelValido(nivel)}`;

function leerLocal(nivel) {
  try {
    return JSON.parse(localStorage.getItem(claveLocal(nivel))) ?? [];
  } catch {
    return [];
  }
}

function guardarLocal(initials, time, nivel) {
  nivel = nivelValido(nivel);
  const lista = leerLocal(nivel);
  lista.push({ initials, time, nivel, offline: true, createdAt: Date.now() });
  lista.sort((a, b) => a.time - b.time);
  localStorage.setItem(claveLocal(nivel), JSON.stringify(lista.slice(0, 10)));
}

/**
 * Guarda una puntuación. Intenta Firestore y, si falla (o no hay config),
 * cae a localStorage. La demo nunca se queda sin ranking.
 */
export async function saveScore(initials, time, nivel) {
  nivel = nivelValido(nivel);
  if (db) {
    try {
      await addDoc(collection(db, 'scores'), { initials, time, nivel, createdAt: serverTimestamp() });
      return { nube: true };
    } catch (e) {
      console.warn('Firestore no disponible, guardo en local:', e.message);
    }
  }
  guardarLocal(initials, time, nivel);
  return { nube: false };
}

/**
 * Top 10. Nube primero; local si la nube falla. Marca las locales no
 * sincronizadas para subirlas cuando haya conexión (best-effort).
 */
export async function getTopScores(nivel) {
  nivel = nivelValido(nivel);
  if (db) {
    try {
      // Requiere índice compuesto: scores(nivel ASC, time ASC). Se crea una
      // sola vez en consola (el error trae el enlace directo si falta).
      const q = query(collection(db, 'scores'),
        where('nivel', '==', nivel), orderBy('time', 'asc'), limit(10));
      const snap = await getDocs(q);
      const nube = snap.docs.map(d => d.data());
      // Sincroniza pendientes locales en segundo plano, sin bloquear.
      subirPendientes(nivel);
      if (nube.length > 0) return nube;
    } catch (e) {
      console.warn('Ranking en la nube no disponible, uso local:', e.message);
    }
  }
  return leerLocal(nivel);
}

async function subirPendientes(nivel) {
  if (!db) return;
  nivel = nivelValido(nivel);
  const pendientes = leerLocal(nivel).filter(s => s.offline);
  if (pendientes.length === 0) return;
  try {
    await Promise.all(pendientes.map(s =>
      addDoc(collection(db, 'scores'), {
        initials: s.initials, time: s.time, nivel,
        createdAt: serverTimestamp(),
      })));
    localStorage.setItem(claveLocal(nivel), JSON.stringify(
      leerLocal(nivel).filter(s => !s.offline).slice(0, 10)));
  } catch {
    // Se reintentará en la próxima carga; el ranking local sigue valiendo.
  }
}
