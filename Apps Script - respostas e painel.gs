// Script da folha "casamento c/ assistente".
// Extensões → Apps Script → apaga tudo → cola isto → Guardar →
// Implementar → Gerir implementações → lápis → Versão: Nova versão → Implementar.
// Depois, uma vez: escolhe "sincronizarTudo" no menu de funções e carrega ▶ Executar.

const CODIGO_PAINEL = 'MUDA-ESTE-CODIGO';   // mantém o código que já tinhas escolhido
const SEPARADOR = 'RSPV Site';
const CONVIDADOS = 'Convidados';

function folha_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SEPARADOR);
}

// Menu na folha: "Casamento → Atualizar convidados com as respostas"
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Casamento')
    .addItem('Atualizar convidados com as respostas', 'sincronizarTudo')
    .addToUi();
}

// Recebe as respostas do convite, escreve no "RSPV Site" e atualiza o "Convidados"
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const data = String(d.enviado || '').replace(/-/g, '/');
    const vem = d.confirma === 'sim' ? 'Sim' : d.confirma === 'nao' ? 'Não' : String(d.confirma || '');
    folha_().appendRow([data, d.nome || '', vem, Number(d.numAcompanhantes || 0), d.convidadosDetalhe || '', d.mensagem || '']);
    try { atualizarConvidados_([{ data: data, nome: d.nome || '', vem: vem, detalhe: d.convidadosDetalhe || '' }]); } catch (err) { console.error(err); }
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
  const out = [['enviado', 'nome', 'confirma', 'numAcompanhantes', 'convidadosDetalhe', 'mensagem']];
  respostas_().forEach(r => out.push([r.data, r.nome, norm_(r.vem) === 'nao' ? 'nao' : norm_(r.vem), r.n, r.detalhe, r.msg]));
  const csv = out.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
  return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
}

// Corre todas as respostas do "RSPV Site" outra vez contra o "Convidados"
function sincronizarTudo() {
  const r = atualizarConvidados_(respostas_());
  try { SpreadsheetApp.getUi().alert('Convidados atualizados: ' + r.atualizados + ' pessoas.' + (r.novos ? '\n' + r.novos + ' nomes novos acrescentados no fim (ver Notas).' : '')); } catch (e) {}
}

// ---------- auxiliares ----------

function respostas_() {
  const rows = folha_().getDataRange().getDisplayValues();
  const out = [];
  rows.forEach(r => {
    const nome = String(r[1] || '').trim();
    if (!nome || /^quem respondeu$/i.test(nome) || /^data$/i.test(String(r[0]).trim())) return;
    out.push({ data: r[0], nome: nome, vem: r[2], n: r[3], detalhe: r[4], msg: r[5] });
  });
  return out;
}

function norm_(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function dist_(a, b) {
  const m = a.length, n = b.length;
  let p = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const c = [i];
    for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    p = c;
  }
  return p[n];
}

// palavras que as pessoas escrevem mas não fazem parte do nome ("o primo João Baião", "a tia Rosa")
const PALHA_ = ['o','a','os','as','e','de','da','do','das','dos','meu','minha','nosso','nossa','sr','sra','senhor','senhora','dona','dr','dra',
  'primo','prima','tio','tia','avo','avó','neto','neta','sobrinho','sobrinha','irmao','irma','pai','mae','filho','filha','padrinho','madrinha',
  'namorado','namorada','marido','mulher','esposa','esposo','noivo','noiva','amigo','amiga','cunhado','cunhada','sogro','sogra','afilhado','afilhada'];
function limpo_(k) {
  return k.split(' ').filter(w => w && PALHA_.indexOf(w) < 0);
}

// mesmo primeiro nome + um apelido igual ou quase igual (ex.: "Simões" / "Simoes" / "Simoed")
function mesma_(a, b) {
  if (a === b) return true;
  const pa = limpo_(a), pb = limpo_(b);
  if (pa.join(' ') === pb.join(' ') && pa.length) return true;
  if (pa.length < 2 || pb.length < 2 || pa[0] !== pb[0]) return false;
  return pa.slice(1).some(x => pb.slice(1).some(y => x === y || (Math.max(x.length, y.length) > 3 && dist_(x, y) <= 1)));
}

function pessoas_(detalhe) {
  return String(detalhe || '').split(';').map(p => p.trim()).filter(Boolean).map(p => {
    const idade = (/\[([^\]]+)\]/.exec(p) || [])[1] || '';
    const diet = (/\(([^)]+)\)\s*$/.exec(p) || [])[1] || '';
    const nome = p.replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)\s*$/, '').trim();
    return { nome: nome, idade: idade, diet: diet };
  });
}

function categoria_(idade) {
  const i = norm_(idade);
  if (i.indexOf('crian') === 0) return 'Criança (4-9)';
  if (i.indexOf('beb') === 0) return 'Bebé (0-3)';
  return 'Adulto';
}

function atualizarConvidados_(lista) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONVIDADOS);
  const vals = sh.getDataRange().getValues();
  const hr = vals.findIndex(r => norm_(r[0]) === 'nome');
  const H = vals[hr].map(h => norm_(h));
  const col = (nome) => H.findIndex(h => h.indexOf(nome) === 0);
  const cNome = 0, cCat = col('categoria'), cPres = col('presenca'), cDiet = col('restric'), cNotas = col('notas'), cGrupo = col('grupo');
  const cData = cPres >= 0 && !H[cPres + 1] ? cPres + 1 : -1;   // coluna sem título logo a seguir a "Presença" = data da resposta
  const linhas = [];
  for (let i = hr + 1; i < vals.length; i++) if (String(vals[i][cNome]).trim()) linhas.push({ i: i, k: norm_(vals[i][cNome]) });
  let atualizados = 0, novos = 0;

  // respostas mais antigas primeiro, para a mais recente ganhar
  lista.forEach(resp => {
    const vem = norm_(resp.vem) === 'sim' ? 'Sim' : norm_(resp.vem) === 'nao' ? 'Não' : '';
    if (!vem) return;
    let ps = pessoas_(resp.detalhe);
    if (!ps.length) ps = [{ nome: resp.nome, idade: '', diet: '' }];
    ps.forEach(p => {
      const k = norm_(p.nome);
      if (!k) return;
      let alvo = linhas.find(l => mesma_(l.k, k));
      if (!alvo) {
        // na lista só está o primeiro nome (ex.: "Margarida"): aceita se for a única com esse nome
        const pr = limpo_(k)[0];
        const so = linhas.filter(l => { const t = limpo_(l.k); return t.length === 1 && t[0] === pr; });
        const outros = linhas.filter(l => limpo_(l.k)[0] === pr && limpo_(l.k).length > 1);
        if (pr && so.length === 1 && !outros.length) alvo = so[0];
      }
      if (alvo) {
        const r = alvo.i + 1;
        if (cPres >= 0) sh.getRange(r, cPres + 1).setValue(vem);
        if (cData >= 0 && resp.data) sh.getRange(r, cData + 1).setValue(resp.data);
        if (cNotas >= 0 && limpo_(alvo.k).join(' ') !== limpo_(k).join(' ')) {
          const nota = String(sh.getRange(r, cNotas + 1).getValue() || '');
          const txt = 'No site escreveu: ' + p.nome;
          if (nota.indexOf(txt) < 0) sh.getRange(r, cNotas + 1).setValue(nota ? nota + ' · ' + txt : txt);
        }
        if (vem === 'Sim') {
          if (cCat >= 0 && p.idade) sh.getRange(r, cCat + 1).setValue(categoria_(p.idade));
          if (cDiet >= 0) sh.getRange(r, cDiet + 1).setValue(p.diet || '');
        }
        atualizados++;
      } else {
        const ja = linhas.find(l => limpo_(l.k).join(' ') === limpo_(k).join(' '));
        if (ja) return;
        const linha = new Array(H.length).fill('');
        linha[cNome] = p.nome;
        if (cCat >= 0) linha[cCat] = categoria_(p.idade);
        if (cPres >= 0) linha[cPres] = vem;
        if (cData >= 0) linha[cData] = resp.data;
        if (cDiet >= 0) linha[cDiet] = p.diet || '';
        const primeiro = limpo_(k)[0];
        const parecidos = linhas.filter(l => limpo_(l.k)[0] === primeiro).map(l => vals[l.i][cNome] + ' (linha ' + (l.i + 1) + ')');
        if (cNotas >= 0) linha[cNotas] = 'Novo, veio do site (resposta de ' + resp.nome + ')' + (parecidos.length ? '. Ver se é: ' + parecidos.join(', ') : '');
        sh.appendRow(linha);
        const nova = sh.getLastRow();
        sh.getRange(nova, 1, 1, H.length).setBackground('#FCE8D6');
        linhas.push({ i: nova - 1, k: k });
        vals[nova - 1] = linha;
        novos++;
      }
    });
  });
  return { atualizados: atualizados, novos: novos };
}
