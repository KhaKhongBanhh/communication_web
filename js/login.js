import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Nếu đã đăng nhập trong phiên này thì vào thẳng trang chủ
if (sessionStorage.getItem("authed") === "true") {
  location.replace("home.html");
}

const form = document.getElementById("login-form");
const input = document.getElementById("password");
const btn = document.getElementById("login-btn");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();               // Chặn reload trang
  errorEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Đang kiểm tra...";

  try {
    // Lấy mật khẩu từ Firestore: config/app
    const snap = await getDoc(doc(db, "config", "app"));

    if (snap.exists() && snap.data().password === input.value) {
      sessionStorage.setItem("authed", "true");   // Đánh dấu đã đăng nhập
      location.replace("home.html");
    } else {
      errorEl.textContent = "❌ Sai mật khẩu, thử lại nhé!";
      input.value = "";
      input.focus();
    }
  } catch (err) {
    console.error(err);
    errorEl.textContent = "⚠️ Không kết nối được Firebase. Kiểm tra config/rules.";
  } finally {
    btn.disabled = false;
    btn.textContent = "Vào trang";
  }
});