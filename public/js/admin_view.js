window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id");

  if (!gameId) {
    alert("ไม่พบ ID ของเกม");
    window.location.href = "/admin_main";
    return;
  }


  try {
    const res = await fetch(`/api/games/${gameId}`);
    const game = await res.json();

    document.getElementById("gameName").textContent = game.name || "-";
    document.getElementById("gameType").textContent = game.type || "-";
    document.getElementById("gamePrice").textContent = `${game.price || 0} ฿`;
    document.getElementById("gameDesc").textContent = game.detail || "-";
    document.getElementById("gameImage").src = game.profile || "./image/default_game.png";

    // ✅ แปลงรูปแบบวันที่เป็น "วัน/เดือน/ปี"
    if (game.release_date) {
      const date = new Date(game.release_date);
      const formattedDate = date.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      document.getElementById("gameDate").textContent = formattedDate;
    } else {
      document.getElementById("gameDate").textContent = "-";
    }

  } catch (err) {
    console.error("Error loading game details:", err);
  }
  //go edit
  document.getElementById("editBtn").addEventListener("click", () => {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");  // เอา id จาก URL ปัจจุบัน
  window.location.href = `/admin_editgame?id=${gameId}`;
});
  // ปุ่มย้อนกลับ
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/admin_main";
  });
});
