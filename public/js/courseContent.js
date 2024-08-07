document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelector('.slides');
    const prevButton = document.querySelector('.prev');
    const nextButton = document.querySelector('.next');
    const currentSlideSpan = document.getElementById('current-slide');
    const takeQuizButton = document.getElementById('take-quiz');
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.slide').length;
  
    function showSlide(index) {
      slides.style.transform = `translateX(-${index * 100}%)`;
      currentSlideSpan.textContent = index + 1;
      
      // Show/hide prev and next buttons
      prevButton.style.display = index === 0 ? 'none' : 'block';
      nextButton.style.display = index === totalSlides - 1 ? 'none' : 'block';
      
      // Show/hide take quiz button
      takeQuizButton.style.display = index === totalSlides - 1 ? 'block' : 'none';
    }
  
    prevButton.addEventListener('click', () => {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    });
  
    nextButton.addEventListener('click', () => {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
    });
  
    // Initialize
    showSlide(0);
  });