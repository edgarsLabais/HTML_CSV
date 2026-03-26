let tulkojumi = {}; 
let aktivaSadala = 'welcome';
let csvTabulasDati = "";

async function ieladetValodas() {
    try {
        const res = await fetch('valodas.csv');
        const teksts = await res.text();
        const rindas = teksts.trim().split('\n');
        
        const galvene = rindas[0].split(',');
        const pieejamasValodas = galvene.slice(1).map(v => v.trim());
        
        let vardenica = {};
        pieejamasValodas.forEach(v => vardenica[v] = { tab_head: {} });

        rindas.forEach((rinda, i) => {
            if (i === 0) return;
            // Sadala rindu, ignorējot komatus pēdiņās
            const kols = rinda.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const atslega = kols[0].trim();
            
            pieejamasValodas.forEach((valKods, valIndex) => {
                let saturs = (kols[valIndex + 1] || "").replace(/^["']|["']$/g, '').trim();
                
                if (['kategorija', 'nosaukums', 'daudzums', 'statuss'].includes(atslega)) {
                    vardenica[valKods].tab_head[atslega] = saturs;
                } else {
                    vardenica[valKods][atslega] = saturs;
                }
            });
        });
        
        tulkojumi = vardenica;
        nomainitValodu(localStorage.getItem('val') || 'lv');
    } catch (e) {
        console.error("Valodu ielādes kļūda:", e);
    }
}

function nomainitValodu(v) {
    if (!tulkojumi[v]) return;
    localStorage.setItem('val', v);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const atslega = el.getAttribute('data-i18n');
        if (tulkojumi[v][atslega]) el.innerHTML = tulkojumi[v][atslega];
    });
    document.querySelectorAll('.v-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase() === v));
    raditSaturu(aktivaSadala);
}

async function raditSaturu(sadala) {
    aktivaSadala = sadala;
    const main = document.getElementById('main-content');
    const v = localStorage.getItem('val') || 'lv';

    if (sadala === 'db') {
        main.innerHTML = `<input type="text" id="mekletajs" onkeyup="filtreTabulu()" placeholder="${tulkojumi[v].search_pl || '...'}"><div class="tabulas-ritinatajs" id="tab-v"></div>`;
        await ieladetTabulu();
    } else {
        const saturs = tulkojumi[v][sadala + '_content'] || tulkojumi[v][sadala] || "Sadaļa nav atrasta.";
        main.innerHTML = `<div class="plustoss-saturs">${saturs}</div>`;
    }
}

async function ieladetTabulu() {
    try {
        const res = await fetch('dati.csv');
        csvTabulasDati = await res.text();
        zimetTabulu();
    } catch (e) { document.getElementById('tab-v').innerHTML = "Kļūda dati.csv ielādē."; }
}

function zimetTabulu() {
    const v = localStorage.getItem('val') || 'lv';
    const rindas = csvTabulasDati.trim().split('\n');
    let h = '<table>';
    rindas.forEach((r, i) => {
        const sep = r.includes(';') ? ';' : ',';
        const kols = r.split(sep);
        h += '<tr>';
        kols.forEach(el => {
            let t = el.replace(/^["']|["']$/g, '').trim();
            if (i === 0) {
                h += `<th>${tulkojumi[v].tab_head[t.toLowerCase()] || t}</th>`;
            } else { h += `<td>${t}</td>`; }
        });
        h += '</tr>';
    });
    document.getElementById('tab-v').innerHTML = h + '</table>';
}

function filtreTabulu() {
    const val = document.getElementById('mekletajs').value.toLowerCase();
    document.querySelectorAll('table tr').forEach((tr, i) => {
        if(i > 0) tr.style.display = tr.innerText.toLowerCase().includes(val) ? '' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', ieladetValodas);
