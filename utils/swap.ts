import { BigNumberish } from '@ethersproject/bignumber';
import IJoeRouter02Abi from '@traderjoe-xyz/core/abi/IJoeRouter02.json';
import { IJoeRouter02 } from '@traderjoe-xyz/core/types'
import { ethers, getNamedAccounts } from 'hardhat';

export const getTraderJoeRouter = async (signer: string) => {
  const {joeRouter} = await getNamedAccounts();
  const router = await ethers.getContractAt(IJoeRouter02Abi, joeRouter, signer) as IJoeRouter02
  return router
}

export const swapAvaxForTokens = async (signer: string, token: string, value: BigNumberish) => {
  const {wavax} = await getNamedAccounts();
  const router = await getTraderJoeRouter(signer);
  const path = [wavax, token];

  const tx = await router.swapExactAVAXForTokens(0, path, signer, Date.now() + 1000, {
    value,
  });
  await tx.wait()
};