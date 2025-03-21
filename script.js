
let currentView = 'tree';
let editor = CodeMirror(document.getElementById('editor-panel'), {
    lineNumbers: true,
    mode: 'application/json',
    theme: 'default',
    autofocus: true,
    styleActiveLine: true
});

const resizer = document.getElementById('resizer');
let isResizing = false;

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', () => {
isResizing = false;
    });
});

function resize(e) {
    if (!isResizing) return;
    const container = document.getElementById('container');
    const newWidth = e.clientX;
    container.style.gridTemplateColumns = `${newWidth}px 5px 1fr`;
}

editor.on('change', () => {
    validateAndParse();
    updateURL();
});

function validateAndParse() {
    const value = editor.getValue();
    clearErrors();
    
    try {
const json = JSON.parse(value);
renderTree(json);
document.getElementById('text-view').textContent = JSON.stringify(json, null, 2);
document.querySelector('.error-message').textContent = '';
    } catch (e) {
const errorLine = getErrorLine(e);
highlightErrorLine(errorLine);
document.querySelector('.error-message').textContent = e.message;
    }
}

function getErrorLine(error) {
    const match = error.message.match(/at position (\d+)/);
    if (!match) return 0;
    
    const index = parseInt(match[1]);
    const content = editor.getValue().substring(0, index);
    return content.split('\n').length;
}

function highlightErrorLine(line) {
    const lineHandle = editor.getLineHandle(line - 1);
    editor.addLineClass(lineHandle, 'background', 'error-line');
}

function clearErrors() {
    editor.eachLine((line) => {
editor.removeLineClass(line, 'background', 'error-line');
    });
}

function renderTree(data, parent=document.getElementById('tree-view')) {
    parent.innerHTML = '';
    
    const renderNode = (data, parentElement) => {
const type = Array.isArray(data) ? 'array' : typeof data;

for (const key in data) {
    if (!data.hasOwnProperty(key)) continue;
    
    const value = data[key];
    const valueType = Array.isArray(value) ? 'array' : typeof value;
    const isComplex = valueType === 'object' || valueType === 'array';
    
    const node = document.createElement('div');
    node.className = 'node';
    
    const toggle = document.createElement('i');
    toggle.className = `fas ${isComplex ? 'fa-caret-right' : 'fa-file'}`;
    toggle.style.marginRight = '8px';
    toggle.style.cursor = isComplex ? 'pointer' : 'default';
    
    const keyElement = document.createElement('span');
    keyElement.style.color = '#800080';
    keyElement.textContent = `${key}: `;
    
    const typeIndicator = document.createElement('span');
    typeIndicator.style.color = '#888';
    typeIndicator.textContent = valueType === 'array' ? '[]' : '{}';
    
    const valueElement = document.createElement('span');
    valueElement.style.color = getValueColor(value);
    valueElement.textContent = isComplex ? '' : JSON.stringify(value);
    
    node.appendChild(toggle);
    node.appendChild(keyElement);
    node.appendChild(typeIndicator);
    node.appendChild(valueElement);
    
    if (isComplex) {
const children = document.createElement('div');
children.className = 'children';
children.style.display = 'none';
node.appendChild(children);

toggle.addEventListener('click', () => {
    children.style.display = children.style.display === 'none' ? 'block' : 'none';
    toggle.className = children.style.display === 'none' ? 'fas fa-caret-right' : 'fas fa-caret-down';
});
    }
    
    parentElement.appendChild(node);
    
    if (isComplex) {
renderNode(value, node.querySelector('.children'));
    }
}
    };
    
    renderNode(data, parent);
}

function getValueColor(value) {
    const type = typeof value;
    switch(type) {
case 'string': return '#2a00ff';
case 'number': return '#008000';
case 'boolean': return '#ff0000';
case 'object': return '#800080';
default: return '#000';
    }
}

function formatJSON() {
    try {
const json = JSON.parse(editor.getValue());
editor.setValue(JSON.stringify(json, null, 2));
    } catch (e) {}
}

function minifyJSON() {
    try {
const json = JSON.parse(editor.getValue());
editor.setValue(JSON.stringify(json));
    } catch (e) {}
}

function copyJSON() {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
alert('Copied to clipboard!');
    });
}

function clearInput() {
    editor.setValue('');
}

function toggleView() {
    const treeView = document.getElementById('tree-view');
    const textView = document.getElementById('text-view');
    
    if (currentView === 'tree') {
treeView.style.display = 'none';
textView.style.display = 'block';
currentView = 'text';
    } else {
treeView.style.display = 'block';
textView.style.display = 'none';
currentView = 'tree';
    }
}

function toggleTheme() {
    const body = document.body;
    body.setAttribute('data-theme', body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    localStorage.setItem('theme', body.getAttribute('data-theme'));
}

function updateURL() {
    try {
const json = JSON.parse(editor.getValue());
const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(json))));
window.history.replaceState({}, '', `#${encoded}`);
    } catch (e) {}
}

function loadFromURL() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    
    try {
const decoded = JSON.parse(decodeURIComponent(escape(atob(hash))));
editor.setValue(JSON.stringify(decoded, null, 2));
    } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    loadFromURL();
});
