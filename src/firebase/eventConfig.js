import { EVENT_INFO } from "./mockData";

const OVERRIDE_KEY = "sg_event_info_override_v1";

/**
 * バックオフィスから保存されたイベント情報オーバーライドを読み込む。
 * localStorage になければデフォルトの EVENT_INFO (mockData) を返す。
 */
export function getEventOverride() {
  try {
    const raw = localStorage.getItem(OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getEventInfo() {
  const o = getEventOverride();
  return o ? { ...EVENT_INFO, ...o } : EVENT_INFO;
}

/** Vol.3 が「終了」扱いになっているか (status=ended or archived) */
export function isEventEnded() {
  const o = getEventOverride();
  if (!o) return false;
  if (o.status === "ended") return true;
  if (o.endsAt && Date.parse(o.endsAt) < Date.now()) return true;
  return false;
}

export function setEventOverride(patch) {
  const current = getEventOverride() || {};
  const next = { ...EVENT_INFO, ...current, ...patch };
  try {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(next));
  } catch (e) {
    /* storage full/unsupported — in-memory only */
  }
  return next;
}
