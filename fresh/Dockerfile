FROM denoland/deno:alpine-1.40.3

WORKDIR /app

# Cache dependencies
COPY deno.json .
RUN deno cache deno.json || true

COPY . .

EXPOSE 8000

CMD ["task", "start"]
