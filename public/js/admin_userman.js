document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/admin/users");
    const users = await res.json();

    const tableBody = document.querySelector("#userTable tbody");
    tableBody.innerHTML = "";

    users.forEach(u => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.games_owned || 0}</td>
        <td><button class="detail-btn" onclick="viewDetail(${u.user_id})">Detail</button></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
});

function viewDetail(userId) {
  window.location.href = `/admin_userdetail.html?id=${userId}`;
}
