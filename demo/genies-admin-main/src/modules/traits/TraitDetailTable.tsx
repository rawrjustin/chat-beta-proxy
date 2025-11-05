import { Trait } from 'src/lib/swagger/devkit';
import { Table, Tbody, Td, Tr, Text, Image } from 'src/theme';
import { FieldConfig, getValueByConfig } from '../collections';

const traitDetailFieldConfig: FieldConfig[] = [
  { label: 'Trait ID', key: 'id' },
  { label: 'Type', key: 'type' },
  { label: 'Version', key: 'version' },
  { label: 'Description', key: 'description' },
  {
    label: 'Icon',
    key: 'iconUrl',
    render: (v: string) =>
      !!v?.length ? (
        <Image src={v} boxSize={6} alt="trait icon" />
      ) : (
        <Text>N/A</Text>
      ),
  },
  { label: 'CMS ID', key: 'cmsId' },
  { label: 'Opposite Trait ID', key: 'oppositeTraitId' },
  { label: 'Archetype ID', key: 'archetypeId' },
  { label: 'Archetype Name', key: 'archetypeName' },
  { label: 'Archetype Color', key: 'archetypeColor' },
  { label: 'Opposite Archetype ID', key: 'oppositeArchetypeId' },
  { label: 'Archetype Description', key: 'archetypeDescription' },
  { label: 'Opposite Archetype ID', key: 'oppositeArchetypeId' },
];

const TraitDetailTable = ({ trait }: { trait: Trait }) => {
  return (
    <Table>
      <Tbody>
        {traitDetailFieldConfig.map((fieldConfig, index: number) => (
          <Tr key={index}>
            <Td w="3xs" py={4} px={3} verticalAlign="top">
              <Text w="full" textStyle="userDetailFont" color="gray.400">
                {fieldConfig.label}
              </Text>
            </Td>
            <Td py={4} px={3}>
              {fieldConfig.render ? (
                fieldConfig.render(getValueByConfig(trait, fieldConfig))
              ) : (
                <Text w="full" textStyle="userDetailFont" color="grey.600">
                  {getValueByConfig(trait, fieldConfig)}
                </Text>
              )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default TraitDetailTable;
