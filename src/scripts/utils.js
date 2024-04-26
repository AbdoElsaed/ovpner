function showToast(message, type = "success", duration = 3000) {
  const toastContainer = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  switch (type) {
    case "success":
      toast.classList.add("toast-success");
      break;
    case "error":
      toast.classList.add("toast-error");
      break;
    default:
      toast.classList.add("toast-success");
  }

  toastContainer.innerHTML = null;
  toastContainer.appendChild(toast);
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.opacity = 1;
    toast.style.transform = "translateY(0)";
  }, 100);

  setTimeout(() => {
    toast.style.opacity = 0;
    toast.style.transform = "translateY(-20px)";
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

function showLoadingSpinner() {
  const overlay = document.querySelector(".overlay");
  const loader = document.getElementById("loader");
  overlay.style.display = "flex";
  loader.style.display = "flex";
}

function stopLoadingSpinner() {
  const overlay = document.querySelector(".overlay");
  const loader = document.getElementById("loader");
  overlay.style.display = "none";
  loader.style.display = "none";
}
