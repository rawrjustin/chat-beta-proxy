import React from 'react';
import { Button, useClipboard, useToast } from 'src/theme';
import { HiOutlineLink } from 'react-icons/hi';

export const CopyLinkAction = () => {
  const toast = useToast();

  const [link, setLink] = React.useState<string>('');
  const { onCopy } = useClipboard(link);

  React.useEffect(() => {
    setLink(window.location.href);
  }, []);

  function handleCopyUrl() {
    onCopy();
    toast({
      title: 'Link Copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }

  return (
    <Button
      size="lg"
      variant="ghost"
      color="users.purple"
      fontWeight={400}
      leftIcon={<HiOutlineLink />}
      onClick={handleCopyUrl}
    >
      Copy Link
    </Button>
  );
};
