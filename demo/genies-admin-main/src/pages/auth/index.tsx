import React, { useState } from 'react';
import MagicAuthOTPForm from 'src/modules/Auth/MagicAuthOTP/MagicAuthOTPForm';
import { EmailForm } from 'src/modules/Auth/EmailForm';
import { Box, Center } from 'src/theme';

export interface User {
  challengeName: string;
  sessionToken: string;
  phoneNumber?: string;
  email?: string;
}

export default function AuthPage() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <Box w="full" mt={20}>
      <Center>
        {user ? (
          <MagicAuthOTPForm user={user} setUser={setUser} />
        ) : (
          <EmailForm setUser={setUser} />
        )}
      </Center>
    </Box>
  );
}
