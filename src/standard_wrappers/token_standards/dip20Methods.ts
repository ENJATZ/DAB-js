/* eslint-disable @typescript-eslint/camelcase */
import { Principal } from '@dfinity/principal';
import { ActorSubclass } from '@dfinity/agent';

import Dip20Service from '../../interfaces/dip_20';
import { Metadata } from '../../interfaces/token'; 
import {
  BalanceResponse,
  BurnParams,
  getDecimalsFromMetadata,
  InternalTokenMethods,
  SendParams,
  SendResponse,
} from './methods';
import { BaseMethodsExtendedActor } from '../../utils/actorFactory';

type BaseDip20Service = BaseMethodsExtendedActor<Dip20Service>;

const getMetadata = async (
  actor: ActorSubclass<BaseDip20Service>
): Promise<Metadata> => {
  const metadataResult = await actor._getMetadata();
  return {
    fungible: {
      symbol: metadataResult.symbol,
      decimals: metadataResult.decimals,
      name: metadataResult.name,
      logo: metadataResult.logo,
    },
  };
};

const send = async (
  actor: ActorSubclass<BaseDip20Service>,
  { to, amount }: SendParams
): Promise<SendResponse> => {
  const transferResult = await actor._transfer(
    Principal.fromText(to),
    amount
  );

  if ('Ok' in transferResult)
    return { transactionId: transferResult.Ok.toString() };

  throw new Error(Object.keys(transferResult.Err)[0]);
};

const getBalance = async (
  actor: ActorSubclass<BaseDip20Service>,
  user: Principal
): Promise<BalanceResponse> => {
  const decimals = await getDecimals(actor);
  const value = (await actor._balanceOf(user)).toString();
  return { value, decimals };
};

const burnXTC = async (
  _actor: ActorSubclass<BaseDip20Service>,
  _params: BurnParams
) => {
  throw new Error('BURN NOT SUPPORTED');
};

const getDecimals = async (actor: ActorSubclass<BaseDip20Service>) => getDecimalsFromMetadata(await getMetadata(actor))

export default {
  send,
  getMetadata,
  getBalance,
  burnXTC,
  getDecimals
} as InternalTokenMethods;
