import $ from 'jquery';

const camClient = new CamSDK.Client({
    mock: false,
    apiUri: 'http://localhost:8080/engine-rest'
});
const ProcessDefinitionKey = "RefundReview";
const params = new URLSearchParams(document.location.search);
const userId = params.get('u');

function CreateStartProcessForm() {
    const processDefinitionService = new camClient.resource('process-definition');

    // Get process form variables
    processDefinitionService.formVariables({ key: ProcessDefinitionKey }, (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(data);
        for (const formVariableKey in data) {
            const formVariableType = data[formVariableKey].type;
            if (formVariableKey === 'User') {
                $('#formElements').append(`
                    <div class="form-group mb-4">
                        <label for="${formVariableKey}">${formVariableKey}</label>
                        <input type="text" class="form-control" id="${formVariableKey}" name="${formVariableKey}" readonly value="${userId}" required>
                    </div>
                `);
            } else {
                $('#formElements').append(`
                    <div class="form-group mb-4">
                        <label for="${formVariableKey}">${formVariableKey}</label>
                        <input type="${formVariableType === 'Long' ? "number" : "text"}" class="form-control" id="${formVariableKey}" name="${formVariableKey}" required>
                    </div>
                `);
            }
        }

        // Start new process on form submit
        $('#processStartForm').on('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const variables = data;
            for (const formVariableKey in data) {
                variables[formVariableKey].value = formData.get(formVariableKey);
            }
            const params = {
                key: ProcessDefinitionKey,
                variables: variables,
            };
            processDefinitionService.start(params, (error, data) => {
                console.log(error, data);
                if (!error) {
                    alert("Uspešno stvoren zahtjev");
                }
                window.location.reload();
            });
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
            const row = `
            <tr>
                <td>${task.id}</td>
                <td>${task.name}</td>
                <td>${task.created}</td>
                <td>${task.assignee}</td>
                <td>
                    <button class="btn btn-primary" onclick="window.location.href = '/user/task/?id=${task.id}'">Fill in form</button>
                </td>
            </tr>
            `;
            myTaskList.append(row); 
        });
    });
}

function main() {
    if (!userId) window.location.search = 'u=stef';
    CreateStartProcessForm();
    CreateMyTaskView();
}
window.onload = main;