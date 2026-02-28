/*const response = await fetch(
  "https://routes.googleapis.com/directions/v2:computeRoutes",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.apiKey,
      "X-Goog-FieldMask": "routes.duration,routes.distanceMeters"
    },
    body: JSON.stringify({
      origin: { address: "1600 Amphitheatre Parkway, Mountain View, CA" },
      destination: { address: "450 Serra Mall, Stanford, CA" }
    })
  }
);

const data = await response.json();
console.log(data);
*/

async function getRoute() {
  const apiKey = process.env.apiKey;

  if (!apiKey) {
    throw new Error("api key is not set.");
  }

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters"
      },
      body: JSON.stringify({
        origin: {
          address: "1600 Amphitheatre Parkway, Mountain View, CA"
        },
        destination: {
          address: "450 Serra Mall, Stanford, CA"
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${errorText}`);
  }

  const data = await response.json();
  console.log(data.routes[0]);
}

// Example usage
getRoute()
  .then(route => {
    console.log("Distance (meters):", route.distanceMeters);
    console.log("Duration:", route.duration);
  })
  .catch(err => console.error(err));