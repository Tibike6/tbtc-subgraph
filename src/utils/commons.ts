import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Block, Transaction } from "../../generated/schema";

export function getOrCreateBlock(event: ethereum.Event): Block {
  let block = Block.load(event.block.hash.toHex());
  if (block == null) {
    block = new Block(event.block.hash.toHex());
    block.hash = event.block.hash;
    block.parentHash = event.block.parentHash;
    block.unclesHash = event.block.unclesHash;
    block.author = event.block.author;
    block.stateRoot = event.block.stateRoot;
    block.transactionsRoot = event.block.transactionsRoot;
    block.number = event.block.number;
    block.gasUsed = event.block.gasUsed;
    block.gasLimit = event.block.gasLimit;
    block.timestamp = event.block.timestamp;
    block.difficulty = event.block.difficulty;
    block.totalDifficulty = event.block.totalDifficulty;
    block.size = event.block.size;
    block.save();
  }
  return block as Block;
}

export function getOrCreateTransaction(
  event: ethereum.Event,
  blockId: string,
  timestamp: BigInt,
): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHex());
  if (transaction == null) {
    transaction = new Transaction(event.transaction.hash.toHex());
    transaction.block = blockId;
    transaction.timestamp = timestamp;
    transaction.hash = event.transaction.hash;
    transaction.index = event.transaction.index;
    transaction.from = event.transaction.from;
    transaction.to = event.transaction.to;
    transaction.value = event.transaction.value;
    transaction.gasUsed = event.transaction.gasUsed;
    transaction.gasPrice = event.transaction.gasPrice;
    // transaction.input = event.transaction.input; ERROR => BUG?
    transaction.save();
  }
  return transaction as Transaction;
}