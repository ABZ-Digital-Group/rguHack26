// Splash Screen Transition Logic

document.addEventListener('DOMContentLoaded', function() {
    const getStartedBtn = document.getElementById('getStartedBtn');
    const splashScreen = document.querySelector('.splash-screen');

    // Add click event listener to Get Started button
    getStartedBtn.addEventListener('click', function() {
        handleGetStarted();
    });

    // Allow pressing Enter key as well
    document.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleGetStarted();
        }
    });

    function handleGetStarted() {
        // Disable button during transition
        getStartedBtn.classList.add('loading');
        getStartedBtn.disabled = true;

        // Add exit animation
        splashScreen.classList.add('exit');

        // Redirect to login after animation completes
        setTimeout(function() {
            window.location.href = '/login';
        }, 800); // Match the animation duration
    }
});
