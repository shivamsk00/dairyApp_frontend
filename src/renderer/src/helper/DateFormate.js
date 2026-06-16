const DateFormate = (dateStr) => {
  const [yyyy, mm, dd] = dateStr.split('-')
  return `${dd}-${mm}-${yyyy}`
}


export default DateFormate