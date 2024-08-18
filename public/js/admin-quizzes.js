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

                // Convert questions to JSON string
                const questions = [];
                const questionInputs = form.querySelectorAll('.question-input');
                questionInputs.forEach((input, index) => {
                    const question = {
                        questionText: input.value,
                        options: [],
                        correctAnswer: form.querySelector(`#correctAnswer${index}`).value
                    };
                    const options = form.querySelectorAll(`#options${index} input`);
                    options.forEach(option => {
                        question.options.push(option.value);
                    });
                    questions.push(question);
                });
                formData.set('questions', JSON.stringify(questions));

                fetch(`/admin/quizzes/${quizId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(data.message);
                        updateRowData(quizId, data.quiz);
                        closeCurrentRow();
                    } else {
                        alert('Error updating quiz: ' + data.message);
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    }

    function updateRowData(quizId, quizData) {
        const row = document.querySelector(`tr[data-quiz-id="${quizId}"]`);
        if (row) {
            row.querySelector('.quiz-title').textContent = quizData.title;
            row.querySelector('.quiz-description').textContent = quizData.description;
            row.querySelector('.quiz-product').textContent = quizData.product.title;
        }
    }

    // Add question button functionality
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', function() {
            const questionsContainer = document.getElementById('questionsContainer');
            const questionCount = questionsContainer.children.length;
            const newQuestion = createQuestionElement(questionCount);
            questionsContainer.appendChild(newQuestion);
        });
    }

    function createQuestionElement(index) {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question mb-3';
        questionDiv.innerHTML = `
            <label for="question${index}">Question ${index + 1}:</label>
            <input type="text" id="question${index}" name="questions[${index}][questionText]" class="form-control question-input" required>
            <div id="options${index}">
                <label>Options:</label>
                <input type="text" name="questions[${index}][options][]" class="form-control mb-2" required>
                <input type="text" name="questions[${index}][options][]" class="form-control mb-2" required>
                <input type="text" name="questions[${index}][options][]" class="form-control mb-2" required>
                <input type="text" name="questions[${index}][options][]" class="form-control mb-2" required>
            </div>
            <label for="correctAnswer${index}">Correct Answer:</label>
            <select id="correctAnswer${index}" name="questions[${index}][correctAnswer]" class="form-control" required>
                <option value="0">Option 1</option>
                <option value="1">Option 2</option>
                <option value="2">Option 3</option>
                <option value="3">Option 4</option>
            </select>
        `;
        return questionDiv;
    }

    // Debug click events
    document.addEventListener('click', function(e) {
        console.log('Clicked element:', e.target);
    });
});