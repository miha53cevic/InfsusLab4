import $ from 'jquery';

const camClient = new CamSDK.Client({
    mock: false,
    apiUri: 'http://localhost:8080/engine-rest'
});
const params = new URLSearchParams(document.location.search);
const taskId = params.get('id');

function CreateTaskForm() {
    const taskService = camClient.resource('task');
    taskService.formVariables({ id: taskId }, (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(data);
        for (const formVariableKey in data) {
            if (data[formVariableKey].value != null) continue;
            const formVariableType = data[formVariableKey].type;
            $('#formElements').append(`
                <div class="form-group mb-4">
                    <label for="${formVariableKey}">${formVariableKey}</label>
                    <select class="form-select" name="${formVariableKey}">
                    <option value="Wallet" selected>Wallet</option>
                    <option value="Card">Card</option>
                    </select>
                </div>
            `);
        }

        // Start new process on form submit
        $('#taskForm').on('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const variables = data;
            for (const formVariableKey of formData.keys()) {
                variables[formVariableKey].value = formData.get(formVariableKey);
            }
            console.log("Variables:", variables);
            const params = {
                id: taskId,
                variables: variables,
            };
            taskService.complete(params, (error, data) => {
                console.log(error, data);
                if (!error) {
                    alert("Uspešno popunjen task");
                }
                window.location.href = "/";
            });
        });
    });
}

function main() {
    CreateTaskForm();
}
window.onload = main;