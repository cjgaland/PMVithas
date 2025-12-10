// Lógica Guía GOLD 2025 - Vithas (Versión Pestañas + Sliders)

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar valores de sliders
    updateRangeVal('exacerb', 'exacerbVal');
    updateRangeVal('hosp', 'hospVal');
});

// --- GESTIÓN DE PESTAÑAS ---
function switchTab(tabNum) {
    // 1. Desactivar todos los botones de tab
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
    // 2. Activar el botón clicado
    document.getElementById('tab-' + tabNum).classList.add('active');
    
    // 3. Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    // 4. Mostrar el contenido deseado
    document.getElementById('step' + tabNum).classList.add('active');
    
    // Scroll suave arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Actualizar visualización del slider en tiempo real
function updateRangeVal(inputId, displayId) {
    const val = document.getElementById(inputId).value;
    document.getElementById(displayId).textContent = val;
}

// Actualizar suma total del CAT en tiempo real
function updateCatTotal() {
    let total = 0;
    for (let i = 1; i <= 8; i++) {
        // Buscar el radio checked para cada pregunta
        const checkedRadio = document.querySelector(`input[name="cat${i}"]:checked`);
        if (checkedRadio) {
            total += parseInt(checkedRadio.value);
        }
    }
    document.getElementById('catTotalDisplay').textContent = total;
}

// --- FASES DE LA INTERFAZ ---

function showResultPhase() {
    // Ocultar tabs y contenedor de entrada
    document.getElementById('inputTabsContainer').classList.add('d-none');
    document.getElementById('inputCard').classList.add('d-none');
    
    // Ocultar otras fases
    document.getElementById('followUpPhase').classList.add('d-none');
    document.getElementById('finalReportPhase').classList.add('d-none');

    // Mostrar resultado
    document.getElementById('resultPhase').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFollowUp() {
    document.getElementById('resultPhase').classList.add('d-none');
    document.getElementById('finalReportPhase').classList.add('d-none');
    document.getElementById('followUpPhase').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFinalReport() {
    document.getElementById('followUpPhase').classList.add('d-none');
    document.getElementById('finalReportPhase').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetToInputPhase() {
    document.getElementById('resultPhase').classList.add('d-none');
    document.getElementById('followUpPhase').classList.add('d-none');
    document.getElementById('finalReportPhase').classList.add('d-none');
    
    document.getElementById('inputTabsContainer').classList.remove('d-none');
    document.getElementById('inputCard').classList.remove('d-none');
    switchTab(1); // Volver a pestaña 1
}

// -----------------------------------------------------
// 1. CÁLCULO CLASIFICACIÓN
// -----------------------------------------------------
function calculateClassification() {
    // Recoger datos
    const smokerYes = document.getElementById('smokerYes').checked;
    localStorage.setItem("isSmoker", smokerYes ? "yes" : "no");

    const edad = parseInt(document.getElementById('edad').value) || 0;
    localStorage.setItem("edad", edad);
    localStorage.setItem("hasCardiac", document.getElementById('cardiacYes').checked ? "yes" : "no");

    const fev1 = parseFloat(document.getElementById('fev1').value);
    const eos = parseInt(document.getElementById('eos').value);
    
    // SLIDERS
    const exacerb = parseInt(document.getElementById('exacerb').value);
    const hosp = parseInt(document.getElementById('hosp').value);

    // mMRC
    let mmrc = null;
    const mmrcRadio = document.querySelector('input[name="mmrc"]:checked');
    if (mmrcRadio) mmrc = parseInt(mmrcRadio.value);

    // CAT Total
    let catTotal = 0;
    for(let i=1; i<=8; i++) {
        const r = document.querySelector(`input[name="cat${i}"]:checked`);
        if(r) catTotal += parseInt(r.value);
    }

    // Validar
    if (isNaN(fev1) || isNaN(eos) || mmrc === null) {
        alert("Por favor, rellene FEV1, Eosinófilos y seleccione mMRC.");
        return;
    }

    // --- LÓGICA ---
    let goldGrade = "";
    let colorClass = "";
    if (fev1 >= 80) { goldGrade = "GOLD 1 (Leve)"; colorClass = "grade-green"; }
    else if (fev1 >= 50) { goldGrade = "GOLD 2 (Moderado)"; colorClass = "grade-yellow"; }
    else if (fev1 >= 30) { goldGrade = "GOLD 3 (Severo)"; colorClass = "grade-orange"; }
    else { goldGrade = "GOLD 4 (Muy Severo)"; colorClass = "grade-red"; }

    let group = "";
    if (exacerb >= 2 || hosp >= 1) group = "E";
    else if (mmrc >= 2 || catTotal >= 10) group = "B";
    else group = "A";

    let rec = "";
    if (group === "A") rec = "Broncodilatador (SABA, LABA o LAMA).";
    else if (group === "B") rec = "Doble terapia (LABA + LAMA).";
    else if (group === "E") {
        rec = "LABA + LAMA.";
        if (eos >= 300) rec += " Considerar Triple Terapia (LABA + LAMA + ICS).";
    }

    // Generar HTML
    const html = `
        <h4><i class="fas fa-clipboard-check"></i> Clasificación: ${goldGrade} - Grupo ${group}</h4>
        <hr style="border-color:rgba(255,255,255,0.2);">
        <p class="mb-2"><strong>Datos:</strong> FEV1 ${fev1}% | Exacerb: ${exacerb} (Hosp: ${hosp}) | mMRC: ${mmrc} | CAT: ${catTotal}</p>
        <div class="mt-3 p-3 bg-white text-dark rounded shadow-sm">
            <strong class="text-primary">Tratamiento Inicial:</strong><br>
            ${rec}
        </div>
    `;

    // Renderizar en visualización y en reporte oculto
    const resDiv = document.getElementById('classificationResult');
    resDiv.innerHTML = html;
    resDiv.className = "result-box " + colorClass;
    
    document.getElementById('reportClassification').innerHTML = resDiv.outerHTML;

    // Guardar para seguimiento
    localStorage.setItem("fev1", fev1);
    localStorage.setItem("eos", eos);

    showResultPhase();
}

// -----------------------------------------------------
// 2. SEGUIMIENTO
// -----------------------------------------------------
function calculateFollowUp() {
    const pDyspnea = document.getElementById('problemDyspnea').checked;
    const pExacerb = document.getElementById('problemExacerbations').checked;
    const treatment = document.getElementById('currentTreatment').value;

    if ((!pDyspnea && !pExacerb) || treatment === "none") {
        alert("Seleccione problema principal y tratamiento actual.");
        return;
    }

    const fev1 = parseFloat(localStorage.getItem("fev1"));
    const eos = parseInt(localStorage.getItem("eos"));
    const cb = document.getElementById('cbYes').checked;
    const exSmoker = document.getElementById('exSYes').checked;

    let txt = "";
    
    if (pDyspnea) {
        if (treatment.includes("laba") && !treatment.includes("ics")) txt = "Escalar a LABA + LAMA.";
        else if (treatment === "laba-lama") txt = "Considerar cambio de dispositivo o investigar otras causas. (¿Añadir ICS si eos >= 300?)";
        else if (treatment === "laba-lama-ics") txt = "Desescalar ICS si no indicado o neumonía. Investigar otras causas.";
    } else {
        if (treatment === "laba" || treatment === "lama") txt = "Escalar a LABA + LAMA. (Si eos >= 300 -> Triple).";
        else if (treatment === "laba-lama") {
            if (eos >= 100) txt = "Escalar a Triple Terapia.";
            else txt = "Valorar Roflumilast (si FEV1<50% y bronquitis) o Azitromicina (ex-fumador).";
        } else if (treatment === "laba-lama-ics") {
            txt = "Valorar Roflumilast (si FEV1<50% y BC) o Azitromicina.";
        }
    }

    const resDiv = document.getElementById('followUpResult');
    resDiv.innerHTML = `<h4>Seguimiento</h4><p>${txt}</p>`;
    resDiv.style.display = "block";

    // Mostrar extras en reporte
    const isSmoker = localStorage.getItem("isSmoker") === "yes";
    document.getElementById('tobaccoBox').style.display = isSmoker ? "block" : "none";
    
    generateVaccines();
    showFinalReport();
}

function generateVaccines() {
    const edad = parseInt(localStorage.getItem("edad"));
    const cardiac = localStorage.getItem("hasCardiac") === "yes";
    const ul = document.getElementById('vaccineList');
    ul.innerHTML = "";
    
    const vax = [
        "Gripe anual", 
        "COVID-19 según pauta", 
        "Neumococo (PCV20)",
        "Tdap (Tosferina)"
    ];
    if(edad >= 60 || cardiac) vax.push("VRS (Arexvy/Abrysvo)");
    if(edad >= 50) vax.push("Herpes Zóster (Shingrix)");

    vax.forEach(v => {
        const li = document.createElement('li');
        li.textContent = v;
        ul.appendChild(li);
    });
}

// -----------------------------------------------------
// 3. EXPORTAR
// -----------------------------------------------------
function exportPDF() {
    const el = document.getElementById('printArea');
    const btns = document.querySelectorAll('.no-print');
    btns.forEach(b => b.style.display = 'none');
    
    html2pdf().from(el).save('Informe_Vithas_EPOC.pdf').then(() => {
        btns.forEach(b => b.style.display = 'flex');
    });
}