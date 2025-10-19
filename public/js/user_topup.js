const walletBalanceEl = document.getElementById("walletBalance");
const buttons = document.querySelectorAll(".amount-btn-group button");
const customInput = document.getElementById("customAmount");
const confirmBtn = document.getElementById("confirmTopup");

// โหลด wallet balance
async function loadWallet() {
    try {
        const res = await fetch("/api/user/wallet", { credentials: "include" });
        const data = await res.json();
        if (!data.success) return alert(data.message);
        walletBalanceEl.textContent = `${parseFloat(data.wallet_balance).toFixed(2)} ฿`;
    } catch (err) {
        console.error("Error loading wallet:", err);
    }
}

// เลือกจำนวนเงินจากปุ่ม
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        customInput.value = btn.dataset.amount;
    });
});

// กดเติมเงิน
confirmBtn.addEventListener("click", async () => {
    const amount = parseFloat(customInput.value);
    if (!amount || amount <= 0) return alert("จำนวนเงินไม่ถูกต้อง");

    try {
        const res = await fetch("/api/user/wallet/topup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ amount })
        });

        const data = await res.json();
        if (!data.success) return alert(data.message);

        // รีเซ็ต input
        customInput.value = "";

        // อัปเดต wallet ทันที
        await loadWallet();
        alert(data.message);
         window.history.back();
         
    } catch (err) {
        console.error("Error during topup:", err);
        alert("❌ เติมเงินไม่สำเร็จ");
    }
});

// โหลด wallet ตอนเริ่ม
loadWallet();
