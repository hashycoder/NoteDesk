// App.js - Notepad Application
        let tasks = [];
        let editingTaskId = null;
        let filteredTasks = [];

        // Initialize app
        document.addEventListener('DOMContentLoaded', function() {
            loadTasks();
            renderTasks();
        });

        // Theme toggle
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Update theme icon
            const icon = document.querySelector('.theme-icon path');
            if (newTheme === 'dark') {
                icon.setAttribute('d', 'M12,18A6,6,0,1,1,18,12A6,6,0,0,1,12,18ZM12,2a1,1,0,0,0,1-1V1a1,1,0,0,0-2,0V1A1,1,0,0,0,12,2ZM12,22a1,1,0,0,0-1,1v0a1,1,0,0,0,2,0V23A1,1,0,0,0,12,22ZM22,12a1,1,0,0,0,1-1h0a1,1,0,0,0-2,0h0A1,1,0,0,0,22,12ZM2,12a1,1,0,0,0-1,1H1a1,1,0,0,0,2,0H3A1,1,0,0,0,2,12Z');
            } else {
                icon.setAttribute('d', 'M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z');
            }
        }

        // Modal functions
        function openAddModal() {
            document.getElementById('modalTitle').textContent = 'Add New Note';
            document.getElementById('submitBtn').textContent = 'Create Note';
            document.getElementById('taskForm').reset();
            editingTaskId = null;
            document.getElementById('taskModal').classList.add('active');
        }

        function openEditModal(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            document.getElementById('modalTitle').textContent = 'Edit Note';
            document.getElementById('submitBtn').textContent = 'Update Note';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskContent').value = task.content;
            editingTaskId = taskId;
            document.getElementById('taskModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('taskModal').classList.remove('active');
            editingTaskId = null;
        }

        // Task CRUD operations
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function formatDate(date) {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }

        document.getElementById('taskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value.trim();
            const content = document.getElementById('taskContent').value.trim();
            
            if (!title || !content) return;

            if (editingTaskId) {
                // Update existing task
                const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
                if (taskIndex !== -1) {
                    tasks[taskIndex] = {
                        ...tasks[taskIndex],
                        title,
                        content,
                        updatedAt: new Date()
                    };
                }
            } else {
                // Create new task
                const newTask = {
                    id: generateId(),
                    title,
                    content,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                tasks.unshift(newTask);
            }

            saveTasks();
            renderTasks();
            closeModal();
        });

        function deleteTask(taskId) {
            if (confirm('Are you sure you want to delete this note?')) {
                tasks = tasks.filter(t => t.id !== taskId);
                saveTasks();
                renderTasks();
            }
        }

        // Search functionality
        function searchTasks(query) {
            if (!query.trim()) {
                filteredTasks = tasks;
            } else {
                filteredTasks = tasks.filter(task =>
                    task.title.toLowerCase().includes(query.toLowerCase()) ||
                    task.content.toLowerCase().includes(query.toLowerCase())
                );
            }
            renderTasks(filteredTasks);
        }

        // Render tasks
        function renderTasks(tasksToRender = tasks) {
            const container = document.getElementById('tasksContainer');
            
            if (tasksToRender.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📝</div>
                        <h3>No notes found</h3>
                        <p>${tasks.length === 0 ? "Click the + button to create your first note" : "Try adjusting your search"}</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = tasksToRender.map(task => `
                <div class="task-card">
                    <div class="task-header">
                        <div class="task-title">${escapeHtml(task.title)}</div>
                        <div class="task-actions">
                            <button class="action-btn" onclick="openEditModal('${task.id}')" title="Edit">
                                ✏️
                            </button>
                            <button class="action-btn" onclick="deleteTask('${task.id}')" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                    <div class="task-content">${escapeHtml(task.content).replace(/\n/g, '<br>')}</div>
                    <div class="task-dates">
                        <div class="date-item">
                            <span>📅</span>
                            <span>Created: ${formatDate(new Date(task.createdAt))}</span>
                        </div>
                        ${task.updatedAt && task.updatedAt !== task.createdAt ? `
                            <div class="date-item">
                                <span>🔄</span>
                                <span>Updated: ${formatDate(new Date(task.updatedAt))}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Local storage
        function saveTasks() {
            // In a real application with Python backend, this would be an API call
            console.log('Tasks would be saved to Python backend:', tasks);
        }

        function loadTasks() {
            // In a real application, this would load from Python backend
            // For demo purposes, using sample data
            if (tasks.length === 0) {
                tasks = [];
            }
        }

        // Close modal when clicking outside
        document.getElementById('taskModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

