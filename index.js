// ===============================
// GLOBAL STATE
// ===============================
// Holds the 3 possible ingredients for a recipe. Initialized with null to represent empty slots.
let selectedIngredients = [null, null, null];

// Entry point: Initialize the application
main();

// ===============================
// MAIN FUNCTION
// ===============================
async function main() {
    // 1. Fetch data and grab DOM elements for manipulation
    const ingredients = await getdata();
    const ingredientGrid = document.querySelector("#ingredientGrid");
    const searchInput = document.querySelector("#ingredientSearch");
    
    // UI Elements for Scaling (Player stats)
    const levelInput = document.getElementById("alchemyLevel");
    const perkInput = document.getElementById("perkLevel");

    /**
     * Renders the list of available ingredients into the grid.
     * @param {Array} items - The list of ingredient objects to display.
     */
    function renderIngredients(items) {
        ingredientGrid.innerHTML = ""; // Clear current view
        items.forEach(ingredient => {
            const card = document.createElement("div");
            card.className = "ingredient-card";
            card.innerHTML = `
                <div class="icon">🌿</div>
                <span>${ingredient.name}</span>
            `;
            // When clicked, try to add this ingredient to an empty slot
            card.addEventListener("click", () => addToSlot(ingredient));
            ingredientGrid.appendChild(card);
        });
    }

    // Initial render of all ingredients
    renderIngredients(ingredients);

    /**
     * Validation: Enforce Skyrim-accurate limits for Level (1-100) and Perks (0-5).
     * This prevents the math from breaking or producing unrealistic values.
     */
    [levelInput, perkInput].forEach(input => {
        input.addEventListener("input", () => {
            if (input.id === "alchemyLevel") {
                if (input.value > 100) input.value = 100;
                if (input.value < 1) input.value = 1;
            }
            if (input.id === "perkLevel") {
                if (input.value > 5) input.value = 5;
                if (input.value < 0) input.value = 0;
            }
            
            updateRankText();     // Update Novice/Master label
            updatePotionResult(); // Recalculate potion strength immediately
        });
    });

    /**
     * Search Filter: Filters the ingredient list in real-time as the user types.
     */
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filtered = ingredients.filter(ing =>
            ing.name.toLowerCase().includes(query)
        );
        renderIngredients(filtered);
    });

    /**
     * Reset Button: Clears the selection state and resets the UI.
     */
    document.getElementById("clearBtn").addEventListener("click", () => {
        selectedIngredients = [null, null, null];
        for (let i = 1; i <= 3; i++) clearSlotUI(i);
        updatePotionResult();
    });
}

// ===============================
// RANK LOGIC
// ===============================
/**
 * Updates the text label (e.g., "Adept") based on the current Alchemy level.
 */
function updateRankText() {
    const lvl = parseInt(document.getElementById("alchemyLevel").value) || 15;
    const rankElem = document.getElementById("levelRank");
    
    if (lvl >= 100) rankElem.innerText = "Master";
    else if (lvl >= 75) rankElem.innerText = "Expert";
    else if (lvl >= 50) rankElem.innerText = "Adept";
    else if (lvl >= 25) rankElem.innerText = "Apprentice";
    else rankElem.innerText = "Novice";
}

// ===============================
// SLOT LOGIC
// ===============================
/**
 * Handles adding an ingredient to the selection array and updating the UI slots.
 */
function addToSlot(ingredient) {
    const emptyIndex = selectedIngredients.indexOf(null);

    // Guard clause: prevent adding more than 3
    if (emptyIndex === -1) {
        alert("All slots are full!");
        return;
    }

    // Guard clause: prevent duplicate ingredients in one potion
    if (selectedIngredients.includes(ingredient)) {
        alert("This ingredient is already selected.");
        return;
    }

    // Update state
    selectedIngredients[emptyIndex] = ingredient;

    // Update UI for the specific slot
    const slotId = emptyIndex + 1;
    const slotElement = document.getElementById(`slot${slotId}`);

    slotElement.innerHTML = `
        <div class="selected-item">
            <div class="icon">🌿</div>
            <p>${ingredient.name}</p>
        </div>
    `;
    slotElement.classList.add("filled");

    // Allow user to click the slot to remove the ingredient
    slotElement.onclick = () => {
        selectedIngredients[emptyIndex] = null;
        clearSlotUI(slotId);
        updatePotionResult();
    };

    updatePotionResult();
}

/**
 * Resets a specific slot in the UI to its empty state.
 */
function clearSlotUI(slotId) {
    const slot = document.getElementById(`slot${slotId}`);
    slot.innerHTML = "";
    slot.classList.remove("filled");
    slot.onclick = null;
}

// ===============================
// POTION ENGINE (SCALING)
// ===============================
/**
 * The "Brain" of the app. It checks for matching effects and calculates
 * the final power and value of the created potion.
 */
function updatePotionResult() {
    const nameElem = document.getElementById("potionName");
    const listElem = document.getElementById("effectsList");
    const displayBox = document.getElementById("potionDisplayBox");
    const bonusElem = document.getElementById("multiplierBonus");

    const activeIngredients = selectedIngredients.filter(i => i !== null);

    // Requirement: Must have at least 2 ingredients to make anything
    if (activeIngredients.length < 2) {
        displayBox.className = "potion-display is-potion";
        nameElem.innerText = "Unknown Potion";
        listElem.innerHTML = "<li>Select ingredients to see effects...</li>";
        bonusElem.innerText = "1.00x Power";
        return;
    }

    // --- EFFECT MATCHING ---
    // Count occurrences of every effect across all selected ingredients
    let effectCount = {};
    activeIngredients.forEach(ing => {
        ing.effects.forEach(effect => {
            effectCount[effect] = (effectCount[effect] || 0) + 1;
        });
    });

    // In Skyrim, an effect is active only if 2 or more ingredients share it
    const matchedEffects = Object.keys(effectCount).filter(effect => effectCount[effect] >= 2);

    // If no effects match, the potion is a "Fail"
    if (matchedEffects.length === 0) {
        displayBox.className = "potion-display is-potion";
        nameElem.innerText = "Failed Potion ❌";
        listElem.innerHTML = "<li>No common effects found.</li>";
        return;
    }

    // --- SKYRIM SCALING CALCULATION ---
    const level = parseInt(document.getElementById("alchemyLevel").value) || 15;
    const perks = parseInt(document.getElementById("perkLevel").value) || 0;
    
    // This formula approximates how Skyrim scales power:
    // Base Skill Multiplier * Perk Multiplier
    const skillMultiplier = (1 + (level / 100) * 1.5) * (1 + (perks * 0.2));
    bonusElem.innerText = `${skillMultiplier.toFixed(2)}x Power`;

    // --- UI & THEMING ---
    // Check if the result is a Poison based on keywords
    const isPoison = matchedEffects.some(e => 
        e.toLowerCase().includes("damage") || 
        e.toLowerCase().includes("ravage") || 
        e.toLowerCase().includes("weakness")
    );

    // Switch CSS class (e.g., changes color to green for poison, blue for potion)
    displayBox.className = `potion-display ${isPoison ? 'is-poison' : 'is-potion'}`;
    nameElem.innerText = (isPoison ? "Poison of " : "Potion of ") + matchedEffects.join(" & ");

    // --- VALUE & MAGNITUDE CALCULATION ---
    // Total value based on base ingredient prices, number of effects, and skill
    let totalValue = activeIngredients.reduce((sum, ing) => sum + ing.value, 0);
    const scaledValue = Math.round(totalValue * matchedEffects.length * skillMultiplier);

    // Build the final HTML list of effects with calculated magnitudes
    listElem.innerHTML = `
        <li><strong>💰 Value:</strong> ${scaledValue} Septims</li>
        <hr>
        <li><strong>Effects:</strong></li>
        ${matchedEffects.map(e => {
            // Calculate a magnitude (e.g., "Restore 34 Health")
            const magnitude = Math.round(15 * skillMultiplier); 
            return `<li>✨ ${e}: <strong>${magnitude} pts</strong></li>`;
        }).join("")}
    `;
}

// ===============================
// FETCH DATA
// ===============================
/**
 * Fetches the ingredient database from a local JSON file.
 */
async function getdata() {
    try {
        const res = await fetch("data.json");
        return await res.json();
    } catch (e) {
        console.error("Failed to load ingredients:", e);
        return []; // Return empty array to prevent app crash
    }
}