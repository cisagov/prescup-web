/* Shared keyboard, modal focus and user-controlled playback for photo galleries. */
window.PCPhotoGalleryAccessibility = function ({ section, lightbox, advance }) {
    const rotationButton = section.querySelector('.pc-photo-carousel__rotation');
    const closeButton = lightbox.querySelector('.pc-photo-lightbox__close');
    const track = section.querySelector('.pc-photo-carousel__track');
    const delay = Math.max(2500, Number(section.dataset.autoplayDelay) || 4000);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer = null;
    let rotationRequested = false;
    let pointerInside = false;
    let returnFocus = null;
    let previousOverflow = '';
    let inertElements = [];

    function stopTimer() {
        clearInterval(timer);
        timer = null;
    }

    function updatePlayback() {
        stopTimer();
        rotationButton.textContent = rotationRequested ? 'Pause slideshow' : 'Start slideshow';
        // Automatic changes must not repeatedly interrupt a screen reader.
        track.setAttribute('aria-live', rotationRequested ? 'off' : 'polite');
        if (rotationRequested && !pointerInside && !document.hidden && lightbox.hidden) {
            timer = setInterval(advance, delay);
        }
    }

    function pause() {
        rotationRequested = false;
        updatePlayback();
    }

    rotationButton.addEventListener('click', () => {
        rotationRequested = !rotationRequested;
        updatePlayback();
    });
    section.addEventListener('mouseenter', () => {
        pointerInside = true;
        stopTimer();
    });
    section.addEventListener('mouseleave', () => {
        pointerInside = false;
        updatePlayback();
    });
    section.addEventListener('focusin', event => {
        // Once a visitor starts using the gallery, only an explicit Start resumes it.
        if (event.target !== rotationButton) pause();
    });
    document.addEventListener('visibilitychange', updatePlayback);
    reducedMotion.addEventListener('change', event => {
        if (event.matches) pause();
    });

    function openLightbox() {
        if (!lightbox.hidden) return;
        pause();
        returnFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        lightbox.hidden = false;
        lightbox.setAttribute('aria-hidden', 'false');
        // Inert only siblings along the ancestor path: never an ancestor of the dialog.
        // Preserve any pre-existing inert state so closing cannot enable disabled UI.
        for (let branch = lightbox; branch.parentElement; branch = branch.parentElement) {
            for (const sibling of branch.parentElement.children) {
                if (sibling !== branch && !sibling.inert) {
                    sibling.inert = true;
                    inertElements.push(sibling);
                }
            }
            if (branch.parentElement === document.body) break;
        }
        closeButton.focus();
    }

    function closeLightbox() {
        if (lightbox.hidden) return;
        lightbox.hidden = true;
        lightbox.setAttribute('aria-hidden', 'true');
        inertElements.forEach(element => { element.inert = false; });
        inertElements = [];
        document.body.style.overflow = previousOverflow;
        if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    }

    document.addEventListener('keydown', event => {
        if (lightbox.hidden || event.key !== 'Tab') return;
        const controls = Array.from(lightbox.querySelectorAll('button:not([disabled])'))
            .filter(button => button.getClientRects().length);
        const current = controls.indexOf(document.activeElement);
        const next = event.shiftKey
            ? (current <= 0 ? controls.length - 1 : current - 1)
            : (current + 1) % controls.length;
        event.preventDefault();
        controls[next].focus();
    });
    document.addEventListener('focusin', event => {
        if (!lightbox.hidden && !lightbox.contains(event.target)) closeButton.focus();
    });

    // Start paused for everyone, including visitors who prefer reduced motion.
    updatePlayback();
    return { openLightbox, closeLightbox };
};
