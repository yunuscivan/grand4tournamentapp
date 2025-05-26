// Theme handling
document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeToggleMobile = document.getElementById("themeToggleMobile");
  const lightText = document.querySelector(".light-text");
  const darkText = document.querySelector(".dark-text");

  // Set initial theme
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggleButton(savedTheme === "dark");

  function handleThemeToggle() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.classList.add("theme-transition");
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeToggleButton(newTheme === "dark");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
      if (themeToggle) themeToggle.classList.remove("theme-toggle-spin");
      if (themeToggleMobile)
        themeToggleMobile.classList.remove("theme-toggle-spin");
    }, 500);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      themeToggle.classList.add("theme-toggle-spin");
      handleThemeToggle();
    });
  }
  if (themeToggleMobile) {
    themeToggleMobile.addEventListener("click", () => {
      themeToggleMobile.classList.add("theme-toggle-spin");
      handleThemeToggle();
    });
  }
});

function updateThemeToggleButton(isDark) {
  const lightText = document.querySelector(".light-text");
  const darkText = document.querySelector(".dark-text");

  if (isDark) {
    lightText.style.display = "none";
    darkText.style.display = "inline-block";
  } else {
    lightText.style.display = "inline-block";
    darkText.style.display = "none";
  }
}
