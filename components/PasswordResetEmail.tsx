// components/emails/PasswordResetEmail.tsx
import * as React from 'react';

interface PasswordResetEmailProps {
  resetLink: string;
}

export const PasswordResetEmail: React.FC<Readonly<PasswordResetEmailProps>> = ({ resetLink }) => (
  <div>
    <h1>Reset Your Password</h1>
    <p>You have requested a password reset. Click the link below to set a new password:</p>
    <a href={resetLink}>Reset Password</a>
    <p>If you didn not request this, you can safely ignore this email.</p>
  </div>
);
