# Genies Admin

Genies internal admin tools

- [Genies Admin - Dev](https://admin.dev.genies.com) (need Dev VPN on)
- [Genies Admin - Production](https://admin.genies.com) (need Prod VPN on)

Learn more at [Genies frontend onboarding doc](https://www.notion.so/geniesinc/Frontend-Onboarding-1ba8f0c92dfc80c0b000e5c876a6e2ae?source=copy_link).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Refer to the [Authorization](#authorization) part for sign in.

## Authorization

- For development, sign up a new user on [Genies Hub](https://hub.dev.genies.com/) if you don't have an account.
- Add your phone number or email to the stagsig dynamic configs [admin_whitelist](https://console.statsig.com/36JrRRtvldZgA7OBr67wrJ/dynamic_configs/admin_whitelist).

## Contributing

### Stack

- [Next.js v14](https://nextjs.org/) - React framework (Page Router)
- [Chakra UI v2](https://v2.chakra-ui.com/) - Component library and design system
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL state management library for JavaScript
- [SwaggerHub](https://app.swaggerhub.com/Genies/home) - REST API client codegen

### Monitoring

- **Datadog** - Application performance monitoring (APM) and logging
  - Service: `genies-admin`

### REST APIs

**[Admin API](https://app.swaggerhub.com/apis/Genies/Admin)**

- Internal admin service
- To update client generated code under `src/lib/swagger/admin`, run `admin-frontend-client` integration from Swagger Hub. This will create a new branch with the generated code in this repository.

**[Devkit API](https://app.swaggerhub.com/apis/Genies/Genies_Devkit_API)**

- Devkit service
- To update client generated code under `src/lib/swagger/devkit`, run `genies-admin` integration from Swagger Hub. This will create a new branch with the generated code in this repository.

**[User API](https://app.swaggerhub.com/apis/Genies/User_API)**

- Auth service
- To update client generated code under `src/lib/swagger/user`, run `genies-admin` integration from Swagger Hub. This will create a new branch with the generated code in this repository.

### Graphql

- Now there are two configured clients :[Genies Consumer API](https://api.warehouse.dev.genies.com/consumer/playground) and [Genies Admins API](https://api.warehouse.dev.genies.com/admin/playground).
- Genies Admin API is recommended to be used first.
- All the gql queries need to be put into target folder for supporting types generation.

  - The Admin API gql queries target folder: `src/src/edge/gql/admin/`
  - The Consumer API gql queries target folder: `src/src/edge/gql/consumer/`

- For the schema download and types generateion, there is a bit difference between consumer API and admin API

  - Now there is no auth verification for consumer API, so we could directly run below command to download graph schema and generate types

  ```
  npm run consumer-schema:download
  npm run consumer-schema:types
  ```

  - But the admin API require auth token to download the schema. So you need to run the command with auth token.

  ```
  token=ReplaceThisWithRealAuthToken npm run admin-schema:download
  npm run admin-schema:types
  ```

### AWS Access

If the development include the AWS interactions, such as image uploading , the AWS keys are needed to export to the local development environement.

- Open [https://geniesinc.awsapps.com/start#/](https://geniesinc.awsapps.com/start#/)
- Click the account you want to use
- Click `Command line or programmatic access`
- In the dialog, copy the export command in the option 1 and paste them in your terminal where you run your dev command. These access key will be expired so it's not necessary to keep them.

### Requirements:

`Node: ^18.20.6,`
`Npm: ^9.8.1`
