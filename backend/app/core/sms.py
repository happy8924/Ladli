import os
import requests
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv


def send_sms_otp(phone_number: str, otp_code: str) -> dict:
    """
    Sends an actual SMS OTP using configured SMS Gateways (Fast2SMS for India, or Twilio internationally).
    If no API keys are provided in environment variables, returns status with dev simulation info.
    """
    load_dotenv(override=True)
    clean_phone = phone_number.replace("+", "").replace("-", "").replace(" ", "").strip()
    fast2sms_key = os.getenv("FAST2SMS_API_KEY", "").strip()

    # 1. Try Fast2SMS (popular in India)
    if fast2sms_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = {
                "variables_values": otp_code,
                "route": "otp",
                "numbers": clean_phone[-10:]
            }
            headers = {
                "authorization": fast2sms_key,
                "Content-Type": "application/x-www-form-urlencoded"
            }
            res = requests.post(url, data=payload, headers=headers, timeout=6)
            res_data = res.json()
            print(f"📱 [Fast2SMS Gateway Response]: {res_data}")
            if res_data.get("return"):
                return {"sent": True, "provider": "Fast2SMS", "message": "SMS delivered to mobile handset"}
            else:
                print(f"⚠️ [Fast2SMS Notice]: {res_data.get('message')}")
        except Exception as e:
            print(f"[SMS ERROR] Fast2SMS failure: {e}")

    # 2. Try Twilio SMS
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            target_phone = clean_phone if clean_phone.startswith("+") else f"+91{clean_phone[-10:]}"
            msg = client.messages.create(
                body=f"Your Ladli Boutique verification OTP code is: {otp_code}. Valid for 10 minutes.",
                from_=TWILIO_PHONE_NUMBER,
                to=target_phone
            )
            return {"sent": True, "provider": "Twilio", "message": f"Twilio SMS sent: SID {msg.sid}"}
        except Exception as e:
            print(f"[SMS ERROR] Twilio failure: {e}")

    # 3. Dev Simulation Mode (No SMS API Key configured)
    print(f"📱 [DEV SMS GATEWAY] Real SMS Gateway API Key not set in .env. Dispatched OTP '{otp_code}' to +91-{clean_phone[-10:]}")
    return {
        "sent": False,
        "provider": "simulation",
        "notice": f"Real SMS delivery requires FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID in .env. For testing: OTP is {otp_code}"
    }


def send_email_otp(to_email: str, otp_code: str) -> dict:
    """
    Sends an actual Email OTP using SMTP server (e.g. Gmail SMTP).
    """
    if SMTP_USER and SMTP_PASS:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"Ladli Boutique <{SMTP_USER}>"
            msg['To'] = to_email
            msg['Subject'] = f"{otp_code} is your Ladli Verification Code"

            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #EADBC8; border-radius: 12px;">
              <h2 style="color: #800000; font-family: serif;">LADLI BOUTIQUE</h2>
              <p style="color: #333;">Use the verification code below to log in or reset your password:</p>
              <div style="background-color: #FAF7F2; padding: 15px; text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #800000;">
                {otp_code}
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
            </div>
            """
            msg.attach(MIMEText(html_body, 'html'))

            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
            server.quit()
            return {"sent": True, "provider": "SMTP", "message": "Email sent to inbox"}
        except Exception as e:
            print(f"[EMAIL ERROR] SMTP failure: {e}")

    # Dev simulation mode
    print(f"📧 [DEV EMAIL GATEWAY] SMTP_USER/PASS not set in .env. Dispatched OTP '{otp_code}' to {to_email}")
    return {
        "sent": False,
        "provider": "simulation",
        "notice": f"Real Email delivery requires SMTP_USER and SMTP_PASS in .env. For testing: OTP is {otp_code}"
    }
