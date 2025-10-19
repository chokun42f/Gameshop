window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("id");

    const gameName = document.getElementById("gameName");
    const gameImage = document.getElementById("gameImage");
    const gameType = document.getElementById("gameType");
    const gameDate = document.getElementById("gameDate");
    const gamePrice = document.getElementById("gamePrice");
    const gameDesc = document.getElementById("gameDesc");
    const addCartBtn = document.getElementById("addCartBtn");
    const backBtn = document.getElementById("backBtn");

    try {
        const res = await fetch(`/api/games/${gameId}`);
        const game = await res.json();

        gameName.textContent = game.name;
        gameImage.src = game.profile || "./image/default_game.png";
        gameType.textContent = game.type;
        gameDate.textContent = game.release_date || "-";
        gamePrice.textContent = game.price.toFixed(2);
        gameDesc.textContent = game.detail || "";

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
        console.error("Error loading game:", err);
        alert("❌ ไม่สามารถโหลดข้อมูลเกมได้");
    }

    addCartBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ game_id: gameId })
            });
            const data = await res.json();

            if (data.success) {
                alert("✅ เกมถูกเพิ่มลงในตะกร้าแล้ว!");
            } else {
                alert("⚠ " + data.message);
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("❌ เกิดข้อผิดพลาดขณะเพิ่มเกมลงตะกร้า");
        }
    });

    backBtn.addEventListener("click", () => {
        window.history.back();
    });
});
