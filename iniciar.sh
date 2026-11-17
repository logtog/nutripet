#!/usr/bin/env bash
# Inicia o NutriPet (Mac/Linux). Instala as dependências na primeira vez.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "[ERRO] Node.js não encontrado. Instale a versão LTS em https://nodejs.org" >&2
  exit 1
fi
if ! node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit((a===22&&b>=13)||(a===24&&b>=3)||a>=26?0:1)"; then
  echo "[ERRO] Node muito antigo (precisa de 22.13+ ou 24.3+). Atual: $(node -v)" >&2
  exit 1
fi
if [ ! -f node_modules/expo/package.json ]; then
  echo "Instalando dependências (só na primeira vez)..."
  npm install || exit 1
fi
exec npx expo start "$@"
