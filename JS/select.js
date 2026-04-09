
    function setupCardSelection(containerId) {
        const container = document.getElementById(containerId);
        const cards = container.querySelectorAll('.radio-card');
        cards.forEach(card => {
            const radio = card.querySelector('input');
            radio.addEventListener('change', function() {
                cards.forEach(c => c.classList.remove('selected'));
                if(this.checked) card.classList.add('selected');
            });
            if(radio.checked) card.classList.add('selected');
        });
    }
    setupCardSelection('roleGroup');
    setupCardSelection('personalityGroup');

    document.getElementById('startWorkspaceBtn').addEventListener('click', () => {
        const selectedRole = document.querySelector('input[name="role"]:checked');
        const selectedPersonality = document.querySelector('input[name="personality"]:checked');

        if(!selectedRole || !selectedPersonality) {
            alert('Пожалуйста, выберите и роль, и тип личности');
            return;
        }

        localStorage.setItem('workspace_role', selectedRole.value);
        localStorage.setItem('workspace_personality', selectedPersonality.value);
        window.location.href = '../HTML/workspace.html';
    });
