import { CLASSES } from "./data/classes.js";
import { ITEM_TYPES } from "./data/itemTypes.js";
import { RUNES } from "./data/runes.js";
import { RUNEWORDS } from "./data/runewords.js";
import { getRandomItemTypeSprite } from "./utils/getRandomItemTypeSprite.js";

// STATE
const selectedRunes = new Set(); //holds rune names

// DOM ELEMENTS
const runeListEl = document.getElementById("runeList");
const runewordListEl = document.getElementById("runewordList");
const runewordHintEl = document.getElementById("runewordHint");

// RENDER RUNES
if (runeListEl) {
   RUNES.forEach((rune) => {
      const li = document.createElement("li");
      li.className = "rune-list__item";

      li.innerHTML = `
      <button class="rune-button" type="button" data-rune="${rune.name}">
        <img
          class="rune-button__image"
          src="${rune.image}"
          alt="${rune.name} rune"
        />
        <span class="rune-button__name">${rune.name}</span>
      </button>
    `;

      const button = li.querySelector(".rune-button");

      button.addEventListener("click", () => {
         const runeName = rune.name;
         const isActive = button.classList.toggle("rune-button--active");

         if (isActive) {
            selectedRunes.add(runeName);
         } else {
            selectedRunes.delete(runeName);
         }

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

   // clear previous results
   runewordListEl.innerHTML = "";

   if (selectedRunes.size === 0) {
      if (runewordHintEl) {
         runewordHintEl.textContent =
            "Select one or more runes above to see matching runewords.";
      }
      return;
   }

   const selectedArray = Array.from(selectedRunes);
   console.log("Selected runes:", selectedArray);

   const matches = RUNEWORDS.filter(
      (rw) =>
         Array.isArray(rw.runeOrder) &&
         rw.runeOrder.every((runeName) => selectedRunes.has(runeName))
   );

   console.log("Matching runewords:", matches);

   if (runewordHintEl) {
      runewordHintEl.textContent =
         matches.length === 0
            ? "No matching runewords found."
            : `Found ${matches.length} matching runeword(s).`;
   }

   if (matches.length === 0) return;

   // sort by level if present
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
         <img src="${sprite}" alt="${rw.itemType.join(", ")} icon" />
      </div>

      <div class="runeword-card__content">
        <header class="runeword-card__header">
          <h3 class="runeword-card__name">${rw.name}</h3>
          <div class="runeword-card__meta">
            <span class="runeword-card__runes">
              [${rw.runeOrder.join(" + ")}]
            </span>
            <span class="runeword-card__item">
               Level ${rw.level} • ${rw.itemType.join(", ")} • ${
         rw.sockets
      } Sockets
            </span>
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
