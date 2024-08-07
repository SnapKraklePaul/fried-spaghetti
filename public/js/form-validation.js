document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.needs-validation');
  
    forms.forEach(form => {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
  
        form.classList.add('was-validated');
      }, false);
    });
  
    // Custom validations
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
  
    if (password && confirmPassword) {
      confirmPassword.addEventListener('input', function() {
        if (password.value !== confirmPassword.value) {
          confirmPassword.setCustomValidity("Passwords don't match");
        } else {
          confirmPassword.setCustomValidity('');
        }
      });
    }
  
    const email = document.getElementById('email');
    if (email) {
      email.addEventListener('input', function() {
        if (email.validity.typeMismatch) {
          email.setCustomValidity('Please enter a valid email address');
        } else {
          email.setCustomValidity('');
        }
      });
    }
  });
  
  function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);
  
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long.';
    } else if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
    }
  
    return '';
  }