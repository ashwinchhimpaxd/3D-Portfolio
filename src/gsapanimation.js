import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import TextSpliting from './TextSpliting.js';

gsap.registerPlugin(ScrollTrigger, SplitText);
/** this is for smooth scrolling  */
function smoothScrolling() {
  const mainEl = document.querySelector('.main');
  const lenis = new Lenis({
    wrapper: mainEl,  // ✅ main ko wrapper banao
    content: mainEl,  // ✅ content bhi wahi ho
    smooth: true,
    lerp: 0.1,
    syncTouch: true,
    syncTouchLerp: 0.75,
    gestureOrientation: 'vertical',
    smoothTouch: true,
    smoothWheel: true,
    direction: 'vertical'
  });

  // Smooth scroll manually using Lenis
  document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault(); // stop default jump
      const targetId = this.getAttribute('href');

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        lenis.scrollTo(targetEl, {
          offset: 1,      // adjust if you have sticky nav
          duration: 1.2,  // seconds
          // ease: 'easeOutExpo',
          easing: (t) => t // easeOutExpo
        });
      }
    });
  });
  // RAF loop
  lenis.on('scroll', ScrollTrigger.update);
  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}
smoothScrolling();

/* this is for navbar */
function navbarAnimation() {
  document.querySelectorAll('nav li a').forEach(anker => {
    // Get the original text and setup
    const text = anker.innerText;
    anker.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.classList.add('link-wrapper');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.overflow = 'hidden'; // Add this to contain animations

    // Create two rows of spans
    for (let i = 0; i < 2; i++) {
      const row = document.createElement('div');
      row.classList.add(`text-row-${i + 1}`);
      row.textContent = text;
      wrapper.appendChild(row);

      // Split text into characters using GSAP SplitText
      const split = new SplitText(row, { type: "chars", tag: "span", charsClass: "char-span" });

      // Clear any default stylesheet transforms on the split characters
      gsap.set(split.chars, { transform: "translateY(0)", display: "inline-block" });
    }

    anker.appendChild(wrapper);

    // Hover animations
    const row1Chars = wrapper.querySelector('.text-row-1').querySelectorAll('.char-span');
    const row2Chars = wrapper.querySelector('.text-row-2').querySelectorAll('.char-span');

    anker.addEventListener("mouseenter", () => {
      gsap.to(row1Chars, {
        yPercent: -100,
        duration: 0.4,
        ease: "power2.out",
        stagger: {
          each: 0.03,
          from: "start"
        }
      });
      gsap.to(row2Chars, {
        yPercent: -100,
        duration: 0.4,
        ease: "power2.out",
        stagger: {
          each: 0.03,
          from: "start"
        }
      }, "<"); // Start at same time
    });

    anker.addEventListener("mouseleave", () => {
      gsap.to(row1Chars, {
        yPercent: 0,
        duration: 0.4,
        ease: "power2.out",
        stagger: {
          each: 0.03,
          from: "start"
        }
      });
      gsap.to(row2Chars, {
        yPercent: 0,
        duration: 0.4,
        ease: "power2.out",
        stagger: {
          each: 0.03,
          from: "start"
        }
      }, "<");
    });
  });
}

/** about section images animation */
function aboutSectionAnimation() {
  TextSpliting('about-text', ["inline-block", "flex flex flex-row justify-center items-center span-position"]);
  const onespan = document.querySelector('.about-text>span');
  gsap.set(onespan, { opacity: 1, y: 5 });

  const imagesContainer = document.querySelector('.images-container');
  const aboutImages = imagesContainer.querySelectorAll('.about_images');

  const tl = gsap.timeline({
    scrollTrigger: {
      scroller: '.main',
      trigger: imagesContainer,
      start: 'top top',
      end: `+=${aboutImages.length * 250}%`,
      pin: true,
      scrub: true,
      markers: false,
    }
  });

  aboutImages.forEach((img, i) => {
    const spans = img.querySelectorAll('.about-text>span');

    // Set spans hidden initially
    gsap.set(spans, { opacity: 0, transform: "translateY(100%)" });

    // Animate image clip-path
    tl.to(img, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1.5,
      ease: "power1.out",
      overwrite: true,
    }, `+=${i * 0.3}`) // offset
      .to(spans, {
        opacity: 1,
        transform: "translateY(0%)",
        duration: 1.2,
        ease: "power4.inOut",
        overwrite: true,
        stagger: {
          from: "start",
          each: 0.1
        }
      }, `-=${1.2}`); // start with previous animation

    // If it's not the first slide, animate the previous slide's spans out of view
    if (i > 0) {
      const prevSpans = aboutImages[i - 1].querySelectorAll('.about-text>span');
      tl.to(prevSpans, {
        opacity: 0,
        transform: "translateY(-100%)",
        duration: 1.0,
        ease: "power2.inOut"
      }, `-=${1.5}`);
    }
  })
}

// With:
document.fonts.ready.then(() => {
  navbarAnimation();
  aboutSectionAnimation();
});