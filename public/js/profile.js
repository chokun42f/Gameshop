const profileInput = document.getElementById("profileInput");
const uploadBtn = document.getElementById("uploadBtn");
const profilePreview = document.getElementById("profilePreview");

uploadBtn.addEventListener("click", () => {
  profileInput.click();
});

profileInput.addEventListener("change", () => {
  const file = profileInput.files[0];
  if (file) {
    // แสดง preview
    const reader = new FileReader();
    reader.onload = () => {
      profilePreview.src = reader.result;
    };
    reader.readAsDataURL(file);

    // ส่งไฟล์ไป server
    const formData = new FormData();
    formData.append("profile", file);

    fetch("/update-profile", {
      method: "POST",
      body: formData,
      credentials: "include"  // 🔑 ต้องใส่ ถ้าใช้ session
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("Profile updated!");
        } else {
          alert("Upload failed: " + data.message);
        }
      })
      .catch(err => console.error("Upload error:", err));
  }
});
