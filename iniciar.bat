@echo off
setlocal
cd /d "%~dp0"
title NutriPet

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode de novo.
  pause
  exit /b 1
)

node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit((a===22&&b>=13)||(a===24&&b>=3)||a>=26?0:1)"
if errorlevel 1 (
  echo [ERRO] Versao do Node muito antiga. Precisa de 22.13+ ou 24.3+. Atual:
  node -v
  pause
  exit /b 1
)

if not exist "node_modules\expo\package.json" (
  echo Instalando dependencias, so na primeira vez...
  call npm install
  if errorlevel 1 (
    echo [ERRO] Falha no npm install. Veja a mensagem acima.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando o NutriPet. Escaneie o QR Code com o Expo Go.
echo Dica: "iniciar.bat --tunnel" se o celular estiver em outra rede; "iniciar.bat --web" abre no navegador.
echo.
call npx expo start %*
