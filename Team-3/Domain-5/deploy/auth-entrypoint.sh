#!/bin/sh
set -eu

python manage.py migrate --noinput
python manage.py seed_roles
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
