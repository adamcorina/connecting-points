const PriorityQueue = require("./priorityQueue");
const { orderByDistance, printMatrix, checkPosition, availableMoves, readFromCSV } = require("./util");

readFromCSV("steps/Step_One.csv", (matrix, coordinates) => {
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
        if (checkPosition(matrix, currNode, availableMove, node, endCoordinatesPosition)) {
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

  function calculateDistances() {
    orderByDistance(coordinates).forEach((point) => {
      const { prev } = djikstraAlgorithm(point[0], point[1][0].join("-"), point[1][1].join("-"));
      reconstructPath(prev, point[0], point[1][0].join("-"), point[1][1].join("-"));
    });
    printMatrix(matrix);
  }

  calculateDistances();
});
