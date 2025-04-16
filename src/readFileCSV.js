/**
 * CSV Parser - Reads and transforms CSV data into structured objects
 */
const fs = require('fs');
const readline = require('readline');

/**
 * Split CSV line into array of values and clean them
 * @param {string} line - The CSV line to split
 * @param {string} delimiter - The delimiter used in the CSV
 * @returns {string[]} Array of cleaned values
 */
function splitCsvLine(line, delimiter) {
  if (!line) return [];

  return line
    .trim()
    .split(delimiter)
    .map((item) => item.replaceAll('"', ''));
}

/**
 * Convert string to number when possible, otherwise keep as string
 * @param {string} value - The value to convert
 * @returns {number|string} Converted value
 */
function convertToNumber(value) {
  if (value === undefined || value === null || value === '') return value;

  const num = Number(value);
  return isNaN(num) ? value : num;
}

/**
 * Transform flat objects with dot notation (e.g., 'a.b.c') into nested objects
 * @param {Object} flatObject - Object with dot notation keys
 * @returns {Object} Nested object structure
 */
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

/**
 * Read and parse CSV file into structured objects
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} Array of parsed records
 */
async function processFile(filePath) {
  const delimiter = ',';

  const fileStream = fs.createReadStream(filePath);
  const lineReader = readline.createInterface({ input: fileStream });

  const parsedRecords = [];
  let columnHeaders = null;
  let lineCount = 0;

  for await (const line of lineReader) {
    lineCount++;

    try {
      // First line contains headers
      if (!columnHeaders) {
        columnHeaders = splitCsvLine(line, delimiter);
        if (!columnHeaders.length) {
          throw new Error(`No valid headers found in CSV file`);
        }
        continue;
      }

      // Parse data line
      const rowValues = splitCsvLine(line, `","`);

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
    const airlines = await processFile('./src/airlines.csv');
    console.log(JSON.stringify(airlines.slice(0, 1), null, 2));
  } catch (error) {
    console.error('Error processing CSV file:', error.message);
  }
})();
