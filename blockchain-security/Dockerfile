FROM rust:1.76-slim as builder

WORKDIR /usr/src/app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /usr/src/app/target/release/muse-blockchain-security .

EXPOSE 3000
CMD ["./muse-blockchain-security"]
