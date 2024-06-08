import $ from 'jquery';

const camClient = new CamSDK.Client({
    mock: false,
    apiUri: 'http://localhost:8080/engine-rest'
});
const params = new URLSearchParams(document.location.search);
const userId = params.get('u');

const AdminTasks = ["Create refund request", "Close refund request"];

function Apply(taskId) {
    console.log(taskId);
    const taskService = camClient.resource('task');
    taskService.claim(taskId, userId, (error, data) => {
        if (error) {
            console.error(error);
            alert("Dogodila se pogreska!");
        } else {
            window.location.reload();
        }
    });
}
window.Apply = Apply; // global variable for accessing from html

function CreateTaskView() {
    const taskService = new camClient.resource('task');
    taskService.list({}, function (err, results) {
        if (err) {
            console.error('Error fetching tasks:', err);
            return;
        }
        const taskList = $('#task-table tbody');
        taskList.empty();
        results._embedded.task.forEach(task => {
            if (task.assignee === userId) return;
            if (!AdminTasks.includes(task.name)) return;
            const row = `
            <tr>
                <td>${task.id}</td>
                <td>${task.name}</td>
                <td>${task.created}</td>
                <td>${task.assignee === null ?
                    `<button class='btn btn-primary' onclick="Apply('${task.id}')">Apply</button>`
                    : task.assignee}
                </td>
            </tr>
            `;
            taskList.append(row); 
        });
    });
}

function CreateMyTaskView() {
    const taskService = new camClient.resource('task');
    taskService.list({}, function (err, results) {
        if (err) {
            console.error('Error fetching tasks:', err);
            return;
        }
        const myTaskList = $('#my-task-table tbody');
        myTaskList.empty();
        console.log(results);
        results._embedded.task.forEach(task => {
            if (task.assignee !== userId) return;
            if (!AdminTasks.includes(task.name)) return;
            const row = `
            <tr>
                <td>${task.id}</td>
                <td>${task.name}</td>
                <td>${task.created}</td>
                <td>${task.assignee}</td>
                <td>
                    <button class="btn btn-primary" onclick="window.location.href = '/admin/task/?id=${task.id}'">Fill in form</button>
                </td>
            </tr>
            `;
            myTaskList.append(row); 
        });
    });
}

function main() {
    if (!userId) window.location.search = 'u=ivo';
    CreateTaskView();
    CreateMyTaskView();
}
window.onload = main;