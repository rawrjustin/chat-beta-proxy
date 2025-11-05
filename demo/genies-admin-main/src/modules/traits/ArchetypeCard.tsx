import { Trait } from 'src/lib/swagger/devkit';
import { VStack, Text, Flex } from 'src/theme';

const TraitProfileCard = ({
  trait,
  value,
}: {
  trait: Trait;
  value: number;
}) => {
  return (
    <VStack borderRadius="md" bgColor="whiteAlpha.200" p={3} align="flex-start">
      <Flex w="100%" justifyContent="space-between">
        <Text textStyle="h4">{trait.archetypeName}</Text>
        <Text textStyle="h4">{value}</Text>
      </Flex>
      <Text>
        <Text fontWeight="bold" as="span">
          Archetype ID:
        </Text>{' '}
        {trait.archetypeId}
      </Text>
      <Text>
        <Text fontWeight="bold" as="span">
          Archetype Name:
        </Text>{' '}
        {trait.archetypeName}
      </Text>
    </VStack>
  );
};

export default TraitProfileCard;
