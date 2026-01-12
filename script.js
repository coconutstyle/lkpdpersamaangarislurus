// =========================================
// 1. SETUP & UTILITY
// =========================================

// Supabase setup
const supabaseUrl = 'https://cydgsvqybhhfedoazfok.supabase.co'; // Ganti dengan Project URL Anda
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZGdzdnF5YmhoZmVkb2F6Zm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDc5ODAsImV4cCI6MjA4MzQyMzk4MH0.4p4It2z4qVyLNydXwNdOHx9es7R5zAbB-EevFZVk5Y8'; // Ganti dengan kunci anon Anda
let supabaseClient;
try {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
} catch (error) {
    console.error('Error initializing Supabase:', error);
    supabaseClient = null;
}

// Fungsi untuk menyimpan jawaban
async function saveAnswer(question, answer, isCorrect) {
    if (!supabaseClient) {
        console.warn('Supabase not initialized, skipping save.');
        return;
    }
    const studentName = document.getElementById('nama-siswa').value || 'Anonymous';
    const { error } = await supabaseClient.from('student_answers').insert([{
        student_name: studentName,
        question: question,
        answer: answer,
        is_correct: isCorrect
    }]);
    if (error) console.error('Error menyimpan jawaban:', error);
}

// Set tanggal otomatis
const now = new Date();
document.getElementById('tanggal').textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Update waktu setiap detik
function updateTime() {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('waktu').textContent = timeStr;
}
updateTime();
setInterval(updateTime, 1000);

// Fungsi untuk menyimpan input ke localStorage
function saveInputValue(id) {
    const element = document.getElementById(id);
    if (element) {
        localStorage.setItem(id, element.value);
    }
}

// Fungsi untuk memuat input dari localStorage
function loadInputValue(id) {
    const value = localStorage.getItem(id);
    const element = document.getElementById(id);
    if (element && value !== null) {
        element.value = value;
    }
}

// Load semua input saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    // List of input IDs to persist
    const inputIds = [
        'kelompok-siswa', 'nama-siswa',
        'coordAx', 'coordAy', 'coordBx', 'coordBy',
        'jawab_metode1', 'jawab_gradien', 'jawab_metode2',
        'jawab_kesimpulan', 'finalEquation',
        'jawab5', 'jawab6', 'jawab6follow',
        'devAnswer1', 'devAnswer2',
        'pointAnswer'
    ];

    inputIds.forEach(id => {
        loadInputValue(id);
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', () => saveInputValue(id));
            element.addEventListener('change', () => saveInputValue(id));
        }
    });
});

// Fungsi Bantuan (Hint)
function toggleHint(id) {
    const hintElement = document.getElementById('hint' + id);
    const btn = document.querySelector(`.btn-hint[onclick="toggleHint('${id}')"]`);
    
    if (hintElement.classList.contains('hidden')) {
        hintElement.classList.remove('hidden');
        btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Tutup';
    } else {
        hintElement.classList.add('hidden');
        btn.innerHTML = '<i class="fa-regular fa-lightbulb"></i> Bantuan';
    }
}

// =========================================
// 2. LOGIKA MATEMATIKA (Fase 2, 3, & Uji Coba)
// =========================================
// =========================================
// 2. LOGIKA MATEMATIKA (Fase 2, 3, & Uji Coba)
// =========================================
async function checkAnswer(type) {
    let feedback, message; 
    let isCorrect = false; // Default status jawaban adalah Salah

    // KUNCI JAWABAN (A(224, 318), B(299, 414)) -> m = 1.28, c = 31.28
    const KUNCI_M = 1.28;
    const VALID_ANSWERS = [
        "1.28x+31.28", "y=1.28x+31.28", 
        "1,28x+31,28", "y=1,28x+31,28"
    ];

    // --- METODE BU SINTYA ---
    if (type === 'metode1') { 
        feedback = document.getElementById('feedback_metode1');
        let rawInput = document.getElementById('jawab_metode1').value.toLowerCase().trim();
        
        if (rawInput === '') {
            message = '<i class="fa-solid fa-circle-exclamation"></i> Isilah persamaan garis yang benar.';
            feedback.innerHTML = message; feedback.className = 'feedback wrong'; return;
        }
        
        let ans = rawInput.replace(/\s/g, '');
        if (VALID_ANSWERS.some(kunci => ans.includes(kunci.replace("y=", "")))) {
            isCorrect = true;
            message = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Rumus akhirnya adalah <strong>y = 1.28x + 31.28</strong> (atau 1,28x + 31,28).';
            await saveAnswer('Metode Bu Sintya', rawInput, true);
        } else {
            message = '<i class="fa-solid fa-circle-xmark"></i> Kurang tepat. Cek lagi operasi pada persamaannya.';
            await saveAnswer('Metode Bu Sintya', rawInput, false);
        }
    } 
    // --- METODE PAK ANDI ---
    else if (type === 'metode2') { 
        feedback = document.getElementById('feedback_metode2');
        let gradInput = document.getElementById('jawab_gradien').value.trim();
        
        if (gradInput === '') {
            message = `<i class="fa-solid fa-circle-exclamation"></i> Hitung gradiennya terlebih dahulu.`;
            feedback.innerHTML = message; feedback.className = 'feedback wrong'; return;
        }

        let grad = parseFloat(gradInput.replace(',', '.'));
        let rawInput = document.getElementById('jawab_metode2').value.toLowerCase();
        let ans = rawInput.replace(/\s/g, '');

        if (grad !== KUNCI_M) {
            message = `<i class="fa-solid fa-circle-exclamation"></i> Gradien salah. Hitung kembali gradiennya.`;
            feedback.innerHTML = message; feedback.className = 'feedback wrong'; return;
        }

        if (VALID_ANSWERS.some(kunci => ans.includes(kunci.replace("y=", "")))) {
            isCorrect = true;
            message = '<i class="fa-solid fa-check-circle"></i> <strong>Sempurna!</strong> Pak Andi menemukan tarif listrik Rp1.280/kWh dan Beban Rp31.280.';
            await saveAnswer('Metode Pak Andi', rawInput, true);
        } else {
            message = '<i class="fa-solid fa-circle-xmark"></i> Gradien benar, tapi persamaan akhirnya salah hitung.';
            await saveAnswer('Metode Pak Andi', rawInput, false);
        }
    }
    // --- KESIMPULAN ---
    else if (type === 'kesimpulan') {
        feedback = document.getElementById('feedback_kesimpulan');
        let ans = document.getElementById('jawab_kesimpulan').value;
        if (ans === 'Ya') {
            isCorrect = true;
            message = '<i class="fa-solid fa-thumbs-up"></i> Tepat! Matematika itu konsisten.';
            document.getElementById('reasonSection').classList.add('hidden');
            document.getElementById('finalEquationSection').classList.remove('hidden');
        } else if (ans === 'Tidak') {
            message = '<i class="fa-solid fa-circle-question"></i>';
            feedback.style.display = 'none';
            document.getElementById('reasonSection').classList.remove('hidden');
            document.getElementById('finalEquationSection').classList.add('hidden');
            return;
        } else {
            message = 'Pilih jawaban dulu.'; feedback.innerHTML = message; return;
        }
    }
    // --- UJI COBA 1 (100 kWh) ---
    else if (type === 5) { 
        feedback = document.getElementById('feedback5');
        let ansRaw = document.getElementById('jawab5').value;
        let ans = parseFloat(ansRaw.replace(',', '.')); 

        if (Math.abs(ans - 159280) <= 0) {
            isCorrect = true;
            message = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Tagihan untuk 100 kWh adalah Rp159.280.';
            await saveAnswer('Tagihan 100 kWh', ansRaw, true);
        } else {
            message = '<i class="fa-solid fa-circle-xmark"></i> Salah. Substitusi nilai x = 100 pada persamaan final.';
            await saveAnswer('Tagihan 100 kWh', ansRaw, false);
        }
    }
    // --- UJI COBA 2 (Beban/Abodemen) ---
    else if (type === 6) { 
        feedback = document.getElementById('feedback6');
        let ans = document.getElementById('jawab6').value;
        let followup = document.getElementById('followup6');
        let followupQuestion = document.getElementById('followupQuestion6');

        if (ans === 'Iya') {
            followupQuestion.innerHTML = 'Berapa tagihan listrik jika pemakaian 0 kWh? (tulis angka, tanpa titik atau koma).';
            document.getElementById('prefix6').style.display = 'inline';
            followup.classList.remove('hidden');
            
            isCorrect = true; // Agar background jadi hijau
            message = 'Jawaban diterima.';
        } else if (ans === 'Tidak') {
            followupQuestion.innerHTML = 'Mengapa Pak Andi tidak membayar?';
            document.getElementById('prefix6').style.display = 'none';
            followup.classList.remove('hidden');
            
            isCorrect = true; // Agar background jadi hijau
            message = 'Jawaban diterima.';
        } else {
            message = 'Pilih jawaban dulu.'; feedback.innerHTML = message; return;
        }
    }
    // --- FOLLOW UP UJI COBA 2 ---
    else if (type === '6.1') { 
        feedback = document.getElementById('feedback6follow');
        let ans = document.getElementById('jawab6follow').value.trim();
        let mainAns = document.getElementById('jawab6').value;

        if (mainAns === 'Iya') {
            // Cek angka 31280 (Biaya Beban)
            let numAns = parseFloat(ans.replace(',', '.')); // Handle koma atau titik
            if (Math.abs(numAns - 31280) < 1) {
                isCorrect = true; // PENTING: Set true agar background hijau
                message = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Tagihan tetap Rp31.280 (biaya beban).';
                await saveAnswer('Tagihan 0 kWh', ans, true);
            } else {
                message = '<i class="fa-solid fa-circle-xmark"></i> Salah. Substitusi nilai x = 0 pada persamaan final.';
                await saveAnswer('Tagihan 0 kWh', ans, false);
            }
        } else if (mainAns === 'Tidak') {
            // Logika jika siswa menjawab Tidak ada tagihan
            if (ans.toLowerCase().includes('beban') || ans.toLowerCase().includes('31280')) {
                isCorrect = true;
                message = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Namun hati-hati, biasanya tetap ada biaya beban Rp31.280.';
                await saveAnswer('Tagihan 0 kWh', ans, true);
            } else {
                message = '<i class="fa-solid fa-circle-xmark"></i> Kurang tepat. Biasanya ada biaya beban tetap.';
                await saveAnswer('Tagihan 0 kWh', ans, false);
            }
        }
    }

    // --- RENDER FINAL ---
    feedback.innerHTML = message;
    // Baris ini akan menentukan warna berdasarkan nilai isCorrect di atas
    feedback.className = isCorrect ? 'feedback correct' : 'feedback wrong';

    // Check if all answers are completed
    checkCompletion();
}

// =========================================
// 3. FASE 1: CEK KOORDINAT INPUT MANUAL
// =========================================
function checkCoordAnswer(point) {
    const feedback = document.getElementById('coordFeedback');
    let correctX, correctY, inputX, inputY;
    if (point === 'A') {
        correctX = 224; correctY = 318;
        inputX = parseInt(document.getElementById('coordAx').value);
        inputY = parseInt(document.getElementById('coordAy').value);
    } else if (point === 'B') {
        correctX = 299; correctY = 414;
        inputX = parseInt(document.getElementById('coordBx').value);
        inputY = parseInt(document.getElementById('coordBy').value);
    } else { return; }

    if (isNaN(inputX) || isNaN(inputY)) {
        feedback.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Isilah nilai dari x dan y.`;
        feedback.className = 'feedback wrong';
    } else if (inputX === correctX && inputY === correctY) {
        feedback.innerHTML = `<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Koordinat ${point} adalah (${correctX}, ${correctY}).`;
        feedback.className = 'feedback correct';
    } else {
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Salah. Cek lagi soal ceritanya.`;
        feedback.className = 'feedback wrong'; // Diganti wrong agar merah jika salah
    }
}

// =========================================
// 4. VISUALISASI GRAFIK (CHART.JS)
// =========================================

let myChart; 

// -- Fungsi Kontrol Grafik --
function undoPoint() {
    if (myChart && myChart.data.datasets[0].data.length > 0) {
        myChart.data.datasets[0].data.pop();
        myChart.update();
        document.getElementById('graphFeedback').innerHTML = ''; 
    }
}

function clearAllPoints() {
    if (myChart) {
        myChart.data.datasets[0].data = [];
        myChart.update();
        document.getElementById('graphFeedback').innerHTML = ''; 
    }
}

// -- Fungsi Cek Grafik --
function checkGraphPoints() {
    if (!myChart) return;
    const points = myChart.data.datasets[0].data;
    const feedback = document.getElementById('graphFeedback');

    const hasA = points.some(p => Math.abs(p.x - 224) <= 1 && Math.abs(p.y - 318) <= 1);
    const hasB = points.some(p => Math.abs(p.x - 299) <= 1 && Math.abs(p.y - 414) <= 1);

    if (hasA && hasB) {
        feedback.innerHTML = `<i class="fa-solid fa-check-circle"></i> <strong>Luar Biasa!</strong> Kamu berhasil menempatkan titik A(224, 318) dan B(299, 414) dengan tepat.`;
        feedback.className = 'feedback correct';
    } else {
        let missing = [];
        if (!hasA) missing.push('A(224, 318)');
        if (!hasB) missing.push('B(299, 414)');
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <strong>Belum Tepat.</strong> Titik yang hilang/salah posisi: ${missing.join(' dan ')}. <br>Gunakan scroll bar untuk mencari koordinat yang pas.`;
        feedback.className = 'feedback wrong';
    }
}

// -- Inisialisasi Chart --
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart');
    if (ctx) {
        const chartCtx = ctx.getContext('2d');
        const dataPoints = []; 

        myChart = new Chart(chartCtx, {
            type: 'scatter', 
            data: {
                datasets: [{
                    label: 'Posisi Tagihan',
                    data: dataPoints,
                    backgroundColor: '#9C27B0',
                    borderColor: '#9C27B0',
                    pointRadius: 8,
                    pointHoverRadius: 12,
                    showLine: true, 
                    borderWidth: 2,
                    fill: false,
                    tension: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, 
                onClick: function(event, elements) {
                    if (elements.length > 0) {
                        const element = elements[0];
                        const dataIndex = element.index;
                        const point = this.data.datasets[0].data[dataIndex];
                        showPointQuestion(point); 
                    } else {
                        const canvasPosition = Chart.helpers.getRelativePosition(event, this);
                        const xValue = this.scales.x.getValueForPixel(canvasPosition.x);
                        const yValue = this.scales.y.getValueForPixel(canvasPosition.y);

                        const label = String.fromCharCode(65 + this.data.datasets[0].data.length); 
                        const newPoint = { x: Math.round(xValue), y: Math.round(yValue), label: label };

                        this.data.datasets[0].data.push(newPoint);
                        this.update();
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Pemakaian Listrik (kWh)', font: {weight:'bold'}, color:'#333' },
                        min: 200, max: 350, 
                        grid: { display: true },
                        ticks: { stepSize: 10, callback: function(value) { return Math.round(value); } }
                    },
                    y: {
                        title: { display: true, text: 'Biaya Tagihan (dalam Ribuan Rupiah)', font: {weight:'bold'}, color:'#333' },
                        min: 250, max: 450, 
                        grid: { display: true },
                        ticks: { stepSize: 10, callback: function(value) { return Math.round(value); } }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let x = context.parsed.x;
                                let y = context.parsed.y;
                                let labelPoint = context.raw.label || '?'; 
                                return `${labelPoint}(${x}, ${y}), Pemakaian ${x} kWh, Tagihan Rp${y}.000`;
                            }
                        }
                    },
                    legend: { display: false },
                    datalabels: {
                        display: true, color: 'white', font: { weight: 'bold' },
                        formatter: function(value) { return value.label; }
                    },
                    zoom: {
                        pan: { enabled: true, mode: 'xy' },
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'xy' }
                    }
                }
            }
        });
    }
});

// =========================================
// 5. MODAL KUIS & PENGEMBANGAN
// =========================================
let currentPoint = null;

function showPointQuestion(point) {
    currentPoint = point;
    const modal = document.getElementById('pointQuestionModal');
    const questionText = document.getElementById('questionText');
    const answerInput = document.getElementById('pointAnswer');
    const feedback = document.getElementById('pointFeedback');

    answerInput.value = '';
    feedback.innerHTML = '';
    
    const type = Math.random() > 0.5 ? 'x' : 'y';
    if (type === 'x') {
        questionText.innerHTML = `Pada titik ini, berapa <strong>Pemakaian Listrik (kWh)</strong>?`;
        answerInput.dataset.type = 'x'; 
    } else {
        questionText.innerHTML = `Pada titik ini, berapa <strong>Biaya Tagihan</strong> (angka ratusan)?`;
        answerInput.dataset.type = 'y';
    }

    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('pointQuestionModal').style.display = 'none';
    currentPoint = null;
}

function checkPointAnswer() {
    if (!currentPoint) return;

    const answerInput = document.getElementById('pointAnswer');
    const feedback = document.getElementById('pointFeedback');
    const userAnswer = parseFloat(answerInput.value);
    const type = answerInput.dataset.type;

    let correctAnswer = (type === 'x') ? currentPoint.x : currentPoint.y;

    if (userAnswer === correctAnswer) {
        feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Kamu hebat membaca grafik.';
        feedback.className = 'feedback correct';
        setTimeout(closeModal, 1500);
    } else {
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Salah. Jawaban yang benar adalah ${correctAnswer}.`;
        feedback.className = 'feedback wrong';
    }
}

function submitReason() {
    const reason = document.getElementById('reasonText').value.trim();
    const feedback = document.getElementById('reasonFeedback');
    if (reason === '') {
        feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Harap isi alasan.';
        feedback.className = 'feedback wrong';
    } else {
        feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> Alasan diterima. Terima kasih atas tanggapannya!';
        feedback.className = 'feedback correct';
    }
}

function checkFinalEquation() {
    const equation = document.getElementById('finalEquation').value.toLowerCase().replace(/\s/g, '');
    const feedback = document.getElementById('finalFeedback');
    
    const validEquations = [
        "1.28x+31.28", "y=1.28x+31.28", 
        "1,28x+31,28", "y=1,28x+31,28"
    ];

    if (validEquations.some(eq => equation.includes(eq.replace("y=", "")))) {
        feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Persamaan final telah dikonfirmasi.';
        feedback.className = 'feedback correct';
    } else {
        feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Persamaan belum tepat. Pastikan formatnya y = mx + c (bisa pakai titik atau koma).';
        feedback.className = 'feedback wrong';
    }
}

function checkDevAnswer(num) {
    const feedback = document.getElementById('devFeedback' + num);

    if (num === 1) {
        const rawAns = document.getElementById('devAnswer1').value.toLowerCase().trim();
        const validAnswers = ['gradien', 'kemiringan', 'm', 'gradient'];

        if (validAnswers.some(key => rawAns.includes(key))) {
            feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> <strong>Benar!</strong> Itu adalah rumus <strong>Gradien (m)</strong>.';
            feedback.className = 'feedback correct';
        } else {
            feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Kurang tepat. Coba ingat kembali, rumus (y2-y1)/(x2-x1) itu rumus apa?';
            feedback.className = 'feedback wrong';
        }
    } else if (num === 2) {
        const ans = document.getElementById('devAnswer2').value.trim();
        if (ans.length > 15) {
            feedback.innerHTML = '<i class="fa-solid fa-check-circle"></i> <strong>Pendapat Diterima!</strong> Analisis yang bagus.';
            feedback.className = 'feedback correct';
        } else {
            feedback.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Jawaban terlalu singkat.';
            feedback.className = 'feedback wrong';
        }
    }

    // Check completion after dev answers
    setTimeout(checkCompletion, 500);
}

// Fungsi untuk mengecek apakah semua jawaban telah diisi
function checkCompletion() {
    const requiredIds = [
        'coordAx', 'coordAy', 'coordBx', 'coordBy',
        'jawab_metode1', 'jawab_gradien', 'jawab_metode2',
        'jawab_kesimpulan', 'finalEquation',
        'jawab5', 'jawab6',
        'devAnswer1', 'devAnswer2'
    ];

    const allFilled = requiredIds.every(id => {
        const element = document.getElementById(id);
        return element && element.value.trim() !== '';
    });

    // Check if graph has points A and B
    let graphComplete = false;
    if (myChart) {
        const points = myChart.data.datasets[0].data;
        const hasA = points.some(p => Math.abs(p.x - 224) <= 1 && Math.abs(p.y - 318) <= 1);
        const hasB = points.some(p => Math.abs(p.x - 299) <= 1 && Math.abs(p.y - 414) <= 1);
        graphComplete = hasA && hasB;
    }

    if (allFilled && graphComplete && !localStorage.getItem('submitted')) {
        document.getElementById('confirmationModal').style.display = 'flex';
    }
}

// Fungsi untuk konfirmasi submission
async function confirmSubmission() {
    // Disable all inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.disabled = true);

    // Mark as submitted
    localStorage.setItem('submitted', 'true');

    // Close modal
    closeConfirmationModal();

    // Optional: Show success message
    alert('Jawaban telah disimpan dan dikunci. Terima kasih!');
}

// Fungsi untuk menutup modal konfirmasi
function closeConfirmationModal() {
    document.getElementById('confirmationModal').style.display = 'none';
}

// =========================================
// 6. VALIDASI & SUBMIT FINAL (UPDATED)
// =========================================

function validateAndOpenModal() {
    // 1. Daftar ID Input Utama yang wajib diisi
    let requiredIds = [
        'nama-siswa', 'kelompok-siswa',
        'coordAx', 'coordAy', 'coordBx', 'coordBy',
        'jawab_metode1', 'jawab_gradien', 'jawab_metode2',
        'jawab_kesimpulan', 'finalEquation',
        'jawab5', 'jawab6',
        'devAnswer1', 'devAnswer2'
    ];

    // 2. Logika Tambahan: Cek input follow-up HANYA jika terlihat (tidak hidden)
    // Cek Follow up soal nomor 6
    const followup6 = document.getElementById('followup6');
    if (followup6 && !followup6.classList.contains('hidden')) {
        requiredIds.push('jawab6follow');
    }

    // 3. Cek Alasan Kesimpulan (Jika menjawab Tidak)
    const reasonSection = document.getElementById('reasonSection');
    if (reasonSection && !reasonSection.classList.contains('hidden')) {
        requiredIds.push('reasonText');
    }

    // 4. Lakukan Pengecekan
    let emptyCount = 0;
    
    // Kita filter ID mana saja yang masih kosong
    requiredIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value.trim() === '') {
            el.style.borderColor = 'red'; // Beri tanda merah
            emptyCount++;
        } else if (el) {
            el.style.borderColor = '#ddd'; // Reset warna jika sudah isi
        }
    });

    // 5. Keputusan
    if (emptyCount > 0) {
        alert(`Masih ada ${emptyCount} kolom jawaban yang belum diisi! Silakan lengkapi yang berwarna merah.`);
        
        // Scroll ke elemen pertama yang kosong agar siswa tahu
        const firstEmpty = requiredIds.find(id => {
             const el = document.getElementById(id); 
             return el && el.value.trim() === '';
        });
        if(firstEmpty) document.getElementById(firstEmpty).scrollIntoView({behavior: "smooth", block: "center"});

    } else {
        // Jika semua lengkap, BUKA MODAL
        document.getElementById('confirmationModal').style.display = 'flex';
    }
}

// Fungsi dijalankan saat tombol "Ya, Saya Yakin" ditekan
async function confirmSubmission() {
    // 1. Simpan status ke LocalStorage
    localStorage.setItem('submitted', 'true');

    // 2. Disable semua input, select, textarea, dan button cek
    const inputs = document.querySelectorAll('input, select, textarea, button.btn-check');
    inputs.forEach(el => {
        el.disabled = true;
        el.style.opacity = '0.7';
        el.style.cursor = 'not-allowed';
    });

    // 3. Sembunyikan tombol Submit Final agar tidak diklik lagi
    const btnFinal = document.getElementById('btnFinalSubmit');
    if(btnFinal) btnFinal.style.display = 'none';

    // 4. Tutup Modal
    closeConfirmationModal();

    // 5. Beri Pesan Sukses
    alert('Selamat! Semua jawaban telah terkunci dan tersimpan.');
    
    // (Opsional) Scroll ke atas
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// File: script.js

// =========================================
// UPDATE: FUNGSI SUBMIT FINAL (FIX GRADIEN)
// =========================================
async function confirmSubmission() {
    const btn = document.querySelector('#confirmationModal .btn-check');
    if(btn) { btn.innerText = "Menyimpan..."; btn.disabled = true; }

    const sName = document.getElementById('nama-siswa').value || 'Tanpa Nama';
    let dataToSave = [];
    const isEq = (v) => v.replace(/\s/g,'').includes('1.28x') && v.includes('31.28');

    // 1. DATA UTAMA
    const m1 = document.getElementById('jawab_metode1');
    if(m1 && m1.value) dataToSave.push({ student_name: sName, question: 'Metode Bu Sintya', answer: m1.value, is_correct: isEq(m1.value) });

    // --- [BARU] Simpan Gradien Pak Andi ---
    const grad = document.getElementById('jawab_gradien');
    if(grad && grad.value) {
        // Cek apakah 1.28 (Benar)
        const val = parseFloat(grad.value.replace(',', '.'));
        dataToSave.push({ student_name: sName, question: 'Gradien Pak Andi', answer: grad.value, is_correct: (val === 1.28) });
    }

    const m2 = document.getElementById('jawab_metode2');
    if(m2 && m2.value) dataToSave.push({ student_name: sName, question: 'Metode Pak Andi', answer: m2.value, is_correct: isEq(m2.value) });
    
    // 2. REFLEKSI & KESIMPULAN
    const kes = document.getElementById('jawab_kesimpulan');
    if(kes && kes.value) dataToSave.push({ student_name: sName, question: 'Kesimpulan', answer: kes.value, is_correct: (kes.value === 'Ya') });

    const final = document.getElementById('finalEquation');
    if(final && final.value) dataToSave.push({ student_name: sName, question: 'Persamaan Final', answer: final.value, is_correct: isEq(final.value) });
    
    const reason = document.getElementById('reasonText');
    if(reason && reason.value && !document.getElementById('reasonSection').classList.contains('hidden')) {
        dataToSave.push({ student_name: sName, question: 'Alasan Kesimpulan', answer: reason.value, is_correct: true });
    }

    // 3. UJI COBA
    const j5 = document.getElementById('jawab5');
    if(j5 && j5.value) dataToSave.push({ student_name: sName, question: 'Tagihan 100 kWh', answer: j5.value, is_correct: Math.abs(j5.value - 159280) < 1 });

    const j6 = document.getElementById('jawab6follow');
    if(j6 && j6.value) dataToSave.push({ student_name: sName, question: 'Tagihan 0 kWh', answer: j6.value, is_correct: Math.abs(j6.value - 31280) < 1 });

    // 4. DATA TAMBAHAN
    const kel = document.getElementById('kelompok-siswa');
    if(kel && kel.value) dataToSave.push({ student_name: sName, question: 'Info Kelompok', answer: kel.value, is_correct: true });

    const ax = document.getElementById('coordAx'); const ay = document.getElementById('coordAy');
    if(ax && ay) dataToSave.push({ student_name: sName, question: 'Koordinat A', answer: `(${ax.value}, ${ay.value})`, is_correct: (ax.value==224 && ay.value==318) });
    
    const bx = document.getElementById('coordBx'); const by = document.getElementById('coordBy');
    if(bx && by) dataToSave.push({ student_name: sName, question: 'Koordinat B', answer: `(${bx.value}, ${by.value})`, is_correct: (bx.value==299 && by.value==414) });

    const dev1 = document.getElementById('devAnswer1');
    if(dev1 && dev1.value) dataToSave.push({ student_name: sName, question: 'Analisis Rumus', answer: dev1.value, is_correct: true });
    
    const dev2 = document.getElementById('devAnswer2');
    if(dev2 && dev2.value) dataToSave.push({ student_name: sName, question: 'Pendapat Kelompok', answer: dev2.value, is_correct: true });

    // 5. GRAFIK
    if (typeof myChart !== 'undefined' && myChart.data.datasets[0].data.length > 0) {
        const points = JSON.stringify(myChart.data.datasets[0].data);
        dataToSave.push({ student_name: sName, question: 'Grafik Chart', answer: points, is_correct: true });
    }

    if (supabaseClient && dataToSave.length > 0) {
        await supabaseClient.from('student_answers').insert(dataToSave);
    }

    localStorage.clear(); 
    localStorage.setItem('submitted', 'true');
    window.location.href = 'closing.html';
}

// =========================================
// 6. REVIEW MODE GURU (FULL UPDATE + GRADIEN)
// =========================================
window.addEventListener('load', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const namaSiswa = urlParams.get('siswa');

    if (namaSiswa) {
        // A. Spanduk
        const banner = document.createElement('div');
        banner.className = 'review-banner';
        banner.innerHTML = `<i class="fa-solid fa-lock"></i> MODE KOREKSI: Jawaban <strong>${namaSiswa}</strong>`;
        document.body.prepend(banner);
        document.body.style.marginTop = '60px';

        // B. Sembunyikan Tombol
        const elementsToHide = document.querySelectorAll('#btnFinalSubmit, .chart-controls button, .btn-check');
        elementsToHide.forEach(el => el.style.display = 'none');

        // C. Ambil Data
        if (!supabaseClient) return;
        const { data } = await supabaseClient.from('student_answers').select('*').eq('student_name', namaSiswa);

        if (data && data.length > 0) {
            const mapSoal = {
                'Metode Bu Sintya': 'jawab_metode1',
                'Gradien Pak Andi': 'jawab_gradien', // <--- INI BARIS BARUNYA
                'Metode Pak Andi': 'jawab_metode2',
                'Kesimpulan': 'jawab_kesimpulan',
                'Alasan Kesimpulan': 'reasonText',
                'Persamaan Final': 'finalEquation',
                'Tagihan 100 kWh': 'jawab5',
                'Tagihan 0 kWh': 'jawab6follow',
                'Info Kelompok': 'kelompok-siswa',
                'Analisis Rumus': 'devAnswer1',
                'Pendapat Kelompok': 'devAnswer2'
            };

            data.forEach(item => {
                // 1. Unhide Bagian Tersembunyi
                if (item.question === 'Persamaan Final') document.getElementById('finalEquationSection').classList.remove('hidden');
                if (item.question === 'Alasan Kesimpulan') document.getElementById('reasonSection').classList.remove('hidden');

                // 2. Grafik Chart
                if (item.question === 'Grafik Chart' && typeof myChart !== 'undefined') {
                    try {
                        const points = JSON.parse(item.answer);
                        myChart.data.datasets[0].data = points;
                        myChart.update();
                    } catch(e) {}
                }

                // 3. Koordinat
                if (item.question === 'Koordinat A') {
                    const match = item.answer.match(/-?\d+/g);
                    if(match) { document.getElementById('coordAx').value = match[0]; document.getElementById('coordAy').value = match[1]; }
                }
                if (item.question === 'Koordinat B') {
                    const match = item.answer.match(/-?\d+/g);
                    if(match) { document.getElementById('coordBx').value = match[0]; document.getElementById('coordBy').value = match[1]; }
                }

                // 4. Tagihan 0 kWh
                if (item.question === 'Tagihan 0 kWh') {
                    const drop = document.getElementById('jawab6');
                    if (drop) {
                        drop.value = (item.answer.includes('31280') || item.answer.toLowerCase().includes('beban')) ? 'Iya' : 'Tidak';
                        document.getElementById('followup6').classList.remove('hidden');
                    }
                }

                // 5. Input Biasa (Termasuk Gradien)
                let id = mapSoal[item.question];
                if (id) {
                    let el = document.getElementById(id);
                    if (el) {
                        el.value = item.answer;
                        if (item.is_correct !== null) {
                            el.style.backgroundColor = item.is_correct ? '#d4edda' : '#f8d7da';
                        }
                    }
                }
            });
        }

        // D. KUNCI TOTAL
        const allInputs = document.querySelectorAll('input, select, textarea');
        allInputs.forEach(el => {
            el.disabled = true;
            el.style.backgroundColor = '#e9ecef';
            el.style.color = '#495057';
            el.style.cursor = 'not-allowed';
            el.style.opacity = '1';
        });
        
        document.getElementById('nama-siswa').value = namaSiswa;
    }
});