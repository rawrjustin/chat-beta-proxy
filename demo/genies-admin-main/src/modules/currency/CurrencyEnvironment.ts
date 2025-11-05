export interface CurrencyEnvironment {
  name: string;
  partyId: string;
  // This field is maintained for backward compatibility
  // Currency IDs are now fetched dynamically via getAllCurrenciesForOwner
  softCurrencyId: string;
}

export const InternalEnv: CurrencyEnvironment = {
  name: 'internal',
  partyId: '51a2a408-3c37-4434-95ca-6939fe076953',
  softCurrencyId: '', // Dynamically fetched at runtime
};

export const QaEnv: CurrencyEnvironment = {
  name: 'QA',
  partyId: 'd893bf2d-313d-4bc8-a5cf-7d11425c7d46',
  softCurrencyId: '', // Dynamically fetched at runtime
};

export const ReleaseQaEnv: CurrencyEnvironment = {
  name: 'release_qa',
  partyId: '51a2a408-3c37-4434-95ca-6939fe076953',
  softCurrencyId: '', // Dynamically fetched at runtime
};

export const ProdEnv: CurrencyEnvironment = {
  name: 'prod',
  partyId: 'd893bf2d-313d-4bc8-a5cf-7d11425c7d46',
  softCurrencyId: '', // Dynamically fetched at runtime
};

export const CurrencyEnvironmentMap = {
  [InternalEnv.name]: InternalEnv,
  [QaEnv.name]: QaEnv,
  [ReleaseQaEnv.name]: ReleaseQaEnv,
  [ProdEnv.name]: ProdEnv,
};

// Helper function to get party ID for a given environment
export const getPartyIdForEnvironment = (envName: string): string => {
  const env = CurrencyEnvironmentMap[envName];
  return env ? env.partyId : InternalEnv.partyId; // Default to internal if not found
};
