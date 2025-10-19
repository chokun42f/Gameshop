document.addEventListener("DOMContentLoaded", async () => {
  try {
    // ✅ ดึงข้อมูล session เพื่อดูว่าใคร login
    const sessionRes = await fetch("/check-session", { credentials: "include" });
    const sessionData = await sessionRes.json();

    if (!sessionData.loggedIn) {
      window.location.href = "/";
      return;
    }

    // แสดงชื่อผู้ใช้และรูป
    document.getElementById("username").textContent = sessionData.user.name;
    document.getElementById("profile-pic").src =
      sessionData.user.profile || "./image/profile_icon.png";

    // ✅ โหลดข้อมูล library
    const res = await fetch(`/api/library/${sessionData.user.user_id}`);
    const games = await res.json();

    const list = document.getElementById("library-list");
    const grid = document.getElementById("gameGrid");

    list.innerHTML = "";
    grid.innerHTML = "";

    if (games.length === 0) {
      grid.innerHTML = `<p style="color:white;">ยังไม่มีเกมในคลัง</p>`;
      return;
    }

    // ✅ แสดงรายชื่อเกม (sidebar)
    games.forEach(game => {
      const li = document.createElement("li");
      li.textContent = game.name;
      list.appendChild(li);
    });

    // ✅ แสดงเกมใน grid
    games.forEach(game => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.innerHTML = `
        <img src="${game.profile || './image/default_game.png'}" 
             alt="${game.name}" 
             style="width:100%; border-radius:8px;">
        <h3>${game.name}</h3>
        <p style="font-size:0.9em;">${game.type}</p>
        <button onclick="viewGame(${game.game_id})">View</button>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading library:", err);
  }
});

function viewGame(gameId) {
  window.location.href = `/game_detail/${gameId}`;
}
