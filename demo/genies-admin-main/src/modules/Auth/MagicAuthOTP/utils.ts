const getMaskPhoneNumber = (phoneNumber: string) => {
  const lastDigits = phoneNumber.match(/\d+$/)[0];
  const totalDigits = phoneNumber.match(/\d/g).length;
  return '*'.repeat(totalDigits - lastDigits.length).concat(lastDigits);
};

const getMaskEmail = (email: string) => {
  const [username, domain] = email.split('@');

  if (!username || !domain) {
    return email;
  }

  if (username.length <= 2) {
    return `*${username.slice(-1)}@${domain}`;
  }

  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const maskedLength = username.length - 2;

  return `${firstChar}${'*'.repeat(maskedLength)}${lastChar}@${domain}`;
};

const OTP_SUBHEADER = 'Enter the code that was sent to\nyour **address**';
export const getSubHeader = (phoneNumber, email) =>
  OTP_SUBHEADER.replace(
    '**address**',
    email
      ? `e-mail ${getMaskEmail(email)}`
      : `mobile number ${getMaskPhoneNumber(phoneNumber)}`,
  );

export const getResendButtonText = (attempts, isEmailAuth) => {
  const defaultText = 'Resend code.';

  if (isEmailAuth) {
    return defaultText;
  }

  switch (attempts) {
    case 0:
    case 1:
      return defaultText;
    case 2:
      return 'Call me instead.';
    case 3:
      return 'Trouble getting your code?';
    default:
      return defaultText;
  }
};

export const getResendText = (attempts, isEmailAuth) => {
  const defaultText = "Didn't receive a code? ";
  if (isEmailAuth) return defaultText;

  switch (attempts) {
    case 0:
    case 1:
    case 2:
      return defaultText;
    default:
      return '';
  }
};
