document.getElementById("addGameForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData();
  formData.append("name", document.getElementById("name").value);
  formData.append("type", document.getElementById("type").value);
  formData.append("price", document.getElementById("price").value);
  formData.append("detail", document.getElementById("detail").value);
  formData.append("profile", document.getElementById("profile").files[0]);

  const statusMsg = document.getElementById("statusMsg");
  statusMsg.textContent = "Uploading...";

  try {
    const res = await fetch("/api/games/add", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      statusMsg.textContent = "✅ Game added successfully!";
      setTimeout(() => {
        window.location.href = "/admin_main";
      }, 1500);
    } else {
      statusMsg.textContent = `❌ Error: ${data.message}`;
    }
  } catch (err) {
    console.error("Error adding game:", err);
    statusMsg.textContent = "❌ Upload failed!";
  }
});
