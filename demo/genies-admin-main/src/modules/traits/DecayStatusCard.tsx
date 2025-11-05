import { VStack, Text } from 'src/theme';

const DecayStatusCard = ({
  name,
  expiresAt,
}: {
  name: string;
  expiresAt: number;
}) => {
  return (
    <VStack borderRadius="md" bgColor="whiteAlpha.200" p={3} align="flex-start">
      <Text textStyle="h4">{name}</Text>
      <Text>
        <Text fontWeight="bold" as="span">
          Expires At:
        </Text>{' '}
        {new Date(Date.now() - expiresAt).toString()}
      </Text>
    </VStack>
  );
};

export default DecayStatusCard;
