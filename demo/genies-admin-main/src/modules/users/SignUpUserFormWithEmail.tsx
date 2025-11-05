import React, { useRef } from 'react';
import {
  Button,
  Input,
  Box,
  Flex,
  useToast,
  PasswordInput,
  FormLabel,
  Text,
} from 'src/theme';
import { useForm, SubmitHandler } from 'react-hook-form';
import { isValidEmail, isValidPassword } from 'src/lib/auth/validate';
import { AuthV2NonAuthenticatedApi } from 'src/lib/swagger/user';
import { getApiConfig } from 'src/lib/swagger/user/util';

export type Inputs = {
  email: string;
  password: string;
};

const SignUpUserFormWithEmail = () => {
  // Rename the hook import to avoid clash

  const toast = useToast();
  const elementRef = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isValid, isSubmitting },
  } = useForm<Inputs>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    const api = new AuthV2NonAuthenticatedApi(getApiConfig());

    try {
      await api.signUpV2({
        email,
        password,
      });
      toast({
        title: 'Success.',
        description: `Signed up new user ${email} successfully!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      reset();
    } catch (error: any) {
      const errorData = await error.json();
      toast({
        title: 'Error.',
        description: errorData.error || `Failed to sign up`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex px={6} alignItems="flex-start">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex
          ref={elementRef}
          id="emailForm"
          gap={1}
          alignItems="flex-start"
          flexDir="column"
          width="25rem"
        >
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            marginBottom={3}
            autoComplete="off"
            placeholder="Email"
            {...register('email', {
              required: true,
              validate: (value) => isValidEmail(value),
            })}
          />

          <FormLabel>Password</FormLabel>
          <PasswordInput
            autoComplete="off"
            marginBottom={3}
            placeholder="Password"
            {...register('password', {
              required: true,
              validate: (value) => {
                const { valid } = isValidPassword(value);
                return valid;
              },
            })}
          />
          <Text fontSize="x-small" marginBottom={2}>
            1 uppercase letter, 1 lowercase letter, 1 number, 1 special
            character, 10 charachers long
          </Text>
          <Button
            isDisabled={!isValid || isSubmitting}
            variant="solid"
            type="submit"
            isLoading={isSubmitting}
          >
            Add User
          </Button>
        </Flex>

        {errors?.email?.message && (
          <Box mt={2} color="#EB5757">
            {errors.email.message}
          </Box>
        )}
      </form>
    </Flex>
  );
};

export default SignUpUserFormWithEmail;
