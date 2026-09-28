import resend
from typing import Dict, List
from app.config import settings

class EmailService:
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        if self.api_key:
            resend.api_key = self.api_key
        self.from_email = settings.FROM_EMAIL

    def build_html_template(self, meeting_title: str, summary: Dict) -> str:
        tldr_bullets = "".join([f"<li style='margin-bottom: 6px;'>{bullet}</li>" for bullet in summary.get("tldr", [])])
        
        hint_cards = "".join([
            f"""
            <div style='background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 12px; border-radius: 4px;'>
                <strong style='color: #1e293b; font-size: 14px;'>💡 {item.get('topic')}</strong>
                <p style='margin: 4px 0 0 0; color: #475569; font-size: 13px;'>{item.get('hint')}</p>
            </div>
            """
            for item in summary.get("hint_notes", [])
        ])

        action_rows = "".join([
            f"""
            <tr style='border-bottom: 1px solid #e2e8f0;'>
                <td style='padding: 8px 12px; font-size: 13px; color: #1e293b;'>{action.get('task')}</td>
                <td style='padding: 8px 12px; font-size: 13px; color: #64748b;'>{action.get('owner')}</td>
                <td style='padding: 8px 12px; font-size: 13px; color: #ef4444; font-weight: 500;'>{action.get('deadline')}</td>
            </tr>
            """
            for action in summary.get("action_items", [])
        ])

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>MeetMee Summary — {meeting_title}</title>
        </head>
        <body style='font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; padding: 24px;'>
            <div style='max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>
                <div style='background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; color: #ffffff;'>
                    <h1 style='margin: 0; font-size: 20px;'>🎙️ MeetMee Meeting Intelligence</h1>
                    <p style='margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;'>Post-Meeting Hint-Style Notes: {meeting_title}</p>
                </div>
                <div style='padding: 24px;'>
                    <h3 style='color: #0f172a; margin-top: 0;'>🎯 60-Second TL;DR</h3>
                    <ul style='color: #334155; font-size: 14px; line-height: 1.5; padding-left: 20px;'>
                        {tldr_bullets}
                    </ul>

                    <h3 style='color: #0f172a; margin-top: 24px;'>💡 Concept Anchors & Hints</h3>
                    {hint_cards}

                    <h3 style='color: #0f172a; margin-top: 24px;'>📋 Action Items & Ownership</h3>
                    <table style='width: 100%; border-collapse: collapse; text-align: left;'>
                        <thead>
                            <tr style='background: #f8fafc; border-bottom: 2px solid #cbd5e1;'>
                                <th style='padding: 8px 12px; font-size: 12px; color: #64748b;'>Task</th>
                                <th style='padding: 8px 12px; font-size: 12px; color: #64748b;'>Owner</th>
                                <th style='padding: 8px 12px; font-size: 12px; color: #64748b;'>Deadline</th>
                            </tr>
                        </thead>
                        <tbody>
                            {action_rows}
                        </tbody>
                    </table>

                    <div style='margin-top: 32px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px;'>
                        <p style='color: #94a3b8; font-size: 12px;'>Sent automatically by MeetMee AI Assistant.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """

    async def send_summary_email(self, to_email: str, meeting_title: str, summary: Dict) -> bool:
        if not self.api_key:
            print(f"[EmailService Mock] Automated email dispatched to {to_email} for '{meeting_title}'")
            return True

        html_content = self.build_html_template(meeting_title, summary)
        try:
            resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": f"📝 MeetMee Hint-Style Notes: {meeting_title}",
                "html": html_content
            })
            return True
        except Exception as e:
            print(f"[EmailService Error] Failed to send email: {e}")
            return False

email_service = EmailService()
