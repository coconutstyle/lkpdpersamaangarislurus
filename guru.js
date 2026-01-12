// 1. SETUP SUPABASE (GUNAKAN KODE YANG SAMA DENGAN script.js SISWA)

// 2. SISTEM LOGIN SEDERHANA
function checkPin() {
    const pin = document.getElementById('pinInput').value.trim();
    if (pin === '1234') {
        document.getElementById('loginOverlay').style.display = 'none';

        // Hanya panggil fetch data kalau supabase berhasil dimuat
        if (supabase) {
            fetchData();
        } else {
            alert("Login berhasil, tapi Supabase error/belum konek.");
        }
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

// --- BAGIAN SUPABASE (PASTIKAN INTERNET LANCAR) ---
const supabaseUrl = 'https://cydgsvqybhhfedoazfok.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZGdzdnF5YmhoZmVkb2F6Zm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NDc5ODAsImV4cCI6MjA4MzQyMzk4MH0.4p4It2z4qVyLNydXwNdOHx9es7R5zAbB-EevFZVk5Y8';

let supabase = null;

try {
    // Coba inisialisasi
    supabase = supabase.createClient(supabaseUrl, supabaseKey);
    console.log("Supabase berhasil dimuat");
} catch (err) {
    console.error("Supabase GAGAL dimuat. Login tetap akan jalan, tapi data tidak muncul.");
    console.error(err);
}

// 3. FUNGSI AMBIL DATA DARI DATABASE
async function fetchData() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Mengambil data terbaru...</td></tr>';

    if (!supabase) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Supabase tidak terinisialisasi.</td></tr>';
        return;
    }

    // Query ke tabel 'student_answers'
    const { data, error } = await supabase
        .from('student_answers')
        .select('*')
        .order('timestamp', { ascending: false }); // Urutkan dari yang terbaru

    if (error) {
        console.error("Error:", error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Gagal memuat data. Cek koneksi internet.</td></tr>';
        return;
    }

    renderTable(data);
    updateStats(data);
}

// 4. RENDER DATA KE TABEL HTML
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Bersihkan loading

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada data masuk.</td></tr>';
        return;
    }

    data.forEach(row => {
        // Format Waktu
        const dateObj = new Date(row.timestamp);
        const timeString = dateObj.toLocaleDateString('id-ID') + ' ' + dateObj.toLocaleTimeString('id-ID');
        
        // Tentukan Badge Status
        const statusBadge = row.is_correct 
            ? '<span class="badge badge-correct">Benar</span>' 
            : '<span class="badge badge-wrong">Salah</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${timeString}</td>
            <td style="font-weight:bold;">${row.student_name}</td>
            <td>${row.question}</td>
            <td>${row.answer}</td>
            <td>${statusBadge}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// 5. UPDATE KARTU STATISTIK
function updateStats(data) {
    document.getElementById('totalEntries').textContent = data.length;
    
    const correctCount = data.filter(item => item.is_correct).length;
    document.getElementById('totalCorrect').textContent = correctCount;
    
    const wrongCount = data.filter(item => !item.is_correct).length;
    document.getElementById('totalWrong').textContent = wrongCount;
}

// 6. FITUR EXPORT KE EXCEL (CSV)
function exportToExcel() {
    // Ambil tabel HTML
    const table = document.getElementById("recapTable");
    let rows = [];
    
    // Loop setiap baris tabel
    for (let i = 0; i < table.rows.length; i++) {
        let row = [], cols = table.rows[i].cells;
        for (let j = 0; j < cols.length; j++) {
            // Bersihkan teks dari enter/spasi berlebih
            let cleanText = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
            row.push(`"${cleanText}"`); // Bungkus dengan tanda kutip untuk CSV aman
        }
        rows.push(row.join(","));
    }

    // Buat file CSV
    let csvContent = "data:text/csv;charset=utf-8," + rows.join("\n");
    
    // Buat link download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Rekap_Nilai_Siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}