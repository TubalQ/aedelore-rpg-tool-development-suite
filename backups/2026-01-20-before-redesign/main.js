// Main character sheet management functions

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Dropdown Menu Functions
// ============================================
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');

    // Close all dropdowns first
    closeDropdowns();

    // Toggle the clicked dropdown
    if (!isOpen) {
        dropdown.classList.add('open');
    }
}

function closeDropdowns() {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        closeDropdowns();
    }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDropdowns();
    }
});

// Get all form fields
function getAllFields() {
    const data = {};
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
        data[input.id] = input.value;
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        data[checkbox.id] = checkbox.checked;
    });

    // Save select/dropdown values (race, class, religion)
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        data[select.id] = select.value;
    });

    // Save range sliders
    const ranges = document.querySelectorAll('input[type="range"]');
    ranges.forEach(range => {
        data[range.id] = range.value;
    });

    return data;
}

// Set all form fields
function setAllFields(data) {
    // First, set race and class to ensure proper initialization
    // This is critical for Mage class (which needs 10 spell slots) and race-specific HP
    const priorityFields = ['race', 'class'];
    priorityFields.forEach(key => {
        if (data[key]) {
            const element = document.getElementById(key);
            if (element && element.tagName === 'SELECT') {
                element.value = data[key];
                // Trigger change event to update bonuses, spell table, HP max, etc.
                element.dispatchEvent(new Event('change'));
            }
        }
    });

    // Then set all other fields
    Object.keys(data).forEach(key => {
        // Skip race and class since we already set them
        if (priorityFields.includes(key)) return;

        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
                // Trigger change event for armor broken checkboxes to restore visual state
                if (key.includes('armor_') && key.includes('_broken')) {
                    element.dispatchEvent(new Event('change'));
                }
            } else if (element.type === 'range') {
                element.value = data[key];
                // Trigger input event to update display
                element.dispatchEvent(new Event('input'));
            } else if (element.tagName === 'SELECT') {
                element.value = data[key];
                // Trigger change event to update bonuses and auto-fill
                element.dispatchEvent(new Event('change'));
            } else {
                element.value = data[key];
            }
        }
    });
}

// Save character to localStorage
function saveCharacter() {
    const data = getAllFields();
    localStorage.setItem('aedelore_character', JSON.stringify(data));
    alert('✅ Character saved successfully!');
}

// Load character from localStorage
function loadCharacter() {
    const saved = localStorage.getItem('aedelore_character');
    if (saved) {
        const data = JSON.parse(saved);
        setAllFields(data);
        alert('✅ Character loaded successfully!');
    } else {
        alert('❌ No saved character found!');
    }
}

// Export character as JSON file
function exportCharacter() {
    const data = getAllFields();
    const characterName = data.character_name || 'character';
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterName.replace(/\s+/g, '_')}_aedelore.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import character from JSON file
function importCharacter() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                setAllFields(data);
                alert('✅ Character imported successfully!');
            } catch (error) {
                alert('❌ Error importing character: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Clear all fields
function clearCharacter() {
    if (confirm('⚠️ Are you sure you want to clear all fields? This cannot be undone.')) {
        document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        document.querySelectorAll('input[type="range"]').forEach(range => {
            range.value = range.min || 0;
            range.dispatchEvent(new Event('input'));
        });
        alert('✅ All fields cleared!');
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    const data = getAllFields();
    localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
}, 30000);

// Load autosave on page load
window.addEventListener('load', () => {
    const autosave = localStorage.getItem('aedelore_character_autosave');
    if (autosave) {
        const data = JSON.parse(autosave);
        setAllFields(data);
    }
    // Check if user is logged in
    updateAuthUI();
});

// ============================================
// Server Authentication & Cloud Save Functions
// ============================================

let authToken = localStorage.getItem('aedelore_auth_token');
let currentCharacterId = null;

function updateAuthUI() {
    // New dropdown-based UI elements
    const loggedOutDiv = document.getElementById('server-logged-out');
    const loggedInDiv = document.getElementById('server-logged-in');
    const serverBtnText = document.getElementById('server-btn-text');

    if (authToken) {
        // Logged in state
        if (loggedOutDiv) loggedOutDiv.style.display = 'none';
        if (loggedInDiv) loggedInDiv.style.display = 'block';
        if (serverBtnText) serverBtnText.textContent = 'Cloud ✓';
    } else {
        // Logged out state
        if (loggedOutDiv) loggedOutDiv.style.display = 'block';
        if (loggedInDiv) loggedInDiv.style.display = 'none';
        if (serverBtnText) serverBtnText.textContent = 'Cloud';
    }
}

function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    usernameInput.value = '';
    passwordInput.value = '';
    document.getElementById('auth-error').textContent = '';

    // Handle Enter key on inputs
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    };
    usernameInput.onkeydown = handleEnter;
    passwordInput.onkeydown = handleEnter;

    if (mode === 'login') {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleText.innerHTML = 'No account? <a href="#" onclick="showAuthModal(\'register\'); return false;">Register here</a>';
        submitBtn.onclick = doLogin;
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleText.innerHTML = 'Have an account? <a href="#" onclick="showAuthModal(\'login\'); return false;">Login here</a>';
        submitBtn.onclick = doRegister;
    }

    modal.style.display = 'flex';
    usernameInput.focus();
}

function hideAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

async function doLogin() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Login failed';
            return;
        }

        authToken = data.token;
        localStorage.setItem('aedelore_auth_token', authToken);
        hideAuthModal();
        updateAuthUI();
        alert('✅ Logged in successfully!');
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

async function doRegister() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Registration failed';
            return;
        }

        authToken = data.token;
        localStorage.setItem('aedelore_auth_token', authToken);
        hideAuthModal();
        updateAuthUI();
        alert('✅ Account created and logged in!');
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

async function doLogout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
    } catch (e) {
        // Ignore errors
    }

    authToken = null;
    currentCharacterId = null;
    localStorage.removeItem('aedelore_auth_token');
    updateAuthUI();
    alert('✅ Logged out successfully!');
}

async function saveToServer() {
    if (!authToken) {
        showAuthModal('login');
        return;
    }

    const data = getAllFields();
    const characterName = data.character_name || 'Unnamed Character';
    const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

    try {
        let res;
        if (currentCharacterId) {
            // Update existing character
            res = await fetch(`/api/characters/${currentCharacterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: characterName, data, system })
            });
        } else {
            // Create new character
            res = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: characterName, data, system })
            });
        }

        if (res.status === 401) {
            authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            updateAuthUI();
            alert('❌ Session expired. Please login again.');
            showAuthModal('login');
            return;
        }

        const result = await res.json();

        if (!res.ok) {
            alert(`❌ Error: ${result.error}`);
            return;
        }

        if (result.id) {
            currentCharacterId = result.id;
        }

        alert('✅ Character saved to server!');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function loadFromServer() {
    if (!authToken) {
        showAuthModal('login');
        return;
    }

    try {
        const res = await fetch('/api/characters', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.status === 401) {
            authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            updateAuthUI();
            alert('❌ Session expired. Please login again.');
            showAuthModal('login');
            return;
        }

        const characters = await res.json();

        if (characters.length === 0) {
            alert('No saved characters found on server.');
            return;
        }

        showCharacterListModal(characters);
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

function showCharacterListModal(characters) {
    const modal = document.getElementById('character-list-modal');
    const list = document.getElementById('character-list');

    // Store character names for delete confirmation (avoids XSS in onclick)
    window._characterNames = {};
    characters.forEach(char => {
        window._characterNames[char.id] = char.name;
    });

    // System display names
    const systemNames = {
        'aedelore': 'Aedelore',
        'dnd5e': 'D&D 5e',
        'pathfinder2e': 'PF2e',
        'storyteller': 'WoD',
        'cod': 'CofD'
    };

    list.innerHTML = characters.map(char => {
        const systemId = char.system || 'aedelore';
        const systemName = systemNames[systemId] || systemId;
        return `
            <div class="character-list-item" onclick="loadCharacterById(${parseInt(char.id)})">
                <div class="character-info">
                    <span class="character-name">${escapeHtml(char.name)}</span>
                    <span class="character-system" data-system="${systemId}">${escapeHtml(systemName)}</span>
                </div>
                <span class="character-date">${escapeHtml(new Date(char.updated_at).toLocaleDateString())}</span>
                <button class="delete-char-btn" onclick="event.stopPropagation(); deleteCharacterById(${parseInt(char.id)})">🗑️</button>
            </div>
        `;
    }).join('');

    modal.style.display = 'flex';
}

function hideCharacterListModal() {
    document.getElementById('character-list-modal').style.display = 'none';
}

async function loadCharacterById(id) {
    try {
        const res = await fetch(`/api/characters/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            alert('❌ Error loading character');
            return;
        }

        const character = await res.json();
        const currentSystem = localStorage.getItem('aedelore_selected_system') || 'aedelore';
        const charSystem = character.system || 'aedelore';

        // Check if character's system matches current system
        if (charSystem !== currentSystem) {
            const systemNames = {
                'aedelore': 'Aedelore',
                'dnd5e': 'D&D 5e',
                'pathfinder2e': 'Pathfinder 2e',
                'storyteller': 'Storyteller (WoD)',
                'cod': 'Chronicles of Darkness'
            };
            const charSystemName = systemNames[charSystem] || charSystem;
            const currentSystemName = systemNames[currentSystem] || currentSystem;

            if (confirm(`This character was created in ${charSystemName}, but you're currently using ${currentSystemName}.\n\nSwitch to ${charSystemName} and load this character?`)) {
                // Switch system and reload
                localStorage.setItem('aedelore_selected_system', charSystem);
                localStorage.setItem('aedelore_pending_character_id', id);
                location.reload();
                return;
            } else {
                return;
            }
        }

        // Parse data if it's a string (API returns JSON string for mobile app compatibility)
        const charData = typeof character.data === 'string' ? JSON.parse(character.data) : character.data;
        setAllFields(charData);
        currentCharacterId = id;
        hideCharacterListModal();
        alert('✅ Character loaded from server!');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function deleteCharacterById(id) {
    const name = window._characterNames?.[id] || 'this character';
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/characters/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            alert('❌ Error deleting character');
            return;
        }

        if (currentCharacterId === id) {
            currentCharacterId = null;
        }

        // Refresh the list
        loadFromServer();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function deleteAccount() {
    if (!authToken) {
        alert('You must be logged in to delete your account.');
        return;
    }

    const password = prompt('⚠️ WARNING: This will permanently delete your account and ALL saved characters!\n\nEnter your password to confirm:');

    if (!password) {
        return;
    }

    if (!confirm('Are you ABSOLUTELY sure? This cannot be undone!')) {
        return;
    }

    try {
        const res = await fetch('/api/account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`❌ ${data.error || 'Failed to delete account'}`);
            return;
        }

        authToken = null;
        currentCharacterId = null;
        localStorage.removeItem('aedelore_auth_token');
        updateAuthUI();
        alert('✅ Account deleted successfully.');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}
