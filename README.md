# PREÇORAMA — Frontend

Projeto React + TanStack Start, configurado para rodar no **Render** como Web Service (Node.js).

## Deploy no Render (passo a passo)

### 1. Suba no GitHub

```bash
git add .
git commit -m "deploy: frontend integrado com backend"
git push
```

### 2. Crie o Web Service no Render

- Render → **New → Web Service**
- Conecte o repositório GitHub
- Configure:
  - **Runtime:** `Node`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `node .output/server/index.mjs`
- Em **Environment Variables** adicione:
  - `NODE_VERSION` = `20`
  - `VITE_API_URL` = `https://price-compass-api.onrender.com` ← URL do seu backend

### 3. Deploy automático

Cada `git push` no `main` dispara um novo deploy automaticamente.

---

## Rodar localmente

```bash
cp .env.example .env
# edite .env com VITE_API_URL=http://localhost:8000

npm install
npm run dev
```

---

## O que foi integrado com o backend real

- `src/lib/api.ts` — todas as chamadas à API FastAPI
- `src/routes/admin.tsx` — painel Admin com dados reais:
  - Estatísticas do banco (total de anúncios, vendidos, preço médio)
  - CRUD de termos de busca (adicionar, pausar, remover)
  - Tabela de vendas recentes
- `src/components/time-ago.tsx` — corrigido (sem dependência de mock-data)

O restante do site (home, catálogo, produtos) continua com mock-data.
