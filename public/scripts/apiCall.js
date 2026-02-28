const response = await fetch(
  "https://routes.googleapis.com/directions/v2:computeRoutes",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_MAPS_API_KEY,
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