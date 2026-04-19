name=examples/tron-transactions.js
import { TronTransactionHandler } from "../src/transaction-handler.js";

const handler = new TronTransactionHandler("http://localhost:9091");

/**
 * Example 1: Get Account Information
 */
async function getAccountInfo() {
  console.log("📊 Getting Account Information...");
  
  const address = "0x..."; // Replace with actual address
  
  try {
    const balance = await handler.getBalance(address);
    const balanceInTRX = parseInt(balance, 16) / 1e6; // Convert from sun to TRX
    
    console.log(`Address: ${address}`);
    console.log(`Balance: ${balanceInTRX} TRX`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Example 2: Build Transfer Transaction (WITHOUT signing)
 */
async function buildTransferTx() {
  console.log("💸 Building Transfer Transaction...");

  const fromAddress = "0x..."; // Your address
  const toAddress = "0x..."; // Recipient address
  const amountInWei = "1000000000000000000"; // 1 TRX in wei

  try {
    const nonce = await handler.getAccountNonce(fromAddress);
    const gasPrice = await handler.getGasPrice();

    const txData = handler.buildTransfer({
      from: fromAddress,
      to: toAddress,
      amount: amountInWei,
      gasPrice,
      nonce,
    });

    console.log("Built Transaction:");
    console.log(JSON.stringify(txData, null, 2));

    return txData;
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Example 3: Sign and Broadcast Transaction
 * ⚠️ SECURITY: Use secure key management in production!
 */
async function signAndBroadcast() {
  console.log("🔐 Signing and Broadcasting Transaction...");

  const fromAddress = "0x..."; // Your address
  const toAddress = "0x..."; // Recipient
  const amountInWei = "1000000000000000000"; // 1 TRX

  const privateKey = "0x..."; // ⚠️ NEVER hardcode in production!

  try {
    // Build transaction
    const nonce = await handler.getAccountNonce(fromAddress);
    const gasPrice = await handler.getGasPrice();

    const txData = handler.buildTransfer({
      from: fromAddress,
      to: toAddress,
      amount: amountInWei,
      gasPrice,
      nonce,
    });

    console.log("Transaction Data:", txData);

    // Sign (requires ethers.js)
    // const signedTx = await handler.signTransaction(txData, privateKey);

    // Send (would be done after signing)
    // const txHash = await handler.sendSignedTransaction(signedTx);
    // console.log(`Transaction Hash: ${txHash}`);

    // Wait for confirmation
    // const receipt = await handler.waitForTransaction(txHash);
    // console.log("Receipt:", receipt);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Example 4: Monitor Transaction
 */
async function monitorTransaction() {
  console.log("👀 Monitoring Transaction...");

  const txHash = "0x..."; // Replace with actual tx hash

  try {
    const receipt = await handler.waitForTransaction(txHash);
    
    console.log("Transaction Confirmed!");
    console.log(`Block: ${receipt.blockNumber}`);
    console.log(`Status: ${receipt.status === "0x1" ? "Success" : "Failed"}`);
    console.log(`Gas Used: ${parseInt(receipt.gasUsed, 16)}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Example 5: Get Transaction Details
 */
async function getTransactionDetails() {
  console.log("📋 Getting Transaction Details...");

  const txHash = "0x..."; // Replace with actual tx hash

  try {
    const tx = await handler.getTransaction(txHash);
    console.log("Transaction Details:");
    console.log(JSON.stringify(tx, null, 2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

/**
 * Example 6: Get Latest Block
 */
async function getLatestBlockInfo() {
  console.log("📦 Getting Latest Block...");

  try {
    const { blockNumber, block } = await handler.getLatestBlock();
    console.log(`Block Number: ${parseInt(blockNumber, 16)}`);
    console.log(`Timestamp: ${parseInt(block.timestamp, 16)}`);
    console.log(`Transactions: ${block.transactions.length}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run examples
async function main() {
  console.log("🚀 TRON Transaction Examples\n");

  // Uncomment to run specific examples
  // await getAccountInfo();
  // await buildTransferTx();
  // await signAndBroadcast();
  // await monitorTransaction();
  // await getTransactionDetails();
  // await getLatestBlockInfo();
}

main().catch(console.error);
