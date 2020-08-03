import { DailyTransferAggregation, MontlyTransferAggregation } from '../../generated/schema';
import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Approval as ApprovalEvent,
  Transfer as TranferEvent,
} from "../../generated/TBTCToken/TBTCToken";
import { Approval, Transfer } from "../../generated/schema";
import { dayMonthYearFromTimestamp } from '../utils/dateCommons';
import { getOrCreateBlock, getOrCreateTransaction } from '../utils/commons';


// Note: If a handler doesn't require existing field values, it is faster
// _not_ to load the entity from the store. Instead, create it fresh with
// `new Entity(...)`, set the fields that should be updated and save the
// entity back to the store. Fields that were not set or unset remain
// unchanged, allowing for partial updates to be applied.

// It is also possible to access smart contracts from mappings. For
// example, the contract that has emitted the event can be connected to
// with:
//
// let contract = Contract.bind(event.address)
//
// The following functions can then be called on this contract to access
// state variables and other data:
//
// - contract.DECIMALS(...)
// - contract.INITIAL_SUPPLY(...)
// - contract.NAME(...)
// - contract.SYMBOL(...)
// - contract.allowance(...)
// - contract.approve(...)
// - contract.approveAndCall(...)
// - contract.balanceOf(...)
// - contract.decimals(...)
// - contract.decreaseAllowance(...)
// - contract.increaseAllowance(...)
// - contract.name(...)
// - contract.symbol(...)
// - contract.totalSupply(...)
// - contract.transfer(...)
// - contract.transferFrom(...)

export function handleApproval(event: ApprovalEvent): void {
  let block = getOrCreateBlock(event);
  let transaction = getOrCreateTransaction(event, block.id, block.timestamp as BigInt);

  let approvalId =
    event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let entity = Approval.load(approvalId);
  if (entity == null) {
    entity = new Approval(approvalId);
    entity.spender = event.params.spender;
    entity.owner = event.params.owner;
    entity.value = event.params.value;
    entity.timestamp = block.timestamp;
    entity.transaction = transaction.id;
    entity.save();
  }
}

export function handleTransfer(event: TranferEvent): void {
  let block = getOrCreateBlock(event);
  let transaction = getOrCreateTransaction(event, block.id, block.timestamp as BigInt);

  let transferId =
    event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let transfer = Transfer.load(transferId);
  if (transfer == null) {
    transfer = new Transfer(transferId);
    transfer.from = event.params.from;
    transfer.to = event.params.to;
    transfer.value = event.params.value.toBigDecimal();
    transfer.timestamp = block.timestamp;
    transfer.transaction = transaction.id;
    transfer.save();
  }

  // Aggregation:
  let dailyTransferDate = dayMonthYearFromTimestamp(transfer.timestamp!);
  
  let dailyTransferAggregate = DailyTransferAggregation.load(dailyTransferDate);
  if (dailyTransferAggregate == null) {
    dailyTransferAggregate = new DailyTransferAggregation(dailyTransferDate);
    dailyTransferAggregate.count = BigInt.fromI32(1);
    dailyTransferAggregate.sum = transfer.value;
    dailyTransferAggregate.timestamp = transfer.timestamp;
  } else {
    dailyTransferAggregate.count = dailyTransferAggregate.count.plus(BigInt.fromI32(1));
    dailyTransferAggregate.sum = dailyTransferAggregate.sum.plus(transfer.value);
  }
  dailyTransferAggregate.save();

  let montlyTransferDate = dayMonthYearFromTimestamp(transfer.timestamp!).slice(0, 7);
  let montlyTransferAggregate = MontlyTransferAggregation.load(montlyTransferDate);
  if (montlyTransferAggregate == null) {
    montlyTransferAggregate = new MontlyTransferAggregation(montlyTransferDate);
    montlyTransferAggregate.count = BigInt.fromI32(1);
    montlyTransferAggregate.sum = transfer.value;
    montlyTransferAggregate.timestamp = transfer.timestamp;
  } else {
    montlyTransferAggregate.count = montlyTransferAggregate.count.plus(BigInt.fromI32(1));
    montlyTransferAggregate.sum = montlyTransferAggregate.sum.plus(transfer.value);
  }
  montlyTransferAggregate.save();
}
