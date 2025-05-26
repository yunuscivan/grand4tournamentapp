// Contact Form Management
class ContactForm {
  constructor() {
    this.form = document.getElementById("contactForm");
    this.prefillUserData();
  }

  prefillUserData() {
    if (this.form) {
      const nameInput = document.getElementById("contactName");
      const emailInput = document.getElementById("contactEmail");

      if (nameInput) {
        nameInput.value = localStorage.getItem("userName") || "";
      }

      if (emailInput) {
        emailInput.value = localStorage.getItem("userEmail") || "";
      }
    }
  }
}

// Initialize contact form
const contactForm = new ContactForm();
 