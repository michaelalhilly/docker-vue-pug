FROM node:12.18.3

# Adds vodka tonic alias.

RUN echo 'alias vt="./vt.sh"' >> ~/.bashrc

# Adds Supervisor configuration file. Supervisor is run
# as a background process to keep this container running.

ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Installs Vue CLI globally.

RUN npm i @vue/cli -g

# Installs dependencies.

RUN apt-get update && apt-get install -y \
	supervisor

# Creates Supervisor directory.

RUN mkdir -p /var/log/supervisor