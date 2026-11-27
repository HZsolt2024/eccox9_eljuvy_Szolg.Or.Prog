const API_BASE_URL = "http://localhost:5272/api/purchases";

const pageStatus = document.getElementById("pageStatus");
const formStatus = document.getElementById("formStatus");
const customerFilter = document.getElementById("customerFilter");
const purchaseCount = document.getElementById("purchaseCount");
const purchaseTableBody = document.getElementById("purchaseTableBody");
const emptyPurchases = document.getElementById("emptyPurchases");
const refreshButton = document.getElementById("refreshButton");
const purchaseForm = document.getElementById("purchaseForm");
const customerNameInput = document.getElementById("customerName");
const purchaseDateInput = document.getElementById("purchaseDate");
const totalAmountInput = document.getElementById("totalAmount");
const purchaseItemsInput = document.getElementById("purchaseItems");
const savePurchaseButton = document.getElementById("savePurchaseButton");

let purchases = [];

function setStatus(element, message, kind = "") {
    element.textContent = message;
    element.classList.toggle("status-error", kind === "error");
    element.classList.toggle("status-success", kind === "success");
}

async function apiRequest(path = "", options = {}) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers
            }
        });
    } catch {
        throw new Error(
            `Nem sikerült elérni az API-t (${API_BASE_URL}). Ellenőrizd, hogy fut-e a backend, ` +
            "és engedélyezve van-e a frontend címe a backend CORS-beállításában."
        );
    }

    const text = await response.text();
    let body = null;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }

    if (!response.ok) {
        const detail = typeof body === "string" ? body : body?.message ?? body?.title;
        throw new Error(`API-hiba (${response.status})${detail ? `: ${detail}` : ""}`);
    }

    return body;
}

function isPurchase(purchase) {
    return purchase &&
        (typeof purchase.id === "number" || typeof purchase.id === "string") &&
        typeof purchase.customerName === "string" &&
        typeof purchase.date === "string" &&
        Number.isFinite(purchase.totalAmount) &&
        Array.isArray(purchase.items) &&
        purchase.items.every((item) => typeof item === "string");
}

function formatAmount(amount) {
    return `${new Intl.NumberFormat("hu-HU").format(amount)} Ft`;
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("hu-HU");
}

function renderPurchases() {
    const query = customerFilter.value.trim().toLocaleLowerCase("hu-HU");
    const filteredPurchases = purchases.filter((purchase) =>
        purchase.customerName.toLocaleLowerCase("hu-HU").includes(query)
    );

    purchaseTableBody.replaceChildren();
    purchaseCount.textContent = query
        ? `${filteredPurchases.length} / ${purchases.length} vásárlás`
        : `${purchases.length} vásárlás`;

    if (filteredPurchases.length === 0) {
        emptyPurchases.textContent = purchases.length === 0
            ? "Még nincs rögzített vásárlás."
            : "Nincs vásárlás ezzel a vevőnévvel.";
        emptyPurchases.hidden = false;
        return;
    }

    emptyPurchases.hidden = true;
    for (const purchase of filteredPurchases) {
        const row = document.createElement("tr");
        const idCell = document.createElement("td");
        const customerCell = document.createElement("td");
        const dateCell = document.createElement("td");
        const itemsCell = document.createElement("td");
        const amountCell = document.createElement("td");

        idCell.textContent = purchase.id;
        customerCell.textContent = purchase.customerName;
        dateCell.textContent = formatDate(purchase.date);
        itemsCell.textContent = purchase.items.length
            ? purchase.items.join(", ")
            : "—";
        amountCell.textContent = formatAmount(purchase.totalAmount);
        row.append(idCell, customerCell, dateCell, itemsCell, amountCell);
        purchaseTableBody.append(row);
    }
}

async function loadPurchases() {
    refreshButton.disabled = true;
    setStatus(pageStatus, "Vásárlások betöltése…");

    try {
        const result = await apiRequest();
        if (!Array.isArray(result) || !result.every(isPurchase)) {
            throw new Error("A vásárláslista API-válasza nem a várt formátumú.");
        }

        purchases = result;
        renderPurchases();
        setStatus(pageStatus, "");
    } catch (error) {
        setStatus(pageStatus, error.message, "error");
        purchaseCount.textContent = "A vásárlások nem tölthetők be.";
    } finally {
        refreshButton.disabled = false;
    }
}

function setDefaultDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    purchaseDateInput.value = now.toISOString().slice(0, 16);
}

customerFilter.addEventListener("input", renderPurchases);
refreshButton.addEventListener("click", loadPurchases);

purchaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const customerName = customerNameInput.value.trim();
    const totalAmount = Number(totalAmountInput.value);
    const date = new Date(purchaseDateInput.value);
    const items = purchaseItemsInput.value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);

    if (!customerName) {
        setStatus(formStatus, "Add meg a vevő nevét.", "error");
        return;
    }
    if (!Number.isSafeInteger(totalAmount) || totalAmount < 0) {
        setStatus(formStatus, "A végösszeg nem negatív, egész szám legyen.", "error");
        return;
    }
    if (Number.isNaN(date.getTime())) {
        setStatus(formStatus, "Adj meg érvényes dátumot és időt.", "error");
        return;
    }

    savePurchaseButton.disabled = true;
    setStatus(formStatus, "Vásárlás rögzítése…");

    try {
        const createdPurchase = await apiRequest("", {
            method: "POST",
            body: JSON.stringify({
                customerName,
                date: date.toISOString(),
                totalAmount,
                items
            })
        });

        if (!isPurchase(createdPurchase)) {
            throw new Error("A backend válasza nem a várt vásárlásadatokat tartalmazza.");
        }

        purchases.push(createdPurchase);
        renderPurchases();
        purchaseForm.reset();
        setDefaultDate();
        setStatus(formStatus, "A vásárlás sikeresen rögzítve.", "success");
    } catch (error) {
        setStatus(formStatus, error.message, "error");
    } finally {
        savePurchaseButton.disabled = false;
    }
});

setDefaultDate();
loadPurchases();
