
echo off
set action=%1

git config --global user.email "febri7299@gmail.com"
git config --global user.name "rincoreiys"

IF "%action%"=="push" (
    git add .
    git commit -m "PUSH"
    git push
)

IF "%action%"=="pull" (
    git checkout .
    git pull
)



