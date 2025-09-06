// app/api/send-feedback-email/route.js
import { Resend } from 'resend';
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { feedback } = await request.json();

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback data is required" },
        { status: 400 }
      );
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    };

    const getStars = (rating) => {
      return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const getTypeEmoji = (type) => {
      switch (type) {
        case "bug":
          return "🐛";
        case "feature":
          return "💡";
        case "complaint":
          return "⚠️";
        default:
          return "💬";
      }
    };

    // Email content
    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Feedback Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-right: 10px; }
            .badge-bug { background-color: #fee2e2; color: #dc2626; }
            .badge-feature { background-color: #dbeafe; color: #2563eb; }
            .badge-complaint { background-color: #fed7aa; color: #ea580c; }
            .badge-general { background-color: #f3f4f6; color: #374151; }
            .rating { color: #fbbf24; font-size: 18px; margin: 10px 0; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background: #f9fafb; padding: 12px; border-radius: 6px; border-left: 3px solid #667eea; }
            .info-label { font-weight: bold; color: #374151; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .info-value { color: #1f2937; }
            .message-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${getTypeEmoji(feedback.type)} New Feedback Received</h1>
            </div>
            
            <div style="margin-bottom: 20px;">
              <span class="badge badge-${
                feedback.type
              }">${feedback.type.toUpperCase()}</span>
              <div class="rating">${getStars(feedback.rating)} (${
      feedback.rating
    }/5)</div>
            </div>
            
            <div class="message-box">
              <h3 style="margin-top: 0; color: #1f2937;">Message:</h3>
              <p style="margin: 0; font-size: 16px; line-height: 1.5;">${
                feedback.message
              }</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Submitted At</div>
                <div class="info-value">${formatDate(feedback.timestamp)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Platform</div>
                <div class="info-value">${feedback.platform || "Unknown"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">App Version</div>
                <div class="info-value">${
                  feedback.appVersion?.version || "Unknown"
                }</div>
              </div>
              <div class="info-item">
                <div class="info-label">Device Info</div>
                <div class="info-value">
                  ${
                    feedback.deviceInfo
                      ? `${feedback.deviceInfo.platform} ${feedback.deviceInfo.version}`
                      : "Unknown"
                  }
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent automatically when new feedback was received in your React Native app.</p>
              <p>Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Feedback System <feedback@yourdomain.com>', // Replace with your verified domain
      to: ['mutharsoomro13@gmail.com'],
      subject: `🔔 New ${feedback.type} feedback received - ${getStars(feedback.rating)}`,
      html: emailHTML,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { message: "Failed to send email", error: error.message },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ 
      message: "Email sent successfully",
      emailId: data?.id 
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Failed to send email", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}