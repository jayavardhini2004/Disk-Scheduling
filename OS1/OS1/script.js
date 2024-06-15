function showAlgorithm() {
    const algorithm = document.getElementById('algorithm').value;
    let description = '';

    switch (algorithm) {
        case 'fcfs':
            description = 'First-Come, First-Served (FCFS) scheduling algorithm.';
            break;
        case 'sstf':
            description = 'Shortest Seek Time First (SSTF) scheduling algorithm.';
            break;
        case 'scan':
            description = 'SCAN scheduling algorithm.';
            break;
        case 'cscan':
            description = 'Circular SCAN (C-SCAN) scheduling algorithm.';
            break;
        case 'look':
            description = 'LOOK scheduling algorithm.';
            break;
        case 'clook':
            description = 'Circular LOOK (C-LOOK) scheduling algorithm.';
            break;
    }

    document.getElementById('algorithm-description').innerText = description;
}

function simulate(event) {
    event.preventDefault();

    const algorithm = document.getElementById('algorithm').value;
    const requestsInput = document.getElementById('requests').value;
    const headInput = document.getElementById('head').value;
    const previousHeadInput = document.getElementById('previous-head').value;
    const diskSizeInput = document.getElementById('disk-size').value;
    



    // Convert requests to an array of numbers
    const requests = requestsInput.split(',').map(Number);
    const head = Number(headInput);
    const previousHead = Number(previousHeadInput);
    const diskSize = Number(diskSizeInput);

    let result;
    let movements = [];

    switch (algorithm) {
        case 'fcfs':
            result = fcfs(requests, head, movements);
            break;
        case 'scan':
            result = scan(requests, head, movements, diskSize,previousHead);
            break;
        case 'cscan':
            result = cscan(requests, head, movements, diskSize,previousHead);
            break;
        case 'look':
            result = look(requests, head, movements, diskSize,previousHead);
            break;
        case 'clook':
            result = clook(requests, head, movements, diskSize,previousHead);
            break;
        case 'sstf':
        default:
            result = sstf(requests, head, movements, diskSize);
            break;
    }

    // Display simulation results
    const simulationResult = document.getElementById('simulation-result');
    simulationResult.innerHTML = `<h2>Simulation Results</h2>`;
    simulationResult.innerHTML += `Total head movement: ${result} cylinders<br><br>`;
    simulationResult.innerHTML += `Movements: ${movements.join(' -> ')}`;
}

function fcfs(requests, head, movements) {
    let totalMovement = 0;
    let currentPosition = head;
    movements.push(currentPosition);

    for (let request of requests) {
        totalMovement += Math.abs(currentPosition - request);
        currentPosition = request;
        movements.push(currentPosition);
    }

    return totalMovement;
}

function sstf(requests, head, movements, diskSize) {
    let totalMovement = 0;
    let currentPosition = head;
    movements.push(currentPosition);

    // Create a copy of requests array
    let remainingRequests = [...requests];

    while (remainingRequests.length > 0) {
        // Find closest request to current position
        let shortestDistance = Math.abs(currentPosition - remainingRequests[0]);
        let closestIndex = 0;

        for (let i = 1; i < remainingRequests.length; i++) {
            let distance = Math.abs(currentPosition - remainingRequests[i]);
            if (distance < shortestDistance) {
                shortestDistance = distance;
                closestIndex = i;
            }
        }

        // Add movement to total and update current position
        totalMovement += shortestDistance;
        currentPosition = remainingRequests[closestIndex];
        movements.push(currentPosition);

        // Remove serviced request from remaining requests
        remainingRequests.splice(closestIndex, 1);
    }

    return totalMovement;
}

function scan(requests, head, movements, diskSize, previousHead) {
    let totalMovement = 0;
    let currentPosition = head;
    movements.push(currentPosition);

    const sortedRequests = requests.slice().sort((a, b) => a - b);

    let direction = (head >= previousHead) ? 1 : -1;

    if (direction === 1) {
        let rightRequests = sortedRequests.filter(req => req >= head);
        rightRequests.sort((a, b) => a - b);
        for (let i = 0; i < rightRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - rightRequests[i]);
            currentPosition = rightRequests[i];
            movements.push(currentPosition);
        }
        totalMovement += Math.abs(currentPosition - diskSize);
        currentPosition = diskSize;
        movements.push(currentPosition);
        let leftRequests = sortedRequests.filter(req => req < head);
        leftRequests.sort((a, b) => b - a);
        for (let i = 0; i < leftRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - leftRequests[i]);
            currentPosition = leftRequests[i];
            movements.push(currentPosition);
        }
    } else {
        let leftRequests = sortedRequests.filter(req => req <= head);
        leftRequests.sort((a, b) => b - a);
        for (let i = 0; i < leftRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - leftRequests[i]);
            currentPosition = leftRequests[i];
            movements.push(currentPosition);
        }
        totalMovement += Math.abs(currentPosition - 0);
        currentPosition = 0;
        movements.push(currentPosition);
        let rightRequests = sortedRequests.filter(req => req > head);
        rightRequests.sort((a, b) => a - b);
        for (let i = 0; i < rightRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - rightRequests[i]);
            currentPosition = rightRequests[i];
            movements.push(currentPosition);
        }
    }

    return totalMovement;
}

function cscan(requests, head, movements, diskSize, previousHead) {
    let totalMovement = 0;
    let currentPosition = head;
    movements.push(currentPosition);

    // Sort requests in ascending order
    const sortedRequests = requests.slice().sort((a, b) => a - b);

    // Determine the direction based on previous head position
    let direction = (head >= previousHead) ? 1 : -1;

    if (direction === 1) {
        // Move right
        let rightRequests = sortedRequests.filter(req => req >= head);
        rightRequests.sort((a, b) => a - b);
        for (let i = 0; i < rightRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - rightRequests[i]);
            currentPosition = rightRequests[i];
            movements.push(currentPosition);
        }
        // Move to end and then to start
        totalMovement += Math.abs(currentPosition - diskSize);
        currentPosition = diskSize;
        movements.push(currentPosition);
        totalMovement += diskSize; // Move to start of the disk
        currentPosition = 0;
        movements.push(currentPosition);
        // Move right again to satisfy remaining requests
        for (let i = 0; i < sortedRequests.length; i++) {
            if (sortedRequests[i] < head) {
                totalMovement += Math.abs(currentPosition - sortedRequests[i]);
                currentPosition = sortedRequests[i];
                movements.push(currentPosition);
            }
        }
    } else {
        // Move left
        let leftRequests = sortedRequests.filter(req => req <= head);
        leftRequests.sort((a, b) => b - a);
        for (let i = 0; i < leftRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - leftRequests[i]);
            currentPosition = leftRequests[i];
            movements.push(currentPosition);
        }
        // Move to start and then to end
        totalMovement += Math.abs(currentPosition - 0);
        currentPosition = 0;
        movements.push(currentPosition);
        totalMovement += diskSize; // Move to end of the disk
        currentPosition = diskSize;
        movements.push(currentPosition);
        // Move left again to satisfy remaining requests
        for (let i = sortedRequests.length - 1; i >= 0; i--) {
            if (sortedRequests[i] > head) {
                totalMovement += Math.abs(currentPosition - sortedRequests[i]);
                currentPosition = sortedRequests[i];
                movements.push(currentPosition);
            }
        }
    }

    return totalMovement;
}

function look(requests, head, movements, diskSize, previousHead) {
    let totalMovement = 0;
    let currentPosition = head;
    movements.push(currentPosition);

    // Sort requests in ascending order
    const sortedRequests = requests.slice().sort((a, b) => a - b);

    // Determine the direction based on previous head position
    let direction = (head >= previousHead) ? 1 : -1;

    if (direction === 1) {
        // Move right
        let rightRequests = sortedRequests.filter(req => req >= head);
        rightRequests.sort((a, b) => a - b);
        for (let i = 0; i < rightRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - rightRequests[i]);
            currentPosition = rightRequests[i];
            movements.push(currentPosition);
        }
        // Move left to satisfy remaining requests
        let leftRequests = sortedRequests.filter(req => req < head);
        leftRequests.sort((a, b) => b - a);
        for (let i = 0; i < leftRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - leftRequests[i]);
            currentPosition = leftRequests[i];
            movements.push(currentPosition);
        }
    } else {
        // Move left
        let leftRequests = sortedRequests.filter(req => req <= head);
        leftRequests.sort((a, b) => b - a);
        for (let i = 0; i < leftRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - leftRequests[i]);
            currentPosition = leftRequests[i];
            movements.push(currentPosition);
        }
        // Move right to satisfy remaining requests
        let rightRequests = sortedRequests.filter(req => req > head);
        rightRequests.sort((a, b) => a - b);
        for (let i = 0; i < rightRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - rightRequests[i]);
            currentPosition = rightRequests[i];
            movements.push(currentPosition);
        }
    }

    return totalMovement;
}

function clook(requests, head, movements, diskSize, previousHead) {
    let totalMovement = 0;
    let currentPosition = head;
    movements.push(currentPosition);

    // Sort requests in ascending order
    const sortedRequests = requests.slice().sort((a, b) => a - b);

    // Determine the direction based on previous head position
    let direction = (head >= previousHead) ? 1 : -1;

    if (direction === 1) {
        // Move right
        let rightRequests = sortedRequests.filter(req => req >= head);
        rightRequests.sort((a, b) => a - b);
        for (let i = 0; i < rightRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - rightRequests[i]);
            currentPosition = rightRequests[i];
            movements.push(currentPosition);
        }
        // Move to the beginning of the requests list and continue moving right
        for (let i = 0; i < sortedRequests.length; i++) {
            if (sortedRequests[i] < head) {
                totalMovement += Math.abs(currentPosition - sortedRequests[i]);
                currentPosition = sortedRequests[i];
                movements.push(currentPosition);
            }
        }
    } else {
        // Move left
        let leftRequests = sortedRequests.filter(req => req <= head);
        leftRequests.sort((a, b) => b - a);
        for (let i = 0; i < leftRequests.length; i++) {
            totalMovement += Math.abs(currentPosition - leftRequests[i]);
            currentPosition = leftRequests[i];
            movements.push(currentPosition);
        }
        // Move to the end of the requests list and continue moving left
        for (let i = sortedRequests.length - 1; i >= 0; i--) {
            if (sortedRequests[i] >head) {
                totalMovement += Math.abs(currentPosition - sortedRequests[i]);
                currentPosition = sortedRequests[i];
                movements.push(currentPosition);
                }
            }
        }
        return totalMovement;
    }
