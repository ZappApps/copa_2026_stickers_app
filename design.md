# Design do App: Copa 2026 Figurinhas

## Identidade Visual

O app adota uma paleta inspirada na Copa do Mundo de 2026 — verde, amarelo e azul do Brasil combinados com o verde e vermelho do torneio FIFA. O visual é moderno, com cards arredondados, tipografia bold para números e ícones esportivos. O tema suporta modo claro e escuro.

**Cores Primárias:**
- `primary`: `#00843D` (verde FIFA/Copa)
- `secondary`: `#FFD700` (amarelo dourado)
- `accent`: `#C8102E` (vermelho FIFA)
- `background`: `#F5F5F5` (claro) / `#121212` (escuro)
- `surface`: `#FFFFFF` (claro) / `#1E1E1E` (escuro)
- `foreground`: `#1A1A1A` (claro) / `#EFEFEF` (escuro)

---

## Lista de Telas

| Tela | Descrição |
| :--- | :--- |
| **Splash / Onboarding** | Tela inicial com logo e inicialização do banco de dados local |
| **Dashboard (Home)** | Visão geral do progresso do álbum, atalhos rápidos e estatísticas |
| **Meu Álbum** | Lista completa de todas as 980 figurinhas, agrupadas por seleção |
| **Adicionar Figurinhas** | Modal/tela para adicionar figurinhas via câmera, texto ou arquivo |
| **Comparar Listas** | Inserir lista de amigo e visualizar matches de troca |
| **Relatórios** | Listas de faltantes e repetidas formatadas para compartilhamento |
| **Histórico de Trocas** | Registro de todas as trocas realizadas |
| **Perfil / Configurações** | Dados do usuário, tema e opções do app |

---

## Conteúdo e Funcionalidade por Tela

### Dashboard (Home)
- Barra de progresso circular mostrando `X/980 figurinhas` coladas
- Cards de resumo: "Faltam X", "Repetidas: Y"
- Botão de ação principal: "Adicionar Figurinhas"
- Acesso rápido às últimas figurinhas adicionadas
- Atalho para "Comparar com Amigo"

### Meu Álbum
- Lista agrupada por seleção (Grupo A, B, C... e Especiais)
- Cada seleção mostra um cabeçalho com bandeira (emoji), nome e progresso (ex: BRA 15/20)
- Cada figurinha é representada por um chip/badge: verde (colada), cinza (faltante), amarelo com número (repetida)
- Filtros: Todas / Coladas / Faltantes / Repetidas
- Busca por código (ex: "BRA12") ou nome do país

### Adicionar Figurinhas
- **Aba Câmera**: Abre câmera para foto das figurinhas. Após captura, envia para OCR e exibe lista de figurinhas reconhecidas para confirmação.
- **Aba Texto**: Campo de texto livre para colar listas copiadas de WhatsApp/redes sociais. Botão "Processar" aciona o parser.
- **Aba Arquivo**: Botão para selecionar arquivo .txt ou .pdf do dispositivo.
- Tela de confirmação mostra figurinhas identificadas antes de salvar.

### Comparar Listas
- Campo de texto para colar a lista do amigo
- Botão "Comparar"
- Resultado em 3 seções:
  1. "Você precisa e o amigo tem" (verde)
  2. "O amigo precisa e você tem" (amarelo)
  3. "Ambos precisam" (cinza)
- Botão "Registrar Troca" para efetivar e salvar no histórico

### Relatórios
- Duas abas: "Faltantes" e "Repetidas"
- Lista formatada no padrão `SIGLA: COD1(x1), COD2(x2)...`
- Botão "Compartilhar" (usa o share nativo do sistema)
- Botão "Copiar" para área de transferência

### Histórico de Trocas
- Lista de trocas em ordem cronológica reversa
- Cada item mostra: data, nome do parceiro, figurinhas trocadas
- Detalhe da troca ao tocar no item

---

## Fluxos Principais

**Fluxo 1 — Adicionar figurinhas por foto:**
Câmera → Foto → OCR (Google Vision) → Tela de Confirmação → Salvar → Dashboard atualizado

**Fluxo 2 — Adicionar figurinhas por texto:**
Colar texto → Parser (Regex) → Tela de Confirmação → Salvar → Dashboard atualizado

**Fluxo 3 — Comparar com amigo:**
Colar lista do amigo → Processar → Ver matches → Registrar troca → Histórico atualizado

**Fluxo 4 — Gerar relatório para compartilhar:**
Relatórios → Selecionar tipo → Copiar/Compartilhar

---

## Navegação

O app utiliza uma Tab Bar inferior com 4 abas:
1. **Home** (ícone: casa) — Dashboard
2. **Álbum** (ícone: livro/grid) — Meu Álbum completo
3. **Comparar** (ícone: setas opostas) — Comparação de listas
4. **Mais** (ícone: três pontos) — Relatórios, Histórico, Perfil
