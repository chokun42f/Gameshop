window.addEventListener("DOMContentLoaded", async () => {
    try {
        // =================== ส่วนโหลด user ===================
        const resUser = await fetch("/check-session", { credentials: "include" });
        const dataUser = await resUser.json();
        if (!dataUser.loggedIn) return window.location.href = "/";

        // แสดงข้อมูล user
        document.getElementById("profile-pic").src = dataUser.user.profile || "./image/default_game.png";
        document.getElementById("username").textContent = dataUser.user.name || "User";
        
        // =================== โหลดประเภทเกม ===================
        const filterType = document.getElementById("filterType");
        const resTypes = await fetch("/api/games/types");
        const types = await resTypes.json();
        types.forEach(t => {
            const option = document.createElement("option");
            option.value = t.type;
            option.textContent = t.type;
            filterType.appendChild(option);
        });

        // =================== โหลดเกมทั้งหมด ===================
        const gameListDiv = document.getElementById("gameList");
        const searchInput = document.getElementById("searchInput");
        async function loadGames(search = "", type = "") {
            let url = "/api/games?";
            if (type) url += `type=${type}&`;
            if (search) url += `search=${encodeURIComponent(search)}&`;

            const resGames = await fetch(url);
            const games = await resGames.json();

            gameListDiv.innerHTML = "";
            games.forEach(game => {
                const card = document.createElement("div");
                card.className = "game-card";
                card.style = "width:180px;margin:10px;padding:10px;border:1px solid #ccc;border-radius:5px;text-align:center;cursor:pointer";
                card.innerHTML = `
                    <img src="${game.image_url || './image/default_game.png'}" alt="${game.name}" style="width:100%; height:120px; object-fit:cover; border-radius:5px;">
                    <h3 style="margin:5px 0;">${game.name}</h3>
                `;
                card.addEventListener("click", () => window.location.href = `/user_game_detail?id=${game.game_id}`);
                gameListDiv.appendChild(card);
            });
        }

        // =================== โหลดเกมยอดนิยม ===================
        async function loadPopularGames() {
            const res = await fetch("/api/games/popular");
            const games = await res.json();
            const popularList = document.getElementById("popularList");
            popularList.innerHTML = "";
            games.forEach(game => {
                const card = document.createElement("div");
                card.className = "game-card";
                card.style = "margin:10px;text-align:center";
                card.innerHTML = `
                    <img src="${game.image_url || './image/default_game.png'}" 
                         alt="${game.name}" 
                          style="width:120px; height:120px; border-radius:10px; object-fit:cover;" />
                    <h3>${game.name}</h3>
                    <p>Sold: ${game.sales_count ?? 0}</p>
                `;
                popularList.appendChild(card);
            });
        }

        // =================== Event Search/Filter ===================
        searchInput?.addEventListener("input", () => loadGames(searchInput.value, filterType.value));
        filterType?.addEventListener("change", () => loadGames(searchInput.value, filterType.value));

        // =================== โหลดตอนเริ่ม ===================
        await loadGames();
        await loadPopularGames(); // ✅ เรียกใน scope เดียวกับฟังก์ชัน
    } catch (err) {
        console.error("Error loading user or games:", err);
    }
});
