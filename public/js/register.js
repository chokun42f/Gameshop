// Profile preview
const profileInput = document.getElementById("profileInput");
const uploadBtn = document.getElementById("uploadBtn");
const profilePreview = document.getElementById("profilePreview");

uploadBtn.addEventListener("click", () => profileInput.click());

profileInput.addEventListener("change", () => {
  const file = profileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => { profilePreview.src = reader.result; };
    reader.readAsDataURL(file);
  }
});

// Form submit
const registerForm = document.getElementById("registerForm");
const cancelBtn = document.querySelector(".cancel-btn");

cancelBtn.addEventListener("click", () => window.location.href = "/");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const file = profileInput.files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  if (file) formData.append("profile", file);

  const res = await fetch("/register", { method: "POST", body: formData });
  const data = await res.json();

  if (data.success) {
    alert("Register successful!");
    window.location.href = "/";
  } else {
    alert(data.message);
  }
});
