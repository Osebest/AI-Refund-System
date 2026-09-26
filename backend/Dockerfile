FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY src/policy/policy.md ./dist/policy/policy.md
RUN mkdir -p /app/data
EXPOSE 4000
CMD ["npm", "start"]
