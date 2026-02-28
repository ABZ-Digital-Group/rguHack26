function validateSelection() {
  const checkboxes = document.querySelectorAll('input[name="modes"]');
  const oneChecked = Array.from(checkboxes).some(cb => cb.checked);
  if (!oneChecked) {
    alert("Please select at least one mode of transport.");
    return false;
  }
  return true;
}