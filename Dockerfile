FROM node:20.14.0
WORKDIR /user/app/

COPY package*.json ./
# Install dependencies
RUN npm install

COPY . .

RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]