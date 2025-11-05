import React from 'react';
import { Button, Input, InputGroup, Box, Center, Text, Flex } from 'src/theme';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useConfig, DynamicConfig } from 'src/lib/statsig';
import { useMagicAuth, clearTokens } from 'src/lib/auth';
import { User } from 'src/pages/auth';

const NOT_ALLOWED_MESSAGE =
  "We couldn't find an account with this email. You might not have switched to email login or have not been granted access yet. To migrate to email login, visit Genies Hub. To get access, contact the dev team";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export type EmailInputs = {
  email: string;
};

export const EmailForm = ({
  setUser,
}: {
  setUser: React.Dispatch<React.SetStateAction<User>>;
}) => {
  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EmailInputs>({
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });
  const { startMagicAuth } = useMagicAuth();
  const elementRef = React.useRef<HTMLDivElement>(null);
  const adminWhiteListConfig = useConfig(DynamicConfig.ADMIN_WHITELIST);

  const onSubmit: SubmitHandler<EmailInputs> = async ({ email }) => {
    try {
      const whitelist = adminWhiteListConfig?.config?.value?.whitelist ?? [];
      const isAllowed =
        whitelist && Array.isArray(whitelist) && whitelist.includes(email);
      if (!isAllowed) {
        throw new Error(NOT_ALLOWED_MESSAGE);
      }
      clearTokens();
      const result = await startMagicAuth({ email });

      if (!result.userExists) {
        throw new Error('Please sign up first');
      }

      // For magic auth, we don't need session tokens like the old auth
      // We just need to track the email for the OTP verification
      setUser({
        challengeName: 'magic-auth', // Use a consistent challenge name
        sessionToken: 'magic-auth-session', // Placeholder since magic auth doesn't use session tokens
        email: email,
      });
    } catch (e: any) {
      const errorMessage = e?.message || 'An unexpected error occurred';

      if (errorMessage.includes('sign up')) {
        setError('email', { message: 'Please sign up first' });
      } else if (errorMessage.includes('user not found')) {
        setError('email', { message: 'Please sign up first' });
      } else {
        setError('email', { message: errorMessage });
      }
    }
  };

  return (
    <Flex direction="column" mt={10} width="305px">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Text
          fontSize="3xl"
          textAlign="center"
          mb={4}
          data-testid="email-header"
        >
          Enter Email
        </Text>
        <Center
          ref={elementRef}
          id="emailForm"
          display="flex"
          flexDirection="column"
        >
          <InputGroup width="full">
            <Input
              data-testid="email-form-input"
              type="text"
              autoComplete="off"
              placeholder="Email"
              {...register('email', {
                required: true,
                validate: (value) =>
                  isValidEmail(value) || 'Please enter a valid email address',
              })}
            />
          </InputGroup>
        </Center>
        <Button
          data-testid="submit-button"
          mt={4}
          width="full"
          disabled={!isValid || isSubmitting}
          variant="solid"
          type="submit"
          isLoading={isSubmitting}
        >
          send code
        </Button>
        <Box>
          {errors.email && (
            <Text
              textAlign="center"
              mt={2}
              color="#EB5757"
              wordBreak="break-word"
              whiteSpace="normal"
            >
              {errors.email.message}
            </Text>
          )}
        </Box>
      </form>
    </Flex>
  );
};
