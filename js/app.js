import { CLASSES } from "./data/classes.js";
import { ITEM_TYPES } from "./data/itemTypes.js";
import { RUNES } from "./data/runes.js";
import { RUNEWORDS } from "./data/runewords.js";
import { getRandomItemTypeSprite } from "./utils/getRandomItemTypeSprite.js";

// STATE
const selectedRunes = new Set();

// DOM ELEMENTS
const runeListEl = document.getElementById("runeList");
const runewordListEl = document.getElementById("runewordList");
const runewordHintEl = document.getElementById("runewordHint");

const levelFilterEl = document.getElementById("levelFilter");
const levelValueEl = document.getElementById("levelValue");
const classFilterEl = document.getElementById("classFilter");
const itemTypeFilterEl = document.getElementById("itemTypeFilter");

// HELPERS (filters)
function normalize(str) {
   return String(str ?? "").toLowerCase();
}

function getActiveFilters() {
   return {
      maxLevel: levelFilterEl ? Number(levelFilterEl.value) : 99,
      className:
         classFilterEl && classFilterEl.value && classFilterEl.value !== "All"
            ? classFilterEl.value
            : null,
      itemType:
         itemTypeFilterEl &&
         itemTypeFilterEl.value &&
         itemTypeFilterEl.value !== "All"
            ? itemTypeFilterEl.value
            : null,
   };
}

function matchesLevel(rw, maxLevel) {
   const lvl = Number(rw.level ?? 0);
   return lvl <= maxLevel;
}

function matchesItemType(rw, itemType) {
   if (!itemType) return true;
   return Array.isArray(rw.itemType) && rw.itemType.includes(itemType);
}

// This checks BOTH formats: "Sorceress Only" and "to Sorceress Skill Levels"
function matchesClass(rw, className) {
   if (!className) return true;
   const effects = Array.isArray(rw.effects) ? rw.effects : [];
   const haystack = normalize(effects.join(" | "));
   const needle = normalize(className);
   return haystack.includes(needle);
}

// POPULATE FILTER OPTIONS
function populateFilterOptions() {
   // Class dropdown
   if (classFilterEl) {
      classFilterEl.innerHTML = "";
      const allOpt = document.createElement("option");
      allOpt.value = "All";
      allOpt.textContent = "All Classes";
      classFilterEl.appendChild(allOpt);

      CLASSES.forEach((cls) => {
         const opt = document.createElement("option");
         opt.value = cls;
         opt.textContent = cls;
         classFilterEl.appendChild(opt);
      });
   }

   // Item Type dropdown
   if (itemTypeFilterEl) {
      itemTypeFilterEl.innerHTML = "";
      const allOpt = document.createElement("option");
      allOpt.value = "All";
      allOpt.textContent = "All Item Types";
      itemTypeFilterEl.appendChild(allOpt);

      ITEM_TYPES.forEach((t) => {
         const opt = document.createElement("option");
         opt.value = t;
         opt.textContent = t;
         itemTypeFilterEl.appendChild(opt);
      });
   }
}

// LEVEL LABEL SYNC
function syncLevelLabel() {
   if (levelValueEl && levelFilterEl) {
      levelValueEl.textContent = levelFilterEl.value;
   }
}

// RENDER RUNES
function renderRunes() {
   if (!runeListEl) return;

   runeListEl.innerHTML = "";

   RUNES.forEach((rune) => {
      const li = document.createElement("li");
      li.className = "rune-list__item";

      li.innerHTML = `
      <button class="rune-button" type="button" data-rune="${rune.name}">
        <img
          class="rune-button__image"
          src="${rune.image}"
          alt="${rune.name} rune"
          loading="lazy"
        />
        <span class="rune-button__name">${rune.name}</span>
      </button>
    `;

      const button = li.querySelector(".rune-button");

      button.addEventListener("click", () => {
         const runeName = rune.name;
         const isActive = button.classList.toggle("rune-button--active");

         if (isActive) selectedRunes.add(runeName);
         else selectedRunes.delete(runeName);

         updateRunewordResults();
      });

      runeListEl.appendChild(li);
   });
}

// FILTER & RENDER RUNEWORDS
function updateRunewordResults() {
   if (!runewordListEl) {
      console.warn("runewordList element not found");
      return;
   }

   runewordListEl.innerHTML = "";

   if (selectedRunes.size === 0) {
      if (runewordHintEl) {
         runewordHintEl.textContent =
            "Select one or more runes above to see matching runewords.";
      }
      return;
   }

   const { maxLevel, className, itemType } = getActiveFilters();

   const matches = RUNEWORDS.filter((rw) => {
      const runeMatch =
         Array.isArray(rw.runeOrder) &&
         rw.runeOrder.every((runeName) => selectedRunes.has(runeName));

      if (!runeMatch) return false;

      // Apply filters
      if (!matchesLevel(rw, maxLevel)) return false;
      if (!matchesClass(rw, className)) return false;
      if (!matchesItemType(rw, itemType)) return false;

      return true;
   });

   if (runewordHintEl) {
      runewordHintEl.textContent =
         matches.length === 0
            ? "No matching runewords found."
            : `Found ${matches.length} matching runeword(s).`;
   }

   if (matches.length === 0) return;

   matches.sort((a, b) => (a.level ?? 0) - (b.level ?? 0));

   matches.forEach((rw) => {
      const li = document.createElement("li");
      li.className = "runewords__item";

      const effectsList = Array.isArray(rw.effects)
         ? rw.effects.map((effect) => `<li>${effect}</li>`).join("")
         : "";

      const sprite = getRandomItemTypeSprite(rw.itemType);

      li.innerHTML = `
      <article class="runeword-card">
        <div class="runeword-card__icon">
          <img src="${sprite}" alt="${rw.itemType.join(
         ", "
      )} icon" loading="lazy" />
        </div>

        <div class="runeword-card__content">
          <header class="runeword-card__header">
            <h3 class="runeword-card__name">${rw.name}</h3>

            <div class="runeword-card__meta">
              <div class="runeword-card__runes">[${rw.runeOrder.join(
                 " + "
              )}]</div>
              <div class="runeword-card__line">Level Requirement ${
                 rw.level
              }</div>
              <div class="runeword-card__line">${rw.itemType.join(", ")}</div>
              <div class="runeword-card__line">${rw.sockets} Sockets</div>
            </div>
          </header>

          <ul class="runeword-card__effects">
            ${effectsList}
          </ul>
        </div>
      </article>
    `;

      runewordListEl.appendChild(li);
   });
}

// WIRE EVENTS
function wireFilterEvents() {
   if (levelFilterEl) {
      levelFilterEl.addEventListener("input", () => {
         syncLevelLabel();
         updateRunewordResults();
      });
   }

   if (classFilterEl) {
      classFilterEl.addEventListener("change", () => updateRunewordResults());
   }

   if (itemTypeFilterEl) {
      itemTypeFilterEl.addEventListener("change", () =>
         updateRunewordResults()
      );
   }
}

// INIT
populateFilterOptions();
syncLevelLabel();
wireFilterEvents();
renderRunes();
updateRunewordResults();
