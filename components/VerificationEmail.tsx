// components/emails/VerificationEmail.tsx
import * as React from 'react';

interface VerificationEmailProps {
  verificationCode: string;
}
// TODO: BUG email is not being sent
export const VerificationEmail: React.FC<Readonly<VerificationEmailProps>> = ({ verificationCode }) => (
  <div>
    <h1>Welcome to eduX!</h1>
    <p>Thanks for signing up. Please use the following code to verify your email address:</p>
    <h2>{verificationCode}</h2>
    <p>This code will expire in 10 minutes.</p>
  </div>
);
