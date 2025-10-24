window.addEventListener("DOMContentLoaded", async () => {
    const cartList = document.getElementById("cartList");
    const cartAmount = document.getElementById("cartAmount");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
    const discountEl = document.getElementById("discount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const discountCodeInput = document.getElementById("discountCode");
    const applyCodeBtn = document.getElementById("applyCodeBtn");
    const discountMessage = document.getElementById("discountMessage");

    let discountAmount = 0;
    let discountType = null;

    // ==================== โหลด wallet balance ====================
    async function loadWallet() {
        try {
            const res = await fetch("/api/user/wallet", { credentials: "include" });
            const data = await res.json();
            if (!data.success) return alert(data.message);
            cartAmount.textContent = `${data.wallet_balance} THB`;
        } catch (err) {
            console.error("Error loading wallet:", err);
        }
    }

    // ==================== โหลด cart ====================
    async function loadCart() {
        try {
            const res = await fetch("/api/cart", { credentials: "include" });
            const data = await res.json();
            if (!data.success) return alert(data.message);

            cartList.innerHTML = "";
            let subtotal = 0;

            data.cart.forEach(item => {
                subtotal += item.price * item.quantity;
                const card = document.createElement("div");
                card.className = "cart-card";
                card.innerHTML = `
                    <div class="game-image"><img src="${item.image_url}" alt="${item.name}"></div>
                    <div class="game-info">
                        <p><strong>${item.name}</strong></p>
                        <p>Price: ${item.price} THB</p>
                        <p>Quantity: ${item.quantity}</p>
                        <div class="cart-actions">
                            <button class="delete-btn" data-id="${item.game_id}">Remove</button>
                        </div>
                    </div>
                `;
                cartList.appendChild(card);
            });

            subtotalEl.textContent = `${subtotal} THB`;
            updateTotal(subtotal);

            // ==================== ลบเกมจาก cart ====================
            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const gameId = btn.dataset.id;
                    if (!gameId) return alert("ไม่พบเกมที่จะลบ");

                    await fetch(`/api/cart/remove/${gameId}`, {
                        method: "DELETE",
                        credentials: "include"
                    });

                    // โหลด cart ใหม่
                    await loadCart();
                });
            });

        } catch (err) {
            console.error("Error loading cart:", err);
            alert("❌ Error loading cart");
        }
    }

    // ==================== Apply Discount Code ====================
    applyCodeBtn.addEventListener("click", async () => {
        const code = discountCodeInput.value.trim();
        if (!code) return alert("กรุณาใส่โค้ด");

        try {
            const res = await fetch("/api/codes/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ code: code })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Invalid code");

            discountAmount = parseFloat(data.discount_value);
            discountType = data.discount_type;
            discountMessage.textContent = `Applied: ${discountType === "percent" ? discountAmount + "%" : discountAmount + " THB"}`;

            updateTotal();

        } catch (err) {
            console.error("Error applying code:", err);
            discountMessage.textContent = `❌ ${err.message}`;
            discountAmount = 0;
            discountType = null;
            updateTotal();
        }
    });

    // ==================== Update total ====================
    function updateTotal(subtotal) {
        subtotal = subtotal || parseFloat(subtotalEl.textContent) || 0;
        let total = subtotal;

        if (discountAmount) {
            if (discountType === "percent") total = subtotal - subtotal * (discountAmount / 100);
            else total = subtotal - discountAmount;
        }

        totalEl.textContent = `${Math.max(total, 0)} THB`;
    }

    discountEl.addEventListener("input", () => {
        const subtotal = parseFloat(subtotalEl.textContent) || 0;
        const manualDiscount = parseFloat(discountEl.value) || 0;
        totalEl.textContent = `${Math.max(subtotal - manualDiscount, 0)} THB`;
    });

    // ==================== Checkout ====================
    checkoutBtn.addEventListener("click", async () => {
        try {
            const res = await fetch("/api/cart/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ discount_code: discountCodeInput.value.trim() })
            });

            const data = await res.json();
            alert(data.message);

            if (data.success) {
                await loadCart();
                await loadWallet();
                discountAmount = 0;
                discountType = null;
                discountCodeInput.value = "";
                discountMessage.textContent = "";
            }

        } catch (err) {
            console.error("Error during checkout:", err);
            alert("❌ Error during checkout");
        }
    });

    // ==================== โหลด wallet และ cart ตอนเริ่ม ====================
    await loadWallet();
    await loadCart();
});
