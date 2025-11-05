import React from 'react';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import {
  HiChevronDown,
  HiDownload,
  HiOutlineFilter,
  HiOutlineX,
  HiPencil,
  HiPlus,
  HiRefresh,
} from 'react-icons/hi';
import getAssetsByModerationStatus from 'src/edge/shim/moderation/getAssetsByModerationStatus';
import updateAsset from 'src/edge/shim/moderation/updateAsset';
import {
  AssetModerationInfo,
  ModerationStatus,
  ModerationStatusResponse,
  ModerationType,
} from 'src/lib/swagger/admin';
import {
  Box,
  Button,
  Stack,
  Text,
  Heading,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Spinner,
  CheckboxGroup,
  VStack,
  HStack,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Textarea,
  ModalFooter,
  useToast,
  Tooltip,
} from 'src/theme';
import downloadAsset from 'src/edge/shim/moderation/downloadAsset';

const LIMIT = 30;

function arraysEqual<T>(a: T[], b: T[]) {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const val of Array.from(setA)) {
    if (!setB.has(val)) return false;
  }
  return true;
}

export function formatEnumLabel(value: string) {
  if (!value) return '';
  return value
    .toString()
    .replace(/_/g, ' ') // replace underscores with spaces
    .toLowerCase() // make all lowercase
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize each word
}

type StatusDropdownProps = {
  value: ModerationStatus;
  onChange: (newValue: ModerationStatus) => void;
  isLoading: boolean;
};

const allStatuses = Object.values(ModerationStatus) as ModerationStatus[];
const allTypes = Object.values(ModerationType) as ModerationType[];

export function StatusDropdown({
  value,
  onChange,
  isLoading = false,
}: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  return (
    <Menu
      isOpen={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <MenuButton
        isLoading={isLoading}
        as={Button}
        size="sm"
        rightIcon={<HiChevronDown />}
        variant="outline"
      >
        {formatEnumLabel(String(value))}
      </MenuButton>

      <MenuList>
        {allStatuses.map((status) => (
          <MenuItem
            key={status}
            onClick={() => {
              onChange(status as ModerationStatus);
              setOpen(false);
            }}
          >
            {formatEnumLabel(String(status))}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}

const Moderation: NextPage = () => {
  const toast = useToast();

  const [assetsForReview, setAssetsForReview] =
    useState<ModerationStatusResponse>(null);

  const [loading, setLoading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingStatus, setSavingStatus] = useState(new Set<string>());
  const [selectedStatuses, setSelectedStatuses] = useState<
    Array<ModerationStatus>
  >([]);

  const [selectedTypes, setSelectedTypes] = useState<Array<ModerationType>>([]);
  const [appliedFilters, setAppliedFilters] = useState<{
    statuses: Array<ModerationStatus>;
    types: Array<ModerationType>;
  }>({ statuses: [], types: [] });

  const [reviewNotes, setReviewNotes] = useState<{
    show: boolean;
    notes: string;
    asset?: AssetModerationInfo;
  }>({ show: false, notes: '', asset: null });

  const filtersChanged =
    !arraysEqual(selectedStatuses, appliedFilters.statuses) ||
    !arraysEqual(selectedTypes, appliedFilters.types);

  const updateAssetNotes = async (
    asset: AssetModerationInfo,
    notes: string = '',
  ) => {
    setSavingNotes(true);

    updateAsset(
      asset.assetId,
      asset.moderationStatus,
      asset.moderationType,
      notes,
    );
    setAssetsForReview((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.assetId === asset.assetId ? { ...a, reviewNotes: notes } : a,
      ),
    }));
    setSavingNotes(false);
    setReviewNotes({ notes: '', show: false, asset: null });
    toast({
      title: 'Updated review notes successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDownloadAsset = async (assetId: string) => {
    try {
      const assetKey = `output/${assetId}-processed.zip`;
      const res = await downloadAsset(assetKey);
      const signedUrl = res.signedURL;

      if (!signedUrl) {
        console.error('No signed URL returned');
        return;
      }
      window.location.href = signedUrl;
    } catch (err) {
      console.error('Error downloading asset:', err);
    }
  };

  const canLoadMore = assetsForReview && !!assetsForReview.nextCursor;

  const updateAssetStatus = async (
    asset: AssetModerationInfo,
    newStatus: ModerationStatus,
  ) => {
    setSavingStatus((prev) => new Set(prev).add(asset.assetId));
    updateAsset(asset.assetId, newStatus, asset.moderationType);
    setAssetsForReview((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.assetId === asset.assetId ? { ...a, moderationStatus: newStatus } : a,
      ),
    }));
    setSavingStatus((prev) => {
      const newSet = new Set(prev);
      newSet.delete(asset.assetId);
      return newSet;
    });
    toast({
      title: 'Updated status successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const getAssetsForReview = async (isReset: boolean) => {
    setLoading(true);
    const response = await getAssetsByModerationStatus(
      selectedStatuses.length ? selectedStatuses : allStatuses,
      selectedTypes.length ? selectedTypes : allTypes,
      isReset ? '' : assetsForReview?.nextCursor || '',
      LIMIT,
    );
    if (assetsForReview && assetsForReview.nextCursor && !isReset) {
      // loading more
      setAssetsForReview({
        ...response,
        assets: [...assetsForReview.assets, ...response.assets],
      });
    } else {
      // initial load
      setAssetsForReview(response);
    }
    setLoading(false);
  };
  const clearAssetsForReview = async () => {
    setAssetsForReview(null);
    setLoading(true);
    const response = await getAssetsByModerationStatus(
      allStatuses,
      allTypes,
      '',
      LIMIT,
    );
    setAssetsForReview(response);
    setLoading(false);
  };
  const refreshAssets = async () => {
    setLoading(true);
    setAssetsForReview(null);
    await getAssetsForReview(true);
    setLoading(false);
  };

  const handleStatusChange = (values) => {
    setSelectedStatuses(values);
  };
  const handleTypeChange = (values) => {
    setSelectedTypes(values);
  };
  useEffect(() => {
    getAssetsForReview(true);
  }, []);

  return (
    <React.Fragment>
      <Box p={4} w="full">
        <VStack spacing={6} align="stretch" p={6}>
          <Box>
            <Heading size="lg" mb={2}>
              Assets Moderation
            </Heading>
            <Text color="gray.600" mb={2}>
              Moderate assets submited by developers.
            </Text>
          </Box>
        </VStack>
        <Box marginBottom={4}>
          <HStack>
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} rightIcon={<HiChevronDown />}>
                {`Filter by status${
                  selectedStatuses.length ? ` (${selectedStatuses.length})` : ''
                }`}
              </MenuButton>
              <MenuList p={2}>
                <CheckboxGroup
                  value={selectedStatuses}
                  onChange={handleStatusChange}
                >
                  <Stack>
                    {/* {selectedStatuses.length ? (
                      <>
                        <MenuItem
                          key={'clear'}
                          border="none"
                          onClick={() => setSelectedStatuses([])}
                          icon={<HiOutlineX />}
                        >
                          Clear
                        </MenuItem>
                        <Divider background={'gray.500'} />
                      </>
                    ) : (
                      <></>
                    )} */}
                    {allStatuses.map((status) => (
                      <MenuItem
                        key={status}
                        as={Checkbox}
                        value={status}
                        _hover={{ bg: 'transparent' }}
                      >
                        {formatEnumLabel(String(status))}
                      </MenuItem>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </MenuList>
            </Menu>
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} rightIcon={<HiChevronDown />}>
                {`Filter by moderation type${
                  selectedTypes.length ? ` (${selectedTypes.length})` : ''
                }`}
              </MenuButton>
              <MenuList p={2}>
                <CheckboxGroup
                  value={selectedTypes}
                  onChange={handleTypeChange}
                >
                  <Stack>
                    {/* {selectedTypes.length ? (
                      <>
                        <MenuItem
                          key={'clear'}
                          border="none"
                          onClick={() => setSelectedTypes([])}
                          icon={<HiOutlineX />}
                        >
                          Clear
                        </MenuItem>
                        <Divider background={'gray.500'} />
                      </>
                    ) : (
                      <></>
                    )} */}
                    {Object.values(ModerationType).map((status) => (
                      <MenuItem
                        key={status}
                        as={Checkbox}
                        value={status}
                        _hover={{ bg: 'transparent' }}
                      >
                        {formatEnumLabel(String(status))}
                      </MenuItem>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </MenuList>
            </Menu>

            {filtersChanged ? (
              <Button
                variant="outline"
                leftIcon={<HiOutlineFilter />}
                onClick={() => {
                  setAppliedFilters({
                    statuses: [...selectedStatuses],
                    types: [...selectedTypes],
                  });
                  setAssetsForReview(null);
                  getAssetsForReview(true);
                }}
              >
                Apply Filters
              </Button>
            ) : (
              <Button
                onClick={() => {
                  refreshAssets();
                }}
                variant="outline"
                leftIcon={<HiRefresh />}
              >
                Refresh
              </Button>
            )}
            {selectedStatuses.length + selectedTypes.length > 0 ? (
              <React.Fragment>
                <Button
                  onClick={() => {
                    setSelectedStatuses([]);
                    setSelectedTypes([]);
                    setAppliedFilters({ statuses: [], types: [] });
                    const changed =
                      !arraysEqual(appliedFilters.statuses, []) ||
                      !arraysEqual(appliedFilters.types, []);
                    if (changed) clearAssetsForReview();
                  }}
                  variant="outline"
                  leftIcon={<HiOutlineX />}
                >
                  Clear Filters
                </Button>
              </React.Fragment>
            ) : (
              <React.Fragment />
            )}
          </HStack>
        </Box>
        <Box>
          {assetsForReview === null ? (
            <React.Fragment>
              <Box
                padding={16}
                alignItems="center"
                justifyContent="center"
                display="flex"
              >
                <Spinner />
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Table marginBottom={4}>
                <Thead>
                  <Tr>
                    <Th>Asset Name</Th>
                    <Th>Asset Type</Th>
                    <Th>Category</Th>
                    <Th>Asset Description</Th>
                    <Th>Creator Id</Th>
                    <Th>Moderation Status</Th>
                    <Th>Moderation Type</Th>
                    <Th>Reviewer User Id</Th>
                    <Th>Review Notes</Th>
                    <Th>Download Asset</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {(assetsForReview?.assets ?? []).map((asset) => {
                    return (
                      <Tr key={asset.assetId}>
                        <Th>{asset.name}</Th>
                        <Th>{asset.assetType}</Th>
                        <Th>{asset.category}</Th>
                        <Th
                          maxW="250px"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          <Tooltip label={asset.description} hasArrow>
                            <Text
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {asset.description || '-'}
                            </Text>
                          </Tooltip>
                        </Th>
                        <Th>{asset.creatorId}</Th>
                        <Th>
                          <StatusDropdown
                            value={asset.moderationStatus as ModerationStatus}
                            onChange={(newValue) =>
                              updateAssetStatus(asset, newValue)
                            }
                            isLoading={savingStatus.has(asset?.assetId)}
                          />
                        </Th>
                        <Th>{asset.moderationType}</Th>
                        <Th>{asset.reviewerUserId}</Th>
                        <Th>
                          <Button
                            leftIcon={
                              asset?.reviewNotes?.length ? (
                                <HiPencil />
                              ) : (
                                <HiPlus />
                              )
                            }
                            onClick={() => {
                              setReviewNotes({
                                show: true,
                                notes: asset.reviewNotes,
                                asset: asset,
                              });
                            }}
                          >
                            {asset?.reviewNotes?.length ? 'Edit' : 'Add'} Notes
                          </Button>
                        </Th>
                        <Th>
                          <Button
                            variant="ghost"
                            leftIcon={<HiDownload />}
                            onClick={() => handleDownloadAsset(asset.assetId)}
                          >
                            Download
                          </Button>
                        </Th>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </React.Fragment>
          )}

          {canLoadMore && (
            <Button
              isLoading={loading}
              onClick={() => getAssetsForReview(false)}
            >
              Load More
            </Button>
          )}
        </Box>
      </Box>
      <Modal
        isOpen={reviewNotes.show}
        onClose={() => setReviewNotes({ notes: '', show: false, asset: null })}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Review Notes</ModalHeader>
          <ModalCloseButton />
          <ModalBody paddingX={6} paddingY={1}>
            <Textarea
              resize="vertical"
              value={reviewNotes.notes}
              onChange={(e) => {
                setReviewNotes({ ...reviewNotes, notes: e.target.value });
              }}
            />
          </ModalBody>
          <ModalFooter>
            <HStack gap={2}>
              <Button
                variant="ghost"
                onClick={() =>
                  setReviewNotes({ notes: '', show: false, asset: null })
                }
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                mr={3}
                isLoading={savingNotes}
                onClick={() => {
                  updateAssetNotes(reviewNotes.asset, reviewNotes.notes);
                }}
              >
                Save
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default Moderation;
