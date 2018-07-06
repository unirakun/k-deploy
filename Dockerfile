FROM node:9-slim

EXPOSE 3000

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn --production

COPY src ./

CMD [ "node", "." ]
