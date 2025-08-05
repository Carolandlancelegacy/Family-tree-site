document.addEventListener("DOMContentLoaded", function () {
  const correctPassword = "cllegacy";

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "#fdfaf6";
  overlay.style.zIndex = 9999;
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";

  const label = document.createElement("label");
  label.textContent = "Enter Password";
  label.style.marginBottom = "10px";

  const input = document.createElement("input");
  input.type = "password";
  input.style.padding = "8px";
  input.style.fontSize = "16px";
  input.style.border = "1px solid #ccc";

  const button = document.createElement("button");
  button.textContent = "Submit";
  button.style.marginTop = "10px";
  button.style.padding = "8px 16px";
  button.style.fontSize = "16px";

  const error = document.createElement("div");
  error.style.color = "red";
  error.style.marginTop = "8px";
  error.style.fontSize = "14px";

  button.onclick = () => {
    if (input.value === correctPassword) {
      overlay.remove();
    } else {
      error.textContent = "Incorrect password. Try again.";
    }
  };

  overlay.appendChild(label);
  overlay.appendChild(input);
  overlay.appendChild(button);
  overlay.appendChild(error);
  document.body.appendChild(overlay);
});
