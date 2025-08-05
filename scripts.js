// Password protection
function checkPassword() {
  const pw = document.getElementById('password').value;
  if (pw === 'cllegacy') {
    window.location.href = 'tree.html';
  } else {
    document.getElementById('error').innerText = 'Incorrect password';
  }
}

// Load and render the family tree
window.onload = function () {
  const container = document.getElementById('tree-container');
  if (!container) return;

  fetch('tree.json')
    .then(response => response.json())
    .then(data => {
      const chart = new Treant(data);
    });
};
