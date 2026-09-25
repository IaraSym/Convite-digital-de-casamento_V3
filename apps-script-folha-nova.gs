// Script completo para a FOLHA NOVA (a organizada).
// Abre a folha nova → Extensões → Apps Script → apaga o que lá estiver → cola tudo isto → Guardar.

const CODIGO_PAINEL = 'MUDA-ESTE-CODIGO';   // o código que vais escrever no painel (não uses o 0910)
const SEPARADOR = 'RSVP';                    // separador onde ficam as respostas do site (é criado sozinho)
const COLUNAS = ['enviado', 'nome', 'confirma', 'numAcompanhantes', 'convidadosDetalhe', 'mensagem'];
const FOLHA_ANTIGA = '1lp0MNbJgo4k9wQzLmmzajxxuzQ09zbLrHzXurQ0j_tg';

function folha_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SEPARADOR);
  if (!sh) {
    sh = ss.insertSheet(SEPARADOR);
    sh.appendRow(COLUNAS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Recebe as respostas do convite
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    folha_().appendRow(COLUNAS.map(c => d[c] == null ? '' : d[c]));
    return ContentService.createTextOutput('OK');
  } finally {
    lock.releaseLock();
  }
}

// Entrega as respostas ao painel, só com o código certo
function doGet(e) {
  const k = (e && e.parameter && e.parameter.k) || '';
  if (k !== CODIGO_PAINEL) {
    Utilities.sleep(1500);
    return ContentService.createTextOutput('ERRO').setMimeType(ContentService.MimeType.TEXT);
  }
  const rows = folha_().getDataRange().getDisplayValues();
  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}

// Corre UMA vez (botão ▶ com "migrar" escolhido) para trazer as respostas que já estão na folha antiga
function migrar() {
  const antiga = SpreadsheetApp.openById(FOLHA_ANTIGA).getSheetByName('Convidados');
  const dados = antiga.getDataRange().getValues();
  const cab = dados.shift().map(h => String(h).trim().toLowerCase());
  const sh = folha_();
  dados.forEach(r => {
    if (!r.join('').trim()) return;
    sh.appendRow(COLUNAS.map(c => { const i = cab.indexOf(c.toLowerCase()); return i < 0 ? '' : r[i]; }));
  });
}
