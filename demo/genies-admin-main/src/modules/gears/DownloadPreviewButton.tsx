import { Tooltip, Button } from 'src/theme';
import { LuDownload } from 'react-icons/lu';
import { useState } from 'react';

const DISABLE_DOWNLOAD_TOOLTIP =
  'Dowload is available once your\nwearable has been approved';

const DownloadPreviewButton = ({
  videoUrl = null,
  canDownload = false,
}: {
  videoUrl: string;
  canDownload: boolean;
}) => {
  const [isHover, setIsHover] = useState<boolean>(false);

  const downloadVideo = async () => {
    if (!canDownload || !videoUrl) return;

    const link = document.createElement('a');
    link.href = videoUrl;
    link.click();
  };

  return (
    <Tooltip
      isOpen={!canDownload && isHover}
      label={DISABLE_DOWNLOAD_TOOLTIP}
      placement="top"
      hasArrow
      bg="#F9FAFB"
      py="8px"
      px="10px"
      borderRadius="md"
      color="#27272A"
      textAlign="center"
      whiteSpace="pre-line"
      aria-label={DISABLE_DOWNLOAD_TOOLTIP}
    >
      <Button
        leftIcon={<LuDownload />}
        variant="solidV3"
        border="none"
        borderRadius="full"
        size="md"
        height="30px"
        bgColor={canDownload ? '#F9FAFB' : 'grey.6'}
        color={canDownload ? '#27272A' : '#A1A1AA'}
        fontFamily="Roobert Regular"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={downloadVideo}
      >
        Download
      </Button>
    </Tooltip>
  );
};

export default DownloadPreviewButton;
