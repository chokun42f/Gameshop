document.getElementById("saveBtn").addEventListener("click", async () => {
  const id = document.getElementById("userId").value;
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;

  // สมมติอัปโหลดรูปแล้วได้ชื่อไฟล์ใหม่กลับมา
  const image = document.getElementById("profilePreview").src.split("/").pop();

  try {
    const res = await fetch("/user_edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, email, image }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Profile updated successfully!");
      window.location.href = `/user_profile/${id}`;
    } else {
      alert("Update failed: " + data.message);
    }
  } catch (err) {
    console.error("Error updating profile:", err);
  }
});
