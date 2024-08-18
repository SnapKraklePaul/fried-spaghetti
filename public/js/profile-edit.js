document.addEventListener('DOMContentLoaded', function() {
    const editBasicInfoIcon = document.getElementById('edit-basic-info');
    const editPasswordIcon = document.getElementById('edit-password');
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
        togglePasswordFieldsRequired(true);
      } else {
        passwordFields.style.display = 'none';
        document.getElementById('firstName').focus();
        togglePasswordFieldsRequired(false);
      }
  
      currentEditField = field;
      document.getElementById('updateField').value = field;
      console.log('Set updateField to:', field); // Debugging line
      submitBtn.textContent = field === 'password' ? 'Update Password' : 'Update Profile';
    }
  
    function hideEditForm() {
      editForm.style.display = 'none';
      profileInfo.style.display = 'block';
      passwordFields.style.display = 'none';
      currentEditField = null;
      submitBtn.textContent = 'Update Profile';
      togglePasswordFieldsRequired(false);
    }
  
    function togglePasswordFieldsRequired(required) {
      const passwordInputs = passwordFields.querySelectorAll('input');
      passwordInputs.forEach(input => {
        input.required = required;
      });
    }
  
    editBasicInfoIcon.addEventListener('click', function() {
      showEditForm('basicInfo');
    });
  
    editPasswordIcon.addEventListener('click', function() {
      showEditForm('password');
    });
  
    cancelEditBtn.addEventListener('click', hideEditForm);
  
    editForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (this.checkValidity()) {
        const formData = new FormData(this);
        
        // Ensure updateField is set
        if (!formData.get('updateField')) {
          formData.set('updateField', currentEditField);
        }
  
        // Log the form data
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
  
        fetch('/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Object.fromEntries(formData))
        })
        .then(response => response.json())
        .then(data => {
          console.log('Server response:', data);
          if (data.success) {
            if (currentEditField === 'basicInfo') {
              document.getElementById('displayFirstName').textContent = formData.get('firstName');
              document.getElementById('displayLastName').textContent = formData.get('lastName');
              document.getElementById('displayEmail').textContent = formData.get('email');
            }
            hideEditForm();
            alert(data.message);
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