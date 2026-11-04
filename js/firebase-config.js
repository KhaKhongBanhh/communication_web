// Kết nối Firebase - dùng chung cho mọi trang
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 👉 Thay bằng config của bạn (copy ở Bước 1)
const firebaseConfig = {
    apiKey: "AIzaSyCYhj0Ub8Ij-Qr1wt0C0LHq6FWq5Hg3vSU",
    authDomain: "communication-b11a4.firebaseapp.com",
    databaseURL: "https://communication-b11a4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "communication-b11a4",
    storageBucket: "communication-b11a4.firebasestorage.app",
    messagingSenderId: "698339601674",
    appId: "1:698339601674:web:88e49db16f324ddec71ef3",
    measurementId: "G-H5EFT6SVCD"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);