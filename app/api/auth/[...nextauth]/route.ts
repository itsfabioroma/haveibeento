import { GET, POST } from '@/lib/auth';

export { GET, POST };

import EmailProvider from 'next-auth/providers/nodemailer';

const authOptions = {
    providers: [
        EmailProvider({
            server: {
                host: 'smtp.resend.com',
                port: 465,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
        // ... other providers
    ],
    // ... other options
};
