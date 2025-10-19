document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get("id");

  const nameInput = document.getElementById("gameName");
  const typeInput = document.getElementById("gameType");
  const dateInput = document.getElementById("gameDate");
  const priceInput = document.getElementById("gamePrice");
  const descInput = document.getElementById("gameDesc");
  const previewImage = document.getElementById("previewImage");
  const imageUpload = document.getElementById("imageUpload");

  // โหลดข้อมูลเกม
  try {
    const res = await fetch(`/api/games/${gameId}`);
    const game = await res.json();

    nameInput.value = game.name;
    typeInput.value = game.type;
    priceInput.value = game.price;
    descInput.value = game.detail || "";

    if (game.release_date) {
      const date = new Date(game.release_date);
      dateInput.value = date.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    previewImage.src = game.profile || "./image/default_game.png";
  } catch (err) {
    console.error("Error loading game:", err);
    alert("❌ ไม่สามารถโหลดข้อมูลเกมได้");
  }

  // พรีวิวรูปภาพเมื่อเลือกไฟล์
  imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) previewImage.src = URL.createObjectURL(file);
  });

  // ปุ่มบันทึกการแก้ไข
  document.getElementById("saveBtn").addEventListener("click", async () => {
    if (!confirm("คุณต้องการบันทึกการแก้ไขหรือไม่?")) return;

    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("type", typeInput.value);
    formData.append("release_date", dateInput.value);
    formData.append("price", priceInput.value);
    formData.append("detail", descInput.value);
    if (imageUpload.files[0]) formData.append("profile", imageUpload.files[0]);

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        alert("✅ แก้ไขข้อมูลเรียบร้อย!");
        window.location.href = "/admin_main";
      } else {
        alert("❌ แก้ไขข้อมูลไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error saving game:", err);
      alert("❌ เกิดข้อผิดพลาดขณะบันทึกข้อมูล");
    }
  });

  // ปุ่มลบเกม
  document.getElementById("deleteBtn").addEventListener("click", async () => {
    const confirmDelete = confirm("⚠ คุณแน่ใจหรือไม่ที่จะลบเกมนี้?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("🗑 ลบเกมเรียบร้อย!");
        window.location.href = "/admin_main";
      } else {
        alert("❌ ลบเกมไม่สำเร็จ");
      }
    } catch (err) {
      console.error("Error deleting game:", err);
      alert("❌ เกิดข้อผิดพลาดขณะลบเกม");
    }
  });

  // ปุ่มย้อนกลับ
  document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = "/admin_main";
  });
});
