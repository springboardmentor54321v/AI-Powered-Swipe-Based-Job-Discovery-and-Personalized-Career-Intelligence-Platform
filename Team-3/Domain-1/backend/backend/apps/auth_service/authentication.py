from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from .jwt_utils import decode_token, TokenExpiredError, TokenInvalidError

User = get_user_model()

class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication class for Django REST Framework.
    Extracts Bearer token from 'Authorization: Bearer <token>' header,
    validates the JWT signature and expiry, and attaches the User instance.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()

        if not auth_header:
            return None

        if len(auth_header) == 1:
            raise AuthenticationFailed("Invalid token header. No credentials provided.")
        elif len(auth_header) > 2:
            raise AuthenticationFailed("Invalid token header. Token string should not contain spaces.")

        prefix = auth_header[0].decode("utf-8")
        if prefix.lower() != self.keyword.lower():
            return None

        token = auth_header[1].decode("utf-8")
        return self.authenticate_credentials(token)

    def authenticate_credentials(self, token: str):
        try:
            payload = decode_token(token, expected_type="access")
        except TokenExpiredError:
            raise AuthenticationFailed("Access token has expired.")
        except TokenInvalidError as e:
            raise AuthenticationFailed(str(e))
        except Exception as e:
            raise AuthenticationFailed(f"Authentication failed: {str(e)}")

        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationFailed("Token payload missing user identifier ('sub').")

        try:
            user = User.objects.select_related("role").get(id=int(user_id), is_active=True)
        except (User.DoesNotExist, ValueError):
            raise AuthenticationFailed("User not found or account is inactive.")

        return (user, payload)

    def authenticate_header(self, request):
        return f'{self.keyword} realm="api"'

# Swagger / OpenAPI Schema Extension
try:
    from drf_spectacular.extensions import OpenApiAuthenticationExtension

    class JWTAuthenticationScheme(OpenApiAuthenticationExtension):
        target_class = "apps.auth_service.authentication.JWTAuthentication"
        name = "jwtAuth"

        def get_security_requirement(self, auto_schema):
            return {self.name: []}

        def get_security_definition(self, auto_schema):
            return {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
except ImportError:
    pass
