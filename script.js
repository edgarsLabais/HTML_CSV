// 1. TULKOJUMU VĀRDNĪCA
const tulkojumi = {
    lv: {
        h_title: "MANA SISTĒMA",
        n_home: "Sākums",
        n_db: "Datu bāze",
        s_aaa: "Sadaļa AAA",
        s_bbb: "Sadaļa BBB",
        f_text: "© 2026 - Mans Projekts",
        search_pl: "Meklēt tabulā...",
        welcome: "<h2>Sveicināti!</h2><p>Izvēlieties sadaļu kreisajā malā, lai sāktu darbu.</p>",
        aaa_content: "<h2>Sadaļa AAA</h2><p>Šis ir AAA sadaļas saturs, ko vari pielāgot pēc vajadzības.</p>",
        bbb_content: "<h2>Sadaļa BBB</h2><p>Šeit ir informācija par BBB tēmu un citi dati.</p>",
        tab_head: { 
            kategorija: "Kategorija", 
            nosaukums: "Nosaukums", 
            daudzums: "Skaits", 
            statuss: "Statuss" 
        }
    },
    en: {
        h_title: "MY SYSTEM",
        n_home: "Home",
        n_db: "Database",
        s_aaa: "Section AAA",
        s_bbb: "Section BBB",
        f_text: "© 2026 - My Project",
        search_pl: "Search in table...",
        welcome: "<h2>Welcome!</h2><p>Select a section from the sidebar to begin.</p>",
        aaa_content: "<h2>Section AAA</h2><p>This is the content of section AAA.</p>",
        bbb_content: "<h2>Section BBB</h2><p>Here is the info about BBB topic and other data.</p>",
        tab_head: { 
            kategorija: "Category", 
            nosaukums: "Item Name", 
            daudzums: "Qty", 
            statuss: "Status" 
        }
    }
};

let aktivaSadala = 'welcome';
let csvDati = "";

// 2. GALVENĀ SATURA MAINĪŠANAS FUNKCIJA
async function raditSaturu(sadala) {
    aktivaSadala = sadala;
    const mainLauks = document.getElementById('main-content');
    const val = localStorage.getItem('val') || 'lv';

    // Ja izvēlēta datu bāze
    if (sadala === 'db') {
        mainLauks.innerHTML = `
            <div style="margin-bottom: 15px;">
                <input type="text" id="mekletajs" onkeyup="filtreTabulu()" placeholder="${tulkojumi[val].search_pl}">
            </div>
            <div id="tab-v">Ielādē datus...</div>
        `;
        await ieladetCSV();
    } else {
        // Parastajām teksta sadaļām
        const saturs = tulkojumi[val][sadala + '_content'] || tulkojumi[val][sadala];
        mainLauks.innerHTML = saturs;
    }
}

// 3. CSV DATU IELĀDE NO FAILA
async function ieladetCSV() {
    const tabulasVieta = document.getElementById('tab-v');
    try {
        const res = await fetch('dati.csv');
        
        if (!res.ok) {
            throw new Error(`Fails 'dati.csv' netika atrasts (Status: ${res.status})`);
        }

        csvDati = await res.text();
        zimetTabulu();
    } catch (e) {
        console.error("Kļūda:", e);
        if (tabulasVieta) {
            tabulasVieta.innerHTML = `
                <div style="color: #a41c2c; padding: 20px; border: 1px solid #ddd; background: #fdf2f2;">
                    <strong>Kļūda ielādējot datus:</strong><br>
                    ${e.message}<br><br>
                    <em>Atceries: Ja atver failu tieši no mapes, pārlūks bloķē datu nolasīšanu. 
                    Lūdzu, augšupielādē failus GitHub un izmanto GitHub Pages!</em>
                </div>`;
        }
    }
}

// 4. TABULAS ZĪMĒŠANA (GENERĒŠANA)
function zimetTabulu() {
    const val = localStorage.getItem('val') || 'lv';
    const rindas = csvDati.trim().split('\n');
    
    if (rindas.length === 0) return;

    let html = '<table id="mana-tabula">';
    
    rindas.forEach((rinda, i) => {
        const kolonas = rinda.split(',');
        html += '<tr>';
        
        kolonas.forEach(elements => {
            const teksts = elements.trim();
            if (i === 0) {
                // Pārtulkojam galvenes nosaukumu, ja tas ir vārdnīcā
                const key = teksts.toLowerCase();
                const tulkotsVirsraksts = tulkojumi[val].tab_head[key] || teksts;
                html += `<th>${tulkotsVirsraksts}</th>`;
            } else {
                html += `<td>${teksts}</td>`;
            }
        });
        html += '</tr>';
    });

    const tabVieta = document.getElementById('tab-v');
    if (tabVieta) {
        tabVieta.innerHTML = html + '</table>';
    }
}

// 5. MEKLĒŠANAS UN FILTRĒŠANAS LOĢIKA
function filtreTabulu() {
    const vertiba = document.getElementById('mekletajs').value.toLowerCase();
    const rindas = document.querySelectorAll('#mana-tabula tr');

    rindas.forEach((rinda, indekss) => {
        if (indekss === 0) return; // Nepaslēpt virsrakstus
        const saturs = rinda.innerText.toLowerCase();
        if (saturs.includes(vertiba)) {
            rinda.classList.remove('hidden');
        } else {
            rinda.classList.add('hidden');
        }
    });
}

// 6. VALODAS MAINĪŠANA
function nomainitValodu(v) {
    localStorage.setItem('val', v);
    
    // Atjaunojam visus statiskos tekstus lapā
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const atslega = el.getAttribute('data-i18n');
        if (tulkojumi[v][atslega]) {
            el.innerText = tulkojumi[v][atslega];
        }
    });

    // Atjaunojam aktīvās pogas vizuālo stilu
    document.querySelectorAll('.v-btn').forEach(btn => {
        btn.classList.toggle('active', btn.innerText.toLowerCase() === v);
    });

    // Pārzīmējam aktuālo sadaļu jaunajā valodā
    raditSaturu(aktivaSadala);
}

// 7. SĀKOTNĒJĀ IELĀDE
document.addEventListener('DOMContentLoaded', () => {
    const saglabataValoda = localStorage.getItem('val') || 'lv';
    nomainitValodu(saglabataValoda);
});
