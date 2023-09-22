FROM node:18

WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm install

# copy source
COPY . .

EXPOSE 1234
CMD [ "npx",  "parcel", "src/index.html" ]
