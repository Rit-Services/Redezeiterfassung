

Xvfb -ac :99 -screen 0 1280x1024x16 & export DISPLAY=:99

sudo Xvnc :1 & obs -display :1