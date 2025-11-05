import React, { useEffect, useState, ReactElement } from 'react';
import { InfoTable } from 'src/general/infotable/InfoTable';
import { Image } from 'src/theme';

export interface FieldConfig {
  label: string;
  key: string;
  isEditable: boolean;
  render?: (v: any) => ReactElement;
}

export const userFormConfig: FieldConfig[] = [
  { label: 'Username', key: 'username', isEditable: true },
  { label: 'Email', key: 'email', isEditable: true },
  { label: 'Bio', key: 'bio', isEditable: true },
  { label: 'Phone Number', key: 'phoneNumber', isEditable: true },
  { label: 'User ID', key: 'geniesID', isEditable: false },
  { label: 'WalletID', key: 'flowAddress', isEditable: false },
  { label: 'Joined', key: 'joined', isEditable: false },
];

interface MockDataProps {
  id: string;
  username: string;
  email: string;
  bio: string;
  phoneNumber: string;
  geniesID: string;
  flowAddress: string;
  dapperID: string;
  joined: string;
  profileImageUrl: string | null;
  prefUsername: string | null;
  __typename: string;
}

export const UserDetails = () => {
  //@mountz: TODO-replace mock data with real data, expose endpoint to get join date
  const [mockData, setMockData] = useState<MockDataProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      !mockData &&
        setMockData({
          id: 'e97bff6b-72f8-44b6-8b8a-0bdd76d1f68a',
          username: 'c6ef432d-a091-49e3-bcc5-e8fba1dfcde6',
          email: 'test@genies.com',
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum rutrum sodales. Nullam mattis fermentum libero, non volutpat.',
          phoneNumber: '+11234567890',
          geniesID: 'c6ef432d-a091-49e3-bcc5-e8fba1dfcde6',
          flowAddress: '20bfe2338a175518',
          dapperID: 'auth0|62841834ef4fc35faafcd2e0',
          joined: 'May 22, 2022',
          profileImageUrl: null,
          prefUsername: null,
          __typename: 'UserProfile',
        });
      setLoading(false);
    }, 1000);
  }, [mockData]);

  const updateData = (field: string, newData: string) => {
    setMockData((prevData) => ({
      ...prevData,
      [field]: newData,
    }));
  };

  const ProfileImage = (
    <Image
      mt={10}
      mb={10}
      src="/static/images/avatar.svg"
      alt="Edition Picture"
      width={['100px', '123px']}
    />
  );

  //@mountz TODO-remove setMockData prop from InfoTable after user details context is done
  return (
    <InfoTable
      formConfig={userFormConfig}
      data={mockData}
      loading={loading}
      updateData={updateData}
      image={ProfileImage}
    />
  );
};
