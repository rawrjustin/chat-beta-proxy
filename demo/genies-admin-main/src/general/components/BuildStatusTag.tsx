import { IconType } from 'react-icons';
import { Badge, Center, Icon, Text } from 'src/theme';

export type StatusTagConfig = {
  bg: string;
  color?: string;
  icon?: IconType;
  label: string;
  accessKey: string;
};

export const getStatusTagByConfig = (
  status: string,
  config: Array<StatusTagConfig>,
) => {
  return config.find((v) => v.accessKey === status) || null;
};

export const BuildStatusTag = ({ config }: { config: StatusTagConfig }) => {
  return (
    <Badge background={config.bg} borderRadius="3xl" px={3} py={1} zIndex={2}>
      <Center>
        {config.icon && (
          <Icon
            mr="1"
            boxSize={5}
            color={config.color || 'black'}
            as={config.icon}
          />
        )}
        <Text color={config.color || 'black'} display="inline">
          {config.label}
        </Text>
      </Center>
    </Badge>
  );
};
