FROM node:16-alpine as builder

WORKDIR /home/ui

COPY . .

RUN npm install -g npm@8.5.1
RUN npm install

ARG REACT_APP_REAL_API
ARG REACT_APP_TEST_API

ENV REACT_APP_REAL_API ${REACT_APP_REAL_API}
ENV REACT_APP_TEST_API ${REACT_APP_TEST_API}

RUN npm run build

## FIRST STEP DONE NOW NGINX CONTAINER WILL BE BUILT

FROM nginx:latest

# Sets configuration files
COPY default.conf /etc/nginx/conf.d/default.conf

# deletes the default nginx page
RUN rm -rf /usr/share/nginx/html/*

# replaces our files instead of default
COPY --from=builder  /home/ui/build/ /usr/share/nginx/html/

#exposes port 80
EXPOSE 80

ENTRYPOINT [ "nginx","-g","daemon off;" ]
