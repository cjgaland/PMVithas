/* ============================================
   LÓGICA GENERAL DEL PORTAL
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MENÚ MÓVIL (SIDEBAR TOGGLE) ---
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if(menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Cerrar menú al hacer click fuera en móvil
        document.addEventListener('click', (e) => {
            if(window.innerWidth <= 768 && 
               !sidebar.contains(e.target) && 
               !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }

    // --- 2. LÓGICA SUBMENÚS SIDEBAR (DESPLEGABLES) ---
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar navegación del enlace padre
            
            const parent = toggle.parentElement;
            
            // Toggle actual
            parent.classList.toggle('open');
        });
    });

    // --- 3. MOTOR DE BÚSQUEDA (SEARCH_INDEX COMPLETO) ---
    
    // Base de datos estática que indexa TODAS las calculadoras del portal.
    // Rutas relativas desde el Index.html de la raíz.
    const SEARCH_INDEX = [
        
        // ===================================
        // 1. NEFROLOGÍA
        // ===================================
        { title: "Filtrado Glomerular (FG)", url: "calculadoras/Nefrologia/fg.html", section: "Nefrología", desc: "Estimación de función renal (CKD-EPI, MDRD, C-G)." },
        { title: "FeNa (Fracción de Excreción de Sodio)", url: "calculadoras/Nefrologia/feNa.html", section: "Nefrología", desc: "Diagnóstico diferencial de IRA prerrenal vs. NTA." },
        { title: "FeUrea (Fracción de Excreción de Urea)", url: "calculadoras/Nefrologia/feUrea.html", section: "Nefrología", desc: "Alternativa a FeNa si hay uso de diuréticos." },
        { title: "Anión Gap (Brecha Aniónica)", url: "calculadoras/Nefrologia/anion-gap.html", section: "Nefrología", desc: "Cálculo con corrección por albúmina." },
        { title: "Osmolalidad Plasmática y Gap Osmolar", url: "calculadoras/Nefrologia/osmolalidad.html", section: "Nefrología", desc: "Diagnóstico diferencial de hiponatremia e intoxicaciones." },
        { title: "Déficit de Agua Libre", url: "calculadoras/Nefrologia/deficit-agua.html", section: "Nefrología", desc: "Estimación de volumen en hipernatremia." },
        { title: "Reposición Hídrica (Adrogué-Madias)", url: "calculadoras/Nefrologia/reposicion-hidrica.html", section: "Nefrología", desc: "Ajuste de velocidad de fluidos en trastornos de Na." },
        { title: "Calcio Sérico Corregido", url: "calculadoras/Nefrologia/calcio-serico.html", section: "Nefrología", desc: "Corrección de Ca total por albúmina o proteínas." },
        
        // ===================================
        // 2. NEUROLOGÍA
        // ===================================
        { title: "Escala NIHSS (Ictus)", url: "calculadoras/Neurologia/nihss.html", section: "Neurología", desc: "Cuantificación de gravedad en ictus isquémico (0-42)." },
        { title: "Glasgow Coma Scale (GCS)", url: "calculadoras/Neurologia/gcs-adulto.html", section: "Neurología", desc: "Valoración rápida del nivel de conciencia (3-15)." },
        { title: "FOUR Score", url: "calculadoras/Neurologia/four-score.html", section: "Neurología", desc: "Escala de coma para pacientes intubados (sin componente verbal)." },
        { title: "Canadian CT Head Rule", url: "calculadoras/Neurologia/canadian-ct-head.html", section: "Neurología", desc: "Criterios para indicar TC craneal en TCE leve." },
        { title: "ABCD² Score", url: "calculadoras/Neurologia/abcd2.html", section: "Neurología", desc: "Riesgo de ictus tras Accidente Isquémico Transitorio (AIT)." },
        { title: "ICH Score (HIC)", url: "calculadoras/Neurologia/ich-score.html", section: "Neurología", desc: "Pronóstico de mortalidad en hemorragia intracerebral." },
        { title: "ASPECTS Score", url: "calculadoras/Neurologia/aspect.html", section: "Neurología", desc: "Valoración de TC temprana en ictus ACM." },
        { title: "Rankin Modificada (mRS)", url: "calculadoras/Neurologia/mrs.html", section: "Neurología", desc: "Discapacidad funcional post-ictus (0-6)." },
        { title: "Ottawa SAH Rule", url: "calculadoras/Neurologia/ottawa-sah.html", section: "Neurología", desc: "Descarte de Hemorragia Subaracnoidea en cefalea aguda." },
        { title: "Status Epiléptico (Dosis)", url: "calculadoras/Neurologia/status-epileptico-dosis.html", section: "Neurología", desc: "Cálculo de dosis secuenciales (Benzos, FAEs)." },
        
        // ===================================
        // 3. RESPIRATORIO
        // ===================================
        { title: "CURB-65", url: "calculadoras/Respiratorio/curb65.html", section: "Respiratorio", desc: "Estratificación rápida de neumonía (NAC)." },
        { title: "PSI / FINE Score", url: "calculadoras/Respiratorio/psi-fine.html", section: "Respiratorio", desc: "Índice de severidad detallado en NAC." },
        { title: "PESI y sPESI", url: "calculadoras/Respiratorio/pesi.html", section: "Respiratorio", desc: "Estratificación de riesgo en TEP." },
        { title: "Gradiente Alvéolo-Arterial (A-a)", url: "calculadoras/Respiratorio/aa-gradient.html", section: "Respiratorio", desc: "Diagnóstico diferencial de hipoxemia." },
        
        // ===================================
        // 4. UCI / EMERGENCIAS
        // ===================================
        { title: "APACHE II Score", url: "calculadoras/UCI/apacheII.html", section: "UCI / Emergencias", desc: "Evaluación de gravedad y pronóstico de mortalidad en UCI." },
        { title: "NEWS2 Score", url: "calculadoras/UCI/news2.html", section: "UCI / Emergencias", desc: "Detección temprana del deterioro del paciente hospitalizado." },
        { title: "Soporte Nutricional (Requerimientos)", url: "calculadoras/UCI/soporte-nutricional.html", section: "UCI / Emergencias", desc: "Cálculo de requerimientos calóricos y proteicos (kcal/día y g/día)." },

        // ===================================
        // 5. INFECCIOSAS (Bloque preexistente)
        // ===================================
        { title: "qSOFA", url: "calculadoras/Infecciosas/qsofa.html", section: "Infecciosas", desc: "Cribado rápido de sepsis." },
        { title: "SOFA Score", url: "calculadoras/Infecciosas/sofa.html", section: "Infecciosas", desc: "Evaluación de fallo orgánico." },
        { title: "Centor / McIsaac", url: "calculadoras/Infecciosas/centor-mcisaac.html", section: "Infecciosas", desc: "Probabilidad de faringitis estreptocócica." },
        { title: "MuLBSTA Score", url: "calculadoras/Infecciosas/mulbsta.html", section: "Infecciosas", desc: "Pronóstico de mortalidad en neumonía viral." },

        // ===================================
        // 6. ANTROPOMÉTRICOS (Bloque preexistente)
        // ===================================
        { title: "IMC (Índice de Masa Corporal)", url: "calculadoras/Antropometricos/imc.html", section: "Antropometría", desc: "Cálculo del Índice de Masa Corporal." },
        { title: "Agua Corporal Total", url: "calculadoras/Antropometricos/agua-corporal.html", section: "Antropometría", desc: "Estimación del volumen hídrico corporal." },
        { title: "BSA (Superficie Corporal)", url: "calculadoras/Antropometricos/bsa-adultos.html", section: "Antropometría", desc: "Cálculo de la superficie corporal (adultos)." },
        { title: "CEB (Gasto Energético Basal)", url: "calculadoras/Antropometricos/ceb-basal.html", section: "Antropometría", desc: "Estimación del gasto energético basal." },
        
        // ===================================
        // 7. CARDIOVASCULAR (Bloque preexistente)
        // ===================================
        { title: "CHA₂DS₂-VASc", url: "calculadoras/Cardiovascular/cha2ds2-vasc.html", section: "Cardiovascular", desc: "Riesgo trombótico en Fibrilación Auricular." },
        { title: "HAS-BLED", url: "calculadoras/Cardiovascular/has-bled.html", section: "Cardiovascular", desc: "Riesgo de sangrado con anticoagulación." },
        { title: "Escala GRACE", url: "calculadoras/Cardiovascular/grace.html", section: "Cardiovascular", desc: "Mortalidad en Síndrome Coronario Agudo." },
        { title: "TIMI Risk Index", url: "calculadoras/Cardiovascular/timi-risk-index.html", section: "Cardiovascular", desc: "Riesgo de eventos en Angina Inestable/NSTEMI." },
        
        // ===================================
        // 8. DIGESTIVO (Bloque preexistente)
        // ===================================
        { title: "MELD Score", url: "calculadoras/Digestivo/meld.html", section: "Digestivo", desc: "Mortalidad en hepatopatía crónica (trasplante)." },
        { title: "Child-Pugh Score", url: "calculadoras/Digestivo/child-pugh.html", section: "Digestivo", desc: "Clasificación de severidad de la cirrosis." },
        { title: "Glasgow-Blatchford", url: "calculadoras/Digestivo/glasgow-blatchford.html", section: "Digestivo", desc: "Riesgo en hemorragia digestiva alta (HDA)." },
        { title: "BISAP Score", url: "calculadoras/Digestivo/bisap.html", section: "Digestivo", desc: "Pronóstico de mortalidad en pancreatitis aguda." },
        { title: "Criterios de Ranson", url: "calculadoras/Digestivo/ranson.html", section: "Digestivo", desc: "Pronóstico de severidad en pancreatitis aguda." },

        // ===================================
        // 9. UTILIDADES (Bloque preexistente)
        // ===================================
        { title: "Guía EPOC (GOLD)", url: "utilidades/Gold_EPOC/index.html", section: "Utilidades", desc: "Clasificación, tratamiento y seguimiento (GOLD)." },
        { title: "Interpretación Analíticas", url: "utilidades/Analisis_Clinicos/index.html", section: "Utilidades", desc: "Guía de referencia rápida de parámetros de laboratorio." }
    ];

    const searchInput = document.getElementById('searchInput');
    const resultsBox = document.getElementById('searchResults');
    let debounceTimer;

    // Normalizar texto (quitar tildes, mayúsculas)
    function normalize(str){
        return (str || "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu,"");
    }

    // Función de búsqueda
    function search(query) {
        if(!query) {
            resultsBox.innerHTML = '';
            resultsBox.classList.remove('visible');
            return;
        }
        
        const nq = normalize(query);
        
        // Filtrar
        const results = SEARCH_INDEX.filter(item => {
            return normalize(item.title).includes(nq) || 
                   normalize(item.desc).includes(nq) ||
                   normalize(item.section).includes(nq);
        });

        // Renderizar
        if(results.length > 0) {
            const html = results.map(item => `
                <a href="${item.url}" class="result-item">
                    <div class="result-title">${item.title}</div>
                    <div class="result-meta">
                        <span class="badge">${item.section}</span>
                        <span>${item.desc}</span>
                    </div>
                </a>
            `).join('');
            resultsBox.innerHTML = html;
            resultsBox.classList.add('visible');
        } else {
            resultsBox.innerHTML = '<div style="padding:15px; color:#666; font-size:0.9rem;">No se encontraron resultados para su búsqueda.</div>';
            resultsBox.classList.add('visible');
        }
    }

    // Event Listeners para el buscador
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => search(e.target.value.trim()), 200);
        });

        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            // Aseguramos que solo cerramos si el click no fue dentro del buscador o los resultados
            const searchWrapper = document.querySelector('.search-wrapper');
            if(searchWrapper && !searchWrapper.contains(e.target)) {
                resultsBox.classList.remove('visible');
            }
        });
    }
});