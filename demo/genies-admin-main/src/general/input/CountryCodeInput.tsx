import React, { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { Box, Center } from 'src/theme';
import { Option, getCountryCodes } from './countryCodes';

type Inputs = {
  countryCode: Option;
  phoneNumber: string;
};

const CountryCodeInput = () => {
  const options = useMemo(() => getCountryCodes(['US']), []);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const { control } = useForm<Inputs>({
    mode: 'onChange',
    defaultValues: {
      countryCode: { ...options[0] },
    },
  });

  //Mountz-TODO: Handle setting country code in user details context
  return (
    <Box>
      <Center
        ref={elementRef}
        id="phoneForm"
        display="flex"
        flexDirection="column"
      >
        <Controller
          control={control}
          name="countryCode"
          render={({ field: { onChange, value } }) => (
            <Select
              instanceId="countryCode"
              defaultValue={options[0]}
              onChange={onChange}
              value={value}
              options={options}
              formatOptionLabel={(option, context) => {
                return context.context === 'value'
                  ? `${option.value} ${option.code}`
                  : option.label;
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  border: 'none',
                  background: '#2F2D2E',
                  color: '#fff',
                  borderColor: 'none!important',
                  boxShadow: 'none!important',
                  fontFamily: 'Roobert Regular',
                }),
                dropdownIndicator: (base) => ({
                  ...base,
                  color: '#fff',
                }),
                singleValue: (base) => ({
                  ...base,
                  color: '#fff',
                }),
                option: (styles, state) => ({
                  ...styles,
                  color: '#fff',
                  backgroundColor: state.isSelected ? '#4F4F4F' : '#2F2D2E',
                  '&:hover': {
                    backgroundColor: '#4F4F4F',
                  },
                }),
                input: (base) => ({
                  ...base,
                  color: '#fff',
                }),
                container: (base) => ({
                  ...base,
                  background: 'grey.dark',
                  color: '#fff',
                }),
                menu: (base) => ({
                  ...base,
                  background: '#2F2D2E',
                  color: '#fff',
                  width: '400px', // should also add default one
                }),
              }}
            />
          )}
        />
      </Center>
    </Box>
  );
};

export default CountryCodeInput;
