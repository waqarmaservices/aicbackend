FROM node:20.13.0

WORKDIR /user/app/

# Copy the local code to the container
COPY . .

RUN npm install

RUN npm run build

EXPOSE 3000

# Start the service
CMD ["npm", "run", "start:dev"]