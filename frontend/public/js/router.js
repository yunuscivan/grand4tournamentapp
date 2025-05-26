// Router class to handle navigation
class Router {
  constructor() {
    this.routes = {
      home: "#home",
      tournaments: "#tournaments",
      admin: "#admin",
      "player-dashboard": "#player-dashboard",
      contact: "#contact",
    };

    // Handle initial route
    this.handleRoute();

    // Listen for hash changes
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  navigateTo(route) {
    window.location.hash = this.routes[route] || this.routes.home;
  }

  handleRoute() {
    const hash = window.location.hash || "#home";
    const views = document.querySelectorAll(".view");

    // Hide all views
    views.forEach((view) => {
      view.style.display = "none";
    });

    // Special handling for admin route
    if (hash === "#admin") {
      // Always show admin login form first
      document.getElementById("adminLoginView").style.display = "block";
      document.getElementById("adminView").style.display = "none";
      // Clear admin login form fields
      const adminEmail = document.getElementById("adminEmail");
      const adminPassword = document.getElementById("adminPassword");
      if (adminEmail) adminEmail.value = "";
      if (adminPassword) adminPassword.value = "";
      window.scrollTo(0, 0);
      this.updateNavigation(hash);
      // Only show admin dashboard after successful admin login
      if (localStorage.getItem("isAdmin") === "true") {
        document.getElementById("adminLoginView").style.display = "none";
        document.getElementById("adminView").style.display = "block";
      }
      return;
    }

    // Special handling for tournaments route
    if (hash === "#tournaments") {
      document.getElementById("tournamentListView").style.display = "block";
      if (typeof fetchTournaments === "function") fetchTournaments();
      window.scrollTo(0, 0);
      this.updateNavigation(hash);
      return;
    }

    // Special handling for player dashboard
    if (hash === "#player-dashboard") {
      document.getElementById("playerDashboardView").style.display = "block";
      if (typeof playerDashboard !== "undefined")
        playerDashboard.loadPlayerTournaments();
      window.scrollTo(0, 0);
      this.updateNavigation(hash);
      return;
    }

    // Show the selected view
    const viewId = hash.slice(1) + "View";
    const currentView = document.getElementById(viewId);

    if (currentView) {
      currentView.style.display = "block";
      // Scroll to top when changing views
      window.scrollTo(0, 0);
    } else {
      // If view not found, show home
      document.getElementById("homeView").style.display = "block";
    }

    // Update active state in navigation
    this.updateNavigation(hash);
  }

  updateNavigation(hash) {
    // Remove active class from all nav links
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current nav link
    const currentLink = document.querySelector(`.nav-link[href="${hash}"]`);
    if (currentLink) {
      currentLink.classList.add("active");
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem("token");
  }

  isAdmin() {
    return localStorage.getItem("userType") === "admin";
  }

  isSelectedPlayer() {
    return localStorage.getItem("isSelectedPlayer") === "true";
  }

  init() {
    // Add click handlers for navigation links
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const route = e.target.getAttribute("href").slice(1);
        this.navigateTo(route);
      });
    });

    // Check authentication and redirect if necessary
    if (
      !this.isAuthenticated() &&
      !["login", "admin-login"].includes(window.location.hash.slice(1))
    ) {
      this.navigateTo("login");
    }
  }
}

// Initialize router
const router = new Router();
document.addEventListener("DOMContentLoaded", () => router.init());
