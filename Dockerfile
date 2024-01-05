FROM node:current-slim as builder

RUN apt-get -qq update && \
    apt-get -y install git && \
    apt-get -y autoremove && \
    apt-get -y autoclean

COPY . /home/FloBot/

RUN cd /home/FloBot && \
  # there npm i was already executed, remove it
  rm -rf node_modules && \
	npm ci && \
  echo "LAST_HASH=$(git rev-parse --short HEAD)" >> .build-info && \
  echo "DATE=$(git log -1 --format=%cd)" >> .build-info && \
  echo "BRANCH=$(git rev-parse --abbrev-ref HEAD)" >> .build-info	&& \
	rm -rf .git

FROM node:current-slim

COPY --from=builder /home/FloBot /home/FloBot

WORKDIR /home/FloBot

CMD ["npm", "run", "start"]
