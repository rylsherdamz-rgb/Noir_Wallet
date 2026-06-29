# Build stage
FROM rust:1.75 as builder

WORKDIR /build

# Copy workspace and backend files
COPY . .

# Build the backend in release mode
RUN cargo build --release --bin backend

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/target/release/backend /app/backend

WORKDIR /app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["/app/backend"]
