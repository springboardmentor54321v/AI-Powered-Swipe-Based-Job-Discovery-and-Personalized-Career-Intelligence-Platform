FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 DJANGO_SETTINGS_MODULE=config.production_settings
WORKDIR /app

COPY Team-3/Domain-1/backend/requirements.txt /tmp/requirements.txt
COPY Team-3/Domain-1/backend/requirements-m3.txt /tmp/requirements-m3.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt \
    && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r /tmp/requirements-m3.txt

COPY Team-3/Domain-1/backend/ /app/
COPY Team-3/Domain-3/Milestone3work/ /Domain-3/Milestone3work/
COPY Team-3/Domain-3/data/ /Domain-3/data/
COPY Team-3/Domain-5/deploy/production_settings.py /app/config/production_settings.py
COPY Team-3/Domain-5/deploy/auth-entrypoint.sh /usr/local/bin/swipex-entrypoint

RUN mkdir -p /app/media/resumes /cache/huggingface && chmod +x /usr/local/bin/swipex-entrypoint
EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/swipex-entrypoint"]
