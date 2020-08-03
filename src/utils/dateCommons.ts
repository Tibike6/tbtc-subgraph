import { BigInt } from "@graphprotocol/graph-ts";

// Ported from http://howardhinnant.github.io/date_algorithms.html#civil_from_days
export function dayMonthYearFromTimestamp(unixEpoch: BigInt): string {

  let SECONDS_IN_DAY =  BigInt.fromI32(86400);
  let ZERO =  BigInt.fromI32(0);
  let ONE =  BigInt.fromI32(1);

  let daysSinceEpochStart = unixEpoch.div(SECONDS_IN_DAY);
  daysSinceEpochStart = daysSinceEpochStart.plus(BigInt.fromI32(719468));
  
  let era: BigInt = (daysSinceEpochStart >= ZERO ? daysSinceEpochStart : daysSinceEpochStart - BigInt.fromI32(146096)) / BigInt.fromI32(146097);
  let dayOfEra: BigInt = (daysSinceEpochStart - era * BigInt.fromI32(146097));                                                                                  // [0, 146096]
  let yearOfEra: BigInt = (dayOfEra - dayOfEra/BigInt.fromI32(1460) + dayOfEra/BigInt.fromI32(36524) - dayOfEra/BigInt.fromI32(146096)) / BigInt.fromI32(365);  // [0, 399]
  
  let year: BigInt = yearOfEra + (era * BigInt.fromI32(400));
  let dayOfYear: BigInt = dayOfEra - (BigInt.fromI32(365)*yearOfEra + yearOfEra/BigInt.fromI32(4) - yearOfEra/BigInt.fromI32(100));                             // [0, 365]
  let monthZeroIndexed = (BigInt.fromI32(5)*dayOfYear + BigInt.fromI32(2))/BigInt.fromI32(153);                                                                 // [0, 11]
  let day = dayOfYear - (BigInt.fromI32(153)*monthZeroIndexed+BigInt.fromI32(2))/BigInt.fromI32(5) + BigInt.fromI32(1);                                         // [1, 31]
  let month = monthZeroIndexed + (monthZeroIndexed < BigInt.fromI32(10) ? BigInt.fromI32(3) : BigInt.fromI32(-9));                                              // [1, 12]

  year = month <= BigInt.fromI32(2) ? year + ONE : year;
  let monthAsString = ('0'.concat(month.toString())).slice(-2);
  let dayAsString = ('0'.concat(day.toString())).slice(-2);

  return year.toString() + "-" + monthAsString + "-" + dayAsString;
}