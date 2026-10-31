@echo off
setlocal
 title Bunker dos Mortos v6 - Servidor local
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado.
  echo Instale Node.js 20 ou superior em https://nodejs.org/ e abra este arquivo novamente.
  pause
  exit /b 1
)

if not exist "node_modules\ws\package.json" (
  echo Instalando a dependencia do servidor multiplayer...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao foi possivel instalar as dependencias. Confira sua conexao com a internet.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando o servidor local em http://localhost:3000
start "Abrir Bunker dos Mortos" cmd /c "timeout /t 2 /nobreak ^>nul ^& start http://localhost:3000"
call npm start
pause
