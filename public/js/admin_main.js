
window.addEventListener("DOMContentLoaded", async () => {
    try {
        // เช็ค session
        const res = await fetch("/check-session", { credentials: "include" });
        const data = await res.json();

        if (!data.loggedIn) {
            // ไม่ login → กลับหน้า login
            window.location.href = "/";
            return;
        }

        // แสดงข้อมูล user
        const profilePic = document.getElementById("profile-pic");
        const namePic = document.getElementById("username");
        profilePic.src = data.user.profile || "./image/user.png"; // default
        namePic.textContent = data.user.name || "User";

        // ถ้ามี lastPage เก็บไว้ → ไปหน้าสุดท้าย
        const lastPage = localStorage.getItem("lastPage");
        if (lastPage && lastPage !== window.location.pathname) {
            window.location.href = lastPage;
        }

        // Logout
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                await fetch("/logout", { method: "POST", credentials: "include" });
                localStorage.removeItem("lastPage"); // ล้าง lastPage
                window.location.href = "/";
            });
        }

    } catch (err) {
        console.error("Error fetching user info:", err);
    }
});

//============================================================//

// เก็บหน้าปัจจุบันก่อนปิด/refresh
window.addEventListener("beforeunload", () => {
});

document.addEventListener("DOMContentLoaded", () => {
    loadGameTypes();
    loadGames();
    loadPopularGames();

    const searchInput = document.getElementById("searchInput");
    const filterType = document.getElementById("filterType");

    // Search realtime
    searchInput.addEventListener("input", () => {
        loadGames(filterType.value, searchInput.value.trim());
    });

    // Filter by type
    filterType.addEventListener("change", () => {
        loadGames(filterType.value, searchInput.value.trim());
    });
});

// โหลดประเภทเกมทั้งหมด
async function loadGameTypes() {
    try {
        const res = await fetch("/api/games/types");
        const types = await res.json();
        const filterType = document.getElementById("filterType");

        types.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.type;
            opt.textContent = t.type;
            filterType.appendChild(opt);
        });
    } catch (err) {
        console.error("Error loading game types:", err);
    }
}

// โหลดเกมทั้งหมดหรือ filter
async function loadGames(selectedType = "", searchKeyword = "") {
    try {
        let url = "/api/games";
        const params = [];
        if (selectedType) params.push(`type=${encodeURIComponent(selectedType)}`);
        if (searchKeyword) params.push(`search=${encodeURIComponent(searchKeyword)}`);
        if (params.length) url += "?" + params.join("&");

        const res = await fetch(url);
        const games = await res.json();

        const gameList = document.getElementById("gameList");
        gameList.innerHTML = "";

        games.forEach(game => {
            const card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <a href="/admin_viewgame?id=${game.game_id}" style="text-decoration:none; color:inherit;">
                    <img src="${game.image_url || './image/default_game.png'}" alt="${game.name}" class="game-img" />
                    <h3>${game.name}</h3>
                </a>
            `;
            gameList.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading games:", err);
    }
}

// โหลดเกมยอดนิยม
async function loadPopularGames() {
    try {
        const res = await fetch("/api/games/popular");
        const games = await res.json();

        const popularList = document.getElementById("popularList");
        popularList.innerHTML = "";

        games.forEach(game => {
            const card = document.createElement("div");
            card.className = "game-card";
            card.innerHTML = `
                <img src="${game.image_url || './image/default_game.png'}" 
                     alt="${game.name}" 
                     class="game-img" 
                     style="width:120px; height:120px; border-radius:10px; object-fit:cover;" />
                <h3>${game.name}</h3>
                <p>Sold: ${game.sales_count ?? 0}</p>
            `;
            popularList.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading popular games:", err);
    }
}

