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
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#64F079">
                    <g fill="none" fill-rule="evenodd">
                        <g transform="translate(1 1)" stroke-width="2">
                            <circle cx="18" cy="18" r="18" stroke-opacity=".5"/>
                            <path d="M36 18c0-9.94-8.06-18-18-18">
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 18 18"
                                    to="360 18 18"
                                    dur="1s"
                                    repeatCount="indefinite"/>
                            </path>
                        </g>
                    </g>
                </svg>`;
        }

        try {
            // Add user message to chat immediately for better UX
            addMessage('user', userMessage);
            input.value = '';
            resetInputHeight();
            
            // Show typing indicator
            const typingId = showTypingIndicator();
            
            try {
                // Try AJAX first
                const response = await sendMessage(userMessage);
                
                // If we got a response, update the UI
                if (response && response.answer) {
                    const timestamp = response.timestamp || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    addMessage('assistant', response.answer, timestamp);
                } else {
                    // If no response, submit the form normally
                    chatForm.submit();
                }
            } catch (error) {
                console.error('AJAX Error:', error);
                // If AJAX fails, submit the form normally
                chatForm.submit();
            } finally {
                // Always remove typing indicator
                removeTypingIndicator(typingId);
            }
        } catch (error) {
            console.error('Error:', error);
            // If something went wrong, just submit the form normally
            chatForm.submit();
        } finally {
            // Re-enable input and button
            input.disabled = false;
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = `
                    <svg width="33" height="33" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 17L11 12L6 7M13 17L18 12L13 7" stroke="#64F079" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </svg>`;
            }
            input.focus();
        }
    }

    function addMessage(role, content, timestamp = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message`;
        
        // Create avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        
        // Set avatar SVG based on role
        if (role === 'user') {
            avatarDiv.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#64F079" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
        } else {
            avatarDiv.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#64F079" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8V16M8 12H16" stroke="#64F079" stroke-width="2" stroke-linecap="round"/>
                </svg>`;
        }
        
        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Create message text and timestamp
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.innerHTML = escapeHtml(content).replace(/\n/g, '<br>');
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = timestamp || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Append elements
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);
        messageDiv.appendChild(avatarDiv);
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
