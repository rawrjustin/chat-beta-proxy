import { useState } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { Button } from 'src/theme';

const ResetTraitProfileAction = ({
  disabled,
  onResetProfile,
}: {
  disabled: boolean;
  onResetProfile: () => Promise<void>;
}) => {
  const [isReseting, setIsReseting] = useState<boolean>();

  const onClickReset = async () => {
    setIsReseting(true);
    await onResetProfile();
    setIsReseting(false);
  };

  return (
    <Button
      isDisabled={disabled}
      size="lg"
      variant="ghost"
      color="users.purple"
      fontWeight={400}
      leftIcon={<HiOutlineRefresh />}
      onClick={onClickReset}
      isLoading={isReseting}
    >
      Reset Trait Profile
    </Button>
  );
};

export default ResetTraitProfileAction;
