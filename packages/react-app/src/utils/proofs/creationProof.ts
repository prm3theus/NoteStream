import { Address, Hash } from '../../types/types';

function initialiseStream(
  streamContract: any,
  depositProof: any,
  payerAddress: Address,
  payeeAddress: Address,
  zkAssetAddress: Address,
  startTime: number,
  endTime: number,
): number {
  return streamContract.methods
    .createStream(payeeAddress, depositProof, zkAssetAddress, startTime, endTime)
    .send({ from: payerAddress }, (err: any, txHash: Hash) => {
      if (err) {
        console.log(err);
        return null;
      }
      console.log('transaction hash', txHash);
      return txHash;
    });
}

async function buildDepositProof(
  streamContractAddress: Address,
  asset: any,
  payerAddress: Address,
  payeeAddress: Address,
  sendAmount: number,
): Promise<object> {
  const { proof } = await asset.send(
    [
      {
        to: streamContractAddress,
        amount: sendAmount,
        aztecAccountNotRequired: true, // contract can't have an AZTEC account
        numberOfOutputNotes: 1, // only want to track a single note per stream
      },
    ],
    {
      userAccess: [payerAddress, payeeAddress], // Give view access to sender and recipient
      returnProof: true,
      sender: streamContractAddress, // proof is being submitted by contract rather than directly
    },
  );

  console.log(proof);
  return proof;
}

async function createStream(
  sendAmount: number,
  zkAsset: any,
  streamContract: any,
  payerAddress: Address,
  payeeAddress: Address,
  startTime: number,
  endTime: number,
): Promise<any> {
  const depositProof = await buildDepositProof(
    streamContract.options.address,
    zkAsset,
    payerAddress,
    payeeAddress,
    sendAmount,
  );
  return initialiseStream(
    streamContract,
    depositProof,
    payerAddress,
    payeeAddress,
    zkAsset.address,
    startTime,
    endTime,
  );
}

export default createStream;
