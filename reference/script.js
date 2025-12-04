// Import roughjs using esm.sh (converts npm packages to ES modules)
import roughjs from 'https://esm.sh/roughjs@latest';
// Handle different export formats
const rough = roughjs.default || roughjs.rough || roughjs;

// Initialize variables
let ratsScore = 0;
let newyorkersScore = 0;
const processedSteps = new Set();


// Initialize Scrollama
const scroller = scrollama();

// Tally mark creation function with rough.js
function createTallyMark(group, index) {
    // Scale up positions by 25%
    const scale = 1.25;
    const baseX = 20;
    const spacing = 18;
    const x = baseX + (index % 5) * spacing * scale;
    const y1 = Math.floor(index / 5) * 30 * scale + 15;
    const y2 = y1 + 25 * scale;
    
    // Check if rough is available
    if (!rough) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('tally-mark');
        
        if ((index + 1) % 5 === 0 && index > 0) {
            const groupRow = Math.floor(index / 5);
            line.setAttribute('x1', baseX - 5);
            line.setAttribute('y1', groupRow * 30 * scale + 12);
            line.setAttribute('x2', baseX + (4 * spacing * scale) + 5);
            line.setAttribute('y2', groupRow * 30 * scale + 12 + (25 * scale));
            line.classList.add('diagonal');
        } else {
            line.setAttribute('x1', x);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y2);
            line.classList.add('vertical');
        }
        return line;
    }
    
    // Use rough.js to draw hand-drawn tally marks
    const rc = rough.svg(group);
    
    // Every 5th mark is diagonal
    if ((index + 1) % 5 === 0 && index > 0) {
        const groupRow = Math.floor(index / 5);
        const x1 = baseX - 5;
        const y1 = groupRow * 30 * scale + 12;
        const x2 = baseX + (4 * spacing * scale) + 5;
        const y2 = groupRow * 30 * scale + 12 + (25 * scale);
        
        const roughLine = rc.line(x1, y1, x2, y2, {
            stroke: 'currentColor',
            strokeWidth: 4,
            roughness: 1.2,
            bowing: 1.5,
        });
        roughLine.classList.add('tally-mark', 'diagonal');
        return roughLine;
    } else {
        // Vertical marks
        const roughLine = rc.line(x, y1, x, y2, {
            stroke: 'currentColor',
            strokeWidth: 4,
            roughness: 1.2,
            bowing: 1.5,
        });
        roughLine.classList.add('tally-mark', 'vertical');
        return roughLine;
    }
}



// Add tally function
function addTally(winner) {
    if (winner === 'rats') {
        const tallyContainer = document.querySelector('#ratsTally svg');
        const newMark = createTallyMark(tallyContainer, ratsScore);
        tallyContainer.appendChild(newMark);
        
        // Trigger animation
        setTimeout(() => {
            newMark.classList.add('animate');
        }, 50);
        
        ratsScore++;
        document.getElementById('ratsScore').textContent = ratsScore;
    } else if (winner === 'newyorkers') {
        const tallyContainer = document.querySelector('#newyorkersTally svg');
        const newMark = createTallyMark(tallyContainer, newyorkersScore);
        tallyContainer.appendChild(newMark);
        
        // Trigger animation
        setTimeout(() => {
            newMark.classList.add('animate');
        }, 50);
        
        newyorkersScore++;
        document.getElementById('newyorkersScore').textContent = newyorkersScore;
    }
}

// Remove tally function
function removeTally(winner) {
    if (winner === 'rats') {
        const tallyContainer = document.querySelector('#ratsTally svg');
        const marks = tallyContainer.querySelectorAll('.tally-mark');
        if (marks.length > 0) {
            marks[marks.length - 1].remove();
            ratsScore--;
            document.getElementById('ratsScore').textContent = ratsScore;
        }
    } else if (winner === 'newyorkers') {
        const tallyContainer = document.querySelector('#newyorkersTally svg');
        const marks = tallyContainer.querySelectorAll('.tally-mark');
        if (marks.length > 0) {
            marks[marks.length - 1].remove();
            newyorkersScore--;
            document.getElementById('newyorkersScore').textContent = newyorkersScore;
        }
    }
}

// Reset tallies function
function resetTallies() {
    // Clear SVG containers
    document.querySelector('#ratsTally svg').innerHTML = '';
    document.querySelector('#newyorkersTally svg').innerHTML = '';
    
    // Reset scores
    ratsScore = 0;
    newyorkersScore = 0;
    document.getElementById('ratsScore').textContent = '0';
    document.getElementById('newyorkersScore').textContent = '0';
    
    // Clear processed steps
    processedSteps.clear();
}

// Rebuild tallies up to current step
// Rebuild tallies up to current step
function rebuildTallies(currentStep) {
    const events = document.querySelectorAll('.timeline-event');

    events.forEach((event) => {
        const step = parseInt(event.dataset.step);

        if (step <= currentStep && !processedSteps.has(step)) {
            const winner = event.dataset.winner;
            addTally(winner);
            processedSteps.add(step);
        }
    });
}

// Handle step enter
function handleStepEnter(response) {
    const { element, index, direction } = response;
    
    // Add active class to current step
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => step.classList.remove('is-active'));
    element.classList.add('is-active');
    
    const currentStep = parseInt(element.dataset.step);
    
    // Rebuild tallies based on current position
    rebuildTallies(currentStep);
}

// Handle step exit
// Handle step exit
function handleStepExit(response) {
    const { element, index, direction } = response;
    
    // If scrolling up and exiting from top, remove this step's tally
    if (direction === 'up') {
        const currentStep = parseInt(element.dataset.step);
        const winner = element.dataset.winner;
        
        // Remove this step's tally if it was processed
        if (processedSteps.has(currentStep)) {
            removeTally(winner);
            processedSteps.delete(currentStep);
        }
    }
}

// Initialize Scrollama
function init() {
    // Setup the scroller
    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);

    // Setup resize event
    window.addEventListener('resize', scroller.resize);
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Draw timeline line (normal SVG line, not rough.js)
function drawTimelineLine() {
    const timelineLine = document.getElementById('timelineLine');
    if (!timelineLine) {
        console.warn('Timeline line element not found');
        return;
    }
    
    const container = timelineLine.closest('.timeline-container');
    if (!container) return;
    
    const events = container.querySelectorAll('.timeline-event');
    if (events.length === 0) return;
    
    // Get container dimensions and rect
    const containerHeight = container.scrollHeight;
    const containerWidth = container.offsetWidth;
    const containerRect = container.getBoundingClientRect();
    
    // Get first and last dots
    const firstEvent = events[0];
    const firstDot = firstEvent.querySelector('.event-dot');
    if (!firstDot) return;
    
    const lastEvent = events[events.length - 1];
    const lastDot = lastEvent.querySelector('.event-dot');
    if (!lastDot) return;
    
    // Calculate line X position (center of dots) relative to container
    const firstDotRect = firstDot.getBoundingClientRect();
    const lineX = firstDotRect.left + firstDotRect.width / 2 - containerRect.left;
    
    // Get relative positions within container
    const lastDotRect = lastDot.getBoundingClientRect();
    const firstDotTop = firstDotRect.top + firstDotRect.height / 2 - containerRect.top;
    const lastDotTop = lastDotRect.top + lastDotRect.height / 2 - containerRect.top;
    
    // Set SVG dimensions to match container
    timelineLine.setAttribute('width', containerWidth);
    timelineLine.setAttribute('height', containerHeight);
    timelineLine.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
    
    // Clear previous line
    timelineLine.innerHTML = '';
    
    // Draw normal SVG line (not rough.js)
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', lineX);
    line.setAttribute('y1', firstDotTop);
    line.setAttribute('x2', lineX);
    line.setAttribute('y2', lastDotTop);
    line.setAttribute('stroke', '#bdc3c7');
    line.setAttribute('stroke-width', '2');
    timelineLine.appendChild(line);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Draw timeline line after layout is complete
    // Use requestAnimationFrame to ensure layout is calculated
    requestAnimationFrame(() => {
        setTimeout(() => {
            drawTimelineLine();
            // Redraw on resize
            window.addEventListener('resize', () => {
                setTimeout(drawTimelineLine, 100);
            });
        }, 300);
    });
});

// Optional: Add intersection observer for fade-in effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
        }
    });
}, observerOptions);

// Observe intro text
document.addEventListener('DOMContentLoaded', () => {
    const introText = document.querySelector('.intro-text');
    if (introText) {
        observer.observe(introText);
    }
    
    // Set up scroll animation for contestant images
    setupContestantImageAnimation();
});

// Animate contestant images from intro to tally sections
function setupContestantImageAnimation() {
    const introSection = document.querySelector('.intro');
    const scrollySection = document.querySelector('.scrolly');
    const ratImageIntro = document.getElementById('ratImage');
    const nyImageIntro = document.getElementById('nyImage');
    const ratImageTally = document.getElementById('ratImageTally');
    const nyImageTally = document.getElementById('nyImageTally');
    const ratTallySection = document.querySelector('.tally-rats');
    const nyTallySection = document.querySelector('.tally-newyorkers');
    
    if (!introSection || !scrollySection || !ratImageIntro || !nyImageIntro) return;
    
    // Create intersection observer for when scrolly section comes into view
    const scrollyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When scrolly section is visible, move images to tally sections
                introSection.classList.add('images-moved');
                if (ratTallySection) ratTallySection.classList.add('images-moved');
                if (nyTallySection) nyTallySection.classList.add('images-moved');
            } else {
                // When scrolly section is not visible, show images in intro
                introSection.classList.remove('images-moved');
                if (ratTallySection) ratTallySection.classList.remove('images-moved');
                if (nyTallySection) nyTallySection.classList.remove('images-moved');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });
    
    scrollyObserver.observe(scrollySection);
}