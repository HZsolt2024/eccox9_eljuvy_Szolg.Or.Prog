
const API_BASE_URL = "http://localhost:5272/api";

const pageStatus = document.getElementById("pageStatus");
const customerFilter = document.getElementById("customerFilter");
const customerList = document.getElementById("customerList");
const customerCount = document.getElementById("customerCount");
const refreshButton = document.getElementById("refreshButton");
const emptySelection = document.getElementById("emptySelection");
const customerDetails = document.getElementById("customerDetails");
const selectedCustomerName = document.getElementById("selectedCustomerName");
const selectedCustomerDebt = document.getElementById("selectedCustomerDebt");
const detailsStatus = document.getElementById("detailsStatus");
const itemList = document.getElementById("itemList");
const emptyItems = document.getElementById("emptyItems");
const itemForm = document.getElementById("itemForm");
const itemFormHeading = document.getElementById("itemFormHeading");
const itemNameInput = document.getElementById("itemName");
const itemPriceInput = document.getElementById("itemPrice");
const saveItemButton = document.getElementById("saveItemButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let customers = [];
let selectedCustomerId = null;
let selectedItems = [];
let editingItemId = null;
let selectionRequest = 0;

function setStatus(element, message, kind = "") {
    element.textContent = message;
    element.classList.toggle("status-error", kind === "error");
    element.classList.toggle("status-success", kind === "success");
}

async function apiRequest(path, options = {}) {
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

    const responseText = await response.text();
    let responseBody = null;

    if (responseText) {
        try {
            responseBody = JSON.parse(responseText);
        } catch {
            responseBody = responseText;
        }
    }

    if (!response.ok) {
        const detail = typeof responseBody === "string"
            ? responseBody
            : responseBody?.message ?? responseBody?.title;
        throw new Error(`API-hiba (${response.status})${detail ? `: ${detail}` : ""}`);
    }

    return responseBody;
}

function formatAmount(amount) {
    if (!Number.isFinite(amount)) {
        return "—";
    }

    return `${new Intl.NumberFormat("hu-HU").format(amount)} Ft`;
}

function visibleCustomers() {
    const query = customerFilter.value.trim().toLocaleLowerCase("hu-HU");
    return customers.filter((customer) =>
        customer.name.toLocaleLowerCase("hu-HU").includes(query)
    );
}

function renderCustomers() {
    customerList.replaceChildren();
    const filteredCustomers = visibleCustomers();
    customerCount.textContent = customerFilter.value.trim()
        ? `${filteredCustomers.length} / ${customers.length} vevő`
        : `${customers.length} vevő`;

    for (const customer of filteredCustomers) {
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "customer-choice";
        button.textContent = customer.name;
        button.dataset.customerId = customer.id;
        button.setAttribute(
            "aria-current",
            String(String(customer.id) === String(selectedCustomerId))
        );
        listItem.append(button);
        customerList.append(listItem);
    }

    if (filteredCustomers.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "muted";
        emptyItem.textContent = customers.length === 0
            ? "Nincs megjeleníthető vevő."
            : "Nincs találat erre a névre.";
        customerList.append(emptyItem);
    }
}

function renderItems() {
    itemList.replaceChildren();
    emptyItems.hidden = selectedItems.length > 0;

    for (const item of selectedItems) {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const amountCell = document.createElement("td");
        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        nameCell.textContent = item.name;
        amountCell.textContent = formatAmount(item.price);
        actions.className = "row-actions";
        editButton.type = "button";
        editButton.className = "row-button";
        editButton.textContent = "Módosítás";
        editButton.dataset.action = "edit";
        editButton.dataset.itemId = item.id;
        deleteButton.type = "button";
        deleteButton.className = "row-button row-button-danger";
        deleteButton.textContent = "Törlés";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.itemId = item.id;

        actions.append(editButton, deleteButton);
        actionsCell.append(actions);
        row.append(nameCell, amountCell, actionsCell);
        itemList.append(row);
    }
}

function resetItemForm() {
    editingItemId = null;
    itemForm.reset();
    itemFormHeading.textContent = "Új tartozás hozzáadása";
    saveItemButton.textContent = "Hozzáadás";
    cancelEditButton.hidden = true;
    setStatus(detailsStatus, "");
}

async function selectCustomer(customerId) {
    selectedCustomerId = String(customerId);
    selectionRequest += 1;
    const requestId = selectionRequest;
    const customer = customers.find((entry) => String(entry.id) === selectedCustomerId);

    renderCustomers();
    resetItemForm();
    emptySelection.hidden = true;
    customerDetails.hidden = false;
    selectedCustomerName.textContent = customer?.name ?? "Vevő";
    selectedCustomerDebt.textContent = "";
    itemList.replaceChildren();
    emptyItems.hidden = true;
    setStatus(detailsStatus, "Tartozások betöltése…");

    try {
        const result = await apiRequest(`/customer/${encodeURIComponent(selectedCustomerId)}`);
        if (requestId !== selectionRequest) {
            return false;
        }

        if (
            !result ||
            !Array.isArray(result.items) ||
            !result.items.every((item) =>
                item &&
                (typeof item.id === "number" || typeof item.id === "string") &&
                typeof item.name === "string" &&
                Number.isFinite(item.price)
            )
        ) {
            throw new Error(
                "A vevő API-válasza nem a várt items listát tartalmazza (minden tételhez id, name és price kell)."
            );
        }

        selectedCustomerName.textContent = result.name ?? customer?.name ?? "Vevő";
        selectedCustomerDebt.textContent = result.debt == null
            ? ""
            : `Nyilvántartott tartozás: ${formatAmount(result.debt)}`;
        selectedItems = result.items;
        renderItems();
        setStatus(detailsStatus, selectedItems.length ? "" : "Nincs még tartozás felvéve.");
        return true;
    } catch (error) {
        if (requestId === selectionRequest) {
            selectedItems = [];
            renderItems();
            setStatus(detailsStatus, error.message, "error");
        }
        return false;
    }
}

async function loadCustomers() {
    refreshButton.disabled = true;
    setStatus(pageStatus, "Vevők betöltése…");

    try {
        const result = await apiRequest("/customer");
        if (!Array.isArray(result)) {
            throw new Error("A vevőlista API-válasza nem lista.");
        }

        customers = result.filter((customer) =>
            customer &&
            (typeof customer.id === "number" || typeof customer.id === "string") &&
            typeof customer.name === "string"
        );
        renderCustomers();
        setStatus(pageStatus, "");

        if (selectedCustomerId !== null) {
            if (customers.some((customer) => String(customer.id) === selectedCustomerId)) {
                await selectCustomer(selectedCustomerId);
            } else {
                selectedCustomerId = null;
                selectedItems = [];
                customerDetails.hidden = true;
                emptySelection.hidden = false;
                resetItemForm();
            }
        }
    } catch (error) {
        setStatus(pageStatus, error.message, "error");
        customerCount.textContent = "A vevőlista nem tölthető be.";
    } finally {
        refreshButton.disabled = false;
    }
}

customerFilter.addEventListener("input", renderCustomers);

customerList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-customer-id]");
    if (button) {
        selectCustomer(button.dataset.customerId);
    }
});

refreshButton.addEventListener("click", loadCustomers);

itemList.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || selectedCustomerId === null) {
        return;
    }

    const item = selectedItems.find((entry) => String(entry.id) === button.dataset.itemId);
    if (!item) {
        setStatus(detailsStatus, "A kiválasztott tartozás már nem található. Frissítsd a listát.", "error");
        return;
    }

    if (button.dataset.action === "edit") {
        editingItemId = item.id;
        itemNameInput.value = item.name;
        itemPriceInput.value = item.price;
        itemFormHeading.textContent = "Tartozás módosítása";
        saveItemButton.textContent = "Módosítás mentése";
        cancelEditButton.hidden = false;
        itemNameInput.focus();
        return;
    }

    if (button.dataset.action === "delete") {
        if (!window.confirm(`Biztosan törlöd ezt a tartozást: „${item.name}”?`)) {
            return;
        }

        const customerId = selectedCustomerId;
        button.disabled = true;
        try {
            await apiRequest(
                `/customer/${encodeURIComponent(customerId)}/items/${encodeURIComponent(item.id)}`,
                { method: "DELETE" }
            );
            if (selectedCustomerId === customerId) {
                const refreshed = await selectCustomer(customerId);
                if (refreshed) {
                    setStatus(detailsStatus, "A tartozás törölve.", "success");
                }
            }
        } catch (error) {
            if (selectedCustomerId === customerId) {
                setStatus(detailsStatus, error.message, "error");
            }
            button.disabled = false;
        }
    }
});

itemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (selectedCustomerId === null) {
        return;
    }

    const name = itemNameInput.value.trim();
    const price = Number(itemPriceInput.value);
    if (!name || !Number.isSafeInteger(price) || price < 0) {
        setStatus(detailsStatus, "Adj meg nevet és nem negatív, egész összeget.", "error");
        return;
    }

    const customerId = selectedCustomerId;
    const isEditing = editingItemId !== null;
    const itemPath = `/customer/${encodeURIComponent(customerId)}/items` +
        (isEditing ? `/${encodeURIComponent(editingItemId)}` : "");
    const submitLabel = saveItemButton.textContent;
    saveItemButton.disabled = true;
    cancelEditButton.disabled = true;
    setStatus(detailsStatus, isEditing ? "Módosítás mentése…" : "Tartozás hozzáadása…");

    try {
        await apiRequest(itemPath, {
            method: isEditing ? "PUT" : "POST",
            body: JSON.stringify({ name, price })
        });
        if (selectedCustomerId === customerId) {
            resetItemForm();
            const refreshed = await selectCustomer(customerId);
            if (refreshed) {
                setStatus(detailsStatus, isEditing ? "A tartozás módosítva." : "A tartozás hozzáadva.", "success");
            }
        }
    } catch (error) {
        if (selectedCustomerId === customerId) {
            setStatus(detailsStatus, error.message, "error");
        }
    } finally {
        saveItemButton.disabled = false;
        saveItemButton.textContent = editingItemId === null ? "Hozzáadás" : submitLabel;
        cancelEditButton.disabled = false;
    }
});

cancelEditButton.addEventListener("click", resetItemForm);

loadCustomers();