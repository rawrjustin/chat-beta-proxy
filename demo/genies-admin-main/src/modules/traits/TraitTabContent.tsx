import {
  SimpleGrid,
  Spinner,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  HStack,
  Alert,
  AlertIcon,
} from 'src/theme';
import TraitProfileCard, { TraitStatusBadge } from './TraitProfileCard';
import { Fragment, useState } from 'react';
import ArchetypeCard from './ArchetypeCard';
import { Trait, UserTraitsResponseProfile } from 'src/lib/swagger/devkit';
import { AdminGetTraitStatusResponse } from 'src/lib/swagger/admin';
import TraitDetailTable from './TraitDetailTable';
import { TabConfig, TabContainer } from 'src/general/components/TabContainer';
import MaxCountProgressCard from './MaxCountProgressCard';
import DecayStatusCard from './DecayStatusCard';

const TraitTabContent = ({
  loading,
  profileData,
  noProfile,
  onEditScore,
  traitsProgress,
}: {
  loading: boolean;
  noProfile: boolean;
  profileData: Array<UserTraitsResponseProfile>;
  onEditScore: (traitId: string, score: number) => Promise<void>;
  traitsProgress: AdminGetTraitStatusResponse;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTrait, setSelectedTrait] = useState<Trait>(null);

  const onClickViewMore = (trait: Trait) => {
    setSelectedTrait(trait);
    onOpen();
  };

  console.log('traitsProgress: ', traitsProgress);

  const traitTabConfig: TabConfig[] = [
    {
      name: 'My Macro Profile',
      content: (
        <Fragment>
          {loading ? (
            <Spinner />
          ) : (
            <Fragment>
              {noProfile && (
                <Alert status="warning" mb={4}>
                  <AlertIcon />
                  Seems your account has no trait profile now. Belows are the
                  all available traits.
                </Alert>
              )}
              <SimpleGrid columns={4} spacing={4}>
                {profileData?.length &&
                  profileData.map((props) => (
                    <TraitProfileCard
                      key={props.trait.id}
                      trait={props.trait}
                      value={props.value}
                      onClickViewMore={onClickViewMore}
                      onEditScore={onEditScore}
                    />
                  ))}
              </SimpleGrid>
            </Fragment>
          )}
          {/* trait details modal */}
          {isOpen && (
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>
                  <HStack w="100%" spacing={3}>
                    <Text textStyle="h4">{selectedTrait.name}</Text>
                    <TraitStatusBadge status={selectedTrait.status} />
                  </HStack>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <TraitDetailTable trait={selectedTrait} />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
        </Fragment>
      ),
    },
    {
      name: 'My Archetype Strengths',
      content: (
        <Fragment>
          {loading ? (
            <Spinner />
          ) : (
            <SimpleGrid columns={4} spacing={4}>
              {profileData?.length &&
                profileData
                  .reduce((acc, prop) => {
                    const existing = acc.find(
                      (item) =>
                        item.trait.archetypeId === prop.trait.archetypeId,
                    );
                    if (existing) {
                      existing.value += prop.value;
                    } else {
                      acc.push({ ...prop });
                    }
                    return acc;
                  }, [])
                  .map((prop) => (
                    <ArchetypeCard
                      key={prop.trait.archetypeId}
                      trait={prop.trait}
                      value={prop.value}
                    />
                  ))}
            </SimpleGrid>
          )}
        </Fragment>
      ),
    },
    {
      name: 'My Max Count Progress',
      content: (
        <Fragment>
          {loading ? (
            <Spinner />
          ) : (
            <SimpleGrid columns={4} spacing={4}>
              {traitsProgress?.maxCounts?.length &&
                traitsProgress.maxCounts
                  .sort((a, b) => b.currentCount - a.currentCount) // sort by highest value
                  .map((prop) => (
                    <MaxCountProgressCard
                      key={prop.traitId}
                      traitId={prop.traitId}
                      name={
                        profileData?.length &&
                        profileData.find((p) => p.trait.id === prop.traitId)
                          .trait.name
                      }
                      currentCount={prop.currentCount}
                      maxCount={prop.maxCount}
                      expiresAt={prop.expiresAt}
                      source={prop.source}
                      onCooldown={prop.onCooldown}
                    />
                  ))}
            </SimpleGrid>
          )}
        </Fragment>
      ),
    },
    {
      name: 'My Decay Status',
      content: (
        <Fragment>
          {loading ? (
            <Spinner />
          ) : (
            <SimpleGrid columns={4} spacing={4}>
              {traitsProgress?.decay?.length &&
                traitsProgress.decay
                  .sort((a, b) => b.expiresAt - a.expiresAt) // sort by highest value
                  .map((prop) => (
                    <DecayStatusCard
                      key={prop.traitId}
                      name={
                        profileData?.length &&
                        profileData.find((p) => p.trait.id === prop.traitId)
                          .trait.name
                      }
                      expiresAt={prop.expiresAt}
                    />
                  ))}
            </SimpleGrid>
          )}
        </Fragment>
      ),
    },
  ];

  return <TabContainer config={traitTabConfig} />;
};

export default TraitTabContent;
