// The sample session (M7): one versioned object saved in the browser.
// It holds the model state and nothing else; views read projections and send
// commands through dispatch(). If storage is missing or fails, the session
// lives in memory only. A different schema or seed version starts from the seed.

import * as m from "./model.js";
import { MOBILE_BEFORE } from "./mode.js";

// The lab's "before" layout keeps its own session, so the lab can run both side by side.
const KEY = MOBILE_BEFORE ? "dealdesk.sampleSession.before" : "dealdesk.sampleSession";
const SCHEMA_VERSION = 1;

function readStorage() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function writeStorage(text) {
  try {
    window.localStorage.setItem(KEY, text);
  } catch {
    // storage unavailable or full: the session stays in memory
  }
}

export async function createStore(rawSeed) {
  const seed = await m.loadSeed(rawSeed);
  let state = restore(seed) ?? m.initialState(seed);
  let queue = Promise.resolve();
  const listeners = new Set();

  function restore(sd) {
    const text = readStorage();
    if (!text) return null;
    try {
      const saved = JSON.parse(text);
      if (saved.schemaVersion !== SCHEMA_VERSION || saved.seedVersion !== sd.seedVersion) return null;
      m.initialState(sd); // registers the seed for RestartSample
      return saved.state;
    } catch {
      return null;
    }
  }

  function save() {
    writeStorage(JSON.stringify({ schemaVersion: SCHEMA_VERSION, seedVersion: seed.seedVersion, state }));
  }

  function notify(change) {
    for (const fn of listeners) fn(change);
  }

  // Commands run one at a time, in the order they were sent.
  function dispatch(cmd, actor, params = {}) {
    const run = async () => {
      try {
        state = await m.apply(state, cmd, actor, params);
        save();
        notify({ cmd, actor, params });
        return { ok: true };
      } catch (e) {
        if (!(e instanceof m.Rejected)) throw e;
        return { ok: false, message: e.message };
      }
    };
    const result = queue.then(run);
    queue = result.catch(() => {});
    return result;
  }

  // Replaces the whole session, e.g. after a jump replayed a scenario.
  function replace(next, change = { cmd: "Replace" }) {
    state = next;
    save();
    notify(change);
  }

  return {
    seed,
    get state() {
      return state;
    },
    projection: () => m.projection(state),
    dispatch,
    replace,
    restart: () => dispatch("RestartSample", state.actorId),
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
