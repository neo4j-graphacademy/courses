function initTeamCourses() {
    const courseContainer = document.querySelector('.form-team-courses');
    if (!courseContainer) {
        return;
    }

    const selects = courseContainer.querySelectorAll('select');
    const reorderCourses = () => {
        const courseRows = Array.from(courseContainer.querySelectorAll('.course-row') || []);
        const formButtons = courseContainer.querySelector('.form-buttons');

        // Get the changed select element (the one that triggered the event)
        const changedSelect = document.activeElement as HTMLSelectElement;
        const newValue = parseInt(changedSelect?.value || '0');

        // Increment values before sorting
        if (newValue > 0) {
            courseRows.forEach(row => {
                const select = row.querySelector('select') as HTMLSelectElement;
                if (select && select !== changedSelect) {
                    const currentValue = parseInt(select.value) || 0;
                    if (currentValue >= newValue) {
                        select.value = (currentValue + 1).toString();
                    }
                }
            });
        }

        // Sort courses based on select values
        courseRows.sort((a, b) => {
            const aValue = parseInt(a.querySelector('select')?.value || '0');
            const bValue = parseInt(b.querySelector('select')?.value || '0');

            if (aValue === 0) return 1;  // Move unselected to bottom
            if (bValue === 0) return -1; // Move unselected to bottom

            return aValue - bValue;
        });

        // Reappend courses in new order
        courseRows.forEach(row => {
            courseContainer?.appendChild(row);
        });

        // Ensure form buttons are always at the bottom
        if (formButtons) {
            courseContainer.appendChild(formButtons); // Reappend form buttons at the end
        }
    };

    // Run on page load
    reorderCourses();

    // Run when any select changes
    selects?.forEach(select => {
        select.addEventListener('change', reorderCourses);
    });
}


export default function teamCourses() {
    initTeamCourses()
}