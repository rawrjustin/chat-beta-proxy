import { GraphQLRequest } from '@apollo/client';
import Logger from 'shared/logger';
import { print } from 'graphql/language/printer';
import axios from 'axios';

export interface RequestWithSignatureResponse {
  hash?: string;
  nonce?: number;
}

export async function requestWithSignature(
  req: GraphQLRequest,
): Promise<RequestWithSignatureResponse> {
  try {
    const operationName = req.operationName;
    const variables = req.variables;
    const queryString = print(req.query);

    const nonce = new Date(Date.now()).getTime();
    const params = {
      operationName,
      variables,
      query: queryString,
      nonce,
    };
    const res = await axios.post(`/api/t`, params);
    if (!res || res.status !== 200) {
      throw new Error('Could not call the server to get signature');
    }

    const { hash } = res.data;
    return { hash, nonce };
  } catch (e) {
    Logger.getInstance().error(`requestWithSignature error: ${e.message}`, {
      errorMessage: e.message,
      source: 'RequestWithSignature',
    });
    return {};
  }
}
