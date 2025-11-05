import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  PinInput,
  PinInputField,
  HStack,
  Button,
  Center,
  Text,
  VStack,
} from 'src/theme';
import { useRouter } from 'next/router';
import { home } from 'src/modules/routes';
import { User } from 'src/pages/auth';
import { useMagicAuth } from 'src/lib/auth';

const OTP_LENGTH = 6;
const RESEND_TIMER = 10;

const MagicAuthOTPForm = ({
  user,
  setUser,
}: {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}) => {
  const router = useRouter();
  const [otpValue, setOtpValue] = useState('');
  const [isRunning, setIsRunning] = React.useState(true);
  const [numberOfMistakes, setNumberOfMistakes] = React.useState(0);
  const [numberOfRetries, setNumberOfRetries] = React.useState(0);
  const [seconds, setSeconds] = React.useState(RESEND_TIMER);
  const { verifyMagicAuth, resendMagicAuth } = useMagicAuth();

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
  });

  const resetTimer = () => {
    setSeconds(RESEND_TIMER);
    setIsRunning(true);
  };

  React.useEffect(() => {
    let interval = null;
    if (seconds === 0) {
      clearInterval(interval);
      setIsRunning(false);
    } else {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [seconds]);

  // On resend handler
  const onResend = async () => {
    if (numberOfRetries === 3) {
      setError('otp1', {
        message: 'Too many retries, please try it later',
      });
      return;
    }
    if (!user.email) {
      setError('otp1', { message: 'Email not found' });
      return;
    }
    try {
      resetTimer();
      await resendMagicAuth({ email: user.email });
      // Magic auth resend doesn't return session tokens, just success
    } catch (e: any) {
      setError('otp1', { message: e?.message || 'Failed to resend code' });
    } finally {
      setNumberOfRetries(numberOfRetries + 1);
    }
  };

  // Check if all OTP fields are filled
  const all = otpValue?.length === OTP_LENGTH;

  // On submit handler
  const onSubmit = async () => {
    if (otpValue.length !== 6) {
      return;
    }
    if (!user || !user.email) return;
    clearErrors();
    try {
      const resp = await verifyMagicAuth({
        email: user.email,
        code: otpValue,
      });
      if (resp && resp.userId) {
        router.push(home());
      } else {
        setError('otp1', { message: 'Please enter a valid verification code' });
      }
    } catch (e: any) {
      const mistakes = numberOfMistakes + 1;
      setNumberOfMistakes(mistakes);
      setError('otp1', { message: 'Please enter a valid verification code' });
      if (mistakes === 5) {
        setError('otp1', {
          message:
            'Invalid Code. One more failed attempt will result in your account being locked for 10 minutes.',
        });
      }
    }
  };

  const memoizedOnChangeHandler = React.useMemo(() => {
    let queue: string[] = [];
    let timeout: any;

    return (value: string) => {
      clearTimeout(timeout);
      queue.push(value);
      let mergedOTPValue = '';
      setOtpValue(value);

      timeout = setTimeout(() => {
        const didReceiveOtp =
          queue.length === OTP_LENGTH &&
          queue.every((a) => {
            return a.length !== OTP_LENGTH;
          });
        if (didReceiveOtp) {
          queue.forEach((val: string) => {
            mergedOTPValue = mergedOTPValue.concat(val.charAt(val.length - 1));
          });
        }

        if (mergedOTPValue) {
          setOtpValue(mergedOTPValue);
        }
        queue = [];
      }, 50);
    };
  }, [setOtpValue]);

  return (
    <VStack>
      <Text
        fontSize="3xl"
        textAlign="center"
        mb={4}
        data-testid="verification-header"
      >
        Enter Verification Code
      </Text>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Center display="flex" flexDirection="column">
          <HStack>
            <PinInput
              size="lg"
              otp
              autoFocus
              manageFocus
              onChange={memoizedOnChangeHandler}
              value={otpValue}
            >
              <PinInputField data-testid="pin-form-1" {...register('otp1')} />
              <PinInputField data-testid="pin-form-2" {...register('otp2')} />
              <PinInputField data-testid="pin-form-3" {...register('otp3')} />
              <PinInputField data-testid="pin-form-4" {...register('otp4')} />
              <PinInputField data-testid="pin-form-5" {...register('otp5')} />
              <PinInputField data-testid="pin-form-6" {...register('otp6')} />
            </PinInput>
          </HStack>
          {errors?.otp1?.message && (
            <Text
              textAlign="center"
              mt={2}
              color="#EB5757"
              data-testid="auth-error"
            >
              {errors.otp1.message as unknown as string}
            </Text>
          )}
        </Center>
        <Button
          data-testid="verify-account-button"
          mt={5}
          width="full"
          disabled={isSubmitting || !all}
          variant="solid"
          type="submit"
          isLoading={isSubmitting}
        >
          verify account
        </Button>
      </form>
      <Center mt={5}>
        <Text
          data-testid="resend-button"
          as="button"
          variant="unstyled"
          disabled={isSubmitting}
          onClick={isRunning ? () => {} : onResend}
          sx={
            isRunning
              ? {
                  color: 'grey.mid',
                  cursor: 'not-allowed',
                }
              : {
                  cursor: 'pointer',
                }
          }
        >
          {numberOfRetries >= 3 ? 'Try a different email' : 'Resend code'}
          {isRunning ? ` (${seconds}s)` : ''}
        </Text>
      </Center>
    </VStack>
  );
};

export default MagicAuthOTPForm;
