import urllib.parse
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from .jwt_utils import decode_token

User = get_user_model()

@database_sync_to_async
def get_user_from_token(token):
    try:
        payload = decode_token(token, expected_type="access")
        user_id = payload.get("sub")
        if user_id and str(user_id).isdigit():
            return User.objects.select_related("role").get(id=int(user_id), is_active=True)
    except Exception:
        pass
    return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        parsed_qs = urllib.parse.parse_qs(query_string)
        token = parsed_qs.get("token", [None])[0]
        
        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
