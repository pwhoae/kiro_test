// ============================================================================
// DATA MODELS AND STORAGE
// ============================================================================

class StorageService {
    constructor() {
        this.storageKey = 'keyword-context-entries';
    }

    loadEntries() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return [];
            
            const entries = JSON.parse(data);
            // Convert date strings back to Date objects
            return entries.map(entry => ({
                ...entry,
                createdAt: new Date(entry.createdAt),
                updatedAt: new Date(entry.updatedAt)
            }));
        } catch (error) {
            console.error('Error loading entries:', error);
            this.showToast('Error loading data', 'error');
            return [];
        }
    }

    saveEntries(entries) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(entries));
        } catch (error) {
            console.error('Error saving entries:', error);
            if (error.name === 'QuotaExceededError') {
                this.showToast('Storage quota exceeded. Please clear some entries.', 'error');
            } else {
                this.showToast('Error saving data', 'error');
            }
        }
    }

    addEntry(entry) {
        const entries = this.loadEntries();
        entries.unshift(entry); // Add to beginning
        this.saveEntries(entries);
    }

    updateEntry(id, updates) {
        const entries = this.loadEntries();
        const index = entries.findIndex(e => e.id === id);
        if (index !== -1) {
            entries[index] = {
                ...entries[index],
                ...updates,
                updatedAt: new Date()
            };
            this.saveEntries(entries);
        }
    }

    deleteEntry(id) {
        const entries = this.loadEntries();
        const filtered = entries.filter(e => e.id !== id);
        this.saveEntries(filtered);
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.className = 'toast';
        }, 3000);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function extractKeywords(text) {
    // Simple keyword extraction: split by spaces and take unique words > 3 chars
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3);
    
    return [...new Set(words)].slice(0, 10); // Max 10 keywords
}

function truncateText(text, maxLength = 25) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
}

function searchEntries(entries, query) {
    if (!query || query.trim() === '') return entries;
    
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry => {
        // Search in keywords
        const keywordMatch = entry.keywords.some(k => 
            k.toLowerCase().includes(lowerQuery)
        );
        
        // Search in context
        const contextMatch = entry.context.toLowerCase().includes(lowerQuery);
        
        return keywordMatch || contextMatch;
    });
}

function filterByTime(entries, startDate, endDate) {
    if (!startDate && !endDate) return entries;
    
    return entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        
        if (startDate && endDate) {
            return entryDate >= startDate && entryDate <= endDate;
        } else if (startDate) {
            return entryDate >= startDate;
        } else if (endDate) {
            return entryDate <= endDate;
        }
        
        return true;
    });
}

function filterByKeyword(entries, keyword) {
    if (!keyword || keyword.trim() === '') return entries;
    
    const lowerKeyword = keyword.toLowerCase();
    return entries.filter(entry => 
        entry.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
    );
}

async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        }
    } catch (error) {
        console.error('Copy failed:', error);
        return false;
    }
}

// ============================================================================
// APPLICATION STATE AND LOGIC
// ============================================================================

class App {
    constructor() {
        this.storage = new StorageService();
        this.entries = [];
        this.filteredEntries = [];
        this.expandedCardId = null;
        this.searchQuery = '';
        this.startDate = null;
        this.endDate = null;
        this.keywordFilter = '';
        this.selectedFile = null;
        this.suggestionIndex = -1;
        this.suggestions = [];
        
        this.init();
    }

    init() {
        // Load entries from storage
        this.entries = this.storage.loadEntries();
        this.applyFilters();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render initial state
        this.render();
    }

    setupEventListeners() {
        // Search box with predictions
        const searchBox = document.getElementById('searchBox');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        searchBox.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.showSearchSuggestions(e.target.value);
            this.applyFilters();
            this.render();
        });
        
        searchBox.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.suggestionIndex >= 0 && this.suggestions.length > 0) {
                    this.selectSuggestion(this.suggestions[this.suggestionIndex]);
                } else {
                    this.applyFilters();
                    this.render();
                }
                this.hideSearchSuggestions();
            } else if (e.key === 'Escape') {
                this.hideSearchSuggestions();
            }
        });
        
        searchBox.addEventListener('blur', () => {
            // Delay to allow click on suggestion
            setTimeout(() => this.hideSearchSuggestions(), 200);
        });
        
        searchBox.addEventListener('focus', (e) => {
            if (e.target.value) {
                this.showSearchSuggestions(e.target.value);
            }
        });

        // File input with actual file reading
        const fileInput = document.getElementById('fileInput');
        const fileButton = document.getElementById('fileButton');
        
        fileButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.selectedFile = file;
                fileButton.textContent = `📁 ${file.name}`;
                fileButton.classList.add('has-file');
                this.readFileContent(file);
            }
        });

        // Text input
        const textInput = document.getElementById('textInput');
        textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleTextInput(e.target.value);
            }
        });

        // Add button
        const addButton = document.getElementById('addButton');
        addButton.addEventListener('click', () => {
            const textValue = textInput.value.trim();
            
            if (textValue) {
                this.handleTextInput(textValue);
            } else if (this.selectedFile) {
                // File already read, just need to trigger add
                this.storage.showToast('Please enter text or select a file', 'error');
            }
        });

        // Date filters
        document.getElementById('startDate').addEventListener('change', (e) => {
            this.startDate = e.target.value ? new Date(e.target.value) : null;
            this.applyFilters();
            this.render();
        });

        document.getElementById('endDate').addEventListener('change', (e) => {
            this.endDate = e.target.value ? new Date(e.target.value) : null;
            this.applyFilters();
            this.render();
        });

        // Keyword filter
        document.getElementById('keywordFilter').addEventListener('input', (e) => {
            this.keywordFilter = e.target.value;
            this.applyFilters();
            this.render();
        });

        // Clear filters
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    async readFileContent(file) {
        try {
            const text = await file.text();
            const textInput = document.getElementById('textInput');
            textInput.value = text;
            this.storage.showToast(`File loaded: ${file.name}`, 'success');
        } catch (error) {
            console.error('Error reading file:', error);
            this.storage.showToast('Error reading file', 'error');
        }
    }

    showSearchSuggestions(query) {
        const suggestionsDiv = document.getElementById('searchSuggestions');
        
        if (!query || query.trim() === '') {
            this.hideSearchSuggestions();
            return;
        }
        
        // Find matching entries
        const lowerQuery = query.toLowerCase();
        const matches = this.entries.filter(entry => {
            const keywordMatch = entry.keywords.some(k => 
                k.toLowerCase().includes(lowerQuery)
            );
            const contextMatch = entry.context.toLowerCase().includes(lowerQuery);
            return keywordMatch || contextMatch;
        }).slice(0, 5); // Limit to 5 suggestions
        
        if (matches.length === 0) {
            this.hideSearchSuggestions();
            return;
        }
        
        this.suggestions = matches;
        this.suggestionIndex = -1;
        
        suggestionsDiv.innerHTML = matches.map((entry, index) => {
            const matchedKeywords = entry.keywords
                .filter(k => k.toLowerCase().includes(lowerQuery))
                .slice(0, 3);
            
            const contextPreview = this.highlightMatch(
                truncateText(entry.context, 60),
                query
            );
            
            return `
                <div class="suggestion-item" data-index="${index}">
                    ${matchedKeywords.map(k => 
                        `<span class="suggestion-keyword">${this.highlightMatch(k, query)}</span>`
                    ).join('')}
                    <div class="suggestion-context">${contextPreview}</div>
                </div>
            `;
        }).join('');
        
        // Add click handlers
        suggestionsDiv.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectSuggestion(matches[index]);
            });
        });
        
        suggestionsDiv.classList.add('show');
    }

    hideSearchSuggestions() {
        const suggestionsDiv = document.getElementById('searchSuggestions');
        suggestionsDiv.classList.remove('show');
        this.suggestionIndex = -1;
    }

    navigateSuggestions(direction) {
        const suggestionsDiv = document.getElementById('searchSuggestions');
        const items = suggestionsDiv.querySelectorAll('.suggestion-item');
        
        if (items.length === 0) return;
        
        // Remove active class from current
        if (this.suggestionIndex >= 0) {
            items[this.suggestionIndex].classList.remove('active');
        }
        
        // Update index
        this.suggestionIndex += direction;
        
        if (this.suggestionIndex < 0) {
            this.suggestionIndex = items.length - 1;
        } else if (this.suggestionIndex >= items.length) {
            this.suggestionIndex = 0;
        }
        
        // Add active class to new
        items[this.suggestionIndex].classList.add('active');
        items[this.suggestionIndex].scrollIntoView({ block: 'nearest' });
    }

    selectSuggestion(entry) {
        const searchBox = document.getElementById('searchBox');
        
        // Use the first keyword as search query
        if (entry.keywords.length > 0) {
            searchBox.value = entry.keywords[0];
            this.searchQuery = entry.keywords[0];
        } else {
            searchBox.value = truncateText(entry.context, 20);
            this.searchQuery = truncateText(entry.context, 20);
        }
        
        this.applyFilters();
        this.render();
        this.hideSearchSuggestions();
    }

    highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="suggestion-highlight">$1</span>');
    }

    handleFileInput(filePath) {
        // This is now handled by the file input change event
        this.storage.showToast('Please use the file button to select a file', 'error');
    }

    handleTextInput(text) {
        if (!text || text.trim() === '') {
            this.storage.showToast('Please enter some text', 'error');
            return;
        }

        const entry = {
            id: generateId(),
            keywords: extractKeywords(text),
            context: text,
            label: this.selectedFile ? this.selectedFile.name : '',
            function: '',
            timestamp: Date.now(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.storage.addEntry(entry);
        this.entries = this.storage.loadEntries();
        this.applyFilters();
        
        // Clear inputs
        document.getElementById('textInput').value = '';
        const fileInput = document.getElementById('fileInput');
        const fileButton = document.getElementById('fileButton');
        fileInput.value = '';
        fileButton.textContent = '📁 Choose File';
        fileButton.classList.remove('has-file');
        this.selectedFile = null;
        
        this.storage.showToast('Entry added successfully!', 'success');
        this.render();
    }

    applyFilters() {
        let filtered = [...this.entries];
        
        // Apply search
        filtered = searchEntries(filtered, this.searchQuery);
        
        // Apply time filter
        filtered = filterByTime(filtered, this.startDate, this.endDate);
        
        // Apply keyword filter
        filtered = filterByKeyword(filtered, this.keywordFilter);
        
        this.filteredEntries = filtered;
    }

    clearFilters() {
        this.searchQuery = '';
        this.startDate = null;
        this.endDate = null;
        this.keywordFilter = '';
        
        document.getElementById('searchBox').value = '';
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        document.getElementById('keywordFilter').value = '';
        
        this.applyFilters();
        this.render();
    }

    toggleCard(id) {
        this.expandedCardId = this.expandedCardId === id ? null : id;
        this.render();
    }

    async handleCopy(entry) {
        const success = await copyToClipboard(entry.context);
        if (success) {
            this.storage.showToast('Copied to clipboard!', 'success');
            
            // Visual feedback on button
            const button = document.querySelector(`[data-copy-id="${entry.id}"]`);
            if (button) {
                button.classList.add('copied');
                button.textContent = '✓ Copied';
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.textContent = '📋 Copy';
                }, 2000);
            }
        } else {
            this.storage.showToast('Failed to copy', 'error');
        }
    }

    handleSave(id, updates) {
        this.storage.updateEntry(id, updates);
        this.entries = this.storage.loadEntries();
        this.applyFilters();
        this.expandedCardId = null;
        this.storage.showToast('Changes saved!', 'success');
        this.render();
    }

    renderCard(entry) {
        const isExpanded = this.expandedCardId === entry.id;
        const card = document.createElement('div');
        card.className = `card ${isExpanded ? 'expanded' : ''}`;
        
        if (isExpanded) {
            card.innerHTML = this.renderExpandedCard(entry);
        } else {
            card.innerHTML = this.renderCollapsedCard(entry);
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('copy-button')) {
                    this.toggleCard(entry.id);
                }
            });
        }
        
        return card;
    }

    renderCollapsedCard(entry) {
        const truncatedContext = truncateText(entry.context, 25);
        const keywords = entry.keywords.slice(0, 5); // Show max 5 keywords
        
        return `
            <button class="copy-button" data-copy-id="${entry.id}" onclick="app.handleCopy(${JSON.stringify(entry).replace(/"/g, '&quot;')})">
                📋 Copy
            </button>
            <div class="card-collapsed">
                <div class="card-keywords">
                    ${keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
                    ${entry.keywords.length > 5 ? `<span class="keyword-tag">+${entry.keywords.length - 5} more</span>` : ''}
                </div>
                <div class="card-context truncated">
                    ${truncatedContext}${entry.context.length > 25 ? '...' : ''}
                </div>
            </div>
        `;
    }

    renderExpandedCard(entry) {
        return `
            <button class="copy-button" data-copy-id="${entry.id}" onclick="app.handleCopy(${JSON.stringify(entry).replace(/"/g, '&quot;')})">
                📋 Copy
            </button>
            <div class="card-expanded">
                <div class="card-field">
                    <label>Label</label>
                    <input type="text" id="label-${entry.id}" value="${entry.label || ''}" placeholder="Enter label...">
                </div>
                <div class="card-field">
                    <label>Function/Category</label>
                    <input type="text" id="function-${entry.id}" value="${entry.function || ''}" placeholder="Enter function...">
                </div>
                <div class="card-field">
                    <label>Keywords</label>
                    <input type="text" id="keywords-${entry.id}" value="${entry.keywords.join(', ')}" placeholder="Enter keywords...">
                </div>
                <div class="card-field">
                    <label>Context</label>
                    <textarea id="context-${entry.id}" placeholder="Enter context...">${entry.context}</textarea>
                </div>
                <div class="card-metadata">
                    Created: ${entry.createdAt.toLocaleString()} | 
                    Updated: ${entry.updatedAt.toLocaleString()}
                </div>
                <div class="card-actions">
                    <button class="save-button" onclick="app.saveCard('${entry.id}')">💾 Save</button>
                    <button class="cancel-button" onclick="app.toggleCard('${entry.id}')">✕ Cancel</button>
                </div>
            </div>
        `;
    }

    saveCard(id) {
        const label = document.getElementById(`label-${id}`).value;
        const func = document.getElementById(`function-${id}`).value;
        const keywordsStr = document.getElementById(`keywords-${id}`).value;
        const context = document.getElementById(`context-${id}`).value;
        
        const keywords = keywordsStr
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0);
        
        this.handleSave(id, {
            label,
            function: func,
            keywords,
            context
        });
    }

    render() {
        const cardGrid = document.getElementById('cardGrid');
        const emptyState = document.getElementById('emptyState');
        const noResults = document.getElementById('noResults');
        
        // Clear grid
        cardGrid.innerHTML = '';
        
        // Show appropriate state
        if (this.entries.length === 0) {
            emptyState.style.display = 'block';
            noResults.style.display = 'none';
            cardGrid.style.display = 'none';
        } else if (this.filteredEntries.length === 0) {
            emptyState.style.display = 'none';
            noResults.style.display = 'block';
            cardGrid.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            noResults.style.display = 'none';
            cardGrid.style.display = 'grid';
            
            // Render cards
            this.filteredEntries.forEach(entry => {
                const card = this.renderCard(entry);
                cardGrid.appendChild(card);
            });
        }
    }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
