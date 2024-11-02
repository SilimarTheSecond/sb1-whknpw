document.addEventListener('DOMContentLoaded', () => {
    const nodeForm = document.getElementById('nodeForm');
    const typeSelect = document.getElementById('type');
    const contentWrapper = document.getElementById('contentWrapper');
    const timeline = document.getElementById('timeline');

    // Load existing nodes
    loadNodes();

    // Handle type change
    typeSelect.addEventListener('change', () => {
        contentWrapper.innerHTML = typeSelect.value === 'text' 
            ? '<textarea id="textContent" placeholder="Enter text content"></textarea>'
            : '<input type="file" id="imageUpload" accept="image/*">';
    });

    // Handle form submission
    nodeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('date').value;
        const type = typeSelect.value;

        let content = '';
        if (type === 'text') {
            content = document.getElementById('textContent').value;
        } else {
            const imageFile = document.getElementById('imageUpload').files[0];
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadResult = await uploadResponse.json();
                content = uploadResult.url;
            }
        }

        await fetch('/api/nodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date, type, content })
        });

        nodeForm.reset();
        loadNodes();
    });

    async function loadNodes() {
        const response = await fetch('/api/nodes');
        const nodes = await response.json();
        
        timeline.innerHTML = nodes.map(node => `
            <div class="node">
                <div class="date">${new Date(node.date).toLocaleDateString()}</div>
                ${node.type === 'text' 
                    ? `<p>${node.content}</p>`
                    : `<img src="${node.content}" alt="Timeline image">`
                }
            </div>
        `).join('');
    }
});