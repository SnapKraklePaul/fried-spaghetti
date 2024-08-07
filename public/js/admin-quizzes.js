document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin quizzes script loaded');

    const viewButtons = document.querySelectorAll('.view-quiz');
    const editButtons = document.querySelectorAll('.edit-quiz');
    let currentlyOpenRow = null;

    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const quizId = this.getAttribute('data-quiz-id');
            toggleQuizDetails(quizId);
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const quizId = this.getAttribute('data-quiz-id');
            toggleQuizEditForm(quizId);
        });
    });

    function toggleQuizDetails(quizId) {
        const expandableRow = document.getElementById(`expandable-${quizId}`);
        const detailsDiv = expandableRow.querySelector('.quiz-details');
        const editDiv = expandableRow.querySelector('.quiz-edit');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (detailsDiv.style.display === 'none') {
            fetchQuizDetails(quizId, detailsDiv);
            detailsDiv.style.display = 'block';
            editDiv.style.display = 'none';
            currentlyOpenRow = expandableRow;
        } else {
            detailsDiv.style.display = 'none';
            currentlyOpenRow = null;
        }
    }

    function toggleQuizEditForm(quizId) {
        const expandableRow = document.getElementById(`expandable-${quizId}`);
        const detailsDiv = expandableRow.querySelector('.quiz-details');
        const editDiv = expandableRow.querySelector('.quiz-edit');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (editDiv.style.display === 'none') {
            fetchQuizEditForm(quizId, editDiv);
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
            const detailsDiv = currentlyOpenRow.querySelector('.quiz-details');
            const editDiv = currentlyOpenRow.querySelector('.quiz-edit');
            detailsDiv.style.display = 'none';
            editDiv.style.display = 'none';
        }
    }

    function fetchQuizDetails(quizId, detailsDiv) {
        fetch(`/admin/quizzes/${quizId}/details`)
            .then(response => response.text())
            .then(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const content = temp.querySelector('.quiz-details-content');
                if (content) {
                    detailsDiv.innerHTML = content.innerHTML;
                } else {
                    detailsDiv.innerHTML = 'Error loading quiz details.';
                }
            })
            .catch(error => {
                console.error('Error fetching quiz details:', error);
                detailsDiv.innerHTML = 'Error loading quiz details.';
            });
    }

    function fetchQuizEditForm(quizId, editDiv) {
        fetch(`/admin/quizzes/${quizId}/edit`)
            .then(response => response.text())
            .then(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const content = temp.querySelector('.quiz-edit-content');
                if (content) {
                    editDiv.innerHTML = content.innerHTML;
                    setupEditForm(editDiv);
                } else {
                    editDiv.innerHTML = 'Error loading edit form.';
                }
            })
            .catch(error => {
                console.error('Error fetching quiz edit form:', error);
                editDiv.innerHTML = 'Error loading edit form.';
            });
    }

    function setupEditForm(editDiv) {
        const form = editDiv.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const quizId = form.getAttribute('data-quiz-id');

                fetch(`/admin/quizzes/${quizId}`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Quiz updated successfully');
                        location.reload();
                    } else {
                        alert('Error updating quiz');
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    }
});