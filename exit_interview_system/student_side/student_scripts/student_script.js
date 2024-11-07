// load published evaluations for the student's program
function loadPublishedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../student_side/student_phps/view_published_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById('publishedList').innerHTML = xhr.responseText;
            setupCardClickEvents();
        }
    };
    xhr.send();
}

function loadMainView() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="tabs">
            <button id="todoButton" class="tab-button">To-Do</button>
            <button id="doneButton" class="tab-button">Done</button>
        </div>
        <div id="publishedList"></div>
        <div id="answeredList" style="display: none;"></div> <!-- New section for answered evaluations -->
    `;

    setupTabListeners();
    loadPublishedEvaluations();
    loadAnsweredEvaluations(); // Load answered evaluations
}

// load answered evaluations for the student's program
function loadAnsweredEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../student_side/student_phps/view_answered_evaluations.php', true); // Path to the new PHP file
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById('answeredList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// load archived evaluations for the student's program
function loadArchivedEvaluations() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '../student_side/student_phps/view_archived_evaluations.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            document.getElementById('archivedList').innerHTML = xhr.responseText;
        }
    };
    xhr.send();
}

// Load questions for a specific evaluation using EvaluationID
function loadQuestions(evaluationID) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `../student_side/student_phps/get_evaluation_questions.php?evaluationID=${encodeURIComponent(evaluationID)}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const questionsListDiv = document.getElementById('questionsList');
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.error) {
                    questionsListDiv.innerHTML = `<p style="color:red;">${response.error}</p>`;
                } else {
                    let questionsHtml = '';
                    response.questions.forEach(question => {
                        if (question.QuestionType === 'Multiple Choice') {
                            questionsHtml += `
                                <div class="question-card-item">
                                    <p>${question.questionDesc}</p>
                                    <input type="text" name="answer_${question.QuestionID}" placeholder="Your answer" required>
                                </div>
                            `;
                        } else if (question.QuestionType === 'TrueOrFalse') {
                            questionsHtml += `
                                <div class="question-card-item">
                                    <p>${question.questionDesc}</p>
                                    <label>
                                        <input type="radio" name="answer_${question.QuestionID}" value="True" required> True
                                    </label>
                                    <label>
                                        <input type="radio" name="answer_${question.QuestionID}" value="False" required> False
                                    </label>
                                </div>
                            `;
                        }
                    });
                    questionsHtml += `<input type="hidden" name="evaluation_id" value="${evaluationID}">`;
                    questionsListDiv.innerHTML = questionsHtml;
                }
            } else {
                questionsListDiv.innerHTML = `<p style="color:red;">Error loading questions. Please try again.</p>`;
            }
        }
    };
    xhr.send();
}

// Setup click event for each evaluation card
function setupCardClickEvents() {
    document.querySelectorAll('.evaluation-card-item').forEach(item => {
        item.addEventListener('click', function() {
            const evaluationID = this.querySelector('h2').id.split('-')[1];
            const evaluationName = this.querySelector('h2').textContent.trim();
            const startDate = item.querySelector('span[id^="startDate-"]').textContent.trim();
            const endDate = item.querySelector('span[id^="endDate-"]').textContent.trim();
            displayEvaluationQuestions(evaluationID, evaluationName, startDate, endDate);
        });
    });
}

// Function to display evaluation questions and add a submit button
function displayEvaluationQuestions(evaluationID, evaluationName, startDate, endDate) {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div>
            <a class="back" onclick="confirmBack()">
                <img alt="back" src="../resources/left-arrow-svgrepo-com.svg">
            </a>
            <div id="evaluationContent">
                <div class="question-card-item">
                    <h1>${evaluationName}</h1>
                    <p>${startDate} - ${endDate}</p>
                </div>        
                <form id="submitAnswersForm">
                    <div id="questionsList">
                        <h2>Loading questions...</h2>
                    </div>
                    <button id="submitAnswersBtn" type="button" onclick="submitAnswers()">Submit</button>
                </form>
            </div>
        </div>
    `;
    loadQuestions(evaluationID);  // Load questions when evaluation is clicked
}

// Submit answers function
function submitAnswers() {
    const form = document.getElementById('submitAnswersForm');
    const formData = new FormData(form);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '../student_side/student_phps/submit_answers.php', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert(xhr.responseText);
                form.reset();
                document.getElementById('questionsList').innerHTML = '';
            } else {
                alert("Error submitting answers. Please try again.");
            }
        }
    };
    xhr.send(formData);
}

function confirmBack() {
    if (confirm("Are you sure you want to go back? Your answers will not be saved.")) {
        loadMainView();
    }
}

// button tab listeners
function setupTabListeners() {
    const todoButton = document.getElementById('todoButton');
    const doneButton = document.getElementById('doneButton');
    const publishedList = document.getElementById('publishedList');
    const answeredList = document.getElementById('answeredList'); // Display answered evaluations
    const archivedList = document.getElementById('archivedList');

    // Load published evals initially
    loadPublishedEvaluations();
    loadAnsweredEvaluations(); // Load answered evaluations
    todoButton.classList.add('active')

    todoButton.addEventListener('click', function() {
        setActiveButton(todoButton);
        showPublishedList();
    });

    doneButton.addEventListener('click', function() {
        setActiveButton(doneButton);
        showAnsweredList(); // Show answered evaluations
    });

    function setActiveButton(activeButton) {
        const buttons = document.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }

    function showPublishedList() {
        publishedList.style.display = 'flex';
        archivedList.style.display = 'none';
        answeredList.style.display = 'none'; // Hide answered evaluations when showing "To-Do"
    }

    function showAnsweredList() {
        publishedList.style.display = 'none';
        archivedList.style.display = 'none';
        answeredList.style.display = 'flex'; // Show answered evaluations
    }
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('../student_side/student_phps/get_username.php')
        .then(response => response.json())
        .then(data => {
            if (data.username) {
                document.getElementById('usernameDisplay').textContent = data.username;
            } else {
                console.error('Error:', data.error);
            }
        })
        .catch(error => console.error('Error fetching username:', error));
});

function confirmLogout() {
    return confirm("Are you sure you want to log out?");
}

// load evaluations on page load
window.onload = loadMainView;
