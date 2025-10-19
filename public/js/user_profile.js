window.addEventListener("DOMContentLoaded", async () => {
    try {
        // เช็ค session
        const res = await fetch("/check-session", { credentials: "include" });
        const data = await res.json();

        if (!data.loggedIn) {
            window.location.href = "/";
            return;
        }

        // Element references
        const usernameElem = document.getElementById("username");
        const nameElem = document.getElementById("name");
        const emailElem = document.getElementById("email");
        const navbarProfile = document.getElementById("profile-pic");
        const profileCardImg = document.getElementById("profile-img-large") || document.getElementById("profilePreview");

        // ใช้ path จาก server ถ้ามี ไม่งั้น default
        const profilePath = (data.user.profile && data.user.profile !== "")
            ? data.user.profile
            : "./image/user.png";

        // แสดงข้อมูลผู้ใช้
        if (usernameElem) usernameElem.textContent = data.user.name || "User";
        if (nameElem) nameElem.textContent = data.user.name || "User";
        if (emailElem) emailElem.textContent = data.user.email || "";
        if (navbarProfile) navbarProfile.src = profilePath;
        if (profileCardImg) profileCardImg.src = profilePath;

        // Logout (profile page)
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                await fetch("/logout", { method: "POST", credentials: "include" });
                window.location.href = "/";
            });
        }
    } catch (err) {
        console.error("Error fetching user info:", err);
    }
    
    const amountBtn = document.getElementById("amountBtn");
    if (amountBtn) {
        amountBtn.addEventListener("click", () => {
            window.location.href = "/user_amount.html";
        });
    }
});
