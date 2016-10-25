FROM node:argon

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install --production

# Bundle app source
COPY .build /app/.build
COPY .bin /app/.bin

EXPOSE 3000
CMD [ "npm", "start" ]