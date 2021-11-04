import { getAvalancheManagerContract } from "./contract"

export const burn = async (signer: string, manager: string) => {
  const managerContract = await getAvalancheManagerContract(signer, manager);
  const tx = await managerContract.burn();
  await tx.wait();
}