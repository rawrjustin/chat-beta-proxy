import React, { useState, forwardRef } from 'react';
import {
  InputGroup,
  InputRightElement,
  Input,
  Button,
  FormControl,
} from 'src/theme';
import { ViewIcon, ViewOffIcon } from 'src/theme';

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  label?: string;
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ ...props }, ref) => {
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);

    return (
      <FormControl>
        <InputGroup>
          <Input
            pr="4.5rem"
            type={show ? 'text' : 'password'}
            placeholder="Enter password"
            ref={ref}
            {...props}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick} variant="ghost">
              {show ? <ViewOffIcon /> : <ViewIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
