import { ReactNode } from 'react';
import {
  Pants,
  Dress,
  Earrings,
  Glasses,
  Hat,
  Jacket,
  Hoodie,
  Mask,
  Skirt,
  Shoes,
  Shorts,
  Shirt,
  Avatar,
} from './3DCreationIcons';
import { GearCategory } from 'src/lib/swagger/devkit';

type OptionType = {
  value: string;
  category: GearCategory;
  listIcon: ReactNode;
};

const categoryOptions: OptionType[] = [
  {
    value: 'Dress',
    category: GearCategory.DRESS,
    listIcon: <Dress color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Earrings',
    category: GearCategory.EARRINGS,
    listIcon: <Earrings color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Glasses',
    category: GearCategory.GLASSES,
    listIcon: <Glasses color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Hat',
    category: GearCategory.HAT,
    listIcon: <Hat color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Hoodie',
    category: GearCategory.HOODIE,
    listIcon: <Hoodie color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Jacket',
    category: GearCategory.JACKET,
    listIcon: <Jacket color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Mask',
    category: GearCategory.MASK,
    listIcon: <Mask color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Pants',
    category: GearCategory.PANTS,
    listIcon: <Pants color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Skirt',
    category: GearCategory.SKIRT,
    listIcon: <Skirt color="black" w="32px" h="32px" mt={1} />,
  },
  {
    value: 'Shoes',
    category: GearCategory.SHOES,
    listIcon: <Shoes color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Shirt',
    category: GearCategory.SHIRT,
    listIcon: <Shirt color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Shorts',
    category: GearCategory.SHORTS,
    listIcon: <Shorts color="black" w="32px" h="32px" margin="auto" />,
  },
  {
    value: 'Avatar',
    category: GearCategory.AVATAR,
    listIcon: <Avatar color="black" w="32px" h="32px" margin="auto" />,
  },
];

export { categoryOptions };
export type { OptionType };
