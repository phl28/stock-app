export function convertUnixTimestampToDate(unixTimestamp: number) {
    const date = new Date(unixTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * This function is used to check if a percentage is valid, a percentage is valid if it is between 0 and 1 when allowOverHundred is false
 * @param percentage 
 * @param allowNeg 
 * @param allowOverHundred 
 * @returns 
 */
export function checkPercentage(percentage: number, allowNeg: boolean = false, allowOverHundred: boolean = false) {
  let valid = true;
  if (!allowNeg && percentage < 0) {
    valid = false;
  }
  if (!allowOverHundred && Math.abs(percentage) > 1) {
    valid = false;
  }
  return valid;
}