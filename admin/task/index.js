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
            if (formVariableType === 'Boolean') {
                $('#formElements').append(`
                    <div class="form-group mb-4">
                        <input type="checkbox" class="check-input" id="${formVariableKey}" value="true" name="${formVariableKey}">
                        <label for="${formVariableKey}">${formVariableKey}</label>
                    </div>
                `);
            } else {
                $('#formElements').append(`
                    <div class="form-group mb-4">
                        <label for="${formVariableKey}">${formVariableKey}</label>
                        <input type="text" class="form-control" id="${formVariableKey}" name="${formVariableKey}" required>
                    </div>
                `);
            }
        }

        // Start new process on form submit
        $('#taskForm').on('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const variables = data;
            if (!formData.has('RefundApproved')) {
                formData.append('RefundApproved', "false");
            }
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
                window.location.href = "/admin/";
            });
        });
    });
}

function main() {
    CreateTaskForm();
}
window.onload = main;