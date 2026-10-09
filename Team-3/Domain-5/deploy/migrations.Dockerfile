FROM postgres:16-alpine
WORKDIR /migrations
COPY Team-3/Domain-2/data-layer/migrations/ ./
COPY Team-3/Domain-5/deploy/run-migrations.sh /usr/local/bin/swipex-migrate
RUN chmod +x /usr/local/bin/swipex-migrate
ENTRYPOINT ["/usr/local/bin/swipex-migrate"]
