// Array to store transport logs
const transportLogs = [];

// Get user input
const method = prompt("Enter transport method: ");
const distance = parseFloat(prompt("Enter distnace travelled in km: "));

// Validate input
if (method && !isNaN(distance) && distance > 0){
    const entry = {
        method: method.toLowerCase(),
        distanceKM: distance,
        date: new Date().toISOString()
    };

    transportLogs.push(entry);

    console.log("Trasnport entry logged: ");
    console.log(entry);
}
else{
    console.log("Invalid input. please enter a valid travel method");
}