# Docker 

FROM node:20.12.1

LABEL maintainer="Aanand Aman <aaman8@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

# Install node dependencies defined in package-lock.json
RUN npm install


# Copy src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Run the server
CMD ["npm" ,"start"]


# We run our service on port 8080
EXPOSE 8080


#Optimization for Step 20 Lab 6 
#Multi-Stage Build 

# #  Build dependencies node 14 as for LTS 
# FROM node:14 AS build
# # We default to use port 8080 in our service
# ENV PORT=8080
# WORKDIR /app
# COPY package*.json ./
# RUN npm install


# # Reduce npm spam when installing within Docker
# # https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
# ENV NPM_CONFIG_LOGLEVEL=warn

# # Disable colour when run inside Docker
# # https://docs.npmjs.com/cli/v8/using-npm/config#color
# ENV NPM_CONFIG_COLOR=false


# #  Create the  image
# FROM node:14
# WORKDIR /app
# COPY --from=build /app /app
# COPY ./src ./src
# COPY ./tests/.htpasswd ./tests/.htpasswd

# #Label by using single statement 
# LABEL maintainer="Aanand Aman <aaman8@example.com>" \
#       description="Fragments node.js microservice"


# # # We run our service on port 8080
#  EXPOSE 8080

# CMD npm start


