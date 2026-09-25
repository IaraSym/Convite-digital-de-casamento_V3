// Script da folha "casamento c/ assistente".
// Extensões → Apps Script → apaga tudo → cola isto → Guardar →
// Implementar → Gerir implementações → lápis → Versão: Nova versão → Implementar.

const CODIGO_PAINEL = 'MUDA-ESTE-CODIGO';   // mantém o código que já tinhas escolhido
const SEPARADOR = 'RSPV Site';

function folha_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SEPARADOR);
}

// Recebe as respostas do convite e escreve no separador "RSPV Site"
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const data = String(d.enviado || '').split(' ')[0].replace(/-/g, '/');
    const vem = d.confirma === 'sim' ? 'Sim' : d.confirma === 'nao' ? 'Não' : String(d.confirma || '');
    folha_().appendRow([data, d.nome || '', vem, Number(d.numAcompanhantes || 0), d.convidadosDetalhe || '', d.mensagem || '']);
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
  const h = rows.findIndex(r => String(r[0]).trim().toLowerCase() === 'data');
  const out = [['enviado', 'nome', 'confirma', 'numAcompanhantes', 'convidadosDetalhe', 'mensagem']];
  rows.slice(h + 1).forEach(r => {
    if (!String(r[1]).trim()) return;
    const c = String(r[2]).trim().toLowerCase();
    out.push([r[0], r[1], c === 'não' || c === 'nao' ? 'nao' : c, r[3], r[4], r[5]]);
  });
  const csv = out.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}
