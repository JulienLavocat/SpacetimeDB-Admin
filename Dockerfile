FROM node:22 AS builder

WORKDIR /app

COPY . .

RUN npm ci && npm run

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=builder /app/dist/stdb-admin/browser /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
