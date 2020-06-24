module.exports.getDateRange = (inDateRange) => {
  const nDate = new Date()
  const endDateMSec = nDate.getTime() - 24 * 60 * 60 * 1000
  const startDateMSec = endDateMSec - inDateRange * 24 * 60 * 60 * 1000
  return [getDateStr(startDateMSec), getDateStr(endDateMSec)]
}

module.exports.getDateStrFromDate = (inDate) => {
  if (!inDate) return '0000-00-00'
  return getDateStr(inDate.getTime())
}

module.exports.getYesterdayDateStr = () => {
  const nDate = new Date()
  const yDateMSec = nDate.getTime() - 24 * 60 * 60 * 1000
  return getDateStr(yDateMSec)
}

const getDateStr = (inUnixDateTime) => {
  const d = new Date(inUnixDateTime)
  const myYear = d.getFullYear()
  const myMonth = d.getMonth() + 1
  const myDate = d.getDate()
  return String(myYear) + '-' + zeroPadding(myMonth, 2) + '-' + zeroPadding(myDate, 2)
}

const zeroPadding = (inNum, inDigitsNum) => {
  let num
  if (!inNum) {
    num = 0
  } else {
    num = Number(inNum)
  }
  let zeroString = ''
  for (let i = 0; i < inDigitsNum; i++) {
    zeroString += '0'
  }
  return (zeroString + String(num)).slice(-1 * inDigitsNum)
}
