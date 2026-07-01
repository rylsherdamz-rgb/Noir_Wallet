# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM rust:1.96-slim-bookworm AS builder

# System deps for sqlx + openssl
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Cache dependencies separately from source for faster rebuilds
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --locked
RUN rm src/main.rs

# Now copy real source and build
COPY . .
# Touch main.rs so cargo knows it changed
RUN touch src/main.rs
RUN cargo build --release --locked

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/target/release/noir-backend /usr/local/bin/noir-backend

# Copy migrations so sqlx can run them at startup
COPY --from=builder /build/migrations /app/migrations

WORKDIR /app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:8080/health | grep -q '"status":"healthy"' || exit 1

ENV RUST_LOG=info,noir_backend=debug

ENTRYPOINT ["/usr/local/bin/noir-backend"]
