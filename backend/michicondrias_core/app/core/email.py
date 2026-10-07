"""
Email service for Michicondrias using Resend.
Handles password reset emails and other transactional emails.
"""
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(
    email: str, 
    token: str, 
    user_name: Optional[str] = None
) -> bool:
    """
    Send a password reset email with a deep link to the app.
    Falls back to logging the token if Resend is not configured.
    Returns True if email was sent (or logged), False on error.
    """
    display_name = user_name or email.split("@")[0]
    
    # Build the reset URL — deep link for mobile, web fallback
    deep_link = f"{settings.APP_DEEP_LINK_SCHEME}://reset-password?token={token}"
    web_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    html_content = _build_reset_email_html(display_name, deep_link, web_link)
    
    # If Resend API key is not configured, log the token (dev mode)
    if not settings.RESEND_API_KEY:
        logger.warning(
            "[EMAIL SERVICE] Resend API key not configured. "
            "Set RESEND_API_KEY environment variable to enable email delivery."
        )
        logger.info(f"[PASSWORD RESET] Token for {email}: {token}")
        logger.info(f"[PASSWORD RESET] Deep link: {deep_link}")
        logger.info(f"[PASSWORD RESET] Web link: {web_link}")
        return True
    
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        
        params = {
            "from": settings.EMAIL_FROM,
            "to": [email],
            "subject": "🐾 Restablece tu contraseña — Michicondrias",
            "html": html_content,
        }
        
        result = resend.Emails.send(params)
        logger.info(f"[EMAIL SERVICE] Password reset email sent to {email}, id={result.get('id', 'unknown')}")
        return True
        
    except Exception as e:
        logger.error(f"[EMAIL SERVICE] Failed to send password reset email to {email}: {e}")
        # Fallback: log the token so it's not lost
        logger.info(f"[PASSWORD RESET FALLBACK] Token for {email}: {token}")
        return False


def _build_reset_email_html(
    user_name: str, 
    deep_link: str, 
    web_link: str
) -> str:
    """Build a premium HTML email template for password reset."""
    return f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#081a2e;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#081a2e;">
        <tr>
            <td align="center" style="padding:40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding:24px 0;">
                            <h1 style="color:#0ea5e9;font-size:28px;font-weight:900;margin:0;letter-spacing:-0.5px;">
                                🐾 Michicondrias
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#0f2438 0%,#0a1628 100%);border-radius:24px;border:1px solid rgba(14,165,233,0.15);padding:40px 36px;">
                            
                            <h2 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 8px;">
                                Hola, {user_name} 👋
                            </h2>
                            
                            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:24px;margin:0 0 28px;">
                                Recibimos una solicitud para restablecer la contraseña de tu cuenta. 
                                Haz clic en el botón de abajo para crear una nueva contraseña.
                            </p>
                            
                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="{deep_link}" 
                                           style="display:inline-block;background-color:#0ea5e9;color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:14px;letter-spacing:0.3px;">
                                            Restablecer Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Alternative link -->
                            <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:20px;margin:24px 0 0;text-align:center;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:
                            </p>
                            <p style="color:#0ea5e9;font-size:12px;word-break:break-all;margin:8px 0 0;text-align:center;">
                                <a href="{web_link}" style="color:#0ea5e9;text-decoration:underline;">{web_link}</a>
                            </p>
                            
                            <!-- Warning -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                                <tr>
                                    <td style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.15);border-radius:12px;padding:16px;">
                                        <p style="color:#f59e0b;font-size:13px;font-weight:600;margin:0 0 4px;">
                                            ⏰ Este enlace expira en 30 minutos
                                        </p>
                                        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;line-height:18px;">
                                            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no será modificada.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding:24px 0;">
                            <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0;">
                                © 2026 Michicondrias — Cuidado integral para tus mascotas
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
