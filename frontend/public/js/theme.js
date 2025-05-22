// Theme handling
const themeToggle = document.getElementById("themeToggle");
const lightText = themeToggle.querySelector(".light-text");
const darkText = themeToggle.querySelector(".dark-text");

// Check for saved theme preference or default to 'light'
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeToggleButton(savedTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeToggleButton(newTheme);
});

function updateThemeToggleButton(theme) {
  if (theme === "dark") {
    lightText.style.display = "none";
    darkText.style.display = "inline";
  } else {
    lightText.style.display = "inline";
    darkText.style.display = "none";
  }
}
