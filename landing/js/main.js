(function () {
  'use strict';

  document.documentElement.classList.add('js');

  // Header hairline once the page scrolls
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile nav toggle
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (isOpen) {
      nav.classList.toggle('is-open', isOpen);
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // GitHub star count — shown only when the API answers
  var stars = document.getElementById('gh-stars');
  var starsWrap = document.getElementById('gh-stars-wrap');

  if (stars && starsWrap) {
    fetch('https://api.github.com/repos/rylsherdamz-rgb/Noir_Wallet')
      .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
      .then(function (data) {
        if (typeof data.stargazers_count === 'number') {
          stars.textContent = data.stargazers_count.toLocaleString();
          starsWrap.hidden = false;
        }
      })
      .catch(function () {});
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
