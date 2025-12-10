// Lógica Completa del Procesador de Análisis Avanzado - Vithas
// Incluye: Clínicos, Orina, Micro, Auto, Comparador Histórico, Gráficas y Resúmenes.

// -------------------------------------------------------------------------
// 1. CONFIGURACIÓN Y DICCIONARIOS
// -------------------------------------------------------------------------

const parameterExplanations = {
    "hematíes": "Glóbulos rojos. Transportan oxígeno.",
    "hemoglobina": "Proteína que transporta oxígeno en sangre.",
    "hematocrito": "% de volumen de sangre ocupado por glóbulos rojos.",
    "vcm": "Tamaño promedio de los glóbulos rojos.",
    "hcm": "Cantidad promedio de hemoglobina por glóbulo.",
    "leucocitos": "Glóbulos blancos. Defensas contra infecciones.",
    "neutrófilos": "Combaten bacterias.",
    "linfocitos": "Combaten virus y generan anticuerpos.",
    "plaquetas": "Intervienen en la coagulación.",
    "glucosa": "Azúcar en sangre.",
    "urea": "Residuo de la función renal.",
    "creatinina": "Indicador clave de función renal.",
    "filtrado glomerular": "Capacidad de filtrado del riñón.",
    "sodio": "Equilibrio de líquidos y nervios.",
    "potasio": "Función muscular y cardiaca.",
    "colesterol": "Grasas en sangre.",
    "proteina c reactiva": "Marcador de inflamación.",
    "tsh": "Hormona tiroidea.",
    "psa": "Antígeno prostático específico."
};

const criticalValueThresholds = {
    "glucosa": { low: 40, high: 400 },
    "potasio": { low: 2.5, high: 6.5 },
    "sodio": { low: 120, high: 160 },
    "leucocitos": { low: 1.0, high: 50.0 },
    "hemoglobina": { low: 7.0, high: 20.0 },
    "plaquetas": { low: 20, high: 1000 },
    "troponina": { high: 0.04 } // Ejemplo genérico
};

// Mapa para asignar secciones automáticamente
const parameterToSectionMap = {
    "hematíes": "Hemograma", "hemoglobina": "Hemograma", "hematocrito": "Hemograma",
    "vcm": "Hemograma", "hcm": "Hemograma", "chcm": "Hemograma", "rdw": "Hemograma",
    "leucocitos": "Hemograma", "neutrófilos": "Hemograma", "linfocitos": "Hemograma", 
    "monocitos": "Hemograma", "eosinófilos": "Hemograma", "basófilos": "Hemograma",
    "plaquetas": "Hemograma", "vpm": "Hemograma", 

    "glucosa": "Bioquímica", "urea": "Bioquímica", "creatinina": "Bioquímica",
    "filtrado glomerular": "Bioquímica", "sodio": "Bioquímica", "potasio": "Bioquímica",
    "cloro": "Bioquímica", "got": "Bioquímica", "gpt": "Bioquímica", "gamma gt": "Bioquímica",
    "ast": "Bioquímica", "alt": "Bioquímica", "ggt": "Bioquímica", "ldh": "Bioquímica",
    "colesterol": "Bioquímica", "triglicéridos": "Bioquímica", "hdl": "Bioquímica", "ldl": "Bioquímica",
    "proteina c reactiva": "Bioquímica", "pcr": "Bioquímica", "ferritina": "Bioquímica", 
    "hierro": "Bioquímica", "transferrina": "Bioquímica", "tsh": "Bioquímica", "t4 libre": "Bioquímica",
    "acido urico": "Bioquímica", "bilirrubina": "Bioquímica", "calcio": "Bioquímica",

    "ts": "Coagulación", "inr": "Coagulación", "fibrinógeno": "Coagulación", "tiempo de protrombina": "Coagulación", "ttpa": "Coagulación",

    "color": "Orina", "aspecto": "Orina", "densidad": "Orina", "ph": "Orina", "nitritos": "Orina", 
    "cuerpos cetónicos": "Orina", "sedimento": "Orina"
};

// Variables Globales de Estado
window.currentDisplayedAnalysisData = [];
window.analysis1ForComparison = [];
window.analysis2ForComparison = [];
window.analysis3ForComparison = [];
let activeCharts = {};

// -------------------------------------------------------------------------
// 2. INICIALIZACIÓN
// -------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Botones Principales
    const btnProcess = document.getElementById('processButton');
    if (btnProcess) btnProcess.addEventListener('click', processData);

    const btnCopy = document.getElementById('copyButton');
    if (btnCopy) btnCopy.addEventListener('click', copyToClipboard);

    const btnExport = document.getElementById('exportButton');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    const btnClear = document.getElementById('clearInputButton');
    if (btnClear) btnClear.addEventListener('click', clearInput);

    const btnIA = document.getElementById('interpretAIButton');
    if (btnIA) btnIA.addEventListener('click', interpretAnalysisWithAI);
    
    // Comparador
    const btnCompare = document.getElementById('compareAnalysesButton');
    if (btnCompare) btnCompare.addEventListener('click', compareAnalyses);

    const btnCopyComp = document.getElementById('copyComparisonButton');
    if (btnCopyComp) btnCopyComp.addEventListener('click', copyComparisonSummary);

    const btnClearComp = document.getElementById('clearComparisonButton');
    if (btnClearComp) btnClearComp.addEventListener('click', clearComparison);

    // Botones de Envío a Histórico
    const btnHist1 = document.getElementById('sendToHist1Button');
    if (btnHist1) btnHist1.addEventListener('click', () => sendToHistorical('historicalInput1'));

    const btnHist2 = document.getElementById('sendToHist2Button');
    if (btnHist2) btnHist2.addEventListener('click', () => sendToHistorical('historicalInput2'));

    const btnHist3 = document.getElementById('sendToHist3Button');
    if (btnHist3) btnHist3.addEventListener('click', () => sendToHistorical('historicalInput3'));

    // Modo Oscuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        }
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }

    // Buscador
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(doSearch, 300));
    }
});

// -------------------------------------------------------------------------
// 3. LÓGICA PRINCIPAL DE PROCESAMIENTO
// -------------------------------------------------------------------------
function processData() {
    const inputData = document.getElementById('inputData').value.trim();
    const analysisType = document.getElementById('analysisType').value;
    
    if (!inputData) {
        showToast("Por favor, ingresa los datos del análisis.");
        return;
    }
    
    showSpinner();
    
    try {
        const lines = preprocessLines(inputData.split(/\r?\n/));
        let processedParams = [];

        if (analysisType === "clinicos") processedParams = parseClinicos(lines);
        else if (analysisType === "orina") processedParams = parseOrina(lines);
        else if (analysisType === "microbiologia") processedParams = parseMicrobiologia(lines);
        else if (analysisType === "autoinmunidad") processedParams = parseAutoinmunidad(lines);

        window.currentDisplayedAnalysisData = processedParams;
        renderResults(processedParams, analysisType);
        generateExecutiveSummary(processedParams);
        showToast("Análisis procesado correctamente");
    } catch (e) {
        console.error(e);
        showToast("Error al procesar los datos");
    } finally {
        hideSpinner();
    }
}

// -------------------------------------------------------------------------
// 4. PARSERS (Motores de Extracción)
// -------------------------------------------------------------------------

function parseClinicos(lines) {
    let params = [];
    
    // CORRECCIÓN JSHINT: Eliminada bandera /u y uso de \p{L}. 
    // Usamos rangos ASCII y extendidos Hex para acentos (\u00C0-\u00FF).
    const generalParamRegex = /^([a-zA-Z\u00C0-\u00FF0-9\.\(\)\-\+%\/, ]+?)(?:\s*\*+)?\s+([<>]?\d+(?:[.,]\d+)?(?:(?:\s*x10\^\d+\/[LU])|(?:\s*[a-zA-Z\/%]+))?)\s*(.*)$/;
    
    const valueUnitRegex = /^([<>]?\d+(?:[.,]\d+)?)\s*(.*)$/;

    lines.forEach(line => {
        // Ignorar basura común
        if(line.length < 3 || line.toUpperCase().includes("VALORES DE REFERENCIA")) return;

        const match = line.match(generalParamRegex);
        if (match) {
            let name = match[1].trim();
            let valStr = match[2].trim();
            let rest = match[3] ? match[3].trim() : "";
            
            let numVal = null;
            let unit = "";
            
            const vMatch = valStr.match(valueUnitRegex);
            if(vMatch) {
                numVal = parseFloat(vMatch[1].replace(',', '.'));
                unit = vMatch[2].trim();
            }

            let low = null, high = null;
            // Busca patrones como "70 - 110" o "0.5 - 1.2"
            const rangeMatch = rest.match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/);
            if(rangeMatch) {
                low = parseFloat(rangeMatch[1].replace(',', '.'));
                high = parseFloat(rangeMatch[2].replace(',', '.'));
            }

            let isAbnormal = false;
            if(numVal !== null && low !== null && high !== null) {
                isAbnormal = numVal < low || numVal > high;
            }

            // Asignación de sección inteligente
            let lowerName = name.toLowerCase();
            let section = "Bioquímica"; // Default fallback
            for(let key in parameterToSectionMap) {
                if(lowerName.includes(key)) {
                    section = parameterToSectionMap[key];
                    break;
                }
            }

            params.push({
                name: name,
                valueStr: valStr,
                numericValue: numVal,
                unit: unit,
                normalLow: low,
                normalHigh: high,
                isAbnormal: isAbnormal,
                section: section
            });
        }
    });
    return params;
}

function parseOrina(lines) {
    let params = [];
    lines.forEach(line => {
        if(line.includes(':')) {
            const parts = line.split(':');
            const val = parts[1].trim();
            let isAbnormal = val.toUpperCase().includes('POSITIVO') || 
                             val.toUpperCase().includes('INFECCION') || 
                             val.toUpperCase().includes('ABUNDANTES');
            
            params.push({
                name: parts[0].trim(),
                valueStr: val,
                numericValue: null,
                isAbnormal: isAbnormal,
                section: 'Orina'
            });
        }
    });
    return params;
}

function parseMicrobiologia(lines) {
    let params = [];
    const fullText = lines.join(" ").toUpperCase();
    let isAbnormal = !fullText.includes("NEGATIVO") && !fullText.includes("ESTERIL");
    
    params.push({
        name: "Resultado de Cultivo",
        valueStr: fullText.length > 150 ? fullText.substring(0, 150) + "..." : fullText,
        isAbnormal: isAbnormal,
        section: "Microbiología"
    });
    return params;
}

function parseAutoinmunidad(lines) {
    let params = [];
    lines.forEach(line => {
        // Detecta líneas tipo "ANA Positivo" o "Anti-DNA Negativo"
        if(line.includes("Positivo") || line.includes("Negativo") || line.includes("POS") || line.includes("NEG")) {
            let isAbnormal = line.toUpperCase().includes("POSITIVO") || line.toUpperCase().includes("POS");
            params.push({
                name: line, // Simplificado para capturar la línea entera como nombre/valor
                valueStr: isAbnormal ? "POSITIVO" : "NEGATIVO",
                isAbnormal: isAbnormal,
                section: "Autoinmunidad"
            });
        }
    });
    return params;
}

// -------------------------------------------------------------------------
// 5. RENDERIZADO VISUAL
// -------------------------------------------------------------------------
function renderResults(params, type) {
    const container = document.getElementById('outputContainer');
    container.innerHTML = "";
    
    // Inicializar secciones
    let sections = {};
    if(type === 'clinicos') {
        sections = { 'Hemograma': [], 'Coagulación': [], 'Bioquímica': [] };
    } else {
        // Capitalizar primera letra para título de sección genérica
        let secTitle = type.charAt(0).toUpperCase() + type.slice(1);
        sections = { [secTitle]: [] };
    }

    // Distribuir parámetros en sus secciones
    params.forEach(p => {
        if(!sections[p.section]) sections[p.section] = [];
        sections[p.section].push(p);
    });

    // Generar HTML por sección
    for(let secName in sections) {
        if(sections[secName].length > 0) {
            let cssClass = secName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if(cssClass === 'microbiologia') cssClass = 'micro';
            
            let html = `<div class="${cssClass}"><span class="section-title">${secName}:</span> `;
            
            html += sections[secName].map(p => {
                let statusClass = "";
                if(p.isAbnormal) {
                    statusClass = "abnormal";
                    if(p.numericValue && p.normalHigh && p.numericValue > p.normalHigh) statusClass = "value-elevated";
                    if(p.numericValue && p.normalLow && p.numericValue < p.normalLow) statusClass = "value-decreased";
                }
                
                let tooltip = p.normalLow ? `Rango: ${p.normalLow} - ${p.normalHigh}` : "";
                
                return `<span class="parameter ${statusClass}" title="${tooltip}" onclick="showExplanation('${p.name}')">
                    ${p.name}: ${p.valueStr}
                </span>`;
            }).join(", ");
            
            html += `</div>`;
            container.innerHTML += html;
        }
    }
}

function generateExecutiveSummary(params) {
    const summaryDiv = document.getElementById('executiveSummaryOutput');
    if (!summaryDiv) return;

    let abnormal = params.filter(p => p.isAbnormal);
    let critical = params.filter(p => {
        let t = criticalValueThresholds[p.name.toLowerCase()];
        return t && p.numericValue && (p.numericValue < t.low || p.numericValue > t.high);
    });

    let html = "<h4><i class='fas fa-clipboard-list'></i> Resumen Ejecutivo</h4>";
    if(abnormal.length === 0) {
        html += "<p style='color:green'><i class='fas fa-check-circle'></i> No se encontraron alteraciones significativas en los parámetros analizados.</p>";
    } else {
        html += `<p>Se han detectado <strong>${abnormal.length}</strong> parámetros fuera de rango.</p>`;
        
        // Alerta de valores críticos
        if(critical.length > 0) {
            html += `<div class="abnormal" style="background:#fee2e2; padding:10px; border-radius:5px; border:1px solid #fca5a5;">
                <i class="fas fa-exclamation-triangle"></i> <strong>VALORES CRÍTICOS DETECTADOS:</strong><br>
                ${critical.map(c => `${c.name} (<strong>${c.valueStr}</strong>)`).join(", ")}
            </div>`;
        }
    }
    summaryDiv.innerHTML = html;
    summaryDiv.classList.remove('hidden');
}

// -------------------------------------------------------------------------
// 6. COMPARADOR HISTÓRICO
// -------------------------------------------------------------------------
function compareAnalyses() {
    showSpinner();
    const t1 = document.getElementById('historicalInput1').value;
    const t2 = document.getElementById('historicalInput2').value;
    const t3 = document.getElementById('historicalInput3').value;
    
    // Parseamos de nuevo usando la lógica Clínica (asumimos comparación clínica)
    const p1 = parseClinicos(preprocessLines(t1.split(/\r?\n/)));
    const p2 = parseClinicos(preprocessLines(t2.split(/\r?\n/)));
    const p3 = t3 ? parseClinicos(preprocessLines(t3.split(/\r?\n/))) : [];

    // Indexamos por nombre
    const m1 = new Map(p1.map(p => [p.name.toLowerCase(), p]));
    const m2 = new Map(p2.map(p => [p.name.toLowerCase(), p]));
    const m3 = new Map(p3.map(p => [p.name.toLowerCase(), p]));
    
    const allKeys = new Set([...m1.keys(), ...m2.keys(), ...m3.keys()]);
    let outputHTML = "";
    
    // Limpieza de gráficos previos
    const chartsContainer = document.getElementById('chartsContainer');
    chartsContainer.innerHTML = "";
    activeCharts = {};

    allKeys.forEach(key => {
        const item1 = m1.get(key);
        const item2 = m2.get(key);
        const item3 = m3.get(key);
        
        // Solo mostramos si hay al menos 2 valores para comparar
        if((item1 && item2) || (item2 && item3)) {
            let name = (item1 || item2 || item3).name;
            let v1 = item1 ? item1.numericValue : null;
            let v2 = item2 ? item2.numericValue : null;
            let v3 = item3 ? item3.numericValue : null;

            // Fila de texto
            let row = `<div class="comparison-item"><strong>${name}</strong>: `;
            
            // Comparación 1 -> 2
            if(v1 !== null && v2 !== null) {
                let diff = v2 - v1;
                let arrow = diff > 0 ? "↑" : "↓";
                let colorClass = diff > 0 ? "value-elevated" : "value-decreased";
                // Si la diferencia es ínfima, lo marcamos neutro
                if(Math.abs(diff) < 0.1) { arrow = "↔"; colorClass = "text-muted"; }
                row += `<span>${v1}</span> ${arrow} <span class="${colorClass}">${v2}</span> `;
            } else {
                row += `<span>${v1 || '-'}</span> → <span>${v2 || '-'}</span> `;
            }
            
            // Comparación 2 -> 3
            if(v3 !== null) {
                if(v2 !== null) {
                    let diff = v3 - v2;
                    let arrow = diff > 0 ? "↑" : "↓";
                    let colorClass = diff > 0 ? "value-elevated" : "value-decreased";
                    row += ` → <span class="${colorClass}">${v3}</span>`;
                } else {
                    row += ` → <span>${v3}</span>`;
                }
            }
            
            row += `</div>`;
            outputHTML += row;

            // Generar Gráfico si hay al menos 2 datos numéricos
            let validPoints = [v1, v2, v3].filter(v => v !== null).length;
            if(validPoints >= 2) {
                createChart(name, [v1, v2, v3], chartsContainer);
            }
        }
    });
    
    document.getElementById('comparisonOutputContainer').innerHTML = outputHTML;
    hideSpinner();
}

function createChart(name, data, container) {
    let labels = ['Análisis 1', 'Análisis 2', 'Análisis 3'];
    
    // Crear elementos DOM
    let canvas = document.createElement('canvas');
    canvas.style.maxHeight = "200px";
    canvas.style.marginTop = "10px";
    let div = document.createElement('div');
    div.style.marginBottom = "20px";
    div.style.background = "#fff";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";
    div.appendChild(canvas);
    container.appendChild(div);

    // Inicializar Chart.js
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: name,
                data: data,
                borderColor: '#009FE3', /* Azul Vithas */
                backgroundColor: 'rgba(0, 159, 227, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: name }
            }
        }
    });
}

// -------------------------------------------------------------------------
// 7. UTILIDADES (Helpers)
// -------------------------------------------------------------------------

function showExplanation(paramName) {
    const modal = document.getElementById('explanationModal');
    const title = document.getElementById('explanationTitle');
    const text = document.getElementById('explanationText');
    
    // Limpiar nombre para buscar en diccionario (quitar dos puntos o unidades)
    const lowerName = paramName.toLowerCase().split(":")[0];
    
    // Búsqueda aproximada en el diccionario
    let foundKey = Object.keys(parameterExplanations).find(k => lowerName.includes(k));
    
    if(foundKey) {
        title.innerText = paramName;
        text.innerText = parameterExplanations[foundKey];
        if(modal) modal.style.display = "flex";
    } else {
        showToast("No hay información extra para este parámetro.");
    }
}

// Cerrar modal
const closeBtn = document.querySelector('.close-button');
if(closeBtn) {
    closeBtn.onclick = function() {
        document.getElementById('explanationModal').style.display = "none";
    };
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('explanationModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

function preprocessLines(lines) {
    let result = [];
    for(let i=0; i<lines.length; i++) {
        let line = lines[i].trim();
        // Lógica simple para unir líneas rotas si terminan extrañamente (opcional)
        if(line) result.push(line);
    }
    return result;
}

function sendToHistorical(targetId) {
    if(window.currentDisplayedAnalysisData.length === 0) {
        showToast("No hay datos procesados para enviar.");
        return;
    }
    // Reconstruir texto plano a partir de los objetos procesados
    let text = window.currentDisplayedAnalysisData.map(p => {
        let range = (p.normalLow && p.normalHigh) ? `${p.normalLow} - ${p.normalHigh}` : "";
        return `${p.name} ${p.valueStr} ${range}`;
    }).join("\n");
    
    document.getElementById(targetId).value = text;
    showToast("Datos enviados al comparador");
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let btn = document.getElementById('darkModeToggle');
    if(document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        if(btn) btn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        if(btn) btn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }
}

function showSpinner() { 
    const s = document.getElementById('spinner');
    if(s) s.classList.remove('hidden'); 
}

function hideSpinner() { 
    const s = document.getElementById('spinner');
    if(s) s.classList.add('hidden'); 
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if(t) {
        t.innerText = msg;
        t.classList.remove('hidden');
        t.classList.add('show');
        setTimeout(() => { t.classList.remove('show'); t.classList.add('hidden'); }, 3000);
    } else {
        alert(msg); // Fallback si no hay toast
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    }; // CORRECCIÓN JSHINT: Punto y coma añadido.
}

function doSearch() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const spans = document.querySelectorAll('.parameter');
    spans.forEach(span => {
        if(span.innerText.toLowerCase().includes(term)) {
            span.style.backgroundColor = "#fff59d"; // Resaltado amarillo suave
            span.style.color = "#000";
        } else {
            span.style.backgroundColor = "";
            span.style.color = "";
        }
    });
}

function clearInput() {
    document.getElementById('inputData').value = "";
    document.getElementById('outputContainer').innerHTML = "";
    const sumDiv = document.getElementById('executiveSummaryOutput');
    if(sumDiv) {
        sumDiv.classList.add('hidden');
        sumDiv.innerHTML = "";
    }
    // Limpiar también datos en memoria
    window.currentDisplayedAnalysisData = [];
    showToast("Datos limpiados");
}

function copyToClipboard() {
    let text = document.getElementById('outputContainer').innerText;
    // Método moderno
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast("Copiado al portapapeles"));
    } else {
        // Fallback para iframes antiguos
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("Copiado al portapapeles");
        } catch (err) {
            console.error('Error al copiar', err);
        }
        document.body.removeChild(textArea);
    }
}

function exportCSV() {
    if(window.currentDisplayedAnalysisData.length === 0) {
        showToast("No hay datos para exportar.");
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Parametro,Valor,Unidad,Rango Bajo,Rango Alto,Estado\n";
    
    window.currentDisplayedAnalysisData.forEach(p => {
        let row = `"${p.name}","${p.numericValue || p.valueStr}","${p.unit}","${p.normalLow || ''}","${p.normalHigh || ''}","${p.isAbnormal ? 'ANORMAL' : 'NORMAL'}"`;
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "analisis_vithas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function loadDemoData() {
    const demo = `Leucocitos 12.5 x10^3/uL 4.0 - 10.0
Hemoglobina 11.2 g/dL 12.0 - 16.0
Plaquetas 180 x10^3/uL 150 - 450
Glucosa 105 mg/dL 70 - 100
Creatinina 0.9 mg/dL 0.6 - 1.2
Colesterol 240 mg/dL 0 - 200
Proteina C Reactiva 12.0 mg/L 0 - 5.0`;
    document.getElementById('inputData').value = demo;
}

// Función auxiliar para copiar el resumen del comparador
function copyComparisonSummary() {
    const text = document.getElementById('comparisonOutputContainer').innerText;
    if(!text) {
        showToast("No hay comparación para copiar");
        return;
    }
    // Reutilizamos la lógica de copyToClipboard pero con este texto
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToast("Resumen comparativo copiado"));
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast("Resumen comparativo copiado");
    }
}

function clearComparison() {
    document.getElementById('historicalInput1').value = "";
    document.getElementById('historicalInput2').value = "";
    document.getElementById('historicalInput3').value = "";
    document.getElementById('comparisonOutputContainer').innerHTML = "";
    document.getElementById('chartsContainer').innerHTML = "";
    showToast("Comparador reiniciado");
}

async function interpretAnalysisWithAI() {
    showToast("Función IA: Requiere configuración de API Key en el servidor.");
}