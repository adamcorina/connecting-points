const fs = require("fs");
const parse = require("csv-parse");

const availableMoves = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
  [1, 0],
  [1, -1],
  [0, -1],
];

function readFromCSV(filePath, onReadDone) {
  let rowIndex = -1;
  const matrix = [];
  const coordinates = {};

  fs.createReadStream(filePath)
    .pipe(parse({ delimiter: "," }))
    .on("data", function (row) {
      rowIndex++;
      matrix.push(row);
      row.forEach((element, colIndex) => {
        if (element !== "0") {
          if (!coordinates[element]) {
            coordinates[element] = [];
          }
          coordinates[element].push([rowIndex, colIndex]);
        }
      });
    })
    .on("end", () => onReadDone(matrix, coordinates));
}

function euclideanDistance(x, y) {
  return Math.sqrt(Math.pow(x[0] - y[0], 2) + Math.pow(x[1] - y[1], 2));
}

function orderByDistance(coordinates) {
  const orderedCoordinates = Object.entries(coordinates);
  return orderedCoordinates.sort((point1, point2) => {
    return euclideanDistance(point1[1][0], point1[1][1]) - euclideanDistance(point2[1][0], point2[1][1]);
  });
}

function printMatrix(matrix) {
  matrix.forEach((row) => {
    row.forEach((elem) => {
      process.stdout.write(elem + " ");
    });
    process.stdout.write("\n");
  });
}

function checkPosition(matrix, currentCoordinates, step, currentPoint, finalCoordinates) {
  if (
    matrix[currentCoordinates[0] + step[0]] === undefined ||
    matrix[currentCoordinates[0] + step[0]][currentCoordinates[1] + step[1]] === undefined
  ) {
    return false;
  }
  const positionOccupied = matrix[currentCoordinates[0] + step[0]][currentCoordinates[1] + step[1]];

  let hasCollision = false;
  availableMoves.forEach((move) => {
    if (
      matrix[currentCoordinates[0] + step[0] + move[0]] !== undefined &&
      matrix[currentCoordinates[0] + step[0] + move[0]][currentCoordinates[1] + step[1] + move[1]] !== undefined
    ) {
      const neighbour = matrix[currentCoordinates[0] + step[0] + move[0]][currentCoordinates[1] + step[1] + move[1]];
      if (neighbour !== "0" && neighbour !== currentPoint) {
        hasCollision = true;
      }
    }
  });
  return (
    (positionOccupied === "0" && !hasCollision) ||
    (currentCoordinates[0] + step[0] === finalCoordinates[0] && currentCoordinates[1] + step[1] === finalCoordinates[1])
  );
}

module.exports = {
  orderByDistance,
  printMatrix,
  checkPosition,
  availableMoves,
  readFromCSV,
};
