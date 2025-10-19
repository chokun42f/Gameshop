window.addEventListener("DOMContentLoaded", async () => {
    const walletEl = document.getElementById("walletBalance");
    const transactionBody = document.getElementById("transactionBody");
    const topupBtn = document.getElementById("topupBtn");

    // ฟังก์ชันโหลดยอดเงิน
    async function loadWallet() {
        try {
            const res = await fetch("/api/user/wallet", { credentials: "include" });
            const data = await res.json();
            if (!data.success) return alert(data.message);

            walletEl.textContent = `${data.wallet_balance.toFixed(2)} ฿`;
        } catch (err) {
            console.error(err);
            alert("❌ Error loading wallet balance");
        }
    }

    // ฟังก์ชันโหลด transaction history
    async function loadTransactions() {
        try {
            const res = await fetch("/api/user/transactions", { credentials: "include" });
            const data = await res.json();
            if (!data.success) return alert(data.message);

            transactionBody.innerHTML = "";
            data.transactions.forEach(tx => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${new Date(tx.date).toLocaleString()}</td>
                    <td>${tx.type}</td>
                    <td>${tx.amount.toFixed(2)}</td>
                    <td>${tx.description || "-"}</td>
                `;
                transactionBody.appendChild(row);
            });
        } catch (err) {
            console.error(err);
            alert("❌ Error loading transactions");
        }
    }

    // ตัวอย่างฟังก์ชันเติมเงิน
    topupBtn.addEventListener("click", () => {
        const amount = prompt("Enter top-up amount:");
        if (!amount || isNaN(amount)) return alert("กรอกจำนวนเงินไม่ถูกต้อง");

        fetch("/api/user/topup", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: parseFloat(amount) })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadWallet();
            loadTransactions();
        })
        .catch(err => {
            console.error(err);
            alert("❌ Error during top-up");
        });
    });

    // โหลดข้อมูลตอนเริ่ม
    await loadWallet();
    await loadTransactions();
});
