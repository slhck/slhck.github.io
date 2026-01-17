// Photo gallery lightbox initialization
document.addEventListener('DOMContentLoaded', function() {
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      touchNavigation: true,
      loop: true,
      openEffect: 'fade',
      closeEffect: 'fade',
      slideEffect: 'fade',
      descPosition: 'bottom',
      moreLength: 0,
      sanitize: false
    });
  }
});
