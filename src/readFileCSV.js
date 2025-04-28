const fs = require('fs');
const readline = require('readline');

function extractRowValues(line, delimiter) {
  if (!line) return [];

  return line
    .trim()
    .split(delimiter)
    .map((item) => item.replaceAll('"', ''));

  // row này để xử lý cho header
  // Raw: "Alice","30","New York"
  // -> after split: ['"Alice', '30', 'New York"']
  // -> After .replaceAll('"', ''): ['Alice', '30', 'New York']
}

function convertToNumber(value) {
  if (value === undefined || value === null || value === '') return value;

  const num = Number(value);
  return isNaN(num) ? value : num;
}

function convertDotNotationToNested(flatObject) {
  if (!flatObject || typeof flatObject !== 'object') return {};

  const nestedResult = {};

  Object.entries(flatObject).forEach(([dotPath, value]) => {
    if (!dotPath) return;

    const propertyPath = dotPath.split('.');
    let currentLevel = nestedResult;

    propertyPath.forEach((property, index, allProperties) => {
      if (!property) return;

      const isLastProperty = index === allProperties.length - 1;

      if (isLastProperty) {
        currentLevel[property] = value;
      } else {
        currentLevel[property] = currentLevel[property] || {};
        currentLevel = currentLevel[property];
      }
    });
  });

  return nestedResult;
}

async function processFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const lineReader = readline.createInterface({ input: fileStream });

  const defaultDelimiter = `","`;
  //   name,age,city
  // "Alice","30","New York"
  // "Bob","28","Los Angeles"

  const parsedRecords = [];
  let columnHeaders = null;
  let lineCount = 0;

  // dùng async await vì:
  // When we use the method createInterface, it creates asynchronous iterator.
  // Each line is read from the file stream as the data arrives, not all at once.
  // Therefore, using await here ensures the next value available asynchronously.
  for await (const line of lineReader) {
    lineCount++;

    try {
      // First line contains headers
      if (!columnHeaders) {
        columnHeaders = extractRowValues(line, defaultDelimiter);
        if (!columnHeaders.length) {
          throw new Error(`No valid headers found in CSV file`);
        }
        continue;
      }

      // Parse data line
      const rowValues = extractRowValues(line, defaultDelimiter); // thay defaultDelimiter = `","`

      // Skip invalid lines
      if (!rowValues || rowValues.length !== columnHeaders.length) {
        continue;
      }

      // Create object from row data
      const flatRowData = {};
      columnHeaders.forEach((header, i) => {
        flatRowData[header] = convertToNumber(rowValues[i]);
      });

      // Transform flat object to nested structure and add to results
      parsedRecords.push(convertDotNotationToNested(flatRowData));
    } catch (error) {
      console.error(`Error processing line ${lineCount}: ${error.message}`);
    }
  }

  return parsedRecords;
}

(async () => {
  try {
    const results = await processFile('./src/airlines.csv');
    console.log(JSON.stringify(results.slice(0, 1), null, 2));
  } catch (error) {
    console.error('Error processing CSV file:', error.message);
  }
})();
