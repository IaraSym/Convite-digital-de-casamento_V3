// Acrescenta isto ao teu projeto do Apps Script (o mesmo que recebe as respostas do convite).
// NÃO apagues o doPost que já lá está.
// Se já existir uma função doGet, substitui-a por esta.

const CODIGO_PAINEL = 'MUDA-ESTE-CODIGO';   // o código que vais escrever no painel
const FOLHA_ID = '1lp0MNbJgo4k9wQzLmmzajxxuzQ09zbLrHzXurQ0j_tg';
const FOLHA_NOME = 'Convidados';

function doGet(e) {
  const k = (e && e.parameter && e.parameter.k) || '';
  if (k !== CODIGO_PAINEL) {
    Utilities.sleep(1500); // atrasa quem tenta adivinhar
    return ContentService.createTextOutput('ERRO').setMimeType(ContentService.MimeType.TEXT);
  }
  const sh = SpreadsheetApp.openById(FOLHA_ID).getSheetByName(FOLHA_NOME);
  const rows = sh.getDataRange().getDisplayValues();
  const csv = rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}
