// File: public/js/wallet.js
window.addEventListener("DOMContentLoaded", async () => {
    const walletBalanceEl = document.getElementById("walletBalance");
    const transactionBody = document.getElementById("transactionBody");
    const topupBtn = document.getElementById("topupBtn");
    const checkoutBtn = document.getElementById("checkoutBtn"); // สำหรับหน้า cart ถ้ามี

    // ==============================
    // โหลด wallet
    async function loadWallet() {
        try {
            const res = await fetch("/api/user/wallet", { credentials: "include" });
            const data = await res.json();
            if (!data.success) return alert(data.message);
            walletBalanceEl.textContent = `${data.wallet_balance} ฿`;
        } catch (err) {
            console.error("Error loading wallet:", err);
        }
    }

    // ==============================
    // โหลด Transaction
    async function loadTransactions() {
        try {
            const res = await fetch("/api/transactions", { credentials: "include" });
            const data = await res.json();
            if (!data.success) return alert(data.message);

            transactionBody.innerHTML = "";

            data.transactions.forEach(tx => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${new Date(tx.created_at).toLocaleString("th-TH")}</td>
                    <td>${tx.type}</td>
                    <td>${parseFloat(tx.amount)}</td>
                    <td>${tx.description}</td>
                `;
                transactionBody.appendChild(tr);
            });
        } catch (err) {
            console.error("Error loading transactions:", err);
        }
    }

    // ==============================
    // กดปุ่มเติมเงิน -> ไปหน้า top-up
    if (topupBtn) {
        topupBtn.addEventListener("click", () => {
            window.location.href = "/user_topup.html";
        });
    }

    // ==============================
    // Checkout (สำหรับหน้า cart)
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async () => {
            try {
                const res = await fetch("/api/cart/checkout", {
                    method: "POST",
                    credentials: "include"
                });
                const data = await res.json();
                alert(data.message);

                // ถ้า backend ส่ง totalAmount + items กลับมา
                if (data.success && data.totalAmount && data.items) {
                    await fetch("/api/transactions/add", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            type: "purchase",
                            amount: data.totalAmount,
                            description: `Bought ${data.items.map(i => i.name).join(", ")}`
                        })
                    });
                }

                await loadWallet();
                await loadTransactions();
            } catch (err) {
                console.error("Error during checkout:", err);
                alert("❌ Error during checkout");
            }
        });
    }

    
    // ==============================
    // โหลด wallet และ transaction ตอนเริ่ม
    await loadWallet();
    await loadTransactions();
});
