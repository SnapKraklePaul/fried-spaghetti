let lastScrollTop = 0;
const navbar = document.getElementById('main-nav');

window.addEventListener('scroll', () => {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop > lastScrollTop) {
    navbar.classList.add('nav-hidden');
  } else {
    navbar.classList.remove('nav-hidden');
  }
  lastScrollTop = scrollTop;
});




function validateForm(formId) {
  const form = document.getElementById(formId);
  if (form) {  // Check if the form exists
      form.addEventListener('submit', function(event) {
          let isValid = true;
          const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
          inputs.forEach(function(input) {
              if (!input.value.trim()) {
                  isValid = false;
                  input.classList.add('error');
              } else {
                  input.classList.remove('error');
              }
          });

          if (!isValid) {
              event.preventDefault();
              alert('Please fill in all required fields.');
          }
      });
  }
}

// Call this function for each form you want to validate
document.addEventListener('DOMContentLoaded', function() {
  const formIds = ['userForm', 'productForm', 'quizForm'];
  formIds.forEach(formId => validateForm(formId));
});