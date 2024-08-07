// document.addEventListener('DOMContentLoaded', function() {
//     console.log('Admin users script loaded');

//     const viewButtons = document.querySelectorAll('.view-user');
//     const editButtons = document.querySelectorAll('.edit-user');

//     viewButtons.forEach(button => {
//         button.addEventListener('click', function(e) {
//             e.preventDefault();
//             const userId = this.getAttribute('data-user-id');
//             toggleUserDetails(userId);
//         });
//     });

//     editButtons.forEach(button => {
//         button.addEventListener('click', function(e) {
//             e.preventDefault();
//             const userId = this.getAttribute('data-user-id');
//             toggleUserEditForm(userId);
//         });
//     });

//     function toggleUserDetails(userId) {
//         const expandableRow = document.getElementById(`expandable-${userId}`);
//         const detailsDiv = expandableRow.querySelector('.user-details');
//         const editDiv = expandableRow.querySelector('.user-edit');

//         if (detailsDiv.style.display === 'none') {
//             fetchUserDetails(userId, detailsDiv);
//             detailsDiv.style.display = 'block';
//             editDiv.style.display = 'none';
//         } else {
//             detailsDiv.style.display = 'none';
//         }
//     }

//     function toggleUserEditForm(userId) {
//         const expandableRow = document.getElementById(`expandable-${userId}`);
//         const detailsDiv = expandableRow.querySelector('.user-details');
//         const editDiv = expandableRow.querySelector('.user-edit');

//         if (editDiv.style.display === 'none') {
//             fetchUserEditForm(userId, editDiv);
//             editDiv.style.display = 'block';
//             detailsDiv.style.display = 'none';
//         } else {
//             editDiv.style.display = 'none';
//         }
//     }

//     // function fetchUserDetails(userId, detailsDiv) {
//     //     fetch(`/admin/users/${userId}/details`)
//     //         .then(response => response.text())
//     //         .then(html => {
//     //             // Create a temporary container
//     //             const temp = document.createElement('div');
//     //             temp.innerHTML = html;

//     //             // Extract only the content we want
//     //             const content = temp.querySelector('.user-details-content');
//     //             if (content) {
//     //                 detailsDiv.innerHTML = content.innerHTML;
//     //             } else {
//     //                 detailsDiv.innerHTML = 'Error loading user details.';
//     //             }
//     //         })
//     //         .catch(error => {
//     //             console.error('Error:', error);
//     //             detailsDiv.innerHTML = 'Error loading user details.';
//     //         });
//     // }

//     function fetchUserDetails(userId, detailsDiv) {
//         console.log('Fetching user details for userId:', userId);
//         fetch(`/admin/users/${userId}/details`)
//             .then(response => {
//                 console.log('Response status:', response.status);
//                 return response.text();
//             })
//             .then(html => {
//                 console.log('Received HTML:', html);
//                 // Create a temporary container
//                 const temp = document.createElement('div');
//                 temp.innerHTML = html;
    
//                 // Extract only the content we want
//                 const content = temp.querySelector('.user-details-content');
//                 if (content) {
//                     detailsDiv.innerHTML = content.innerHTML;
//                     console.log('User details content set successfully');
//                 } else {
//                     console.error('Could not find .user-details-content in the response');
//                     detailsDiv.innerHTML = 'Error loading user details.';
//                 }
//             })
//             .catch(error => {
//                 console.error('Error fetching user details:', error);
//                 detailsDiv.innerHTML = 'Error loading user details.';
//             });
//     }

//     function fetchUserEditForm(userId, editDiv) {
//         fetch(`/admin/users/${userId}/edit-form`)
//             .then(response => response.text())
//             .then(html => {
//                 // Create a temporary container
//                 const temp = document.createElement('div');
//                 temp.innerHTML = html;

//                 // Extract only the content we want
//                 const content = temp.querySelector('.user-edit-content');
//                 if (content) {
//                     editDiv.innerHTML = content.innerHTML;
//                     setupEditForm(editDiv);
//                 } else {
//                     editDiv.innerHTML = 'Error loading edit form.';
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 editDiv.innerHTML = 'Error loading edit form.';
//             });
//     }

//     function setupEditForm(editDiv) {
//         const form = editDiv.querySelector('form');
//         if (form) {
//             form.addEventListener('submit', function(e) {
//                 e.preventDefault();
//                 const formData = new FormData(form);
//                 const userId = form.getAttribute('data-user-id');

//                 fetch(`/admin/users/${userId}`, {
//                     method: 'POST',
//                     body: formData
//                 })
//                 .then(response => response.json())
//                 .then(data => {
//                     if (data.success) {
//                         alert('User updated successfully');
//                         location.reload();
//                     } else {
//                         alert('Error updating user');
//                     }
//                 })
//                 .catch(error => console.error('Error:', error));
//             });
//         }
//     }

//     // Debug click events
//     document.addEventListener('click', function(e) {
//         console.log('Clicked element:', e.target);
//     });
// });

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin users script loaded');

    const viewButtons = document.querySelectorAll('.view-user');
    const editButtons = document.querySelectorAll('.edit-user');
    let currentlyOpenRow = null;

    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-user-id');
            toggleUserDetails(userId);
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const userId = this.getAttribute('data-user-id');
            toggleUserEditForm(userId);
        });
    });

    function toggleUserDetails(userId) {
        const expandableRow = document.getElementById(`expandable-${userId}`);
        const detailsDiv = expandableRow.querySelector('.user-details');
        const editDiv = expandableRow.querySelector('.user-edit');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (detailsDiv.style.display === 'none') {
            fetchUserDetails(userId, detailsDiv);
            detailsDiv.style.display = 'block';
            editDiv.style.display = 'none';
            currentlyOpenRow = expandableRow;
        } else {
            detailsDiv.style.display = 'none';
            currentlyOpenRow = null;
        }
    }

    function toggleUserEditForm(userId) {
        const expandableRow = document.getElementById(`expandable-${userId}`);
        const detailsDiv = expandableRow.querySelector('.user-details');
        const editDiv = expandableRow.querySelector('.user-edit');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (editDiv.style.display === 'none') {
            fetchUserEditForm(userId, editDiv);
            editDiv.style.display = 'block';
            detailsDiv.style.display = 'none';
            currentlyOpenRow = expandableRow;
        } else {
            editDiv.style.display = 'none';
            currentlyOpenRow = null;
        }
    }

    function closeCurrentRow() {
        if (currentlyOpenRow) {
            const detailsDiv = currentlyOpenRow.querySelector('.user-details');
            const editDiv = currentlyOpenRow.querySelector('.user-edit');
            detailsDiv.style.display = 'none';
            editDiv.style.display = 'none';
        }
    }

    function fetchUserDetails(userId, detailsDiv) {
        console.log('Fetching user details for userId:', userId);
        fetch(`/admin/users/${userId}/details`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.text();
            })
            .then(html => {
                console.log('Received HTML:', html);
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const content = temp.querySelector('.user-details-content');
                if (content) {
                    detailsDiv.innerHTML = content.innerHTML;
                    console.log('User details content set successfully');
                } else {
                    console.error('Could not find .user-details-content in the response');
                    detailsDiv.innerHTML = 'Error loading user details.';
                }
            })
            .catch(error => {
                console.error('Error fetching user details:', error);
                detailsDiv.innerHTML = 'Error loading user details.';
            });
    }

    // function fetchUserEditForm(userId, editDiv) {
    //     console.log('Fetching user edit form for userId:', userId);
    //     fetch(`/admin/users/${userId}/edit`)
    //         .then(response => {
    //             console.log('Response status:', response.status);
    //             return response.text();
    //         })
    //         .then(html => {
    //             console.log('Received HTML:', html);
    //             editDiv.innerHTML = html;
    //             setupEditForm(editDiv);
    //             console.log('User edit form set successfully');
    //         })
    //         .catch(error => {
    //             console.error('Error fetching user edit form:', error);
    //             editDiv.innerHTML = 'Error loading edit form.';
    //         });
    // }

    function fetchUserEditForm(userId, editDiv) {
        console.log('Fetching user edit form for userId:', userId);
        fetch(`/admin/users/${userId}/edit`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.text();
            })
            .then(html => {
                console.log('Received HTML:', html);
                // Create a temporary container
                const temp = document.createElement('div');
                temp.innerHTML = html;
                // Extract only the content we want
                const content = temp.querySelector('.user-edit-content');
                if (content) {
                    editDiv.innerHTML = content.innerHTML;
                    setupEditForm(editDiv);
                    console.log('User edit form set successfully');
                } else {
                    console.error('Could not find .user-edit-content in the response');
                    editDiv.innerHTML = 'Error loading edit form.';
                }
            })
            .catch(error => {
                console.error('Error fetching user edit form:', error);
                editDiv.innerHTML = 'Error loading edit form.';
            });
    }

    function setupEditForm(editDiv) {
        const form = editDiv.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const userId = form.getAttribute('data-user-id');

                fetch(`/admin/users/${userId}`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('User updated successfully');
                        location.reload();
                    } else {
                        alert('Error updating user');
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    }

    // Debug click events
    document.addEventListener('click', function(e) {
        console.log('Clicked element:', e.target);
    });
});