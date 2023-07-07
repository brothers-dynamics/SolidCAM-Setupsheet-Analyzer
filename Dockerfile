FROM node:latest

WORKDIR /app/

COPY . .

CMD [ "node", "server.js" ]