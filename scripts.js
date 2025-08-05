// Password protection
function checkPassword() {
  const pw = document.getElementById('password').value;
  if (pw === 'cllegacy') {
    window.location.href = 'tree.html';
  } else {
    document.getElementById('error').innerText = 'Incorrect password';
  }
}
};
