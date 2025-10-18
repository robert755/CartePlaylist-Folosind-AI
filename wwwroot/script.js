const playlistForm = document.getElementById('playlistForm');
const generateBtn = document.getElementById('generateBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

playlistForm.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(playlistForm);
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim()
    };
    
    if (!bookData.title && !bookData.author) {
        showError('Te rog sa introduci cel putin titlul cartii sau autorul.');
        return;
    }
    
    try {
        showLoading();
        const response = await fetch('/api/playlist/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'A aparut o eroare');
        }
        
        showResults(result);
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

function showLoading() {
    hideAllSections();
    loadingSection.style.display = 'block';
    loadingSection.classList.add('fade-in');
    generateBtn.disabled = true;
}

function showResults(data) {
    hideAllSections();
    
    document.getElementById('bookTitleResult').textContent = data.bookTitle || 'Titlu necunoscut';
    document.getElementById('bookAuthorResult').textContent = data.bookAuthor ? `de ${data.bookAuthor}` : '';
    document.getElementById('bookDescription').textContent = data.description || 'Descriere indisponibila';
    document.getElementById('playlistContent').textContent = data.playlist || 'Nu s-a putut genera playlist-ul.';
    
    resultsSection.style.display = 'block';
    resultsSection.classList.add('fade-in');
    generateBtn.disabled = false;
}

function showError(message) {
    hideAllSections();
    
    document.getElementById('errorMessage').textContent = message;
    errorSection.style.display = 'block';
    errorSection.classList.add('fade-in');
    generateBtn.disabled = false;
}

function hideAllSections() {
    const sections = [loadingSection, resultsSection, errorSection];
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('fade-in');
    });
}

function resetForm() {
    hideAllSections();
    playlistForm.reset();
    generateBtn.disabled = false;
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function addFadeInAnimation(element) {
    element.classList.add('fade-in');
    setTimeout(() => {
        element.classList.remove('fade-in');
    }, 500);
}

function setupRealTimeValidation() {
    const inputs = playlistForm.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });
}

function validateForm() {
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    
    const hasTitle = titleInput.value.trim().length > 0;
    const hasAuthor = authorInput.value.trim().length > 0;
    
    generateBtn.disabled = !hasTitle && !hasAuthor;
    
    [titleInput, authorInput].forEach(input => {
        if (input.value.trim().length > 0) {
            input.style.borderColor = 'var(--success-color)';
        } else {
            input.style.borderColor = '';
        }
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            if (!generateBtn.disabled) {
                playlistForm.dispatchEvent(new Event('submit'));
            }
        }
        
        if (e.key === 'Escape') {
            resetForm();
        }
    });
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}


document.addEventListener('DOMContentLoaded', () => {
    setupRealTimeValidation();
    setupKeyboardShortcuts();
});


const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .playlist-actions {
        animation: fadeIn 0.5s ease-out;
    }
`;
document.head.appendChild(style);
