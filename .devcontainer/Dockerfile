FROM mcr.microsoft.com/devcontainers/javascript-node:18-bullseye

#install java on debian
RUN apt-get update && \
  apt-get install -y openjdk-11-jre curl

# install clojure
RUN curl -L -O https://github.com/clojure/brew-install/releases/latest/download/linux-install.sh && \
  chmod +x linux-install.sh && \
  ./linux-install.sh

RUN curl -sLO https://raw.githubusercontent.com/clj-kondo/clj-kondo/master/script/install-clj-kondo && \
  chmod +x install-clj-kondo && \
  ./install-clj-kondo
