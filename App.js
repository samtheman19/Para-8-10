/* 2 km 8:10 – Routine (Treadmill + Outdoor mode)
   Paratrooper Engine – v1
*/

const STORAGE_KEY = "paratrooper_engine_v1";
const TODAY_KEY = () => new Date().toISOString().slice(0, 10);

// -------------------- WEEK PLAN --------------------
const days = [
  {
    key: "mon",
    name: "Monday – Strength A (Lower)",
    warmup: ["5 min easy jog", "Hip + ankle mobility"],
    main: {
      type: "strength",
      exercises: [
        { id: "trap", name: "Trap Bar Deadlift", sets: 4, targetReps: 3 },
        { id: "bss", name: "Bulgarian Split Squat", sets: 3, targetReps: 5 },
        { id: "calf", name: "Standing Calf Raises", sets: 3, targetReps: 10 }
      ]
    },
    mobility: [{ id: "couch", name: "Couch stretch", seconds: 60 }]
  },

  {
    key: "tue",
    name: "Tuesday – Intervals",
    warmup: ["10–12 min easy", "3 × 20s strides"],
    main: {
      type: "run",
      title: "Intervals",
      showIntervalTimer: true,
      detailsByMode: {
        treadmill: [
          "Incline 1%",
          "6 × 95s @ 15.0 km/h",
          "90s recovery jog"
        ],
        outdoor: [
          "6 × 95s hard (RPE 8/10)",
          "90s easy jog"
        ]
      }
    },
    mobility: [{ id: "calf2", name: "Calf stretch", seconds: 60 }]
  },

  {
    key: "wed",
    name: "Wednesday – Upper Body + HIIT",
    warmup: ["5 min row or jog"],
    main: {
      type: "strength",
      exercises: [
        { id: "bench", name: "Bench Press", sets: 4, targetReps: 5 },
        { id: "row", name: "Pull-ups / Rows", sets: 4, targetReps: 6 },
        { id: "press", name: "Overhead Press", sets: 3, targetReps: 5 }
      ]
    },
    mobility: [{ id: "thor", name: "Thoracic rotation", seconds: 60 }]
  },

  {
    key: "thu",
    name: "Thursday – Tempo Run",
    warmup: ["10 min easy"],
    main: {
      type: "run",
      title: "Tempo",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: [
          "1% incline",
          "15 min @ 13.5–14 km/h",
          "Cool down 5–10 min"
        ],
        outdoor: [
          "15 min comfortably hard (RPE 7/10)",
          "Even effort"
        ]
      }
    },
    mobility: [{ id: "ham", name: "Hamstring stretch", seconds: 60 }]
  },

  {
    key: "fri",
    name: "Friday – Strength B (Full)",
    warmup: ["5 min jog"],
    main: {
      type: "strength",
      exercises: [
        { id: "squat", name: "Back Squat", sets: 4, targetReps: 4 },
        { id: "hinge", name: "RDL", sets: 3, targetReps: 6 },
        { id: "core", name: "Hanging Knee Raise", sets: 3, targetReps: 10 }
      ]
    },
    mobility: [{ id: "glute", name: "Glute stretch", seconds: 60 }]
  },

  {
    key: "sat",
    name: "Saturday – Long Run",
    warmup: ["5–10 min build"],
    main: {
      type: "run",
      title: "Long Run",
      showIntervalTimer: false,
      detailsByMode: {
        treadmill: [
          "1% incline",
          "45–60 min easy (RPE 4–5)"
        ],
        outdoor: [
          "45–60 min conversational",
          "Prefer flat terrain"
        ]
      }
    },
    mobility: [{ id: "full", name: "Full body stretch", seconds: 180 }]
  },

  {
    key: "sun",
    name: "Sunday – Rest",
    warmup: [],
    main: {
      type: "rest",
      details: ["Complete rest or gentle walk"]
    },
    mobility: []
  }
];

// -------------------- STATE --------------------
const defaultState = {
  dayKey: "mon",
  mode: "treadmill",
  restSeconds: 90,
  logs: {},
  mobility: {}
};

let state = loadState();

// -------------------- STORAGE --------------------
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// -------------------- HELPERS --------------------
function dayByKey(k) {
  return days.find(d => d.key === k);
}
function getWeekKey() {
  return Math.floor((Date.now() - new Date("2026-01-01")) / 604800000).toString();
}

// -------------------- RENDER --------------------
const daySelect = document.getElementById("daySelect");
const modeSelect = document.getElementById("modeSelect");
const dayTitleEl = document.getElementById("dayTitle");
const warmupList = document.getElementById("warmupList");
const mainBlock = document.getElementById("mainBlock");
const mobilityList = document.getElementById("mobilityList");

function init() {
  daySelect.innerHTML = days.map(d => `<option value="${d.key}">${d.name}</option>`).join("");
  daySelect.value = state.dayKey;
  modeSelect.value = state.mode;
  render();
}

function render() {
  const day = dayByKey(state.dayKey);
  dayTitleEl.textContent = day.name;

  warmupList.innerHTML = (day.warmup || []).map(w => `<li>${w}</li>`).join("") || "<li>—</li>";

  if (day.main.type === "run") {
    const list = day.main.detailsByMode[state.mode] || [];
    mainBlock.innerHTML = `
      <h3>${day.main.title}</h3>
      <ul>${list.map(x => `<li>${x}</li>`).join("")}</ul>
      ${day.main.showIntervalTimer ? `<p><b>Use Interval Timer</b></p>` : ""}
    `;
  } else if (day.main.type === "strength") {
    mainBlock.innerHTML = day.main.exercises
      .map(ex => `<p><b>${ex.name}</b> – ${ex.sets}×${ex.targetReps}</p>`)
      .join("");
  } else {
    mainBlock.innerHTML = `<p>${day.main.details.join("<br>")}</p>`;
  }

  mobilityList.innerHTML = (day.mobility || [])
    .map(m => `<p>${m.name} – ${m.seconds}s</p>`)
    .join("") || "<p>—</p>";
}

// -------------------- EVENTS --------------------
daySelect.onchange = () => {
  state.dayKey = daySelect.value;
  saveState();
  render();
};

modeSelect.onchange = () => {
  state.mode = modeSelect.value;
  saveState();
  render();
};

init();
