import Mailjet from 'node-mailjet';

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  throw new Error("MAILJET_API_KEY and MAILJET_SECRET_KEY environment variables must be set");
}

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

interface EmailParams {
  to: string;
  subject: string;
  textPart?: string;
  htmlPart?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: "hollytransport04@gmail.com",
              Name: "Holly Transportation"
            },
            To: [
              {
                Email: params.to,
                Name: "Holly Transportation"
              }
            ],
            Subject: params.subject,
            TextPart: params.textPart,
            HTMLPart: params.htmlPart
          }
        ]
      });

    const result = await request;
    console.log('Email sent successfully:', result.body);
    return true;
  } catch (error) {
    console.error('Mailjet email error:', error);
    return false;
  }
}

export async function sendContactFormNotification(contactData: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  const emailSubject = `New Contact Form Submission: ${contactData.subject}`;
  
  const textContent = `
New contact form submission from Holly Transportation website:

Name: ${contactData.firstName} ${contactData.lastName}
Email: ${contactData.email}
Phone: ${contactData.phone || 'Not provided'}
Subject: ${contactData.subject}

Message:
${contactData.message}

Submitted at: ${new Date().toLocaleString()}
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">New Contact Form Submission</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
        <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h3 style="margin-top: 0;">Message:</h3>
        <p style="line-height: 1.6;">${contactData.message.replace(/\n/g, '<br>')}</p>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
        Submitted at: ${new Date().toLocaleString()}
      </p>
    </div>
  `;

  return await sendEmail({
    to: "hollytransport04@gmail.com",
    subject: emailSubject,
    textPart: textContent,
    htmlPart: htmlContent
  });
}