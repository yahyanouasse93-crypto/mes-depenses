const form = document.getElementById('form');
const liste = document.getElementById('liste');
const totalEl = document.getElementById('total');
const nombreEl = document.getElementById('nombre');
const videEl = document.getElementById('vide');
const filtres = document.querySelectorAll('.filtre');

let depenses = JSON.parse(localStorage.getItem('depenses')) || [];
let filtreActif = 'Tous';

function sauvegarder() {
  localStorage.setItem('depenses', JSON.stringify(depenses));
}

function afficher() {
  liste.innerHTML = '';
  const filtrees = filtreActif === 'Tous'
    ? depenses
    : depenses.filter(d => d.categorie === filtreActif);

  let total = 0;
  filtrees.forEach((d) => {
    total += d.montant;
    const index = depenses.indexOf(d);
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="info">
        <span class="nom">${d.nom}</span>
        <span class="cat">${d.categorie}</span>
      </div>
      <div>
        <span class="montant">${d.montant.toFixed(2)} DH</span>
        <button class="supprimer" data-index="${index}">✕</button>
      </div>
    `;
    liste.appendChild(li);
  });

  totalEl.textContent = total.toFixed(2) + ' DH';
  nombreEl.textContent = filtrees.length;
  videEl.style.display = filtrees.length === 0 ? 'block' : 'none';

  document.querySelectorAll('.supprimer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = parseInt(e.target.dataset.index);
      if (confirm('Supprimer cette dépense ?')) {
        depenses.splice(i, 1);
        sauvegarder();
        afficher();
      }
    });
  });

  afficherStats();
}

function afficherStats() {
  const statsEl = document.getElementById('stats-list');
  const parCat = {};
  depenses.forEach(d => {
    parCat[d.categorie] = (parCat[d.categorie] || 0) + d.montant;
  });
  const entrees = Object.entries(parCat).sort((a, b) => b[1] - a[1]);
  if (entrees.length === 0) {
    statsEl.innerHTML = '<p style="color:#95a5a6;font-size:13px;">Aucune donnée.</p>';
    return;
  }
  statsEl.innerHTML = entrees.map(([cat, val]) =>
    `<div class="stat-ligne"><span>${cat}</span><span class="valeur">${val.toFixed(2)} DH</span></div>`
  ).join('');
}

function exporterCSV() {
  if (depenses.length === 0) {
    alert('Aucune dépense à exporter.');
    return;
  }
  const entetes = ['Nom', 'Montant (DH)', 'Categorie'];
  const lignes = depenses.map(d => [d.nom, d.montant.toFixed(2), d.categorie]);
  const csv = [entetes, ...lignes]
    .map(l => l.map(c => `"${c}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const lien = document.createElement('a');
  lien.href = URL.createObjectURL(blob);
  lien.download = `depenses-${new Date().toISOString().slice(0,10)}.csv`;
  lien.click();
  URL.revokeObjectURL(lien.href);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const nom = document.getElementById('nom').value.trim();
  const montant = parseFloat(document.getElementById('montant').value);
  const categorie = document.getElementById('categorie').value;

  if (!nom || isNaN(montant) || montant <= 0) return;

  depenses.push({ nom, montant, categorie });
  sauvegarder();
  form.reset();
  afficher();
});

filtres.forEach(f => {
  f.addEventListener('click', () => {
    filtres.forEach(x => x.classList.remove('actif'));
    f.classList.add('actif');
    filtreActif = f.dataset.cat;
    afficher();
  });
});

document.getElementById('export').addEventListener('click', exporterCSV);

afficher();