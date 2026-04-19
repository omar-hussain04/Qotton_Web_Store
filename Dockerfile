FROM node:24-alpine

WORKDIR /app

COPY package.json /app/.

RUN npm install

COPY . .

CMD ["npm", "run", "dev"]

EXPOSE 3000