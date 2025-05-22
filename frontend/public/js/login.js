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

// User type handling
function setupUserTypeToggle(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const buttons = form.querySelectorAll(".user-type-btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      buttons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");
    });
  });
}

// Setup user type toggles for both forms
setupUserTypeToggle("loginForm");
setupUserTypeToggle("signupForm");

// Check admin status and update UI accordingly
async function checkAndUpdateAdminUI() {
  try {
    const response = await fetch("/api/auth/check-admin");
    const data = await response.json();

    // Get all admin toggle buttons
    const adminButtons = document.querySelectorAll(
      '.user-type-btn[data-type="admin"]'
    );

    adminButtons.forEach((button) => {
      if (data.currentAdmins >= data.maxAdmins) {
        // Disable admin option if max admins reached
        button.disabled = true;
        button.title = `Maximum number of admin accounts (${data.maxAdmins}) has been reached`;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      } else {
        button.disabled = false;
        button.title = `Admin slots available: ${data.remainingSlots}`;
        button.style.opacity = "1";
        button.style.cursor = "pointer";
      }
    });
  } catch (error) {
    console.error("Error checking admin status:", error);
  }
}

// Check admin status when page loads and when switching to signup view
document.addEventListener("DOMContentLoaded", checkAndUpdateAdminUI);
document
  .querySelector(".signup-link a")
  ?.addEventListener("click", checkAndUpdateAdminUI);

// Login form handling
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const userType = loginForm.querySelector(".user-type-btn.active").dataset
    .type;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, userType }),
    });

    const data = await response.json();

    if (response.ok) {
      // Store the token and user type
      localStorage.setItem("token", data.token);
      localStorage.setItem("userType", data.role);
      // Switch to appropriate dashboard
      router.showView(data.role === "admin" ? "admin" : "player");
    } else {
      alert(data.message || "Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("An error occurred during login. Please try again.");
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const userType = signupForm.querySelector(".user-type-btn.active").dataset
    .type;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Check admin status if trying to register as admin
  if (userType === "admin") {
    try {
      const checkAdmin = await fetch("/api/auth/check-admin");
      const adminData = await checkAdmin.json();

      if (adminData.currentAdmins >= adminData.maxAdmins) {
        alert(
          `Maximum number of admin accounts (${adminData.maxAdmins}) has been reached`
        );
        return;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      alert("Error checking admin status. Please try again.");
      return;
    }
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: name, email, password, userType }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Account created successfully! Please log in.");
      router.showView("login");
    } else {
      alert(data.message || "Sign up failed. Please try again.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("An error occurred during sign up. Please try again.");
  }
});

forgotPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value;

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Password reset instructions have been sent to your email.");
      router.showView("login");
    } else {
      alert(data.message || "Failed to process password reset request.");
    }
  } catch (error) {
    console.error("Password reset error:", error);
    alert("An error occurred. Please try again.");
  }
});
