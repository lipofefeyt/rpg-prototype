@echo off
rem Optional shortcut: opens the Emberhold Android project (the "android" folder next to this file) in
rem Android Studio. You can equally use File > Open in Studio and choose that "android" folder.
set "STUDIO=C:\Program Files\Android\Android Studio\bin\studio64.exe"
if not exist "%STUDIO%" (
  for /f "delims=" %%I in ('where studio64.exe 2^>nul') do set "STUDIO=%%I"
)
if not exist "%STUDIO%" (
  echo Android Studio not found. Open the "android" folder from Studio via File ^> Open.
  pause
  exit /b 1
)
start "" "%STUDIO%" "%~dp0android"
