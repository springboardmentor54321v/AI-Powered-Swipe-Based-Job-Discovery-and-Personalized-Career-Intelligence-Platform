"""Alert delivery channels. In-app notifications are always created (they are the fallback);
email and push are optional extras.

EMAIL_BACKEND = console (default, prints to the log) | smtp (SMTP_HOST, SMTP_PORT, SMTP_USER,
SMTP_PASSWORD, SMTP_FROM, SMTP_TLS=1)  -- works with Brevo/SendGrid SMTP relays or MailHog in dev.

Push (Firebase Cloud Messaging) needs a Firebase service account and the google-auth package; this
module only defines the hook. Until FCM_PROJECT_ID + FCM_SERVICE_ACCOUNT_JSON are configured and
send_push is implemented, push requests fall back to the in-app notification.
"""
import os
import smtplib
from email.message import EmailMessage


def email_backend():
    return os.getenv("EMAIL_BACKEND", "console").lower()


def send_email(to_address, subject, body):
    """-> True if the message was handed to a backend."""
    if not to_address:
        return False
    if email_backend() == "smtp" and os.getenv("SMTP_HOST"):
        msg = EmailMessage()
        msg["From"] = os.getenv("SMTP_FROM", "alerts@swipex.local")
        msg["To"] = to_address
        msg["Subject"] = subject
        msg.set_content(body)
        try:
            with smtplib.SMTP(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT", "587")), timeout=10) as smtp:
                if os.getenv("SMTP_TLS", "1") == "1":
                    smtp.starttls()
                if os.getenv("SMTP_USER"):
                    smtp.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD", ""))
                smtp.send_message(msg)
            return True
        except Exception as exc:
            print("EMAIL WARNING:", exc)
            return False
    print(f"[email:console] to={to_address} subject={subject!r}")
    return True


def push_configured():
    return bool(os.getenv("FCM_PROJECT_ID") and os.getenv("FCM_SERVICE_ACCOUNT_JSON"))


def send_push(token, title, body):
    """Not implemented without Firebase credentials. Returns False so callers rely on the in-app alert."""
    if not token or not push_configured():
        return False
    print("PUSH WARNING: FCM sending is not implemented in this build.")
    return False
