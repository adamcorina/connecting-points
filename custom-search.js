const { orderByDistance, printMatrix, checkPosition, availableMoves, readFromCSV } = require("./util");

readFromCSV("steps/Step_One.csv", (matrix, coordinates) => {
  function checkIfDone(currentCoordinates, finalCoordinates) {
    return currentCoordinates[0] === finalCoordinates[0] && currentCoordinates[1] === finalCoordinates[1];
  }

  function optimalOyMove(currentCoordinates, finalCoordinates) {
    return currentCoordinates[0] - finalCoordinates[0] > 0
      ? -1
      : currentCoordinates[0] - finalCoordinates[0] < 0
      ? 1
      : 0;
  }

  function optimalOxMove(currentCoordinates, finalCoordinates) {
    return currentCoordinates[1] - finalCoordinates[1] > 0
      ? -1
      : currentCoordinates[1] - finalCoordinates[1] < 0
      ? 1
      : 0;
  }

  function getMoveIndex(move) {
    let moveIndex = -1;
    availableMoves.forEach((availableMove, index) => {
      if (move[0] === availableMove[0] && move[1] === availableMove[1]) {
        moveIndex = index;
      }
    });
    return moveIndex;
  }

  function getNewCoordinates(currentCoordinates, move) {
    return [currentCoordinates[0] + move[0], currentCoordinates[1] + move[1]];
  }

  function searchAlternative(moveIndex, currentCoordinates, currentPoint, finalCoordinates, steps) {
    let validMove = null;
    let currentShifting = 1;
    let validMoveIndex = moveIndex;
    do {
      for (let i = validMoveIndex + currentShifting; i < availableMoves.length && validMove === null; i++) {
        if (checkPosition(matrix, currentCoordinates, availableMoves[i], currentPoint, finalCoordinates)) {
          validMove = [...availableMoves[i]];
        } else {
          currentShifting++;
        }
      }
      for (
        let i = (validMoveIndex + currentShifting) % availableMoves.length;
        i < validMoveIndex && validMove === null;
        i++
      ) {
        if (checkPosition(matrix, currentCoordinates, availableMoves[i], currentPoint, finalCoordinates)) {
          validMove = [...availableMoves[i]];
        } else {
          currentShifting++;
        }
      }
      if (validMove === null) {
        const moveToUndo = steps[steps.length - 1].move;
        currentShifting = steps[steps.length - 1].shift + 1;
        validMoveIndex = steps[steps.length - 1].moveIndex;
        steps.pop();

        matrix[currentCoordinates[0]][currentCoordinates[1]] = "0";
        currentCoordinates = [currentCoordinates[0] - moveToUndo[0], currentCoordinates[1] - moveToUndo[1]];
      }
    } while (
      validMove === null &&
      (steps.length !== 0 || (steps.length === 0 && currentShifting < availableMoves.length))
    );
    return { validMove, validMoveIndex, currentShifting, newCoordinates: currentCoordinates };
  }

  function parseMatrix() {
    orderByDistance(coordinates).forEach((point) => {
      const coordinate = point[1];
      const steps = [];
      let currentCoordinates = coordinate[0];
      const finalCoordinates = coordinate[1];

      do {
        const oyMove = optimalOyMove(currentCoordinates, finalCoordinates);
        const oxMove = optimalOxMove(currentCoordinates, finalCoordinates);
        const move = [oyMove, oxMove];
        const moveIndex = getMoveIndex(move);
        if (checkPosition(matrix, currentCoordinates, move, point[0], finalCoordinates)) {
          steps.push({ move: move, moveIndex: moveIndex, shift: 0 });
          currentCoordinates = getNewCoordinates(currentCoordinates, move);
          matrix[currentCoordinates[0]][currentCoordinates[1]] = point[0];
        } else {
          const { validMove, validMoveIndex, currentShifting, newCoordinates } = searchAlternative(
            moveIndex,
            currentCoordinates,
            point[0],
            finalCoordinates,
            steps
          );
          if (validMove === null && steps.length === 0) {
            break;
          } else {
            steps.push({
              move: validMove,
              moveIndex: validMoveIndex,
              shift: currentShifting,
            });
            currentCoordinates = getNewCoordinates(newCoordinates, validMove);
            matrix[currentCoordinates[0]][currentCoordinates[1]] = point[0];
          }
        }
      } while (!checkIfDone(currentCoordinates, finalCoordinates) && steps.length !== 0);
    });
    printMatrix(matrix);
  }

  parseMatrix();
});
