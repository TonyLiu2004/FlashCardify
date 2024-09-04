import { NextResponse } from 'next/server';
import emailjs from '@emailjs/browser';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !message || !email) {
      return NextResponse.json({ error: 'Missing name, email, or message' }, { status: 400 });
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID as string;
    const templateId = process.env.EMAILJS_TEMPLATE_ID as string;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY as string;

    if (!serviceId || !templateId || !publicKey) {
      return NextResponse.json({ error: 'Missing email configuration' }, { status: 500 });
    }

    const templateParams = {
      name,
      email,
      message,
    };

    const emailResponse = await emailjs.send(serviceId, templateId, templateParams, publicKey);

    if (emailResponse.status >= 200 && emailResponse.status < 300) {
      return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (err) {
    console.error('Error processing the request:', err);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
