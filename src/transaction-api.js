name=src/transaction-api.js
import express from "express";
import { TronTransactionHandler } from "./transaction-handler.js";
import { log } from "./functions.js";

const router = express.Router();
const handler = new TronTransactionHandler();

/**
 * GET /tx/balance/:address
 * Get account balance
 */
router.get("/tx/balance/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const balance = await handler.getBalance(address);
    const balanceInTRX = parseInt(balance, 16) / 1e6;

    res.json({
      address,
      balance: balance,
      balanceInTRX,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log(`Error getting balance: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /tx/build-transfer
 * Build transfer transaction
 */
router.post("/tx/build-transfer", async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        error: "Missing required fields: from, to, amount",
      });
    }

    const nonce = await handler.getAccountNonce(from);
    const gasPrice = await handler.getGasPrice();

    const txData = handler.buildTransfer({
      from,
      to,
      amount,
      gasPrice,
      nonce,
    });

    res.json({
      success: true,
      transaction: txData,
      message: "⚠️ Transaction built but NOT signed or sent",
    });
  } catch (error) {
    log(`Error building transfer: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /tx/estimate-gas
 * Estimate gas for transaction
 */
router.post("/tx/estimate-gas", async (req, res) => {
  try {
    const { from, to, value, data } = req.body;

    const estimate = await handler.estimateGas({
      from,
      to,
      value: value || "0x0",
      data: data || "0x",
    });

    const gasEstimateInGWei = parseInt(estimate, 16) / 1e9;

    res.json({
      gasEstimate: estimate,
      gasEstimateInGWei,
    });
  } catch (error) {
    log(`Error estimating gas: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /tx/:txHash
 * Get transaction details
 */
router.get("/tx/:txHash", async (req, res) => {
  try {
    const { txHash } = req.params;
    const tx = await handler.getTransaction(txHash);

    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({
      transaction: tx,
      value: parseInt(tx.value, 16) / 1e6, // in TRX
      gasPrice: parseInt(tx.gasPrice, 16) / 1e9, // in GWei
    });
  } catch (error) {
    log(`Error getting transaction: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /tx/receipt/:txHash
 * Get transaction receipt (confirmation status)
 */
router.get("/tx/receipt/:txHash", async (req, res) => {
  try {
    const { txHash } = req.params;
    const receipt = await handler.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.status(404).json({ error: "Receipt not found (pending)" });
    }

    res.json({
      receipt,
      status: receipt.status === "0x1" ? "Success" : "Failed",
      gasUsed: parseInt(receipt.gasUsed, 16),
      confirmations: receipt.blockNumber ? "Confirmed" : "Pending",
    });
  } catch (error) {
    log(`Error getting receipt: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /tx/nonce/:address
 * Get account nonce for transaction
 */
router.get("/tx/nonce/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const nonce = await handler.getAccountNonce(address);

    res.json({
      address,
      nonce,
      message: "Use this nonce in your next transaction",
    });
  } catch (error) {
    log(`Error getting nonce: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /tx/block/latest
 * Get latest block
 */
router.get("/tx/block/latest", async (req, res) => {
  try {
    const { blockNumber, block } = await handler.getLatestBlock();

    res.json({
      blockNumber: parseInt(blockNumber, 16),
      timestamp: new Date(parseInt(block.timestamp, 16) * 1000),
      transactions: block.transactions.length,
      miner: block.miner,
    });
  } catch (error) {
    log(`Error getting latest block: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export { router };
