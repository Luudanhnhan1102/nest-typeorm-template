const fs = require('fs');
const readline = require('readline');

function formatLine(line, delimiter) {
  return line
    ?.trim()
    ?.split(delimiter)
    ?.map((header) => header.replaceAll('"', ''));
}

function castNumber(value) {
  let castedValue = Number(value);
  if (isNaN(castedValue)) {
    return value;
  }
  return castedValue;
}

function flattenToNested(flattenObject) {
  // console.log(sample);
  const allFlattenKeys = Object.keys(flattenObject);
  const nestedObject = {};
  for (const flattenKeys of allFlattenKeys) {
    const properties = flattenKeys.split('.');
    let currentHandlingObject = nestedObject;
    for (const [index, property] of properties.entries()) {
      if (index === properties.length - 1) {
        currentHandlingObject[property] = flattenObject[flattenKeys];
        continue;
      }
      if (!currentHandlingObject[property]) {
        currentHandlingObject[property] = {};
      }
      currentHandlingObject = currentHandlingObject[property];
    }
  }
  // console.log(nestedObject);
  return nestedObject;
}

async function readCsv(path) {
  const delimiter = ',';
  const readableStream = fs.createReadStream(path);
  const lineReader = readline.createInterface({
    input: readableStream,
  });

  let count = 1;
  let headers = null;
  const airlines = [];
  for await (const line of lineReader) {
    if (!headers) {
      headers = formatLine(line, delimiter);
      continue;
    }
    if (headers && count !== 0) {
      const rawLine = formatLine(line, `","`);
      const row = {};
      for (const [index, header] of headers.entries()) {
        const formatedValue = castNumber(rawLine[index]);
        row[header] = formatedValue;
      }
      airlines.push(flattenToNested(row));
    }
  }
  console.log(JSON.stringify(airlines.slice(0, 1), null, 2));
}

(async () => {
  await readCsv('./src/airlines.csv');
})();
