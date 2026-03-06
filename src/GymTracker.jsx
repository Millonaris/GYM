import { useState, useEffect, useCallback, useRef, memo } from "react";

/* ═══════════════════════════════════════════
   ROUTINES DATA
   ═══════════════════════════════════════════ */
const R = {
  torsoA: {
    id: "torsoA", name: "Torso A", sub: "Espalda + Hombros 3D", icon: "💪", type: "torso",
    ex: [
      { id: "ta1", name: "Dominadas / Jalón", sets: 4, reps: "8-12", rest: 120, notes: "Excéntrica 3s", fallo: false },
      { id: "ta2", name: "Press inclinado manc.", sets: 4, reps: "8-12", rest: 120, notes: "Pecho superior", fallo: false },
      { id: "ta3", name: "Remo barra / máquina", sets: 3, reps: "8-12", rest: 90, notes: "", fallo: false },
      { id: "ta4", name: "Press militar manc.", sets: 3, reps: "8-12", rest: 90, notes: "", fallo: false },
      { id: "ta5", name: "Elevaciones laterales", sets: 4, reps: "12-20", rest: 50, notes: "Hombros 3D", fallo: true },
      { id: "ta6", name: "Face pull / Pájaro", sets: 3, reps: "12-20", rest: 50, notes: "Delt. posterior", fallo: true },
      { id: "ta7", name: "Tríceps polea", sets: 2, reps: "10-15", rest: 60, notes: "", fallo: true },
      { id: "ta8", name: "Curl bíceps", sets: 2, reps: "10-15", rest: 60, notes: "", fallo: true },
    ],
    mini: [{ id: "ta9", name: "Extensión cuádriceps", sets: 2, reps: "12-15", rest: 60, notes: "Mini pierna", fallo: true }]
  },
  torsoB: {
    id: "torsoB", name: "Torso B", sub: "Pecho + Espalda + Brazos", icon: "🔥", type: "torso",
    ex: [
      { id: "tb1", name: "Press banca / máquina", sets: 4, reps: "8-12", rest: 120, notes: "", fallo: false },
      { id: "tb2", name: "Remo cable / 1 mano", sets: 4, reps: "8-12", rest: 90, notes: "Grosor espalda", fallo: false },
      { id: "tb3", name: "Jalón neutro cerrado", sets: 3, reps: "8-12", rest: 90, notes: "", fallo: false },
      { id: "tb4", name: "Aperturas máq./cable", sets: 2, reps: "12-20", rest: 60, notes: "", fallo: true },
      { id: "tb5", name: "Elevaciones laterales", sets: 4, reps: "12-20", rest: 50, notes: "", fallo: true },
      { id: "tb6", name: "Curl bíceps inclinado", sets: 3, reps: "8-12", rest: 70, notes: "", fallo: true },
      { id: "tb7", name: "Tríceps sobre cabeza", sets: 3, reps: "8-12", rest: 70, notes: "", fallo: true },
    ],
    mini: [
      { id: "tb8", name: "Curl femoral", sets: 2, reps: "10-15", rest: 60, notes: "Mini pierna", fallo: true },
      { id: "tb9", name: "Gemelos", sets: 2, reps: "12-20", rest: 45, notes: "Mini pierna", fallo: true }
    ]
  },
  piernaA: {
    id: "piernaA", name: "Pierna A", sub: "Cuádriceps + Glúteos", icon: "🦵", type: "pierna",
    ex: [
      { id: "pa1", name: "Prensa inclinada", sets: 4, reps: "8-12", rest: 150, notes: "Pies arriba = + glúteo", fallo: false },
      { id: "pa2", name: "Hack squat / Sent. máq.", sets: 3, reps: "8-12", rest: 120, notes: "Estable", fallo: false },
      { id: "pa3", name: "Extensión cuádriceps", sets: 3, reps: "10-15", rest: 60, notes: "Rest-pause última", fallo: true },
      { id: "pa4", name: "Curl femoral tumbado", sets: 3, reps: "10-15", rest: 70, notes: "", fallo: true },
      { id: "pa5", name: "Curl femoral sentado", sets: 2, reps: "10-15", rest: 60, notes: "", fallo: true },
      { id: "pa6", name: "Abductora", sets: 3, reps: "15-20", rest: 50, notes: "Glúteo medio", fallo: true },
      { id: "pa7", name: "Gemelos de pie", sets: 4, reps: "10-20", rest: 50, notes: "Pausa abajo 2s", fallo: true },
    ],
    mini: []
  },
  piernaB: {
    id: "piernaB", name: "Pierna B", sub: "Isquios + Glúteo", icon: "🍑", type: "pierna",
    ex: [
      { id: "pb1", name: "Hip thrust máq./Smith", sets: 4, reps: "8-12", rest: 120, notes: "Aprieta arriba 2s", fallo: false },
      { id: "pb2", name: "Prensa pies juntos", sets: 3, reps: "10-15", rest: 90, notes: "Rango completo", fallo: false },
      { id: "pb3", name: "Curl femoral tumbado", sets: 3, reps: "10-15", rest: 70, notes: "", fallo: true },
      { id: "pb4", name: "Curl femoral sentado", sets: 3, reps: "10-15", rest: 60, notes: "Drop set última", fallo: true },
      { id: "pb5", name: "Extensión cuádriceps", sets: 2, reps: "12-15", rest: 60, notes: "", fallo: true },
      { id: "pb6", name: "Abductora", sets: 3, reps: "15-20", rest: 50, notes: "Glúteo medio", fallo: true },
      { id: "pb7", name: "Aductora", sets: 2, reps: "15-20", rest: 50, notes: "", fallo: true },
      { id: "pb8", name: "Gemelos sentado", sets: 4, reps: "10-20", rest: 50, notes: "", fallo: true },
    ],
    mini: []
  }
};

const allExOf = (id) => [...R[id].ex, ...R[id].mini];

/* ═══════════════════════════════════════════
   STORAGE — safe, with timeouts, error-proof
   ═══════════════════════════════════════════ */
const LS = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
const UID_KEY = "gym-uid";
const KEY_TO_FIELD = { "gym-h": "history", "gym-a": "active" };
const BACKUP_LATEST_KEY = "gym-backup-latest";
const REMOTE_ENABLED = import.meta.env.VITE_REMOTE_SYNC === "1";

function getUid() {
  if (!LS) return null;
  try {
    let uid = LS.getItem(UID_KEY);
    if (!uid) {
      uid = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `gym-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      LS.setItem(UID_KEY, uid);
    }
    return uid;
  } catch {
    return null;
  }
}

const UID = getUid();
let remoteStatePromise = null;
let pendingPatch = {};
let flushTimer = null;

function localLoad(k, fb) {
  if (!LS) return fb;
  try {
    const raw = LS.getItem(k);
    return raw ? JSON.parse(raw) : fb;
  } catch {
    return fb;
  }
}

function localSave(k, v) {
  if (!LS) return;
  try {
    LS.setItem(k, JSON.stringify(v));
  } catch {}
}

async function apiFetch(url, opts = {}, ms = 3500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function loadRemoteState() {
  if (!REMOTE_ENABLED || !UID) return null;
  try {
    const res = await apiFetch(`/api/state?uid=${encodeURIComponent(UID)}`);
    if (!res.ok) return null;
    const body = await res.json();
    if (!body || typeof body !== "object") return null;
    if (Object.prototype.hasOwnProperty.call(body, "history")) localSave("gym-h", body.history ?? []);
    if (Object.prototype.hasOwnProperty.call(body, "active")) localSave("gym-a", body.active ?? null);
    return body;
  } catch {
    return null;
  }
}

function scheduleRemoteFlush(delay = 700) {
  if (!REMOTE_ENABLED || !UID || flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushRemotePatch();
  }, delay);
}

async function flushRemotePatch(keepalive = false) {
  if (!REMOTE_ENABLED || !UID || Object.keys(pendingPatch).length === 0) return;
  const patch = pendingPatch;
  pendingPatch = {};
  try {
    await fetch(`/api/state?uid=${encodeURIComponent(UID)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
      keepalive,
    });
  } catch {
    pendingPatch = { ...patch, ...pendingPatch };
  }
}

function queueRemoteSave(k, v) {
  const field = KEY_TO_FIELD[k];
  if (!REMOTE_ENABLED || !field || !UID) return;
  pendingPatch[field] = v;
  scheduleRemoteFlush();
}

if (REMOTE_ENABLED && typeof window !== "undefined" && !window.__gymRemoteFlushBound) {
  window.__gymRemoteFlushBound = true;
  const flushOnLeave = () => { void flushRemotePatch(true); };
  window.addEventListener("beforeunload", flushOnLeave);
  window.addEventListener("pagehide", flushOnLeave);
}

async function dbLoad(k, fb) {
  const local = localLoad(k, fb);
  const field = KEY_TO_FIELD[k];
  if (!field || !REMOTE_ENABLED) return local;
  if (!remoteStatePromise) remoteStatePromise = loadRemoteState();
  try {
    const remote = await remoteStatePromise;
    if (!remote || !Object.prototype.hasOwnProperty.call(remote, field)) return local;
    const value = remote[field];
    localSave(k, value);
    return value ?? fb;
  } catch {
    return local;
  }
}
async function dbSave(k, v) {
  // Sync write first to survive app close/tab kill.
  localSave(k, v);
  queueRemoteSave(k, v);
}

function makeBackupPayload(history, active) {
  return {
    app: "GymTracker",
    version: 1,
    createdAt: new Date().toISOString(),
    data: { history, active },
  };
}

function downloadBackupFile(payload) {
  if (typeof document === "undefined") return;
  const ts = new Date(payload?.createdAt || Date.now());
  const stamp = `${ts.getFullYear()}${String(ts.getMonth() + 1).padStart(2, "0")}${String(ts.getDate()).padStart(2, "0")}-${String(ts.getHours()).padStart(2, "0")}${String(ts.getMinutes()).padStart(2, "0")}${String(ts.getSeconds()).padStart(2, "0")}`;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gymtracker-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════
   ISOLATED TIMER — uses only internal state,
   parent NEVER re-renders when timer ticks
   ═══════════════════════════════════════════ */
const RestTimer = memo(function RestTimer({ defaultRest, triggerRef }) {
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState(defaultRest || 90);
  const iv = useRef(null);

  useEffect(() => { setTarget(defaultRest || 90); }, [defaultRest]);
  useEffect(() => () => { if (iv.current) clearInterval(iv.current); }, []);

  const go = useCallback((t) => {
    if (iv.current) clearInterval(iv.current);
    const dur = t || target;
    setSecs(dur);
    setRunning(true);
    iv.current = setInterval(() => {
      setSecs(p => {
        if (p <= 1) {
          clearInterval(iv.current); iv.current = null;
          setRunning(false);
          try { navigator.vibrate?.([200, 100, 200]); } catch {}
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }, [target]);

  useEffect(() => { if (triggerRef) triggerRef.current = go; }, [go, triggerRef]);

  const stop = () => { if (iv.current) { clearInterval(iv.current); iv.current = null; } setRunning(false); };
  const reset = () => { stop(); setSecs(0); };
  const fmt = s => s <= 0 ? "0:00" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const active = running || secs > 0;

  const chipStyle = (s) => ({
    padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700,
    border: `2px solid ${target === s ? "#3b82f6" : "#e5e7eb"}`,
    background: target === s ? "#dbeafe" : "#f9fafb",
    color: target === s ? "#2563eb" : "#6b7280", cursor: "pointer"
  });

  return (
    <div style={{ padding: "0 12px", marginTop: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#9ca3af", padding: "6px 0" }}>Descanso:</span>
        {[45, 60, 90, 120, 150].map(s => (
          <button key={s} onClick={() => { stop(); setTarget(s); setSecs(s); }} style={chipStyle(s)}>{s}s</button>
        ))}
      </div>
      {active ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <button onClick={reset} style={{ padding: "8px 14px", borderRadius: 10, background: "#f3f4f6", border: "none", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✕</button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 36, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: secs <= 5 && secs > 0 && running ? "#f97316" : secs <= 0 ? "#22c55e" : "#111827" }}>
            {secs > 0 ? fmt(secs) : "¡VAMOS!"}
          </div>
          {running
            ? <button onClick={stop} style={{ padding: "8px 18px", borderRadius: 10, background: "#ef4444", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Parar</button>
            : <button onClick={() => go(secs > 0 ? secs : target)} style={{ padding: "8px 18px", borderRadius: 10, background: "#3b82f6", color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Seguir</button>}
        </div>
      ) : (
        <button onClick={() => go(target)} style={{ width: "100%", padding: 12, borderRadius: 12, background: "#eff6ff", border: "2px solid #bfdbfe", color: "#2563eb", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 8 }}>
          ⏱ Iniciar descanso ({target}s)
        </button>
      )}
    </div>
  );
});

/* ═══════════════════════════════════════════
   ISOLATED SET ROW — typing NEVER triggers
   parent re-render. Only internal state.
   ═══════════════════════════════════════════ */
const SetRow = memo(function SetRow({ idx, initWeight, initReps, initDone, onSave, onToggle }) {
  const wRef = useRef(null);
  const rRef = useRef(null);
  const [done, setDone] = useState(initDone);

  const flush = useCallback(() => {
    const w = wRef.current ? parseFloat(wRef.current.value) || 0 : 0;
    const r = rRef.current ? parseInt(rRef.current.value) || 0 : 0;
    onSave(idx, w, r);
  }, [idx, onSave]);

  const handleToggle = () => {
    flush();
    const next = !done;
    setDone(next);
    onToggle(idx, next);
  };

  const border = done ? "#86efac" : "#e5e7eb";
  const bg = done ? "#f0fdf4" : "#ffffff";

  return (
    <div style={{ background: bg, border: `2px solid ${border}`, borderRadius: 14, padding: 12, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: done ? "#16a34a" : "#9ca3af" }}>Serie {idx + 1}</span>
        <button onClick={handleToggle}
          style={{ padding: "8px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: `2px solid ${done ? "#22c55e" : "#d1d5db"}`, background: done ? "#22c55e" : "#fff", color: done ? "#fff" : "#9ca3af", cursor: "pointer" }}>
          {done ? "✓ Hecho" : "Marcar ✓"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>Peso (kg)</label>
          <input ref={wRef} type="number" inputMode="decimal" placeholder="0"
            defaultValue={initWeight || ""}
            onInput={flush}
            onBlur={flush}
            style={{ width: "100%", background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 12, padding: "14px 8px", textAlign: "center", fontSize: 20, fontWeight: 700, outline: "none", boxSizing: "border-box", WebkitAppearance: "none", MozAppearance: "textfield" }} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>Reps</label>
          <input ref={rRef} type="number" inputMode="numeric" placeholder="0"
            defaultValue={initReps || ""}
            onInput={flush}
            onBlur={flush}
            style={{ width: "100%", background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: 12, padding: "14px 8px", textAlign: "center", fontSize: 20, fontWeight: 700, outline: "none", boxSizing: "border-box", WebkitAppearance: "none", MozAppearance: "textfield" }} />
        </div>
      </div>
    </div>
  );
});

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function GymTracker() {
  const [view, setView] = useState("home");
  const [hist, setHist] = useState([]);
  const [rid, setRid] = useState(null);
  const [eidx, setEidx] = useState(0);
  const dataRef = useRef({});
  const doneRef = useRef({});
  const [ver, setVer] = useState(0);
  const tRef = useRef(null);
  const startRef = useRef(null);
  const readyRef = useRef(false);
  const backupFileRef = useRef(null);
  const [calM, setCalM] = useState(new Date().getMonth());
  const [calY, setCalY] = useState(new Date().getFullYear());
  const [detW, setDetW] = useState(null);

  // Load on mount
  useEffect(() => {
    Promise.all([dbLoad("gym-h", []), dbLoad("gym-a", null)]).then(([h, a]) => {
      const backup = localLoad(BACKUP_LATEST_KEY, null);
      const bh = Array.isArray(backup?.data?.history) ? backup.data.history : [];
      const ba = backup?.data?.active;
      const effectiveHist = h?.length ? h : bh;
      const effectiveActive = a?.rid ? a : (ba?.rid ? ba : null);

      if (effectiveHist?.length) setHist(effectiveHist);
      if (effectiveActive?.rid && R[effectiveActive.rid]) {
        dataRef.current = effectiveActive.data || {};
        doneRef.current = effectiveActive.done || {};
        setRid(effectiveActive.rid);
        setEidx(effectiveActive.eidx || 0);
        startRef.current = effectiveActive.st || Date.now();
        // Restore exact screen
        setView(effectiveActive.view === "workout" ? "workout" : "routine");
      }
      readyRef.current = true;
    }).catch(() => { readyRef.current = true; });
  }, []);

  // Save history
  useEffect(() => { if (readyRef.current) dbSave("gym-h", hist); }, [hist]);

  // Save active — includes current screen and exercise index
  const saveActive = useCallback((overrideView, overrideEidx) => {
    if (!rid) {
      dbSave("gym-a", null);
      localSave(BACKUP_LATEST_KEY, makeBackupPayload(hist, null));
      return;
    }
    const active = {
      rid,
      data: dataRef.current,
      done: doneRef.current,
      st: startRef.current,
      eidx: overrideEidx !== undefined ? overrideEidx : eidx,
      view: overrideView || view,
    };
    dbSave("gym-a", active);
    localSave(BACKUP_LATEST_KEY, makeBackupPayload(hist, active));
  }, [rid, eidx, view, hist]);

  const getActiveSnapshot = useCallback((override) => {
    if (override !== undefined) return override;
    if (!rid) return null;
    return {
      rid,
      data: dataRef.current,
      done: doneRef.current,
      st: startRef.current,
      eidx,
      view,
    };
  }, [rid, eidx, view]);

  const createBackup = useCallback((historyOverride, activeOverride) => {
    const payload = makeBackupPayload(historyOverride ?? hist, getActiveSnapshot(activeOverride));
    localSave(BACKUP_LATEST_KEY, payload);
    return payload;
  }, [hist, getActiveSnapshot]);

  const exportBackup = useCallback(() => {
    const payload = createBackup();
    downloadBackupFile(payload);
  }, [createBackup]);

  const importBackup = useCallback(async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const body = parsed?.data && typeof parsed.data === "object" ? parsed.data : parsed;
      const nextHist = Array.isArray(body?.history) ? body.history : null;
      const nextActive = body?.active ?? null;
      if (!nextHist) throw new Error("invalid_history");

      setHist(nextHist);
      dbSave("gym-h", nextHist);

      let restoredActive = null;
      if (nextActive?.rid && R[nextActive.rid]) {
        dataRef.current = nextActive.data || {};
        doneRef.current = nextActive.done || {};
        setRid(nextActive.rid);
        setEidx(nextActive.eidx || 0);
        startRef.current = nextActive.st || Date.now();
        setView(nextActive.view === "workout" ? "workout" : "routine");
        dbSave("gym-a", nextActive);
        restoredActive = nextActive;
      } else {
        dataRef.current = {};
        doneRef.current = {};
        setRid(null);
        setEidx(0);
        startRef.current = null;
        setView("home");
        dbSave("gym-a", null);
      }
      localSave(BACKUP_LATEST_KEY, makeBackupPayload(nextHist, restoredActive));
      setVer(v => v + 1);
      alert("Backup cargado correctamente.");
    } catch {
      alert("No se pudo cargar el backup. El archivo no es válido.");
    }
  }, []);

  // Extra safety: flush active session on app background/close.
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    const flush = () => {
      if (!readyRef.current) return;
      saveActive();
      void flushRemotePatch(true);
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") flush(); };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [saveActive]);

  // Periodic checkpoint while training in case the process is killed.
  useEffect(() => {
    if (!readyRef.current || !rid) return;
    const iv = setInterval(() => saveActive(), 15000);
    return () => clearInterval(iv);
  }, [rid, saveActive]);

  // Open routine
  const openRoutine = useCallback((id) => {
    if (rid && rid !== id && Object.keys(dataRef.current).length > 0) {
      const ok = confirm(`Ya tienes un entrenamiento en curso (${R[rid]?.name || rid}). Si abres ${R[id]?.name || id}, perderás la sesión actual. ¿Continuar?`);
      if (!ok) {
        saveActive("routine");
        setView("routine");
        return;
      }
    }
    if (rid === id && Object.keys(dataRef.current).length > 0) {
      // Resume — don't reset eidx, keep where we were
      setView("routine");
      saveActive("routine");
      return;
    }
    const exs = allExOf(id);
    const d = {}, dn = {};
    exs.forEach(e => {
      d[e.id] = Array.from({ length: e.sets }, () => ({ weight: 0, reps: 0 }));
      dn[e.id] = Array.from({ length: e.sets }, () => false);
    });
    const prev = hist.filter(w => w.routine === id).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (prev?.exercises) {
      Object.entries(prev.exercises).forEach(([eid, ed]) => {
        if (d[eid]) ed.sets.forEach((s, i) => {
          if (d[eid][i] && s.done) { d[eid][i].weight = s.weight || 0; d[eid][i].reps = s.reps || 0; }
        });
      });
    }
    dataRef.current = d;
    doneRef.current = dn;
    setRid(id);
    setEidx(0);
    startRef.current = Date.now();
    setVer(v => v + 1);
    setView("routine");
    // Save after state updates via timeout
    setTimeout(() => dbSave("gym-a", { rid: id, data: d, done: dn, st: Date.now(), eidx: 0, view: "routine" }), 50);
  }, [rid, hist, saveActive]);

  // Set handlers — save to storage on every change
  const onSaveSet = useCallback((si, w, r) => {
    if (!rid) return;
    const e = allExOf(rid)[eidx];
    if (dataRef.current[e.id]?.[si]) {
      dataRef.current[e.id][si] = { weight: w, reps: r };
      saveActive("workout");
    }
  }, [rid, eidx, saveActive]);

  const onToggleSet = useCallback((si, val) => {
    if (!rid) return;
    const e = allExOf(rid)[eidx];
    if (doneRef.current[e.id]) {
      doneRef.current[e.id][si] = val;
      saveActive("workout");
      if (val && tRef.current) tRef.current(e.rest);
    }
  }, [rid, eidx, saveActive]);

  const addSet = useCallback(() => {
    if (!rid) return;
    const e = allExOf(rid)[eidx];
    dataRef.current[e.id] = [...(dataRef.current[e.id] || []), { weight: 0, reps: 0 }];
    doneRef.current[e.id] = [...(doneRef.current[e.id] || []), false];
    setVer(v => v + 1);
    saveActive("workout");
  }, [rid, eidx, saveActive]);

  // Navigate exercises — save position
  const goExercise = useCallback((newIdx) => {
    setEidx(newIdx);
    setTimeout(() => saveActive("workout", newIdx), 30);
  }, [saveActive]);

  const goToRoutineView = useCallback(() => {
    setVer(v => v + 1);
    setView("routine");
    saveActive("routine");
  }, [saveActive]);

  const goToWorkout = useCallback((idx) => {
    setEidx(idx);
    setView("workout");
    setTimeout(() => saveActive("workout", idx), 30);
  }, [saveActive]);

  const finish = () => {
    const dur = Math.round((Date.now() - startRef.current) / 60000);
    const exObj = {};
    Object.entries(dataRef.current).forEach(([eid, sets]) => {
      exObj[eid] = { sets: sets.map((s, i) => ({ ...s, done: doneRef.current[eid]?.[i] || false })) };
    });
    const doneWorkout = { id: Date.now(), date: new Date().toISOString(), routine: rid, exercises: exObj, duration: dur };
    const nextHist = [doneWorkout, ...hist];
    setHist(nextHist);
    dbSave("gym-h", nextHist);
    const payload = createBackup(nextHist, null);
    downloadBackupFile(payload);
    dataRef.current = {}; doneRef.current = {};
    setRid(null); dbSave("gym-a", null); setView("home");
  };

  const discard = () => {
    if (!confirm("¿Descartar entrenamiento?")) return;
    dataRef.current = {}; doneRef.current = {};
    setRid(null); dbSave("gym-a", null); setView("home");
  };

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayF = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const css = {
    page: { height: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f7", color: "#1c1c1e", fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto", overflow: "hidden", position: "relative" },
    hdr: { background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "12px 16px", flexShrink: 0 },
    body: { flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 80 },
    btn: (bg, cl) => ({ padding: "14px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", background: bg, color: cl, flex: 1, textAlign: "center" }),
    lbl: { padding: "16px 16px 6px", fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
    back: { width: 34, height: 34, borderRadius: "50%", background: "#f3f4f6", border: "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  };

  // ═════ HOME ═════
  if (view === "home") {
    const today = new Date();
    return (
      <div style={css.page}>
        <div style={css.hdr}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🏋️ GymTracker</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{dayF[today.getDay()]} {today.getDate()} de {months[today.getMonth()]}</div>
        </div>
        <div style={css.body}>
          <input
            ref={backupFileRef}
            type="file"
            accept="application/json,.json"
            onChange={importBackup}
            style={{ display: "none" }}
          />
          {rid && (
            <div onClick={() => { setView(rid ? "routine" : "home"); }}
              style={{ margin: "10px 12px", padding: 14, background: "#dcfce7", border: "2px solid #86efac", borderRadius: 14, cursor: "pointer" }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#166534" }}>▶ Entrenamiento en curso</div>
              <div style={{ fontSize: 13, color: "#15803d", marginTop: 2 }}>Toca para continuar — {R[rid]?.icon} {R[rid]?.name}</div>
            </div>
          )}
          <div style={css.lbl}>Elige tu rutina</div>
          <div style={{ padding: "0 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(R).map(([id, r]) => {
              const isTorso = r.type === "torso";
              const accent = isTorso ? "#3b82f6" : "#f97316";
              const gradBg = isTorso ? "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)" : "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)";
              return (
                <button key={id} onClick={() => openRoutine(id)}
                  style={{ background: gradBg, border: `2px solid ${isTorso ? "#bfdbfe" : "#fed7aa"}`, borderRadius: 18, padding: "18px 14px", textAlign: "center", cursor: "pointer", boxShadow: `0 2px 8px ${isTorso ? "rgba(59,130,246,0.1)" : "rgba(249,115,22,0.1)"}` }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#1c1c1e" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, lineHeight: 1.3 }}>{r.sub}</div>
                </button>
              );
            })}
          </div>
          <div style={{ margin: "12px 12px 0", padding: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#1d4ed8", marginBottom: 4 }}>📅 DISTRIBUCIÓN</div>
            <div style={{ fontSize: 11, color: "#3b82f6", lineHeight: 1.6 }}>
              <b>4 días:</b> Torso A → Pierna A → Torso B → Pierna B<br />
              <b>3 días:</b> Pierna A → Torso A/B → Pierna B
            </div>
          </div>
          <div style={{ margin: "10px 12px 0", padding: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 12, color: "#111827", marginBottom: 8 }}>💾 Backup total</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={exportBackup}
                style={{ ...css.btn("#111827", "#fff"), fontSize: 13, padding: "10px 0" }}
              >
                Descargar backup
              </button>
              <button
                onClick={() => backupFileRef.current?.click()}
                style={{ ...css.btn("#fff", "#111827"), fontSize: 13, padding: "10px 0", border: "1px solid #d1d5db" }}
              >
                Cargar backup
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
              Al terminar entrenamiento también se descarga una copia automática.
            </div>
          </div>
          {hist.length > 0 && <>
            <div style={css.lbl}>Últimos entrenamientos</div>
            {hist.slice(0, 3).map(w => <HistCard key={w.id} w={w} onTap={() => { setDetW(w); setView("detail"); }} />)}
          </>}
          <Cal m={calM} y={calY} hist={hist}
            onPrev={() => { let m = calM - 1, y = calY; if (m < 0) { m = 11; y--; } setCalM(m); setCalY(y); }}
            onNext={() => { let m = calM + 1, y = calY; if (m > 11) { m = 0; y++; } setCalM(m); setCalY(y); }} />
        </div>
        <BNav act="home" go={setView} />
      </div>
    );
  }

  // ═════ ROUTINE ═════
  if (view === "routine" && rid) {
    const r = R[rid], exs = allExOf(rid), dn = doneRef.current;
    const cnt = exs.filter(e => dn[e.id]?.length >= e.sets && dn[e.id].slice(0, e.sets).every(Boolean)).length;
    const pct = Math.round((cnt / exs.length) * 100);
    const isTorso = r.type === "torso";
    const accent = isTorso ? "#3b82f6" : "#f97316";
    const accentLight = isTorso ? "#eff6ff" : "#fff7ed";
    return (
      <div style={css.page}>
        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <button onClick={() => { saveActive("routine"); setView("home"); }} style={css.back}>‹</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{r.icon} {r.name}</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>{r.sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{cnt}/{exs.length}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: cnt === exs.length ? "#22c55e" : accent, borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={css.body}>
          <div style={css.lbl}>Toca un ejercicio para registrar</div>
          {r.ex.map((e, i) => <ExBtn key={e.id} e={e} i={i} tp={r.type} dn={dn[e.id]} onTap={() => goToWorkout(i)} />)}
          {r.mini.length > 0 && <>
            <div style={{ margin: "14px 12px 8px", padding: "8px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🦵</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#ea580c", textTransform: "uppercase", letterSpacing: 0.5 }}>Mini pierna</span>
              <span style={{ fontSize: 11, color: "#fb923c" }}>— estímulo extra</span>
            </div>
            {r.mini.map((e, i) => <ExBtn key={e.id} e={e} i={r.ex.length + i} tp="pierna" dn={dn[e.id]} onTap={() => goToWorkout(r.ex.length + i)} />)}
          </>}
          <div style={{ padding: "16px 12px", display: "flex", gap: 10 }}>
            <button onClick={discard} style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: "2px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 15, color: "#6b7280", cursor: "pointer" }}>Descartar</button>
            <button onClick={finish} disabled={cnt < 1} style={{ flex: 1.5, padding: "14px 0", borderRadius: 14, border: "none", background: cnt < 1 ? "#d1d5db" : "#22c55e", fontWeight: 700, fontSize: 15, color: "#fff", cursor: cnt < 1 ? "default" : "pointer", boxShadow: cnt < 1 ? "none" : "0 4px 12px rgba(34,197,94,0.3)" }}>Terminar ✓</button>
          </div>
        </div>
      </div>
    );
  }

  // ═════ WORKOUT ═════
  if (view === "workout" && rid) {
    const exs = allExOf(rid), e = exs[eidx];
    const sets = dataRef.current[e.id] || [];
    const dn = doneRef.current[e.id] || [];
    const hasPrev = hist.some(w => w.routine === rid && w.exercises?.[e.id]?.sets.some(s => s.done));

    return (
      <div style={css.page}>
        <div style={{ ...css.hdr, display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={goToRoutineView} style={css.back}>‹</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{eidx + 1} de {exs.length}</div>
          </div>
        </div>
        <div style={css.body}>
          {/* Exercise info */}
          <div style={{ margin: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "#4b5563" }}>{e.sets} series × {e.reps} reps · Descanso {e.rest}s</div>
            {e.notes && <div style={{ fontSize: 13, color: "#f97316", fontWeight: 600, marginTop: 4 }}>💡 {e.notes}</div>}
            <div style={{ display: "inline-block", marginTop: 6, padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: e.fallo ? "#dcfce7" : "#fee2e2", color: e.fallo ? "#15803d" : "#dc2626" }}>
              {e.fallo ? "🟢 Última serie SÍ al fallo" : "🔴 NUNCA al fallo · 1-2 en recámara"}
            </div>
          </div>
          {hasPrev && <div style={{ margin: "0 12px 6px", padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, fontSize: 12, color: "#1d4ed8", fontWeight: 600 }}>📋 Cargado de tu sesión anterior</div>}

          <RestTimer defaultRest={e.rest} triggerRef={tRef} />

          <div style={{ padding: "0 12px" }}>
            {sets.map((s, i) => (
              <SetRow key={`${e.id}-${i}-${ver}`} idx={i}
                initWeight={s.weight} initReps={s.reps} initDone={dn[i] || false}
                onSave={onSaveSet} onToggle={onToggleSet} />
            ))}
            <button onClick={addSet} style={{ width: "100%", padding: 10, borderRadius: 12, border: "2px dashed #d1d5db", background: "none", color: "#9ca3af", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>+ Serie extra</button>
          </div>

          <div style={{ padding: "4px 12px 16px", display: "flex", gap: 8 }}>
            <button onClick={() => { if (eidx > 0) goExercise(eidx - 1); }} disabled={eidx === 0}
              style={{ ...css.btn("#f3f4f6", "#1c1c1e"), opacity: eidx === 0 ? 0.3 : 1 }}>← Anterior</button>
            {eidx < exs.length - 1
              ? <button onClick={() => goExercise(eidx + 1)} style={css.btn("#3b82f6", "#fff")}>Siguiente →</button>
              : <button onClick={goToRoutineView} style={css.btn("#22c55e", "#fff")}>Ver resumen ✓</button>}
          </div>
        </div>
      </div>
    );
  }

  // ═════ HISTORY ═════
  if (view === "history") return (
    <div style={css.page}>
      <div style={css.hdr}><div style={{ fontSize: 22, fontWeight: 800 }}>📋 Historial</div></div>
      <div style={css.body}>
        {hist.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 24px", color: "#d1d5db" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>Sin entrenamientos aún</div>
          : hist.map(w => <HistCard key={w.id} w={w} del onTap={() => { setDetW(w); setView("detail"); }} onDel={() => { if (confirm("¿Eliminar?")) setHist(p => p.filter(x => x.id !== w.id)); }} />)}
      </div>
      <BNav act="history" go={setView} />
    </div>
  );

  // ═════ DETAIL ═════
  if (view === "detail" && detW) {
    const r = R[detW.routine], exs = r ? allExOf(detW.routine) : [];
    return (
      <div style={css.page}>
        <div style={{ ...css.hdr, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setView("history")} style={css.back}>‹</button>
          <div><div style={{ fontSize: 18, fontWeight: 800 }}>{r?.icon} {r?.name}</div><div style={{ fontSize: 12, color: "#6b7280" }}>{new Date(detW.date).toLocaleDateString("es-ES")}</div></div>
        </div>
        <div style={css.body}>
          {exs.map(e => {
            const ds = detW.exercises?.[e.id]?.sets.filter(s => s.done);
            if (!ds?.length) return null;
            return (
              <div key={e.id} style={{ margin: "8px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{e.name}</div>
                {ds.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i > 0 ? "1px solid #f3f4f6" : "none", fontSize: 13 }}>
                    <span style={{ color: "#9ca3af" }}>Serie {i + 1}</span>
                    <span style={{ fontWeight: 700 }}>{s.weight} kg × {s.reps}</span>
                    <span style={{ color: "#9ca3af" }}>{(s.weight || 0) * (s.reps || 0)} kg</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <BNav act="history" go={setView} />
      </div>
    );
  }

  // ═════ STATS ═════
  if (view === "stats") {
    let ts = 0, tv = 0;
    hist.forEach(w => { if (w.exercises) Object.values(w.exercises).forEach(ex => ex.sets.filter(s => s.done).forEach(s => { ts++; tv += (s.weight || 0) * (s.reps || 0); })); });
    const wk = hist.filter(w => new Date(w.date) >= new Date(Date.now() - 7 * 864e5)).length;
    return (
      <div style={css.page}>
        <div style={css.hdr}><div style={{ fontSize: 22, fontWeight: 800 }}>📊 Progresión</div></div>
        <div style={css.body}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "12px" }}>
            {[[hist.length, "Entrenamientos", "#3b82f6"], [wk, "Esta semana", "#f97316"], [tv >= 1000 ? (tv / 1000).toFixed(1) + "k" : tv, "Volumen total", "#22c55e"], [ts, "Series totales", "#6b7280"]].map(([v, l, c], i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: c }}>{v}</div>
                <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
          {hist.length > 0 && <>
            <div style={css.lbl}>Progresión de pesos</div>
            {[["ta1", "Dominadas/Jalón"], ["tb1", "Press banca"], ["pa1", "Prensa"], ["pb1", "Hip thrust"]].map(([eid, nm]) => {
              const pts = [];
              [...hist].reverse().forEach(w => {
                const ds = w.exercises?.[eid]?.sets.filter(s => s.done && s.weight > 0);
                if (ds?.length) pts.push({ d: new Date(w.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }), w: Math.max(...ds.map(s => s.weight)) });
              });
              if (!pts.length) return null;
              return (
                <div key={eid} style={{ margin: "4px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{nm}</div>
                  {pts.map((p, i) => {
                    const diff = i > 0 ? p.w - pts[i - 1].w : 0;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }}>
                        <span style={{ color: "#9ca3af" }}>{p.d}</span>
                        <span style={{ fontWeight: 700 }}>{p.w} kg</span>
                        <span style={{ color: diff > 0 ? "#22c55e" : diff < 0 ? "#ef4444" : "#9ca3af", fontWeight: 600 }}>{diff > 0 ? `+${diff}↑` : diff < 0 ? `${diff}↓` : "—"}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>}
          {hist.length === 0 && <div style={{ textAlign: "center", padding: "60px 24px", color: "#d1d5db" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>Entrena para ver tu progresión</div>}
        </div>
        <BNav act="stats" go={setView} />
      </div>
    );
  }

  return null;
}

/* ═══════════════════════════════════════════
   SMALL COMPONENTS
   ═══════════════════════════════════════════ */
function ExBtn({ e, i, tp, dn, onTap }) {
  const ok = dn?.length >= e.sets && dn.slice(0, e.sets).every(Boolean);
  const isTorso = tp === "torso";
  const accent = isTorso ? "#3b82f6" : "#f97316";
  const accentLight = isTorso ? "#eff6ff" : "#fff7ed";
  const numBg = isTorso ? "#3b82f6" : "#f97316";

  return (
    <button onClick={onTap} style={{
      display: "block", margin: "0 12px 10px", boxSizing: "border-box",
      width: "calc(100% - 24px)",
      background: ok ? "#f0fdf4" : "#fff",
      border: ok ? "2px solid #86efac" : "1px solid #e5e7eb",
      borderRadius: 16, padding: "14px 16px", textAlign: "left", cursor: "pointer",
      boxShadow: ok ? "0 2px 8px rgba(34,197,94,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
      borderLeft: ok ? "4px solid #22c55e" : `4px solid ${accent}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: ok ? "#22c55e" : numBg,
          color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, flexShrink: 0,
          boxShadow: `0 2px 6px ${ok ? "rgba(34,197,94,0.3)" : (isTorso ? "rgba(59,130,246,0.3)" : "rgba(249,115,22,0.3)")}`,
        }}>{ok ? "✓" : i + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: ok ? "#166534" : "#1c1c1e" }}>{e.name}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 6 }}>{e.sets}×{e.reps}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 6 }}>⏱ {e.rest}s</span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
              background: e.fallo ? "#dcfce7" : "#fee2e2",
              color: e.fallo ? "#15803d" : "#dc2626"
            }}>{e.fallo ? "🟢 Fallo últ." : "🔴 Sin fallo"}</span>
          </div>
        </div>
        <div style={{ fontSize: 18, color: "#d1d5db", flexShrink: 0 }}>›</div>
      </div>
    </button>
  );
}

const HistCard = memo(function HistCard({ w, del, onTap, onDel }) {
  const d = new Date(w.date);
  const dn = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const r = R[w.routine];
  let ts = 0, tv = 0;
  if (w.exercises) Object.values(w.exercises).forEach(ex => ex.sets.filter(s => s.done).forEach(s => { ts++; tv += (s.weight || 0) * (s.reps || 0); }));
  return (
    <div onClick={onTap} style={{ margin: "0 12px 8px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{dn[d.getDay()]} {d.getDate()}/{d.getMonth() + 1}</span>
        <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: r?.type === "torso" ? "#dbeafe" : "#ffedd5", color: r?.type === "torso" ? "#2563eb" : "#ea580c" }}>
          {r ? `${r.icon} ${r.name}` : w.routine}
        </span>
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 13, color: "#6b7280", alignItems: "center" }}>
        <span><b style={{ color: "#1c1c1e" }}>{ts}</b> series</span>
        <span><b style={{ color: "#1c1c1e" }}>{tv >= 1000 ? (tv / 1000).toFixed(1) + "k" : tv}</b> kg</span>
        <span><b style={{ color: "#1c1c1e" }}>{w.duration || "?"}</b> min</span>
        {del && onDel && <button onClick={ev => { ev.stopPropagation(); onDel(); }} style={{ marginLeft: "auto", color: "#ef4444", fontSize: 11, border: "1px solid #fecaca", borderRadius: 6, padding: "2px 8px", background: "none", cursor: "pointer" }}>🗑</button>}
      </div>
    </div>
  );
});

function Cal({ m, y, hist, onPrev, onNext }) {
  const ms = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const first = new Date(y, m, 1).getDay();
  const sd = first === 0 ? 6 : first - 1;
  const dim = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const tr = {};
  hist.forEach(w => { const d = new Date(w.date); if (d.getMonth() === m && d.getFullYear() === y) tr[d.getDate()] = R[w.routine]?.type || "torso"; });

  return (
    <div style={{ margin: "12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onPrev} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", fontSize: 18, cursor: "pointer" }}>‹</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>{ms[m]} {y}</span>
        <button onClick={onNext} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", border: "none", fontSize: 18, cursor: "pointer" }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
        {["L", "M", "X", "J", "V", "S", "D"].map(l => <div key={l} style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", padding: 4 }}>{l}</div>)}
        {Array.from({ length: sd }, (_, i) => <div key={"e" + i} />)}
        {Array.from({ length: dim }, (_, i) => {
          const d = i + 1, isT = d === today.getDate() && m === today.getMonth() && y === today.getFullYear(), t = tr[d];
          let bg = "transparent", cl = "#374151", fw = 400, brd = "2px solid transparent";
          if (t === "torso") { bg = "#3b82f6"; cl = "#fff"; fw = 700; }
          else if (t === "pierna") { bg = "#f97316"; cl = "#fff"; fw = 700; }
          else if (isT) { cl = "#2563eb"; fw = 800; brd = "2px solid #93c5fd"; }
          return <div key={d} style={{ aspectRatio: "1", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: fw, background: bg, color: cl, border: brd }}>{d}</div>;
        })}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} />Torso</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />Pierna</span>
      </div>
    </div>
  );
}

function BNav({ act, go }) {
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", padding: "4px 0 max(4px, env(safe-area-inset-bottom))", zIndex: 100 }}>
      {[["home", "Inicio", "🏠"], ["history", "Historial", "📋"], ["stats", "Progresión", "📊"]].map(([id, l, ic]) => (
        <button key={id} onClick={() => go(id)}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: 6, background: "none", border: "none", color: act === id ? "#3b82f6" : "#d1d5db", fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
          <span style={{ fontSize: 20 }}>{ic}</span>{l}
        </button>
      ))}
    </nav>
  );
}
