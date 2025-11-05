import { VStack, Text } from 'src/theme';

const MaxCountProgressCard = ({
  traitId,
  name,
  currentCount,
  maxCount,
  expiresAt,
  source,
  onCooldown,
}: {
  traitId: string;
  name: string;
  currentCount: number;
  maxCount: number;
  expiresAt: number;
  source: string;
  onCooldown: boolean;
}) => {
  return (
    <VStack borderRadius="md" bgColor="whiteAlpha.200" p={3} align="flex-start">
      <Text textStyle="h4">{name}</Text>
      <Text>
        <Text fontWeight="bold" as="span">
          Current Count
        </Text>{' '}
        {currentCount}
      </Text>
      <Text>
        <Text fontWeight="bold" as="span">
          Max Count:
        </Text>{' '}
        {maxCount}
      </Text>
      <Text>
        <Text fontWeight="bold" as="span">
          Expires At:
        </Text>{' '}
        {new Date(Date.now() - expiresAt).toString()}
      </Text>
      <Text>
        <Text fontWeight="bold" as="span">
          Source:
        </Text>{' '}
        {source}
      </Text>
      <Text>
        <Text fontWeight="bold" as="span">
          On Cooldown:
        </Text>{' '}
        {onCooldown ? 'Yes' : 'No'}
      </Text>
    </VStack>
  );
};

export default MaxCountProgressCard;
