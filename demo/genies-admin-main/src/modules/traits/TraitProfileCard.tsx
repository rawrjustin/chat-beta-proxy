import { Trait } from 'src/lib/swagger/devkit';
import {
  VStack,
  Text,
  Flex,
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  PopoverArrow,
  PopoverBody,
} from 'src/theme';
import { useState } from 'react';

export const TraitStatusBadge = ({ status }: { status: Trait.StatusEnum }) => {
  return (
    <Badge colorScheme={status === Trait.StatusEnum.ACTIVE ? 'green' : 'red'}>
      {status}
    </Badge>
  );
};

const TraitProfileCard = ({
  trait,
  value,
  onClickViewMore,
  onEditScore,
}: {
  trait: Trait;
  value: number;
  onClickViewMore: (trait: Trait) => void;
  onEditScore: (traitId: string, score: number) => Promise<void>;
}) => {
  const [score, setScore] = useState<number>(value);
  const [saving, setSaving] = useState<boolean>();

  const onClickSaveScore = async () => {
    setSaving(true);
    await onEditScore(trait.id, score);
    setSaving(false);
  };

  return (
    <VStack
      borderRadius="md"
      bgColor="whiteAlpha.200"
      p={3}
      align="flex-start"
      justify="space-between"
    >
      <Flex w="100%" justifyContent="space-between">
        <Text textStyle="h4">{trait.name}</Text>
        <Popover onOpen={() => setScore(value)}>
          <PopoverTrigger>
            <Text cursor="pointer" textStyle="h4">
              {value}
            </Text>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <NumberInput
                onChange={(v) => setScore(parseInt(v))}
                value={score}
                min={0}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <Button onClick={onClickSaveScore} isLoading={saving}>
                Save
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
      <VStack align="flex-start">
        <TraitStatusBadge status={trait.status} />
        <Text>
          <Text fontWeight="bold" as="span">
            Trait ID:
          </Text>{' '}
          {trait.id}
        </Text>
        <Text>
          <Text fontWeight="bold" as="span">
            Type:
          </Text>{' '}
          {trait.type}
        </Text>
        <Text>
          <Text fontWeight="bold" as="span">
            Version:
          </Text>{' '}
          {trait.version}
        </Text>
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
      <Button
        variant="link"
        ml="auto"
        color="#AA99FF"
        onClick={() => onClickViewMore(trait)}
      >
        View More
      </Button>
    </VStack>
  );
};

export default TraitProfileCard;
