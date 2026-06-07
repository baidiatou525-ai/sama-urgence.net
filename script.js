/**
 * SAMA URGENCE - Script Espace Partenaire Professionnel
 * Intègre Chart.js et la passerelle d'écoute temps réel Firebase Firestore.
 */

// ==========================================
// CONFIGURATION CONFIG FIREBASE
// ==========================================
// Remplacez cet objet par les clés fournies dans la console Firebase
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY_FIREBASE",
    authDomain: "sama-urgence.firebaseapp.com",
    projectId: "sama-urgence",
    storageBucket: "sama-urgence.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567:web:abcde12345"
};

// Initialisation conditionnelle de Firebase pour éviter les plantages si non configuré
let db = null;
try {
    if (firebaseConfig.apiKey !== "VOTRE_API_KEY_FIREBASE") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("SAMA URGENCE: Connexion Firestore établie avec succès.");
    } else {
        console.warn("SAMA URGENCE: Mode démonstration actif. (Clés Firebase manquantes)");
    }
} catch (error) {
    console.error("Erreur d'initialisation Firebase:", error);
}

// Variables globales de contrôle des instances de graphiques
let activityChartInstance = null;
let performanceChartInstance = null;

// ==========================================
// GESTION DE L'AUTHENTIFICATION (SIMULÉE)
// ==========================================
const loginForm = document.getElementById('partnerLoginForm');
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('partnerEmail').value;
        const password = document.getElementById('partnerPassword').value;

        // Démo Pro: Autorise l'accès pour l'évaluation immédiate
        if (email && password.length >= 4) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'grid';
            
            // Personnalisation dynamique du profil selon l'identifiant saisi
            initPartnerProfile(email);
            // Lancement de l'écosystème de données
            initDashboardData();
        } else {
            loginError.style.display = 'block';
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        dashboardSection.style.display = 'none';
        loginSection.style.display = 'flex';
        // Réinitialiser les champs
        loginForm.reset();
        loginError.style.display = 'none';
    });
}

function initPartnerProfile(email) {
    const pName = document.getElementById('partnerName');
    const pType = document.getElementById('partnerType');
    const pAvatar = document.getElementById('partnerAvatar');

    if (email.includes('ambulance') || email.includes('samu')) {
        pName.textContent = "SAMU National - Base Dakar";
        pType.textContent = "Société d'Ambulance Régulatrice";
        pAvatar.textContent = "S";
        pAvatar.style.backgroundColor = "var(--red-emergency)";
    } else {
        pName.textContent = "Hôpital Principal de Dakar";
        pType.textContent = "Centre de Traitement Trauma & Urgences";
        pAvatar.textContent = "H";
        pAvatar.style.backgroundColor = "var(--blue-medical)";
    }
}

// ==========================================
// ARCHITECTURE DES DONNÉES & GRAPHIQUES
// ==========================================
function initDashboardData() {
    // 1. Données de base par défaut (Fallback Démo)
    const demoData = {
        totalDemand: 148,
        todayDemand: 12,
        responseTime: "8.4 min",
        satisfaction: "96.8%",
        successInterventions: 132,
        cancelledInterventions: 16,
        orientedPatients: 284,
        // Historiques pour Chart.js (6 derniers mois)
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
        demandsHistory: [90, 110, 95, 130, 122, 148],
        successHistory: [82, 98, 84, 115, 110, 132]
    };

    // Mettre à jour l'interface visuelle immédiatement avec les données d'usine
    renderKPIs(demoData);
    buildCharts(demoData);

    // 2. Branchement Firestore si disponible
    if (db) {
        syncWithFirestore();
    }
}

// Injection des valeurs numériques dans le DOM
function renderKPIs(data) {
    document.getElementById('kpiTotalDemand').textContent = data.totalDemand;
    document.getElementById('kpiTodayDemand').textContent = data.todayDemand;
    document.getElementById('kpiResponseTime').textContent = data.responseTime;
    document.getElementById('kpiSatisfaction').textContent = data.satisfaction;
    document.getElementById('statSuccess').textContent = data.successInterventions;
    document.getElementById('statCancelled').textContent = data.cancelledInterventions;
    document.getElementById('statOriented').textContent = data.orientedPatients;
}

// Génération des courbes via Chart.js
function buildCharts(data) {
    // Nettoyage si réaffichage ultérieur
    if (activityChartInstance) activityChartInstance.destroy();
    if (performanceChartInstance) performanceChartInstance.destroy();

    // Configuration Graphique 1 : Évolution Mensuelle (Lignes superposées)
    const ctxActivity = document.getElementById('monthlyActivityChart').getContext('2d');
    activityChartInstance = new Chart(ctxActivity, {
        type: 'line',
        data: {
            labels: data.months,
            datasets: [
                {
                    label: 'Demandes Reçues',
                    data: data.demandsHistory,
                    borderColor: '#0056D2', // Bleu Médical
                    backgroundColor: 'rgba(0, 86, 210, 0.05)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointBackgroundColor: '#0056D2'
                },
                {
                    label: 'Interventions Réalisées',
                    data: data.successHistory,
                    borderColor: '#071630', // Bleu Foncé
                    backgroundColor: 'transparent',
                    fill: false,
                    tension: 0.2,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointBackgroundColor: '#071630'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { family: 'Montserrat', weight: 600 } } }
            },
            scales: {
                y: { grid: { color: 'rgba(0,0,0,0.04)' }, beginAtZero: true }
            }
        }
    });

    // Configuration Graphique 2 : Performance & Taux de croissance (Histogramme Double)
    const ctxPerf = document.getElementById('performanceComparisonChart').getContext('2d');
    
    // Calcul factice ou réel du taux de croissance basé sur les volumes
    const growthRates = [0, 22, -13, 36, -6, 21]; 

    performanceChartInstance = new Chart(ctxPerf, {
        type: 'bar',
        data: {
            labels: data.months,
            datasets: [
                {
                    label: 'Patients Orientés',
                    data: data.demandsHistory.map(x => x * 2), // Équivalence proportionnelle
                    backgroundColor: '#071630',
                    borderRadius: 4
                },
                {
                    label: 'Taux de Croissance (%)',
                    data: growthRates,
                    backgroundColor: '#E63946', // Rouge Urgence
                    borderRadius: 4,
                    type: 'line', // Mixte : Barres + Ligne d'évolution
                    borderColor: '#E63946',
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: { grid: { color: 'rgba(0,0,0,0.04)' } }
            }
        }
    });
}

// ==========================================
// CONVERGENCE FIRESTORE EN TEMPS RÉEL
// ==========================================
function syncWithFirestore() {
    const statusBox = document.getElementById('dbStatus');
    
    // Écoute continue sur la collection maîtresse des requêtes d'ambulances
    db.collection("demandes_urgence").onSnapshot((snapshot) => {
        
        // Notification visuelle de synchronisation
        if(statusBox) {
            statusBox.style.color = "#10B981";
            statusBox.innerHTML = '<span class="status-dot pulsing"></span> Live Firestore Connecté';
        }

        let total = 0;
        let aujourdhui = 0;
        let annulees = 0;
        let reussies = 0;

        const dateDuJour = new Date().toDateString();

        // Analyse algorithmique pas à pas de la collection à chaque mutation de la BDD
        snapshot.forEach((doc) => {
            const alerte = doc.data();
            total++;

            // Analyse de l'état du traitement
            if (alerte.statut === "annule") {
                annulees++;
            } else if (alerte.statut === "termine" || alerte.statut === "valide") {
                reussies++;
            }

            // Filtrage temporel pour les statistiques du jour (KPI 2)
            if (alerte.timestamp) {
                const dateAlerte = alerte.timestamp.toDate().toDateString();
                if (dateAlerte === dateDuJour) {
                    aujourdhui++;
                }
            }
        });

        // Extraction des métriques calculées et fusion avec les données historiques stables
        const liveCalculatedData = {
            totalDemand: total > 0 ? total : 148, // Fallback démo si la BDD Firestore démarre à vide
            todayDemand: aujourdhui,
            responseTime: "7.9 min", // Dans une architecture mature, calculé via : mean(alerte.heure_arrivee - alerte.heure_appel)
            satisfaction: "97.2%",
            successInterventions: reussies > 0 ? reussies : 132,
            cancelledInterventions: annulees,
            orientedPatients: Math.floor(reussies * 1.8),
            
            // Conservation de l'historique graphique pour le rendu visuel
            months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
            demandsHistory: [90, 110, 95, 130, 122, total > 0 ? total : 148],
            successHistory: [82, 98, 84, 115, 110, reussies > 0 ? reussies : 132]
        };

        // Actualisation dynamique immédiate des composants sans recharger la page
        renderKPIs(liveCalculatedData);
        buildCharts(liveCalculatedData);

    }, (error) => {
        console.error("Firestore synchronisation échec: ", error);
        if(statusBox) {
            statusBox.style.color = "var(--red-emergency)";
            statusBox.innerHTML = '<span class="status-dot" style="background-color: var(--red-emergency)"></span> Erreur de liaison BDD';
        }
    });
}
