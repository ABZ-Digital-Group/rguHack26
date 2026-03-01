function validateSelection() {
  const selectedMode = document.querySelector('input[name="selectedMode"]:checked');
  if (!selectedMode) {
    alert("Please select a route to complete your journey.");
    return false;
  }
  return true;
}