FROM node:slim
WORKDIR /app/frontend
COPY frontend ./
ENV VITE_API_URL=
ARG VITE_CLERK_PUBLISHABLE_KEY
RUN npm install --no-audit --no-fund \
 && npm run build

 