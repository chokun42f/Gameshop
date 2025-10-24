// File: public/js/user_library.js
window.addEventListener("DOMContentLoaded", async () => {
  const libraryList = document.getElementById("libraryList");
  const gameNameList = document.getElementById("gameNameList");
  const searchInput = document.getElementById("searchInput");
  const filterType = document.getElementById("filterType");

  try {
    // ==================== ตรวจสอบ session ====================
    const resUser = await fetch("/check-session", { credentials: "include" });
    if (!resUser.ok) throw new Error("Cannot check session");
    const dataUser = await resUser.json();
    if (!dataUser.loggedIn) return (window.location.href = "/login");

    document.getElementById("username").textContent = dataUser.user.name;
    document.getElementById("profile-pic").src = dataUser.user.profile || "/image_game/default_game.png";

    // ==================== โหลดประเภทเกม ====================
    const resTypes = await fetch("/api/games/types");
    const types = await resTypes.json();
    types.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.type;
      opt.textContent = t.type;
      filterType.appendChild(opt);
    });

    // ==================== โหลด Library ====================
    async function loadLibrary(search = "", type = "") {
      try {
        const res = await fetch(`/api/library?search=${encodeURIComponent(search)}&type=${encodeURIComponent(type)}`, { credentials: "include" });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          libraryList.innerHTML = `<p style="color:red;">${errData.message || "เกิดข้อผิดพลาด"}</p>`;
          gameNameList.innerHTML = "";
          return;
        }

        const games = await res.json();
        libraryList.innerHTML = "";
        gameNameList.innerHTML = "";

        if (games.length === 0) {
          libraryList.innerHTML = `<p style="color:white;">ยังไม่มีเกมใน Library</p>`;
          return;
        }

        games.forEach(game => {
          // ----- Sidebar list -----
          const li = document.createElement("li");
          li.textContent = game.name;
          li.addEventListener("click", () => window.location.href = `/user_game_detail?id=${game.game_id}`);
          gameNameList.appendChild(li);

          // ----- Card view -----
          const card = document.createElement("div");
          card.className = "library-card";

          // ถ้าไม่มี image_url ให้ใช้ default
          const imgSrc = game.image_url ? game.image_url : "/image_game/default_game.png";

          card.innerHTML = `
            <div class="game-image">
              <img src="${imgSrc}" alt="${game.name}" style="width:100%; height:100px; object-fit:cover; border-radius:5px;">
            </div>
            <p style="margin-top:5px; font-weight:bold; color:black;">${game.name}</p>
            <small style="font-size:0.8em; color:black;">Type: ${game.type || "N/A"}</small><br>
          `;

          card.addEventListener("click", () => window.location.href = `/user_game_detail?id=${game.game_id}`);
          libraryList.appendChild(card);
        });

      } catch (err) {
        console.error(err);
        libraryList.innerHTML = `<p style="color:red;">เกิดข้อผิดพลาด: ${err.message}</p>`;
        gameNameList.innerHTML = "";
      }
    }

    // ==================== Event listeners ====================
    searchInput.addEventListener("input", () => loadLibrary(searchInput.value, filterType.value));
    filterType.addEventListener("change", () => loadLibrary(searchInput.value, filterType.value));

    // ==================== โหลดตอนเริ่ม ====================
    await loadLibrary();

  } catch (err) {
    console.error(err);
    libraryList.innerHTML = `<p style="color:red;">เกิดข้อผิดพลาด: ${err.message}</p>`;
  }
});
