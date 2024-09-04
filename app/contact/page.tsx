'use client';
import React, { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';

const ContactPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<string | null>(null);

    useEffect(() => {
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string;
        if (publicKey) {
            emailjs.init(publicKey);
        } else {
            console.error("EmailJS Public Key is missing");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResponseMessage(null);

        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string;

        const templateParams = {
            name,
            email,
            message,
        };

        try {
            const emailResponse = await emailjs.send(serviceId, templateId, templateParams);
            
            if (emailResponse.status === 200) {
                setResponseMessage('Your message has been sent successfully!');
                setName('');
                setEmail('');
                setMessage('');
            } else {
                setResponseMessage('Failed to send the message. Please try again later.');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setResponseMessage('An error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto my-20 p-8 bg-black shadow-md rounded-lg">
            <h1 className="text-2xl font-semibold text-center mb-6">Help us help you better!</h1>
            <p className="text-center text-white">Have ideas to make FlashCardify even better? Share your thoughts with us below, and we'll get back to you shortly!</p>
            <form onSubmit={handleSubmit} className="space-y-4 my-10">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white">Message:</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {isLoading ? 'Sending...' : 'Send'}
                </button>
            </form>
            {responseMessage && <p className="mt-4 text-center text-white">{responseMessage}</p>}
        </div>
    );
};

export default ContactPage;
