// navbar.js
window.addEventListener("DOMContentLoaded", async () => {
    try {
        // เช็ค session
        const res = await fetch("/check-session", { credentials: "include" });
        const data = await res.json();

        if (!data.loggedIn) {
            // ไม่ login → กลับหน้า login
            window.location.href = "/";
            return;
        }

        // แสดงข้อมูลผู้ใช้
        const usernameElem = document.getElementById("username");
        const profilePicElem = document.getElementById("profile-pic");

        if (usernameElem) usernameElem.textContent = data.user.name || "User";
        if (profilePicElem) profilePicElem.src = data.user.profile || "./image/user.png";

        // --- lastPage เฉพาะการเปิดหน้าใหม่หลังปิด browser ---
        const navType = performance.getEntriesByType("navigation")[0].type;
        if (navType !== "navigate" || navType === "reload") {

        }

        // Logout
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                try {
                    await fetch("/logout", {
                        method: "POST",
                        credentials: "include"
                    });
                    localStorage.removeItem("lastPage"); // ล้าง lastPage
                    window.location.href = "/"; // กลับหน้า login
                } catch (err) {
                    console.error("Logout error:", err);
                }
            });
        }

    } catch (err) {
        console.error("Error fetching session:", err);
    }
});

// เก็บหน้าปัจจุบันก่อนปิด/refresh
window.addEventListener("beforeunload", () => {
});
