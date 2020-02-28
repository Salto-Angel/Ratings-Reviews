# inherit from the Node official Image
FROM node:11.8

# set a workdir inside docker
WORKDIR /usr/src/app

# copy . (all in the current directory) to . (WORKDIR)
COPY . .

RUN npm install

# the port we wish to expose
EXPOSE 12345

# run a command when running the container
CMD ["npm", "start"]