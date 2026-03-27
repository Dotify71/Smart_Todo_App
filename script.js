document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cursorGlow = document.getElementById('cursor-glow');
    const appContainer = document.querySelector('.app-container');

    const STORAGE_KEY = 'smart_todo_tasks';
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let currentFilter = 'all';

    renderTasks();
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        requestAnimationFrame(() => {
            if (cursorGlow && !cursorGlow.classList.contains('hidden')) {
                cursorGlow.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            }

            const tasks = document.querySelectorAll('.task-item');
            tasks.forEach(task => {
                const rect = task.getBoundingClientRect();
                const taskCenterX = rect.left + rect.width / 2;
                const taskCenterY = rect.top + rect.height / 2;
                
                const deltaX = taskCenterX - mouseX;
                const deltaY = taskCenterY - mouseY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                const maxDistance = 250; 
                const maxOffset = 20; 
                
                if (distance < maxDistance && !task.matches(':hover')) {
                    const force = Math.pow((maxDistance - distance) / maxDistance, 1.5);
                    const angle = Math.atan2(deltaY, deltaX);
                    const offsetX = Math.cos(angle) * maxOffset * force;
                    const offsetY = Math.sin(angle) * maxOffset * force;
                    
                    task.style.translate = `${offsetX}px ${offsetY}px`;
                } else {
                    task.style.translate = '0px 0px'; 
                }
            });
        });
    });

    appContainer.addEventListener('mouseenter', () => {
        cursorGlow.classList.add('hidden');
    });

    appContainer.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('hidden');
    });

    addTaskBtn.addEventListener('click', handleAddTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    function handleAddTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            isNew: true
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        newTask.isNew = false;
        taskInput.value = '';
        taskInput.focus();
    }

    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';

        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        if (filteredTasks.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.className = 'empty-state';
            emptyLi.textContent = 'No tasks found.';
            taskList.appendChild(emptyLi);
            return;
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            if (task.isNew) {
                li.classList.add('entering');
                setTimeout(() => li.classList.remove('entering'), 400);
            }
            
            li.style.animationDelay = `-${Math.random() * 5}s`;
            li.style.animationDuration = `${4 + Math.random() * 3}s`;

            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'task-checkbox-container';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            
            checkboxContainer.appendChild(checkbox);

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => {
                li.classList.add('exiting');
                setTimeout(() => deleteTask(task.id), 300);
            });

            li.appendChild(checkboxContainer);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });
    }
});
