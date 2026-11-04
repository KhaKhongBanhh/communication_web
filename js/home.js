import { db } from "./firebase-config.js";
import {
  collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== DOM =====
const searchInput = document.getElementById("search");
const listEl      = document.getElementById("quote-list");
const countEl     = document.getElementById("count");
const addForm     = document.getElementById("add-form");
const contentEl   = document.getElementById("content");
const authorEl    = document.getElementById("author");
const addBtn      = document.getElementById("add-btn");
const logoutBtn   = document.getElementById("logout-btn");

const quotesRef = collection(db, "quotes");
let allQuotes = [];   // Dữ liệu gốc lấy từ Firestore

// ===== Bỏ dấu tiếng Việt để tìm kiếm: "Thành công" -> "thanh cong" =====
function normalize(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// ===== Render danh sách: lọc + sắp xếp A-Z =====
function render() {
  const keyword = normalize(searchInput.value);

  const filtered = allQuotes
    .filter(q =>
      normalize(q.content).includes(keyword) ||
      normalize(q.author).includes(keyword)
    )
    // Sắp xếp theo bảng chữ cái tiếng Việt, không phân biệt hoa/thường
    .sort((a, b) => a.content.localeCompare(b.content, "vi", { sensitivity: "base" }));

  countEl.textContent = keyword
    ? `Tìm thấy ${filtered.length} / ${allQuotes.length} câu nói`
    : `Tổng cộng ${allQuotes.length} câu nói`;

  listEl.innerHTML = "";

  if (filtered.length === 0) {
    listEl.innerHTML = `<li class="empty">Không có câu nói nào 😢</li>`;
    return;
  }

  filtered.forEach(q => {
    const li = document.createElement("li");
    li.className = "quote-card";

    const text = document.createElement("p");
    text.className = "quote-content";
    text.textContent = `“${q.content}”`;      // textContent để chống XSS

    const footer = document.createElement("div");
    footer.className = "quote-footer";

    const author = document.createElement("span");
    author.className = "quote-author";
    author.textContent = `— ${q.author || "Khuyết danh"}`;

    const delBtn = document.createElement("button");
    delBtn.className = "btn-delete";
    delBtn.textContent = "🗑 Xóa";
    delBtn.dataset.id = q.id;

    footer.append(author, delBtn);
    li.append(text, footer);
    listEl.appendChild(li);
  });
}

// ===== Lắng nghe realtime: thêm/xóa ở đâu cũng tự cập nhật =====
onSnapshot(
  quotesRef,
  (snapshot) => {
    allQuotes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    render();
  },
  (err) => {
    console.error(err);
    countEl.textContent = "⚠️ Lỗi tải dữ liệu. Kiểm tra Firestore Rules.";
  }
);

// ===== Tìm kiếm dynamic: gõ đến đâu lọc đến đó =====
searchInput.addEventListener("input", render);

// ===== Thêm câu nói =====
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = contentEl.value.trim();
  const author  = authorEl.value.trim() || "Khuyết danh";

  if (!content) return alert("Bạn chưa nhập câu nói!");

  // Chặn trùng lặp (so sánh không dấu, không phân biệt hoa thường)
  if (allQuotes.some(q => normalize(q.content) === normalize(content))) {
    return alert("Câu nói này đã tồn tại!");
  }

  addBtn.disabled = true;
  try {
    await addDoc(quotesRef, { content, author, createdAt: serverTimestamp() });
    addForm.reset();
    contentEl.focus();
  } catch (err) {
    console.error(err);
    alert("Thêm thất bại: " + err.message);
  } finally {
    addBtn.disabled = false;
  }
});

// ===== Xóa câu nói (event delegation) =====
listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-delete");
  if (!btn) return;
  if (!confirm("Bạn chắc chắn muốn xóa câu nói này?")) return;

  try {
    await deleteDoc(doc(db, "quotes", btn.dataset.id));
  } catch (err) {
    console.error(err);
    alert("Xóa thất bại: " + err.message);
  }
});

// ===== Đăng xuất =====
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("authed");
  location.replace("index.html");
});