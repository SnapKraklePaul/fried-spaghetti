// // public/js/profile-edit.js

// document.addEventListener('DOMContentLoaded', function() {
//     const editIcons = document.querySelectorAll('.edit-icon');
//     const editForm = document.getElementById('edit-profile-form');
//     const profileInfo = document.getElementById('profile-info');
//     const cancelEditBtn = document.getElementById('cancel-edit');
//     const passwordFields = document.getElementById('password-fields');
  
//     editIcons.forEach(icon => {
//       icon.addEventListener('click', function() {
//         const field = this.dataset.field;
//         profileInfo.style.display = 'none';
//         editForm.style.display = 'block';
        
//         if (field === 'password') {
//           passwordFields.style.display = 'block';
//         } else {
//           passwordFields.style.display = 'none';
//           document.getElementById(field).focus();
//         }
//       });
//     });
  
//     cancelEditBtn.addEventListener('click', function() {
//       editForm.style.display = 'none';
//       profileInfo.style.display = 'block';
//       passwordFields.style.display = 'none';
//     });
//   });

// public/js/profile-edit.js

document.addEventListener('DOMContentLoaded', function() {
  const editIcons = document.querySelectorAll('.edit-icon');
  const editForm = document.getElementById('edit-profile-form');
  const profileInfo = document.getElementById('profile-info');
  const cancelEditBtn = document.getElementById('cancel-edit');
  const passwordFields = document.getElementById('password-fields');
  const submitBtn = editForm.querySelector('button[type="submit"]');

  let currentEditField = null;

  function showEditForm(field) {
      profileInfo.style.display = 'none';
      editForm.style.display = 'block';
      
      if (field === 'password') {
          passwordFields.style.display = 'block';
          document.getElementById('currentPassword').focus();
      } else {
          passwordFields.style.display = 'none';
          const input = document.getElementById(field);
          input.focus();
          input.select();
      }

      currentEditField = field;
      submitBtn.textContent = field === 'password' ? 'Update Password' : 'Update ' + field.charAt(0).toUpperCase() + field.slice(1);
  }

  function hideEditForm() {
      editForm.style.display = 'none';
      profileInfo.style.display = 'block';
      passwordFields.style.display = 'none';
      currentEditField = null;
      submitBtn.textContent = 'Update Profile';
  }

  editIcons.forEach(icon => {
      icon.addEventListener('click', function() {
          const field = this.dataset.field;
          showEditForm(field);
      });
  });

  cancelEditBtn.addEventListener('click', hideEditForm);

  editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Perform form validation here
      if (this.checkValidity()) {
          const formData = new FormData(this);
          formData.append('updateField', currentEditField);

          fetch('/profile', {
              method: 'POST',
              body: formData
          })
          .then(response => response.json())
          .then(data => {
              if (data.success) {
                  if (currentEditField !== 'password') {
                      document.getElementById('display' + currentEditField.charAt(0).toUpperCase() + currentEditField.slice(1)).textContent = formData.get(currentEditField);
                  }
                  hideEditForm();
              } else {
                  alert('Failed to update profile: ' + data.message);
              }
          })
          .catch(error => {
              console.error('Error:', error);
              alert('An error occurred while updating the profile.');
          });
      } else {
          this.reportValidity();
      }
  });

  // Handle Enter key press in input fields
  editForm.querySelectorAll('input').forEach(input => {
      input.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
              e.preventDefault();
              submitBtn.click();
          }
      });
  });
});