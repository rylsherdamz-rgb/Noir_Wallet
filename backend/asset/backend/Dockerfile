# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM rust:1.90-slim-bookworm AS builder

# System deps for sqlx + openssl + libsodium
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    automake \
    autoconf \
    libtool \
    make \
    file \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Build dependencies separately for Docker layer caching
# If Cargo.toml/Cargo.lock don't change, this step is re-used from cache
COPY Cargo.toml Cargo.lock ./
RUN mkdir -p src && touch src/lib.rs src/main.rs
RUN cargo fetch
RUN mkdir migrations

# Now copy real source
COPY src ./src
COPY migrations ./migrations
RUN cargo build --release

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/target/release/noir-backend /usr/local/bin/noir-backend
COPY --from=builder /build/migrations /app/migrations

WORKDIR /app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -sf http://localhost:8080/health | grep -q '"status":"healthy"' || exit 1

ENV RUST_LOG=info,noir_backend=debug

ENTRYPOINT ["/usr/local/bin/noir-backend"]
