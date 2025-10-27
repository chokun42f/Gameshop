window.addEventListener("DOMContentLoaded", async () => {
    loadCodeTable();
});

let showExpired = false; // state สำหรับแสดงโค้ดหมดอายุหรือไม่

// ================== โหลดโค้ดทั้งหมด ==================
async function loadCodeTable() {
    try {
        const res = await fetch("/api/codes", { credentials: "include" });
        if (!res.ok) throw new Error("Cannot load codes");
        const codes = await res.json();

        const container = document.getElementById("codesList");
        container.innerHTML = "";

        // กรองตาม state
        const visibleCodes = showExpired
            ? codes // แสดงทั้งหมด
            : codes.filter(c => c.used_count < c.max_uses); // ซ่อนโค้ดหมดอายุ

        if (visibleCodes.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:#999;">No codes to display.</p>`;
            return;
        }

        visibleCodes.forEach(c => {
            const expired = c.used_count >= c.max_uses;
            const card = document.createElement("div");
            card.className = "code-card";
            card.style.opacity = expired ? "0.5" : "1";

            card.innerHTML = `
                <div class="code-info">
                    <span><strong>${c.code}</strong></span>
                    <span>${c.discount_type === 'percent' ? c.discount_value + '%' : '฿' + c.discount_value}</span>
                    <span>Used: ${c.used_count}/${c.max_uses}</span>
                </div>
                <div class="code-actions">
                    <button class="edit-btn" onclick="openEditCodeModal(${c.code_id}, '${c.code}', '${c.discount_type}', ${c.discount_value}, ${c.max_uses})" ${expired ? 'disabled' : ''}>Edit</button>
                    <button class="delete-btn" onclick="deleteCode(${c.code_id})">Delete</button>
                </div>
            `;

            container.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading code table:", err);
    }
}

// ================== Toggle Show Expired ==================
function toggleExpired() {
    showExpired = !showExpired;
    const btn = document.querySelector('button[onclick="toggleExpired()"]');
    btn.textContent = showExpired ? "🙈 Hide Expired Codes" : "👁 Show Expired Codes";
    loadCodeTable();
}

// ================== Modal Add/Edit ==================
let editingCodeId = null;

function openAddCodeModal() {
    editingCodeId = null;
    document.getElementById("modalTitle").textContent = "Add Code";
    document.getElementById("code").value = "";
    document.getElementById("discount_type").value = "percent";
    document.getElementById("discount_value").value = "";
    document.getElementById("max_uses").value = 1;
    document.getElementById("codeModal").style.display = "flex";
}

function openEditCodeModal(codeId, code, discount_type, discount_value, max_uses) {
    editingCodeId = codeId;
    document.getElementById("modalTitle").textContent = "Edit Code";
    document.getElementById("code").value = code;
    document.getElementById("discount_type").value = discount_type;
    document.getElementById("discount_value").value = discount_value;
    document.getElementById("max_uses").value = max_uses;
    document.getElementById("codeModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("codeModal").style.display = "none";
}

// ================== Save Code ==================
async function saveCode() {
    const code = document.getElementById("code").value.trim();
    const discount_type = document.getElementById("discount_type").value;
    const discount_value = parseFloat(document.getElementById("discount_value").value);
    const max_uses = parseInt(document.getElementById("max_uses").value);

    if (!code || !discount_type || !discount_value || !max_uses) {
        alert("Please fill all fields");
        return;
    }

    try {
        let url = "/api/codes";
        let method = "POST";
        let body = { code, discount_type, discount_value, max_uses };

        if (editingCodeId) {
            url += `/${editingCodeId}`;
            method = "PUT";
        }

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            credentials: "include"
        });

        const data = await res.json();
        if (res.ok) {
            closeModal();
            loadCodeTable();
        } else {
            alert(data.message || "Failed to save code");
        }

    } catch (err) {
        console.error("Error saving code:", err);
    }
}

// ================== Delete Code ==================
async function deleteCode(codeId) {
    if (!confirm("Are you sure you want to delete this code?")) return;

    try {
        const res = await fetch(`/api/codes/${codeId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await res.json();
        if (res.ok) {
            loadCodeTable();
        } else {
            alert(data.message || "Failed to delete code");
        }

    } catch (err) {
        console.error("Error deleting code:", err);
    }
}
