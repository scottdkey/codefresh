FROM node:current-alpine.3.13 as build
WORKDIR /usr/app
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
RUN yarn tsc


FROM node:current-alpine.3.13
WORKDIR /usr/app
COPY package.json . 
COPY yarn.lock .
RUN yarn install --production
COPY --from=build /usr/app/dist ./dist
EXPOSE 300
CMD ["yarn", "start"]