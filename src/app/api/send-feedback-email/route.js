// app/api/send-feedback-email/route.js
import { NextResponse } from "next/server";

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
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString("en-US", {
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
          return "🐛 Bug Report";
        case "feature":
          return "💡 Feature Request";
        case "complaint":
          return "⚠️ Complaint";
        default:
          return "💬 General Feedback";
      }
    };

    // Prepare template parameters for EmailJS
    const templateParams = {
      feedback_type: getTypeEmoji(feedback.type),
      rating: getStars(feedback.rating),
      message: feedback.message,
      submission_date: formatDate(feedback.timestamp),
      submission_time: formatTime(feedback.timestamp),
      firestore_id: feedback.id || 'N/A',
      platform: feedback.platform || 'Unknown',
      app_version: feedback.appVersion?.version || 'Unknown',
      device_info: feedback.deviceInfo 
        ? `${feedback.deviceInfo.platform} ${feedback.deviceInfo.version}`
        : 'Unknown'
    };

    // EmailJS configuration
    const emailjsConfig = {
      service_id: 'service_4lpts7s',
      template_id: 'template_t4hmovn', // Replace with your actual template ID from the screenshot
      public_key: 'c5Ei2FkzB2ky27bBi',
      template_params: templateParams
    };

    // Send email using EmailJS REST API
    const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailjsConfig),
    });

    if (!emailjsResponse.ok) {
      const errorText = await emailjsResponse.text();
      console.error('EmailJS Error:', errorText);
      throw new Error(`EmailJS failed with status: ${emailjsResponse.status}`);
    }

    const result = await emailjsResponse.text();
    console.log('EmailJS Success:', result);

    return NextResponse.json({ 
      message: "Email sent successfully via EmailJS",
      emailjs_response: result 
    });

  } catch (error) {
    console.error("Error sending email via EmailJS:", error);
    return NextResponse.json(
      { 
        message: "Failed to send email", 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}