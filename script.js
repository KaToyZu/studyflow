const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const subjectInput = document.getElementById("subject-input");
const dueDateInput = document.getElementById("due-date");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("task-list");
const filterSelect = document.getElementById("filter");
const emptyMessage = document.getElementById("empty-message");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const openCount = document.getElementById("open-count");

// Charger les tâches sauvegardées
let tasks = JSON.parse(
    localStorage.getItem("studyflow-tasks")
) || [];

let nextId = tasks.length > 0
    ? Math.max(...tasks.map(task => task.id)) + 1
    : 1;

// Identifier la tâche en cours de modification
let editingTaskId = null;

// Sauvegarder les tâches
function saveTasks() {
    localStorage.setItem(
        "studyflow-tasks",
        JSON.stringify(tasks)
    );
}

// Mettre à jour les compteurs
function updateStats() {
    totalCount.textContent = tasks.length;

    const completedTasks = tasks.filter(function(task) {
        return task.completed;
    }).length;

    completedCount.textContent = completedTasks;
    openCount.textContent = tasks.length - completedTasks;
}

// Réinitialiser le formulaire
function resetTaskForm() {
    taskForm.reset();
    editingTaskId = null;

    const submitButton = taskForm.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.textContent = "Aufgabe hinzufügen";
    }

    const cancelButton = document.getElementById("cancel-edit");

    if (cancelButton) {
        cancelButton.hidden = true;
    }
}

// Créer le bouton d'annulation de modification
function createCancelButton() {
    let cancelButton = document.getElementById("cancel-edit");

    if (cancelButton) {
        return cancelButton;
    }

    cancelButton = document.createElement("button");
    cancelButton.id = "cancel-edit";
    cancelButton.type = "button";
    cancelButton.textContent = "Abbrechen";
    cancelButton.hidden = true;

    cancelButton.addEventListener("click", resetTaskForm);

    taskForm.appendChild(cancelButton);

    return cancelButton;
}

// Afficher les tâches
function renderTasks() {
    taskList.replaceChildren();

    const filter = filterSelect.value;

    const visibleTasks = tasks.filter(function(task) {
        if (filter === "open") {
            return !task.completed;
        }

        if (filter === "completed") {
            return task.completed;
        }

        return true;
    });

    emptyMessage.hidden = visibleTasks.length > 0;

    if (tasks.length === 0) {
        emptyMessage.textContent =
            "Noch keine Aufgaben. Füge deine erste Aufgabe hinzu!";
    } else if (visibleTasks.length === 0) {
        emptyMessage.textContent =
            "Keine Aufgaben in dieser Kategorie.";
    }

    visibleTasks.forEach(function(task) {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        // Case à cocher
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            "Aufgabe erledigen: " + task.title
        );

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });

        // Informations de la tâche
        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const subject = document.createElement("p");
        subject.textContent = task.subject;

        info.append(title, subject);

        // Date limite
        if (task.dueDate) {
            const date = document.createElement("p");
            date.className = "task-date";
            date.textContent = "Abgabe: " + task.dueDate;

            info.appendChild(date);
        }

        // Priorité
        const priority = document.createElement("span");
        priority.className = "priority " + task.priority;

        const priorityLabels = {
            high: "Hoch",
            medium: "Mittel",
            low: "Niedrig"
        };

        priority.textContent =
            priorityLabels[task.priority] || task.priority;

        // Bouton Modifier
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-button";
        editButton.textContent = "Bearbeiten";

        editButton.setAttribute(
            "aria-label",
            "Aufgabe bearbeiten: " + task.title
        );

        editButton.addEventListener("click", function() {
            editingTaskId = task.id;

            taskInput.value = task.title;
            subjectInput.value = task.subject;
            dueDateInput.value = task.dueDate || "";
            priorityInput.value = task.priority;

            const submitButton = taskForm.querySelector(
                'button[type="submit"]'
            );

            if (submitButton) {
                submitButton.textContent = "Änderungen speichern";
            }

            createCancelButton().hidden = false;

            taskInput.focus();
            taskForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        // Bouton Supprimer
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Löschen";

        deleteButton.setAttribute(
            "aria-label",
            "Aufgabe löschen: " + task.title
        );

        deleteButton.addEventListener("click", function() {
            tasks = tasks.filter(function(currentTask) {
                return currentTask.id !== task.id;
            });

            if (editingTaskId === task.id) {
                resetTaskForm();
            }

            saveTasks();
            renderTasks();
        });

        item.append(
            checkbox,
            info,
            priority,
            editButton,
            deleteButton
        );

        taskList.appendChild(item);
    });

    updateStats();
}

// Ajouter une tâche ou enregistrer une modification
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();
    const subject = subjectInput.value.trim();

    if (title === "" || subject === "") {
        return;
    }

    if (editingTaskId !== null) {
        // Modifier la tâche existante
        const taskToEdit = tasks.find(function(task) {
            return task.id === editingTaskId;
        });

        if (taskToEdit) {
            taskToEdit.title = title;
            taskToEdit.subject = subject;
            taskToEdit.dueDate = dueDateInput.value;
            taskToEdit.priority = priorityInput.value;
        }
    } else {
        // Créer une nouvelle tâche
        const newTask = {
            id: nextId,
            title: title,
            subject: subject,
            dueDate: dueDateInput.value,
            priority: priorityInput.value,
            completed: false
        };

        nextId++;
        tasks.push(newTask);
    }

    saveTasks();
    resetTaskForm();
    renderTasks();
});

// Filtrer les tâches
filterSelect.addEventListener("change", renderTasks);

// Préparer le bouton d'annulation
createCancelButton();

// Afficher les tâches au chargement
renderTasks();
