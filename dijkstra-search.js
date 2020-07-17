const fs = require("fs");
const parse = require("csv-parse");
const PriorityQueue = require("./priorityQueue");

const matrix = [];
const coordinates = {};
let rowIndex = -1;

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

fs.createReadStream("steps/Step_One.csv")
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
  .on("end", calculateDistances);

function checkPosition(currentCoordinates, step, currentPoint, finalCoordinates) {
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

function djikstraAlgorithm(node, startCoordinates, endCoordinates) {
  let distances = {};
  let endCoordinatesPosition = endCoordinates.split("-").map((el) => Number.parseInt(el));

  let prev = {};
  let pq = new PriorityQueue(matrix.length * matrix[0].length);

  distances[startCoordinates] = 0;
  pq.enqueue(startCoordinates, 0);
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (`${i}-${j}` !== startCoordinates) {
        distances[`${i}-${j}`] = Infinity;
      }
      prev[`${i}-${j}`] = null;
    }
  }

  found = false;
  while (!pq.isEmpty() && found === false) {
    let minNode = pq.dequeue();
    let currNode = minNode.element.split("-").map((el) => Number.parseInt(el));
    availableMoves.forEach((availableMove) => {
      if (checkPosition(currNode, availableMove, node, endCoordinatesPosition)) {
        const neighbor = `${currNode[0] + availableMove[0]}-${currNode[1] + availableMove[1]}`;
        let alt = distances[minNode.element] + 1;
        if (neighbor === endCoordinates) {
          found = true;
        }
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          prev[neighbor] = minNode.element;
          pq.enqueue(neighbor, distances[neighbor]);
        }
      }
    });
  }
  return { distances, prev };
}

function reconstructPath(prev, point, source, destination) {
  let currentPos = destination;
  if (prev[currentPos] !== null || currentPos === source) {
    while (currentPos !== null) {
      currentPosCoordinates = currentPos.split("-").map((el) => Number.parseInt(el));
      matrix[currentPosCoordinates[0]][currentPosCoordinates[1]] = point;
      currentPos = prev[currentPos];
    }
  }
}

function euclideanDistance(x, y){
  return Math.sqrt(Math.pow(x[0]-y[0], 2) + Math.pow(x[1]-y[1], 2))
}

function orderByDistance(coordinates) {
   const orderedCoordinates = Object.entries(coordinates)
   return orderedCoordinates.sort((point1, point2)=> {
     return euclideanDistance(point1[1][0], point1[1][1]) - euclideanDistance(point2[1][0], point2[1][1])
   })
}

function calculateDistances() {
  orderByDistance(coordinates).forEach((point) => {
    const { prev } = djikstraAlgorithm(point[0], point[1][0].join("-"), point[1][1].join("-"));
    reconstructPath(prev, point[0], point[1][0].join("-"), point[1][1].join("-"));
  });
  printMatrix();
}

function printMatrix() {
  matrix.forEach((row) => {
    row.forEach((elem) => {
      process.stdout.write(elem + " ");
    });
    process.stdout.write("\n");
  });
}
