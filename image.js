let slideIndex = 0;
let intervalId;
const slidesContainer = document.querySelector('.slides');
const uploadButton = document.getElementById('uploadButton');
const imageUpload = document.getElementById('imageUpload');
const chooseButton = document.getElementById('chooseButton');

// Load saved images from local storage on page load
function loadSavedImages() {
    const savedImages = JSON.parse(localStorage.getItem('images')) || [];
    
    savedImages.forEach(imageSrc => {
        const newSlide = createSlide(imageSrc); // Create a new slide
        slidesContainer.appendChild(newSlide); // Add the new slide
        createThumbnail(imageSrc); // Create a thumbnail for navigation
    });

    // Update total slides after loading
    slideIndex = slidesContainer.children.length - 1; // Move to the last image
    showSlides();
}

function createSlide(imageSrc) {
    const newSlide = document.createElement('div');
    newSlide.classList.add('slide');

    const img = document.createElement('img');
    img.src = imageSrc; // Set the source to the uploaded image
    img.alt = 'Uploaded Image';

    const deleteButton = document.createElement('button'); // Create delete button
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button'); // Add class for styling
    deleteButton.onclick = () => deleteImage(newSlide, imageSrc); // Set delete function

    newSlide.appendChild(img);
    newSlide.appendChild(deleteButton); // Add delete button to the slide
    return newSlide;
}

function createThumbnail(imageSrc) {
    const thumbnailNav = document.querySelector('.thumbnail-nav');
    
    const img = document.createElement('img');
    img.src = imageSrc; // Set the source to the uploaded image
    img.alt = 'Thumbnail Image';
    
    img.addEventListener('click', () => {
        slideIndex = Array.from(thumbnailNav.children).indexOf(img); // Get index of clicked thumbnail
        showSlides(); // Show corresponding slide
        updateThumbnailActiveState(); // Update active state of thumbnails
    });
    
    thumbnailNav.appendChild(img);
}

function showSlides() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, index) => {
        slide.style.display = index === slideIndex ? 'block' : 'none';
    });
    updateThumbnailActiveState(); // Update active state for thumbnails
}

function updateThumbnailActiveState() {
    const thumbnails = document.querySelectorAll('.thumbnail-nav img');
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle('active', index === slideIndex); // Add active class to current slide's thumbnail
    });
}

function nextSlide() {
    slideIndex = (slideIndex + 1) % slidesContainer.children.length; // Update totalSlides
    showSlides();
}

function prevSlide() {
    slideIndex = (slideIndex - 1 + slidesContainer.children.length) % slidesContainer.children.length; // Update totalSlides
    showSlides();
}

let currentScale = 1; // Initialize scale for zoom

function zoomImage(event) {
    const img = event.target; // Get the clicked image
    currentScale = currentScale === 1 ? 2 : 1; // Toggle scale between 1 and 2

    img.style.transform = `scale(${currentScale})`; // Apply scale to image
    img.style.transition = 'transform 0.3s ease'; // Smooth transition for zoom
}

// Add event listener for zoom functionality on each image
document.querySelectorAll('.slide img').forEach(slide => {
    slide.addEventListener('click', zoomImage);
});

function playSlideshow() {
    const playButton = document.querySelector('.play');
    
    if (intervalId) {
        clearInterval(intervalId); // Stop the slideshow if already running
        intervalId = null; // Reset intervalId
        playButton.textContent = 'Play'; // Change button text to "Play"
    } else {
        intervalId = setInterval(nextSlide, 1800); // Change slide every 3 seconds
        playButton.textContent = 'Pause'; // Change button text to "Pause"
    }
}

chooseButton.addEventListener('click', () => {
    document.getElementById('imageUpload').click(); // Trigger file input click
});

function handleImageUpload() {
    const file = imageUpload.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const newSlide = createSlide(event.target.result); // Create a new slide with uploaded image
        slidesContainer.appendChild(newSlide); // Add the new slide
        createThumbnail(event.target.result); // Create a thumbnail for the new image
        
        // Save uploaded image to local storage
        saveImageToLocalStorage(event.target.result);
        
        slideIndex = slidesContainer.children.length - 1; // Move to the newly added image
        showSlides();
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

// Function to save images to local storage
function saveImageToLocalStorage(imageSrc) {
    const savedImages = JSON.parse(localStorage.getItem('images')) || [];
    savedImages.push(imageSrc);
    localStorage.setItem('images', JSON.stringify(savedImages));
}

// Function to delete image
function deleteImage(slideElement, imageSrc) {
    slidesContainer.removeChild(slideElement); // Remove slide from DOM
    const savedImages = JSON.parse(localStorage.getItem('images')) || [];
    const updatedImages = savedImages.filter(src => src !== imageSrc); // Remove image from array
    localStorage.setItem('images', JSON.stringify(updatedImages)); // Update local storage

    // Update slides and thumbnails after deletion
    slideIndex = Math.max(0, slideIndex - 1); // Adjust slide index if necessary
    showSlides();
    updateThumbnailsAfterDeletion(); // Update thumbnails
}

// Function to update thumbnails after deletion
function updateThumbnailsAfterDeletion() {
    const thumbnailNav = document.querySelector('.thumbnail-nav');
    thumbnailNav.innerHTML = ''; // Clear existing thumbnails
    const savedImages = JSON.parse(localStorage.getItem('images')) || [];
    savedImages.forEach(imageSrc => {
        createThumbnail(imageSrc); // Recreate thumbnails
    });
}

// Swipe functionality
let touchStartX = 0;
let touchEndX = 0;

function handleSwipe() {
    if (touchEndX < touchStartX) {
        nextSlide(); // Swipe left
    }
    if (touchEndX > touchStartX) {
        prevSlide(); // Swipe right
    }
}

// Event listeners for touch events
slidesContainer.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].screenX; // Get starting X position
});

slidesContainer.addEventListener('touchend', event => {
    touchEndX = event.changedTouches[0].screenX; // Get ending X position
    handleSwipe(); // Handle swipe action
});

uploadButton.addEventListener('click', handleImageUpload);
document.querySelector('.next').addEventListener('click', nextSlide);
document.querySelector('.prev').addEventListener('click', prevSlide);
document.querySelector('.play').addEventListener('click', playSlideshow);

// Load saved images when the page loads
loadSavedImages();
