repo: IaraSym/Convite-digital-de-casamento_V3
branch: main

## Last sync
date: 2026-09-18T14:44:08Z

### Updated in this project
- O site passou do Netlify para o GitHub Pages em iaraejoao.pt (`CNAME`, `index.html` é agora o próprio convite).
- Novo painel de respostas com código de acesso, mensagens dos convidados e exportação CSV para a quinta.
- Convite personalizado por link (`?c=codigo`) com a linha "Para: …".
- Ícone do browser é o selo I&J; mapa adapta-se à janela; correções de scroll no iOS.

## Screen map
| Ecrã / ficheiro do projeto | Ficheiros no repositório |
| --- | --- |
| Convite Iara e Joao.dc.html (convite completo: envelope, itinerário, RSVP, álbum) | `Convite Iara e Joao.dc.html`, `support.js` |
| index.html (cópia do convite servida na raiz do domínio) | `index.html`, `CNAME` |
| Painel de Convidados.dc.html (respostas, exportações) | `Painel de Convidados.dc.html` |
| mapa-destinos.html (mapa das viagens, abre em modal) | `mapa-destinos.html` |
| Ícone do browser e atalho iOS | `favicon-32.png`, `favicon-64.png`, `favicon-180.png`, `assets/selo-ij.png` |
| Evento de calendário | `casamento-iara-joao.ics` |
| Imagens e ilustrações | `assets/` (fotos, `carro-puma.svg`, envelopes, `bawi/`) |

## Notas
- Publicado no GitHub Pages em iaraejoao.pt (deploy automático a cada push no `main`). O Netlify já não é usado.
- O `index.html` é uma cópia do `Convite Iara e Joao.dc.html` — regenerar sempre que o convite mudar.
- `support.js` é do runtime — não editar à mão.
- A apagar do repositório quando der: `favicon.svg`, `_redirects`, `dashboard.html`, `Convite Iara e Joao.html`, `Convite Iara e Joao - standalone-src.html`, `uploads/`.
- Respostas do RSVP: Apps Script da folha "casamento c/ assistente" (separador RSVP). O painel pede o código ao script; a folha fica Restrita.
- Convite com ecrã "em preparação" (código de acesso, também `?k=`). Tirar antes de enviar aos convidados.
- Fora do site (não vão para o repositório): `Manual dos Padrinhos/`, `Extras/`, `Originais/`, `doc-page.js`.
