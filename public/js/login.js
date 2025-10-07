const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // ป้องกัน form submit แบบ default

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  console.log(email, password); // ✅ แสดงค่าที่กรอก

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = data.redirect;
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
  }
});
