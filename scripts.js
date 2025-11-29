/* ==============================
   SCRIPT.JS – GAME CỦNG CỐ TIN HỌC
   Tải dữ liệu từ Excel (SheetJS)
   ============================== */

// Đường dẫn đến file Excel
const EXCEL_FILE = "questions.xlsx";

let allData = []; // Dữ liệu toàn bộ câu hỏi
let filteredQuestions = []; // Câu hỏi theo bộ chọn
let currentIndex = 0;
let score = 0;

// DOM
const gradeSelect = document.getElementById("grade");
const topicSelect = document.getElementById("topic");
const lessonSelect = document.getElementById("lesson");
const startBtn = document.getElementById("startBtn");
const quizArea = document.getElementById("quizArea");
const questionText = document.getElementById("questionText");
const answersBox = document.getElementById("answers");
const resultBox = document.getElementById("resultBox");
const scoreText = document.getElementById("scoreText");
const retryBtn = document.getElementById("retryBtn");

/* ==========================================
   1) TẢI FILE EXCEL – sử dụng SheetJS
========================================== */
async function loadExcel() {
  const file = await fetch(EXCEL_FILE);
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  allData = XLSX.utils.sheet_to_json(sheet);
  buildSelectors();
}

/* ==========================================
   2) TẠO DANH SÁCH CHỦ ĐỀ + BÀI
========================================== */
function buildSelectors() {
  updateTopics();
  gradeSelect.addEventListener("change", updateTopics);
  topicSelect.addEventListener("change", updateLessons);
}

function updateTopics() {
  const grade = gradeSelect.value;

  const topics = [...new Set(allData
    .filter(q => q.Khoi == grade)
    .map(q => q.ChuDe)
  )];

  topicSelect.innerHTML = topics.map(t => `<option value="${t}">${t}</option>`).join("");
  updateLessons();
}

function updateLessons() {
  const grade = gradeSelect.value;
  const topic = topicSelect.value;

  const lessons = [...new Set(allData
    .filter(q => q.Khoi == grade && q.ChuDe == topic)
    .map(q => q.Bai)
  )];

  lessonSelect.innerHTML = lessons.map(b => `<option value="${b}">${b}</option>`).join("");
}

/* ==========================================
   3) BẮT ĐẦU TRÒ CHƠI
========================================== */
startBtn.addEventListener("click", () => {
  const grade = gradeSelect.value;
  const topic = topicSelect.value;
  const lesson = lessonSelect.value;

  filteredQuestions = allData.filter(q => 
    q.Khoi == grade && q.ChuDe == topic && q.Bai == lesson
  );

  if (filteredQuestions.length === 0) {
    alert("Không có câu hỏi cho nội dung này!");
    return;
  }

  score = 0;
  currentIndex = 0;
  resultBox.style.display = "none";
  quizArea.style.display = "block";

  showQuestion();
});

/* ==========================================
   4) HIỂN THỊ CÂU HỎI
========================================== */
function showQuestion() {
  const q = filteredQuestions[currentIndex];
  questionText.textContent = q.CauHoi;

  answersBox.innerHTML = "";
  const answers = [q.A, q.B, q.C, q.D];

  answers.forEach((text, i) => {
    const div = document.createElement("div");
    div.className = "answer";
    div.textContent = text;
    div.addEventListener("click", () => checkAnswer(div, i));
    answersBox.appendChild(div);
  });
}

/* ==========================================
   5) KIỂM TRA ĐÁP ÁN
========================================== */
function checkAnswer(div, index) {
  const correctIndex = filteredQuestions[currentIndex].DapAn - 1;

  if (index === correctIndex) {
    div.classList.add("correct");
    score++;
  } else {
    div.classList.add("wrong");
  }

  setTimeout(() => {
    currentIndex++;
    if (currentIndex < filteredQuestions.length) {
      showQuestion();
    } else {
      endGame();
    }
  }, 600);
}

/* ==========================================
   6) KẾT THÚC TRÒ CHƠI
========================================== */
function endGame() {
  quizArea.style.display = "none";
  resultBox.style.display = "block";
  scoreText.textContent = `Bạn đúng ${score}/${filteredQuestions.length} câu!`;
}

retryBtn.addEventListener("click", () => {
  resultBox.style.display = "none";
});

// Khởi động
loadExcel();