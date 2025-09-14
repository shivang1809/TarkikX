document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const input = chatForm?.querySelector('input[name="query"]');
    const submitButton = chatForm?.querySelector('button[type="submit"]');

    // Check if we're on a page with a chat interface
    if (!chatBox || !chatForm || !input) return;

    // Scroll to bottom on load
    scrollToBottom();

    // Handle form submission
    chatForm.addEventListener('submit', handleSubmit);

    // Add keyboard shortcut (Shift + Enter for new line, Enter to send)
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Auto-resize textarea (if using textarea instead of input)
    if (input.tagName === 'TEXTAREA') {
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = `${Math.min(input.scrollHeight, 200)}px`;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const userMessage = input.value.trim();
        if (!userMessage) return;

        // Disable input and button while processing
        input.disabled = true;
        if (submitButton) submitButton.disabled = true;

        try {
            // Add user message to chat
            addMessage('user', userMessage);
            input.value = '';
            resetInputHeight();
            
            // Show typing indicator
            const typingId = showTypingIndicator();
            
            // Send message to server
            const response = await sendMessage(userMessage);
            
            // Remove typing indicator
            removeTypingIndicator(typingId);
            
            // Add assistant's response
            if (response && response.answer) {
                addMessage('assistant', response.answer);
            } else {
                throw new Error('No response from server');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        } finally {
            // Re-enable input and button
            input.disabled = false;
            if (submitButton) submitButton.disabled = false;
            input.focus();
        }
    }

    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = `${role}-msg`;
        
        // Convert markdown to HTML if needed (you can implement markdown parsing here)
        messageContent.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
        
        messageDiv.appendChild(messageContent);
        chatBox.appendChild(messageDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const typingId = `typing-${Date.now()}`;
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'chat-message';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'assistant-msg typing';
        typingContent.innerHTML = `
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        `;
        
        typingDiv.appendChild(typingContent);
        chatBox.appendChild(typingDiv);
        scrollToBottom();
        
        return typingId;
    }

    function removeTypingIndicator(id) {
        const typingElement = document.getElementById(id);
        if (typingElement) {
            typingElement.remove();
        }
    }

    async function sendMessage(message) {
        const formData = new FormData();
        formData.append('query', message);

        const response = await fetch('/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function resetInputHeight() {
        if (input.tagName === 'TEXTAREA') {
            input.style.height = 'auto';
        }
    }

    function escapeHtml(unsafe) {
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    }
});

// Theme handling (light/dark mode)
function initTheme() {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

// Initialize theme when the script loads
initTheme();
