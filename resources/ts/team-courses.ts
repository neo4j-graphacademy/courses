function initTeamCourses() {
    const courseContainer = document.querySelector('.form-team-courses');
    if (!courseContainer) {
        return;
    }

    const currentCourses = document.getElementById('currentCourses');
    const availableCourses = document.getElementById('availableCourses');
    const courseOrderInput = document.getElementById('courseOrder') as HTMLInputElement;
    const pathSelect = document.getElementById('pathSelect') as HTMLSelectElement;

    let draggedElement: HTMLElement | null = null;
    let dragStartContainer: HTMLElement | null = null;
    let placeholder: HTMLElement | null = null;

    function createDragImage(element: HTMLElement): HTMLElement {
        const rect = element.getBoundingClientRect();
        const dragImage = element.cloneNode(true) as HTMLElement;

        // Copy all styles from the original element
        const computed = window.getComputedStyle(element);
        const styles = Array.from(computed).reduce((acc, prop) => {
            acc[prop] = computed.getPropertyValue(prop);
            return acc;
        }, {} as { [key: string]: string });

        // Apply the copied styles
        Object.assign(dragImage.style, styles);

        // Override some styles for drag image
        dragImage.style.width = `${rect.width}px`;
        dragImage.style.height = `${rect.height}px`;
        dragImage.style.margin = '0';
        dragImage.style.position = 'fixed';
        dragImage.style.top = '-9999px';
        dragImage.style.left = '-9999px';
        dragImage.style.opacity = '0.7';
        dragImage.style.pointerEvents = 'none';
        dragImage.style.transform = 'none';
        dragImage.style.zIndex = '9999';

        // Copy styles for all child elements
        const sourceElements = element.getElementsByTagName('*');
        const clonedElements = dragImage.getElementsByTagName('*');
        Array.from(sourceElements).forEach((sourceEl, index) => {
            const clonedEl = clonedElements[index] as HTMLElement;
            const computedStyle = window.getComputedStyle(sourceEl);
            const childStyles = Array.from(computedStyle).reduce((acc, prop) => {
                acc[prop] = computedStyle.getPropertyValue(prop);
                return acc;
            }, {} as { [key: string]: string });
            Object.assign(clonedEl.style, childStyles);
        });

        document.body.appendChild(dragImage);
        return dragImage;
    }

    function createPlaceholder(element: HTMLElement): HTMLElement {
        const rect = element.getBoundingClientRect();
        const placeholder = element.cloneNode(true) as HTMLElement;

        // Copy all styles from the original element
        const computed = window.getComputedStyle(element);
        const styles = Array.from(computed).reduce((acc, prop) => {
            acc[prop] = computed.getPropertyValue(prop);
            return acc;
        }, {} as { [key: string]: string });

        // Apply the copied styles and placeholder-specific styles
        Object.assign(placeholder.style, styles);
        placeholder.style.width = `${rect.width}px`;
        placeholder.style.height = `${rect.height}px`;
        placeholder.style.margin = computed.margin;
        placeholder.style.boxSizing = 'border-box';
        placeholder.style.pointerEvents = 'none';
        placeholder.classList.add('drag-placeholder');

        return placeholder;
    }

    function handleDragStart(e: DragEvent) {
        if (!(e.target instanceof HTMLElement)) return;
        draggedElement = e.target.closest('.course-row');
        if (!draggedElement) return;

        // Store original container
        dragStartContainer = draggedElement.parentElement as HTMLElement;

        // Create and insert placeholder
        placeholder = createPlaceholder(draggedElement);
        draggedElement.parentElement?.insertBefore(placeholder, draggedElement.nextSibling);

        draggedElement.classList.add('dragging');

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedElement.dataset.courseSlug || '');

            // Create and set custom drag image
            const dragImage = createDragImage(draggedElement);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => dragImage.remove(), 0);
        }
    }

    function handleDragEnd(e: DragEvent) {
        if (!draggedElement || !dragStartContainer) return;

        const dropContainer = draggedElement.parentElement;

        // If dropped outside valid targets, return to original position
        if (!dropContainer || (!dropContainer.matches('#currentCourses') && !dropContainer.matches('#availableCourses'))) {
            if (placeholder) {
                placeholder.parentElement?.insertBefore(draggedElement, placeholder);
            } else {
                dragStartContainer.appendChild(draggedElement);
            }
        }

        // Clean up
        draggedElement.classList.remove('dragging');
        placeholder?.remove();
        placeholder = null;
        draggedElement = null;
        dragStartContainer = null;

        // Remove drag-over styling from containers
        [currentCourses, availableCourses].forEach(container => {
            container?.classList.remove('drag-over');
        });

        updateCourseOrder();
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        if (!draggedElement || !(e.target instanceof HTMLElement)) return;

        const container = e.target.closest('.course-list');
        if (!container) return;

        container.classList.add('drag-over');

        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }

        const afterElement = getDragAfterElement(container as HTMLElement, e.clientY);
        if (placeholder) {
            if (afterElement === placeholder) return;

            if (afterElement) {
                container.insertBefore(placeholder, afterElement);
            } else {
                container.appendChild(placeholder);
            }
        }
    }

    function handleDragLeave(e: DragEvent) {
        if (!(e.target instanceof HTMLElement)) return;
        const container = e.target.closest('.course-list');
        container?.classList.remove('drag-over');
    }

    function updateButtonForContainer(courseRow: HTMLElement, container: HTMLElement) {
        const isCurrentCourses = container.id === 'currentCourses';
        const existingButton = courseRow.querySelector('.course-remove, .course-add') as HTMLElement;

        if (existingButton) {
            const newButton = document.createElement('button');
            if (isCurrentCourses) {
                newButton.className = 'course-remove';
                newButton.setAttribute('aria-label', 'Remove course');
                newButton.textContent = 'Remove';
                newButton.addEventListener('click', handleRemoveCourse);
            } else {
                newButton.className = 'course-add';
                newButton.setAttribute('aria-label', 'Add course');
                newButton.textContent = 'Add';
                newButton.addEventListener('click', handleAddCourse);
            }
            newButton.setAttribute('type', 'button');
            existingButton.replaceWith(newButton);
        }
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        if (!draggedElement || !(e.target instanceof HTMLElement)) return;

        const dropZone = e.target.closest('.course-list') as HTMLElement;
        if (!dropZone) return;

        // Remove drag-over styling
        dropZone.classList.remove('drag-over');

        // Insert the dragged element where the placeholder is
        if (placeholder) {
            placeholder.parentElement?.insertBefore(draggedElement, placeholder);
            placeholder.remove();
            placeholder = null;
        } else {
            const afterElement = getDragAfterElement(dropZone, e.clientY);
            if (afterElement) {
                dropZone.insertBefore(draggedElement, afterElement);
            } else {
                dropZone.appendChild(draggedElement);
            }
        }

        // Update the button based on the new container
        updateButtonForContainer(draggedElement, dropZone);

        updateCourseOrder();
    }

    function getDragAfterElement(container: HTMLElement, y: number): Element | null {
        const draggableElements = Array.from(container.querySelectorAll('.course-row:not(.dragging):not(.drag-placeholder)'));

        return draggableElements.reduce((closest: { offset: number; element: Element | null }, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    }

    function updateCourseOrder() {
        if (!currentCourses) return;
        const courseOrder = Array.from(currentCourses.querySelectorAll('.course-row'))
            .map(row => (row as HTMLElement).dataset.courseSlug)
            .join(',');

        courseOrderInput.value = courseOrder;
    }

    function handleRemoveCourse(e: Event) {
        const button = e.target as HTMLElement;
        const courseRow = button.closest('.course-row') as HTMLElement;
        if (!courseRow || !availableCourses) return;

        // Insert at the top of available courses
        const firstChild = availableCourses.firstChild;
        if (firstChild) {
            availableCourses.insertBefore(courseRow, firstChild);
        } else {
            availableCourses.appendChild(courseRow);
        }
        updateButtonForContainer(courseRow, availableCourses);
        updateCourseOrder();
    }

    function handleAddCourse(e: Event) {
        const button = e.target as HTMLElement;
        const courseRow = button.closest('.course-row') as HTMLElement;
        if (!courseRow || !currentCourses) return;

        currentCourses.appendChild(courseRow);
        updateButtonForContainer(courseRow, currentCourses);
        updateCourseOrder();
    }

    function handleCourseSelection(courses: string[]) {
        if (!currentCourses || !availableCourses) return;

        const currentCourseCount = currentCourses.querySelectorAll('.course-row').length;

        if (currentCourseCount > 0) {
            if (!confirm('This will replace your current course selection. Are you sure?')) {
                return;
            }
        }

        // Move all courses back to available
        const existingCourses = Array.from(currentCourses.querySelectorAll('.course-row'));
        existingCourses.forEach(course => {
            availableCourses.appendChild(course);
        });

        // Move selected courses to current in the specified order
        courses.forEach(courseSlug => {
            const courseRow = availableCourses.querySelector(`[data-course-slug="${courseSlug}"]`);
            if (courseRow) {
                currentCourses.appendChild(courseRow);
            }
        });

        updateCourseOrder();
    }

    function handlePathSelection(courses: string[]) {
        if (!currentCourses || !availableCourses) return false;

        // Check if there are any current courses
        const hasCurrentCourses = currentCourses.querySelectorAll('.course-row').length > 0;
        if (hasCurrentCourses) {
            if (!confirm('Your current course selection will be replaced. Are you sure?')) {
                return false;
            }
        }

        // Move all current courses to available
        Array.from(currentCourses.querySelectorAll('.course-row')).forEach(row => {
            const courseRow = row as HTMLElement;
            availableCourses.appendChild(courseRow);
            updateButtonForContainer(courseRow, availableCourses);
        });

        // Add selected courses in order
        let coursesAdded = 0;
        courses.forEach(slug => {
            const courseRow = document.getElementById(`course-${slug}`);
            if (courseRow) {
                currentCourses.appendChild(courseRow);
                updateButtonForContainer(courseRow as HTMLElement, currentCourses);
                coursesAdded++;
            }
        });

        updateCourseOrder();
        return coursesAdded > 0;
    }

    // Initialize drag and drop listeners
    [currentCourses, availableCourses].forEach(container => {
        if (!container) return;

        container.addEventListener('dragover', (e: Event) => handleDragOver(e as DragEvent));
        container.addEventListener('dragleave', (e: Event) => handleDragLeave(e as DragEvent));
        container.addEventListener('drop', (e: Event) => handleDrop(e as DragEvent));
    });

    // Add drag and drop listeners to course rows
    const courseRows = document.querySelectorAll('.course-row');
    Array.from(courseRows).forEach(row => {
        row.addEventListener('dragstart', (e: Event) => handleDragStart(e as DragEvent));
        row.addEventListener('dragend', (e: Event) => handleDragEnd(e as DragEvent));
    });

    // Add click listeners to remove buttons
    const removeButtons = document.querySelectorAll('.course-remove');
    Array.from(removeButtons).forEach(button => {
        button.addEventListener('click', handleRemoveCourse);
    });

    const addButtons = document.querySelectorAll('.course-add');
    Array.from(addButtons).forEach(button => {
        button.addEventListener('click', handleAddCourse);
    });

    // Initialize path select handler
    pathSelect?.addEventListener('change', (e: Event) => {
        const select = e.target as HTMLSelectElement;

        if (!select.value) {
            return;
        }

        // Split and trim each course
        const selectedCourses = select.value
            .split(',')
            .map(course => course.trim())
            .filter(course => course.length > 0);


        if (selectedCourses.length === 0) {
            return;
        }

        const success = handlePathSelection(selectedCourses);
        if (!success) {
            select.value = ''; // Reset if user cancelled or no courses were added
        }
    });

    // Initialize with current order
    updateCourseOrder();
}

export default function teamCourses() {
    initTeamCourses();
}