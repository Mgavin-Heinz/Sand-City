import './style.css';

const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 0.08 + 's';
    observer.observe(el);
  });

  function submitForm() {
    const name = document.getElementById('f-name').value.trim();
    const msg  = document.getElementById('f-msg').value.trim();
    if (!name || !msg) {
      alert('Please fill in at least your name and project details.');
      return;
    }
    document.getElementById('form-wrap').style.display = 'none';
    const success = document.getElementById('form-success');
    success.style.display = 'block';
  }