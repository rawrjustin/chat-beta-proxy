import { useEffect, useState } from 'react';
import {
  Flex,
  VStack,
  Box,
  HStack,
  Circle,
  Image,
  Center,
  Skeleton,
  Button,
} from 'src/theme';
import DownloadPreviewButton from './DownloadPreviewButton';
import { LuExpand } from 'react-icons/lu';
import { ToggleButtonGroup } from './ToggleButton';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { RenderingUrl } from 'src/lib/swagger/devkit';

enum GeniePreviewOptions {
  // wearbale preview options
  WEARABLE_MALE = 'male',
  WEARABLE_FEMALE = 'female',

  // avatar preview options
  AVATAR_FULL_BODY = 'body',
  AVATAR_FACE = 'face',
  AVATAR_CLOTHED = 'clothed',
}

const geniePreviewOptionsMap: { [key: string]: GeniePreviewOptions } = {
  male: GeniePreviewOptions.WEARABLE_MALE,
  female: GeniePreviewOptions.WEARABLE_FEMALE,
  body: GeniePreviewOptions.AVATAR_FULL_BODY,
  face: GeniePreviewOptions.AVATAR_FACE,
  clothed: GeniePreviewOptions.AVATAR_CLOTHED,
};

enum GeniePreviewRatio {
  SQUARE = '1080x1080',
  NINE_BY_SIXTEEN = '1080x1920',
}

const RatioButtons = ['1:1', '9:16'];

const getRenderingData = (
  renderingUrl: Array<RenderingUrl>,
  ratio: GeniePreviewRatio,
  option: GeniePreviewOptions,
): RenderingUrl => {
  return renderingUrl.find(({ previewURL }) => {
    // filename format: {GeniePreviewOptions}_{ratio}_{creation_name}.{extension}
    const filename = previewURL
      .substring(previewURL.lastIndexOf('/') + 1)
      .split('_');
    return filename[0] === option.toString() && filename[1].startsWith(ratio);
  });
};

const GenieThumbnail = ({
  value,
  selectedValue,
  previewURL,
  onSelectChange,
}: {
  value: string;
  selectedValue: string;
  previewURL: string;
  onSelectChange: (newValue: string) => void;
}) => {
  return (
    <Box
      cursor="pointer"
      bgColor="grey.6"
      w="96px"
      h="96px"
      borderRadius="lg"
      overflow="hidden"
      border={selectedValue === value ? '1px solid #FF9DEF' : 'none'}
      onClick={() => onSelectChange(value)}
    >
      <Image
        alt=""
        w="100%"
        h="100%"
        objectFit="fill"
        src={previewURL}
        onContextMenu={(e) => {
          // disable right-click menu
          e.preventDefault();
        }}
      />
    </Box>
  );
};

const PreviewGenieWindow = ({
  canDownload,
  isAvatarPreview,
  renderingUrl,
}: {
  canDownload: boolean;
  isAvatarPreview: boolean;
  renderingUrl: Array<RenderingUrl>;
}) => {
  const OptionButtons = isAvatarPreview
    ? [
        GeniePreviewOptions.AVATAR_FULL_BODY,
        GeniePreviewOptions.AVATAR_FACE,
        GeniePreviewOptions.AVATAR_CLOTHED,
      ]
    : [GeniePreviewOptions.WEARABLE_MALE, GeniePreviewOptions.WEARABLE_FEMALE];
  const fullScreenHandle = useFullScreenHandle();
  const [curVideo, setCurVideo] = useState<string | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<GeniePreviewRatio>(
    GeniePreviewRatio.SQUARE,
  );
  const [selectedOption, setSelectedOption] = useState<GeniePreviewOptions>(
    OptionButtons[0],
  );

  useEffect(() => {
    const url = getRenderingData(
      renderingUrl,
      selectedRatio,
      selectedOption,
    ).videoURL;
    setCurVideo(url);
  }, [renderingUrl, selectedOption, selectedRatio]);

  const handleRatioChange = (selectedValue) => {
    let newRatio = selectedValue?.[0];
    let ratio = GeniePreviewRatio.SQUARE;
    switch (newRatio) {
      case '9:16':
        ratio = GeniePreviewRatio.NINE_BY_SIXTEEN;
        break;
      case '1:1':
      default:
        ratio = GeniePreviewRatio.SQUARE;
        break;
    }
    setSelectedRatio(ratio);
  };

  return (
    <Flex
      flexDir="column"
      w="100%"
      justifyContent="space-between"
      gap={4}
      flexShrink={0}
    >
      {/* videos and thumbnails  */}
      <Flex w="fit-content" h="480px" maxH="480px" gap={4}>
        <Skeleton isLoaded={curVideo?.length > 0}>
          <Center
            w={fullScreenHandle.active ? '100%' : '480px'}
            h="fit-content"
          >
            <FullScreen handle={fullScreenHandle}>
              <video
                autoPlay
                preload="auto"
                muted={true}
                src={curVideo}
                playsInline={true}
                loop={true}
                controls={false}
                onContextMenu={(e) => {
                  // disable right-click menu
                  e.preventDefault();
                }}
                style={{
                  height: fullScreenHandle.active ? '100%' : '480px',
                  width: 'auto',
                  borderRadius: '8px',
                  margin: 'auto',
                }}
              />
            </FullScreen>
          </Center>
        </Skeleton>
        <VStack spacing={3}>
          {OptionButtons.map((optionVal) => {
            const url = getRenderingData(
              renderingUrl,
              GeniePreviewRatio.SQUARE,
              optionVal,
            ).previewURL;
            return (
              <GenieThumbnail
                key={optionVal}
                value={optionVal}
                selectedValue={selectedOption}
                previewURL={url}
                onSelectChange={(newVal: string) =>
                  setSelectedOption(geniePreviewOptionsMap[newVal])
                }
              />
            );
          })}
        </VStack>
      </Flex>
      {/* bottom button controls  */}
      <HStack w="480px" justifyContent="center" spacing={4}>
        {!isAvatarPreview && (
          <ToggleButtonGroup
            allowNoSeceltion={false}
            onChange={handleRatioChange}
            variant="solidV3"
            borderRadius="full"
            size="md"
            height="30px"
            bgColor="grey.6"
            fontFamily="Roobert Regular"
            color="white"
          >
            {RatioButtons.map((ratio) => (
              <Button
                key={ratio}
                height="inherit"
                border="none"
                borderRadius="full!important"
                _active={{
                  bg: '#F9FAFB',
                  color: '#27272A',
                }}
                value={ratio}
              >
                {ratio}
              </Button>
            ))}
          </ToggleButtonGroup>
        )}
        <DownloadPreviewButton canDownload={canDownload} videoUrl={curVideo} />
        <Circle
          size="30px"
          bg="#F9FAFB"
          color="#27272A"
          cursor="pointer"
          onClick={fullScreenHandle.enter}
        >
          <LuExpand />
        </Circle>
      </HStack>
    </Flex>
  );
};

export default PreviewGenieWindow;
