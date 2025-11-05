FROM node:18.20.6-bullseye-slim as builder

ARG ENV_FILE

RUN mkdir -p /opt/genies_admin
WORKDIR /opt/genies_admin

COPY public ./public 
COPY src ./src
COPY shared ./shared
COPY env/${ENV_FILE} ./.env
COPY .npmrc next-env.d.ts next.config.js package.json package-lock.json tsconfig.json ./

# Need to install all dependencies first for typescript, then remove and install production only dependencies
RUN npm ci --ignore-scripts && npm run build && \
    npm prune --production && rm -f tsconfig.json && \
    rm -rf .husky && rm -f .npmrc rm -f package-lock.json

FROM node:18.20.6-bullseye-slim
# expose port
EXPOSE 3000

RUN mkdir -p /opt/genies_admin 
WORKDIR /opt/genies_admin

# copy over everything (last to optimize cacheing)
COPY --from=builder  /opt/genies_admin ./

# start
ENV NODE_ENV=production
CMD ["./node_modules/.bin/next", "start"]

