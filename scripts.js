// Create a 30x45 grid
const gridContainer = document.getElementById('grid');
const gridRows = 30; // Define the number of rows
const gridCols = 45; // Define the number of columns

// Data structure to represent the grid
let grid = [];

// Function to create the grid
function createGrid() {
    for (let row = 0; row < gridRows; row++) {
        const gridRow = [];
        for (let col = 0; col < gridCols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('mousedown', handleCellMouseDown); // Add mousedown event to each cell
            cell.addEventListener('mousemove', handleCellMouseMove); // Add mousemove event to each cell
            cell.addEventListener('mouseup', handleCellMouseUp); // Add mouseup event to each cell
            gridContainer.appendChild(cell);

            // Initialize grid node
            gridRow.push({
                row,
                col,
                isStart: false,
                isEnd: false,
                isWall: false,
                distance: Infinity,
                heuristic: 0,
                previousNode: null,
                isVisited: false // Added to track if the node has been visited
            });
        }
        grid.push(gridRow);
    }
    console.log('Grid created:', grid); // Debug log
}

// Variables to store the start and end nodes
let startNode = null;
let endNode = null;

// Variable to keep track of the active toggle button
let activeButton = null;

// Variable to track if the mouse is being dragged
let isDragging = false;

// Function to handle button toggling
function handleButtonClick(event) {
    // Deactivate all buttons
    document.querySelectorAll('.control-panel button').forEach(button => {
        button.classList.remove('active');
    });

    // Activate the clicked button
    event.target.classList.add('active');

    // Set the active button
    activeButton = event.target.id;
    console.log('Active button:', activeButton); // Debug log
}

function handleCellMouseDown(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    isDragging = true;

    // Clear the shortest path when grid is modified
    clearShortestPath();

    if (activeButton === 'start-node') {
        if (startNode) {
            // Remove the existing start node
            grid[startNode.row][startNode.col].isStart = false;
            document.querySelector(`[data-row="${startNode.row}"][data-col="${startNode.col}"]`).classList.remove('start');
        }
        // Set the new start node
        cell.classList.add('start');
        grid[row][col].isStart = true;
        startNode = { row, col };
        console.log('Start node set:', startNode); // Debug log
    } else if (activeButton === 'end-node') {
        if (endNode) {
            // Remove the existing end node
            grid[endNode.row][endNode.col].isEnd = false;
            document.querySelector(`[data-row="${endNode.row}"][data-col="${endNode.col}"]`).classList.remove('end');
        }
        // Set the new end node
        cell.classList.add('end');
        grid[row][col].isEnd = true;
        endNode = { row, col };
        console.log('End node set:', endNode); // Debug log
    } else if (activeButton === 'wall') {
        // Toggle the wall
        cell.classList.add('weighted');
        grid[row][col].isWall = true;
        console.log(`Wall set at (${row}, ${col})`); // Debug log
    }
}




// Function to handle cell mousemove events
function handleCellMouseMove(event) {
    if (!isDragging) return; // Only process if dragging

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (activeButton === 'wall') {
        // Continue placing walls while dragging
        cell.classList.add('weighted');
        grid[row][col].isWall = true;
    }
}

// Function to handle cell mouseup events
function handleCellMouseUp() {
    isDragging = false;
}

function clearGrid() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('start', 'end', 'weighted', 'shortest-path');
    });
    grid.forEach(row => {
        row.forEach(node => {
            node.isStart = false;
            node.isEnd = false;
            node.isWall = false;
            node.distance = Infinity;
            node.heuristic = 0;
            node.previousNode = null;
            node.isVisited = false; // Reset isVisited flag
        });
    });
    startNode = null;
    endNode = null;
    activeButton = null;
    document.querySelectorAll('.control-panel button').forEach(button => {
        button.classList.remove('active');
    });
    console.log('Grid cleared'); // Debug log
}


// Dijkstra's algorithm implementation
function dijkstra(startNode, endNode) {
    const unvisitedNodes = getAllNodes(grid);
    startNode.distance = 0;
    console.log('Starting Dijkstra\'s algorithm'); // Debug log

    while (unvisitedNodes.length) {
        sortNodesByDistance(unvisitedNodes);
        const closestNode = unvisitedNodes.shift();

        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return;

        closestNode.isVisited = true;

        if (closestNode === endNode) {
            console.log('End node reached in Dijkstra\'s algorithm'); // Debug log
            return;
        }

        updateUnvisitedNeighbors(closestNode, grid);
    }
}

// Helper functions for Dijkstra's algorithm
function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
        for (const node of row) {
            nodes.push(node);
        }
    }
    return nodes;
}

function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
        neighbor.distance = node.distance + 1;
        neighbor.previousNode = node;
    }
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { row, col } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
}

function visualizeDijkstra() {
    console.log('Visualizing Dijkstra\'s algorithm'); // Debug log
    dijkstra(grid[startNode.row][startNode.col], grid[endNode.row][endNode.col]);
    let currentNode = grid[endNode.row][endNode.col];
    let path = [];

    // Collect the path nodes in an array
    while (currentNode !== null) {
        path.push(currentNode);
        currentNode = currentNode.previousNode;
    }

    // Reverse the path array to start from the start node
    path.reverse();

    // Function to update the cell with a delay
    function updateCellWithDelay(i) {
        if (i < path.length) {
            const node = path[i];
            console.log('Updating cell:', node); // Debug log
            document.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`).classList.add('shortest-path');
            setTimeout(() => updateCellWithDelay(i + 1), 100); // Delay of 100ms between each cell
        }
    }

    // Start the sequential update
    updateCellWithDelay(0);
}

// A* algorithm implementation
function aStar(startNode, endNode) {
    const openSet = [];
    startNode.distance = 0;
    startNode.heuristic = heuristic(startNode, endNode);
    openSet.push(startNode);
    console.log('Starting A* algorithm'); // Debug log

    while (openSet.length) {
        sortNodesByHeuristic(openSet);
        const currentNode = openSet.shift();

        if (currentNode.isWall) continue;
        if (currentNode === endNode) {
            console.log('End node reached in A* algorithm'); // Debug log
            return;
        }

        currentNode.isVisited = true;

        const neighbors = getUnvisitedNeighbors(currentNode, grid);
        for (const neighbor of neighbors) {
            const tentativeDistance = currentNode.distance + 1;
            if (tentativeDistance < neighbor.distance) {
                neighbor.distance = tentativeDistance;
                neighbor.heuristic = neighbor.distance + heuristic(neighbor, endNode);
                neighbor.previousNode = currentNode;
                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                }
            }
        }
    }
}

// Helper functions for A* algorithm
function heuristic(nodeA, nodeB) {
    const dx = Math.abs(nodeA.row - nodeB.row);
    const dy = Math.abs(nodeA.col - nodeB.col);
    return dx + dy;
}

function sortNodesByHeuristic(openSet) {
    openSet.sort((nodeA, nodeB) => nodeA.heuristic - nodeB.heuristic);
}

function visualizeAStar() {
    console.log('Visualizing A* algorithm'); // Debug log
    aStar(grid[startNode.row][startNode.col], grid[endNode.row][endNode.col]);
    let currentNode = grid[endNode.row][endNode.col];
    let path = [];

    // Collect the path nodes in an array
    while (currentNode !== null) {
        path.push(currentNode);
        currentNode = currentNode.previousNode;
    }

    // Reverse the path array to start from the start node
    path.reverse();

    // Function to update the cell with a delay
    function updateCellWithDelay(i) {
        if (i < path.length) {
            const node = path[i];
            console.log('Updating cell:', node); // Debug log
            document.querySelector(`[data-row="${node.row}"][data-col="${node.col}"]`).classList.add('shortest-path');
            setTimeout(() => updateCellWithDelay(i + 1), 100); // Delay of 100ms between each cell
        }
    }

    // Start the sequential update
    updateCellWithDelay(0);
}

document.getElementById('start').addEventListener('click', () => {
    console.log('Start button clicked'); // Debug log
    const selectedAlgorithm = document.getElementById('algorithm').value;
    console.log('Selected algorithm:', selectedAlgorithm); // Debug log

    // Reset the grid before running the algorithm
    resetGrid();

    if (selectedAlgorithm === 'dijkstra') {
        visualizeDijkstra();
    } else if (selectedAlgorithm === 'a-star') {
        visualizeAStar();
    }
});

// Function to clear the shortest path visualization
function clearShortestPath() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('shortest-path');
    });
}

// Function to reset the grid, retaining walls but resetting distances, heuristics, and previous nodes
function resetGrid() {
    grid.forEach(row => {
        row.forEach(node => {
            node.distance = Infinity;
            node.heuristic = 0;
            node.previousNode = null;
            node.isVisited = false; // Reset isVisited flag
        });
    });
}

document.getElementById('start-node').addEventListener('click', handleButtonClick);
document.getElementById('end-node').addEventListener('click', handleButtonClick);
document.getElementById('wall').addEventListener('click', handleButtonClick);
document.getElementById('clear').addEventListener('click', clearGrid);

// Create the grid when the page loads
window.onload = createGrid;




