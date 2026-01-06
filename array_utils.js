export function chunk (values = [], chunkSize = 4) {
  let i, j, newArray = [], chunk = chunkSize

  for (i=0, j=values.length; i<j; i+=chunk) {
    newArray.push(values.slice(i, i+chunk))
  }

  return newArray
}