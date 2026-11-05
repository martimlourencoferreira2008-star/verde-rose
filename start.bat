@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao esta instalado. Instala a versao 20.6 ou superior em https://nodejs.org/
  pause
  exit /b 1
)

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Criei o ficheiro .env. Abre-o, cola uma chave Gemini nova, guarda e executa start.bat novamente.
  start "" notepad ".env"
  pause
  exit /b 1
)

findstr /c:"cola_a_nova_chave_aqui" ".env" >nul
if not errorlevel 1 (
  echo Substitui o texto de exemplo em .env pela tua chave Gemini e guarda.
  start "" notepad ".env"
  pause
  exit /b 1
)

echo A app vai abrir em http://127.0.0.1:4173
start "" http://127.0.0.1:4173
node --env-file=.env server.js
pause
