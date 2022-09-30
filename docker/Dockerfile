FROM node:16-alpine

ENV PORT=3000
ADD . /srv
RUN cd /srv && npm -g install pnpm && pnpm install && pnpm run build && rm -rf node_modules packages/*/node_modules && pnpm install -P && pnpm store prune
WORKDIR /srv/packsages/website
ENTRYPOINT ["pnpm", "run", "serve"]
