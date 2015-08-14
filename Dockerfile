FROM library/node:0.10

RUN apt-get update && apt-get install -y npm git

WORKDIR /home

EXPOSE 7070

CMD git clone -b master http://readonly:systemsbiology@amp.pharm.mssm.edu/gitlab/apps/Lich.git \
	&& cd Lich \
	&& npm install \
	&& npm install -g grunt-cli \
  && npm install -g bower \
	&& bower -F install --allow-root \
	&& grunt deploy
