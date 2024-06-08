import bpmnJs from 'bpmn-js';

function CreateDiagramCanvas() {
    const camClient = new CamSDK.Client({
        mock: false,
        apiUri: 'http://localhost:8080/engine-rest'
    });
    const ProcessDefinitionKey = "RefundReview";
    const processDefinitionService = new camClient.resource('process-definition');
    
    processDefinitionService.xml({ key: ProcessDefinitionKey }, async (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        const bpmnViewer = new bpmnJs({
            container: "#diagramCanvas",
            height: 600,
            width: '100%'
        });
        try {
            await bpmnViewer.importXML(data.bpmn20Xml);
            const canvas = bpmnViewer.get('canvas');
            canvas.zoom('fit-viewport');
        } catch(err) {
            console.error(err);
        }
    });
}

CreateDiagramCanvas();