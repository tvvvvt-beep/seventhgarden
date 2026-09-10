import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isConfigured } from "./config";

const LS_KEY = "sg_backoffice_state_v1";

/**
 * バックオフィス状態 (告知戦略・イベント設定オーバーライド) の永続化。
 * - localStorage が一次ソース (端末内で即反映)
 * - Firestore `admin/backoffice` ドキュメントを best-effort 同期
 *   (セキュリティルールが許可している場合、端末を跨いで共有される)
 */
export function loadLocalState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function saveLocalState(state) {
  const next = { ...state, updatedAt: Date.now() };
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch (e) {
    /* storage full/unsupported */
  }
  return next;
}

/**
 * localStorage + Firestore をマージして読む。
 * Firestore が新しければそれを採用 (端末間共有)。
 */
export async function loadBackOffice() {
  const local = loadLocalState();
  let remote = null;
  if (isConfigured && db) {
    try {
      const snap = await getDoc(doc(db, "admin", "backoffice"));
      if (snap.exists()) remote = snap.data();
    } catch (e) {
      /* ルールが拒否 — ローカルのみで動く */
    }
  }
  if (remote && remote.updatedAt) {
    if (!local || remote.updatedAt > (local.updatedAt || 0)) {
      const merged = { ...local, ...remote };
      if (local) saveLocalState(merged);
      return merged;
    }
  }
  return local;
}

export async function saveBackOffice(state) {
  const saved = saveLocalState(state);
  if (isConfigured && db) {
    try {
      await setDoc(doc(db, "admin", "backoffice"), {
        ...state,
        updatedAt: saved.updatedAt,
        updatedAtIso: new Date().toISOString(),
        ts: serverTimestamp()
      });
    } catch (e) {
      /* 書き込み拒否は無視 (ローカルに既に保存済み) */
    }
  }
  return saved;
}
