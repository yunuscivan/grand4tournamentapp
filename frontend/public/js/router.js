// Router class to handle navigation
class Router {
  constructor() {
    this.views = ["login", "admin", "forgotPassword", "signup"];
    this.defaultView = "login";

    // Handle browser back/forward buttons
    window.addEventListener("popstate", (e) => {
      this.showView(e.state?.view || this.defaultView);
    });

    // Check authentication on load
    this.checkAuthAndRoute();
  }

  checkAuthAndRoute() {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    const currentView = this.getCurrentView();

    if (token) {
      // User is logged in
      if (
        currentView === "login" ||
        currentView === "forgotPassword" ||
        currentView === "signup"
      ) {
        // Redirect to appropriate dashboard based on user type
        this.showView(userType === "admin" ? "admin" : "player");
      }
    } else {
      // User is not logged in
      if (currentView === "admin" || currentView === "player") {
        this.showView("login");
      }
    }
  }

  getCurrentView() {
    const hash = window.location.hash.slice(1) || this.defaultView;
    return this.views.includes(hash) ? hash : this.defaultView;
  }

  showView(viewName) {
    // Hide all views
    this.views.forEach((view) => {
      const element = document.getElementById(`${view}View`);
      if (element) {
        element.style.display = "none";
      }
    });

    // Show requested view
    const viewElement = document.getElementById(`${viewName}View`);
    if (viewElement) {
      viewElement.style.display = "";
      window.location.hash = viewName;
      window.history.pushState({ view: viewName }, "", `#${viewName}`);
    }
  }
}

// Initialize router
const router = new Router();

// Function to be called from HTML
function showView(viewName) {
  router.showView(viewName);
}
