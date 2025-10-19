window.addEventListener("DOMContentLoaded", async () => {
    const cartList = document.getElementById("cartList");
    const cartAmount = document.getElementById("cartAmount");
    const subtotalEl = document.getElementById("subtotal");
    const totalEl = document.getElementById("total");
    const discountEl = document.getElementById("discount");
    const checkoutBtn = document.getElementById("checkoutBtn");

    // ==================== โหลด wallet balance ====================
    async function loadWallet() {
        try {
            const res = await fetch("/api/user/wallet", { credentials: "include" });
            const data = await res.json();
            console.log("Wallet data:", data);
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
            const discount = parseFloat(discountEl.value) || 0;
            totalEl.textContent = `${Math.max(subtotal - discount, 0)} THB`;

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

    // ==================== Checkout ====================
checkoutBtn.addEventListener("click", async () => {
    try {
        const res = await fetch("/api/cart/checkout", {
            method: "POST",
            credentials: "include"
        });
        const data = await res.json();
        alert(data.message);

        if (data.success && data.items) {
            // อัปเดต sales_count
            await fetch("/api/games/update-sales", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: data.items.map(i => ({
                        game_id: i.game_id,
                        quantity: i.quantity
                    }))
                })
            });
        }

        // โหลด cart ใหม่
        await loadCart();

        // โหลด wallet balance ใหม่
        await loadWallet();

    } catch (err) {
        console.error("Error during checkout:", err);
        alert("❌ Error during checkout");
    }
});


    // ==================== Update total เมื่อแก้ discount ====================
    discountEl.addEventListener("input", () => {
        const subtotal = parseFloat(subtotalEl.textContent) || 0;
        const discount = parseFloat(discountEl.value) || 0;
        totalEl.textContent = `${Math.max(subtotal - discount, 0)} THB`;
    });

    // ==================== โหลด wallet และ cart ตอนเริ่ม ====================
    await loadWallet();
    await loadCart();
});
