document.addEventListener('DOMContentLoaded', () => {
    
    // Auto asset fallback for local testing
    document.addEventListener('error', (e) => {
        if (e.target && e.target.tagName === 'IMG') {
            const src = e.target.getAttribute('src');
            if (src && (src.startsWith('./assets/') || src.startsWith('assets/')) && !e.target.dataset.fallback) {
                e.target.dataset.fallback = 'true';
                const cleanPath = src.replace('./', '');
                e.target.src = 'https://rajnishstudios.vercel.app/' + cleanPath;
            }
        }
    }, true);

    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }




    /* ==========================================================================
       HEADER SCROLL & MOBILE NAV
       ========================================================================== */
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileNav && mobileNavClose) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
        });
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
        });
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
            });
        });
    }


    /* ==========================================================================
       PORTFOLIO FILTER SYSTEM & AUTOPLAY PREVIEWS
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    // Helper to parse YouTube/Instagram links and generate embed details
    function getEmbedDetails(url) {
        if (!url) return null;
        
        // YouTube Shorts & standard YouTube videos
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('/shorts/')) {
                videoId = url.split('/shorts/')[1].split('?')[0].split('&')[0];
            } else if (url.includes('v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            }
            return {
                type: 'youtube',
                previewUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`,
                modalUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0`
            };
        }
        
        // Instagram Reels & posts
        if (url.includes('instagram.com')) {
            let reelId = '';
            if (url.includes('/reels/')) {
                reelId = url.split('/reels/')[1].split('/')[0].split('?')[0];
            } else if (url.includes('/reel/')) {
                reelId = url.split('/reel/')[1].split('/')[0].split('?')[0];
            } else if (url.includes('/p/')) {
                reelId = url.split('/p/')[1].split('/')[0].split('?')[0];
            }
            return {
                type: 'instagram',
                previewUrl: `https://www.instagram.com/reel/${reelId}/embed/`,
                modalUrl: `https://www.instagram.com/reel/${reelId}/embed/`
            };
        }
        
        // Default MP4 URL
        return {
            type: 'local',
            previewUrl: url,
            modalUrl: url
        };
    }

    // Initialize all portfolio card previews dynamically
    portfolioItems.forEach(item => {
        const videoUrl = item.getAttribute('data-video');
        const mediaContainer = item.querySelector('.portfolio-media');
        
        if (videoUrl && mediaContainer) {
            const embed = getEmbedDetails(videoUrl);
            const overlay = mediaContainer.querySelector('.media-overlay');
            
            if (embed.type === 'local') {
                const videoEl = document.createElement('video');
                videoEl.className = 'portfolio-video-preview';
                videoEl.loop = true;
                videoEl.muted = true;
                videoEl.playsInline = true;
                videoEl.setAttribute('preload', 'metadata');
                
                const sourceEl = document.createElement('source');
                sourceEl.src = embed.previewUrl;
                sourceEl.type = 'video/mp4';
                
                videoEl.appendChild(sourceEl);
                if (overlay) {
                    mediaContainer.insertBefore(videoEl, overlay.nextSibling);
                } else {
                    mediaContainer.appendChild(videoEl);
                }
            } else if (embed.type === 'youtube' || embed.type === 'instagram') {
                const iframeEl = document.createElement('iframe');
                iframeEl.className = 'portfolio-video-preview';
                iframeEl.src = embed.previewUrl;
                iframeEl.frameBorder = '0';
                iframeEl.style.width = '100%';
                iframeEl.style.height = '100%';
                iframeEl.style.border = 'none';
                iframeEl.style.pointerEvents = 'none'; // Ensure clicks pass to the card overlay
                
                if (embed.type === 'youtube') {
                    iframeEl.setAttribute('allow', 'autoplay; encrypted-media');
                } else if (embed.type === 'instagram') {
                    iframeEl.setAttribute('allowtransparency', 'true');
                    iframeEl.scrolling = 'no';
                }
                
                if (overlay) {
                    mediaContainer.insertBefore(iframeEl, overlay.nextSibling);
                } else {
                    mediaContainer.appendChild(iframeEl);
                }
            }
        }
    });

    /* ==========================================================================
       PORTFOLIO REEL SLIDER CONTROLLER
       ========================================================================== */
    const portfolioTrack = document.querySelector('.portfolio-track');
    const prevBtn = document.getElementById('portfolio-prev-btn');
    const nextBtn = document.getElementById('portfolio-next-btn');
    
    let sliderIndex = 0;
    
    function getVisibleItems() {
        return Array.from(portfolioItems).filter(item => !item.classList.contains('hidden'));
    }
    
    function updateSliderPosition() {
        if (!portfolioTrack) return;
        const visibleItems = getVisibleItems();
        if (visibleItems.length === 0) return;
        
        // Ensure index is within range
        const maxIndex = getMaxSliderIndex();
        sliderIndex = Math.max(0, Math.min(sliderIndex, maxIndex));
        
        // Calculate transition offset. Card width (360px) + gap (24px) = 384px.
        const cardWidth = 360;
        const gap = 24;
        const offset = sliderIndex * (cardWidth + gap);
        
        portfolioTrack.style.transform = `translateX(-${offset}px)`;
        
        // Update button navigation states (opacity/pointer-events)
        if (prevBtn) {
            if (sliderIndex === 0) {
                prevBtn.style.opacity = '0.4';
                prevBtn.style.pointerEvents = 'none';
            } else {
                prevBtn.style.opacity = '1';
                prevBtn.style.pointerEvents = 'auto';
            }
        }
        if (nextBtn) {
            if (sliderIndex === maxIndex) {
                nextBtn.style.opacity = '0.4';
                nextBtn.style.pointerEvents = 'none';
            } else {
                nextBtn.style.opacity = '1';
                nextBtn.style.pointerEvents = 'auto';
            }
        }
    }
    
    function getMaxSliderIndex() {
        const visibleItems = getVisibleItems();
        if (!portfolioTrack) return 0;
        
        // Measure viewport size relative to card sizes to determine columns in view
        const viewportWidth = portfolioTrack.parentElement.offsetWidth;
        const cardWidth = 360;
        const gap = 24;
        const itemsInViewport = Math.floor((viewportWidth + gap) / (cardWidth + gap)) || 1;
        
        return Math.max(0, visibleItems.length - itemsInViewport);
    }
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            if (sliderIndex > 0) {
                sliderIndex--;
                updateSliderPosition();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (sliderIndex < getMaxSliderIndex()) {
                sliderIndex++;
                updateSliderPosition();
            }
        });
        
        window.addEventListener('resize', updateSliderPosition);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue || (category && category.split(' ').includes(filterValue))) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });

            // Reset slider index and update track position on filter change
            sliderIndex = 0;
            updateSliderPosition();
        });
    });

    // Initial setup for controls
    if (prevBtn && nextBtn) {
        updateSliderPosition();
    }

    // Auto-play preview videos on hover
    portfolioItems.forEach(item => {
        const video = item.querySelector('.portfolio-video-preview');
        
        if (video) {
            item.addEventListener('mouseenter', () => {
                video.play().catch(err => console.log('Autoplay blocked: ', err));
            });
            item.addEventListener('mouseleave', () => {
                video.pause();
                video.currentTime = 0; // Rewind
            });
        }
    });


    /* ==========================================================================
       VIDEO MODAL PLAYER
       ========================================================================== */
    const videoModal = document.getElementById('video-modal');
    const videoModalClose = document.getElementById('video-modal-close');
    const modalVideoElement = document.getElementById('modal-video-element');
    const modalIframeElement = document.getElementById('modal-iframe-element');

    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            const videoUrl = item.getAttribute('data-video');
            if (videoUrl && videoModal) {
                const embed = getEmbedDetails(videoUrl);
                
                if (embed.type === 'local') {
                    if (modalVideoElement && modalIframeElement) {
                        modalIframeElement.style.display = 'none';
                        modalIframeElement.src = '';
                        
                        modalVideoElement.style.display = 'block';
                        modalVideoElement.src = embed.modalUrl;
                        modalVideoElement.play();
                    }
                } else if (embed.type === 'youtube' || embed.type === 'instagram') {
                    if (modalVideoElement && modalIframeElement) {
                        modalVideoElement.style.display = 'none';
                        modalVideoElement.pause();
                        modalVideoElement.src = '';
                        
                        modalIframeElement.style.display = 'block';
                        modalIframeElement.src = embed.modalUrl;
                    }
                }
                
                videoModal.classList.add('active');

            }
        });
    });

    if (videoModalClose && videoModal) {
        const closeModal = () => {
            videoModal.classList.remove('active');
            
            if (modalVideoElement) {
                modalVideoElement.pause();
                modalVideoElement.src = '';
                modalVideoElement.style.display = 'block'; // reset to default display
            }
            if (modalIframeElement) {
                modalIframeElement.src = '';
                modalIframeElement.style.display = 'none';
            }
            

        };

        videoModalClose.addEventListener('click', closeModal);
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal();
            }
        });
    }



    /* ==========================================================================
       INTERSECTION OBSERVER (Reveals & Skill Bars)
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal-item');
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    const statCards = document.querySelectorAll('.stat-card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });

    // Skill bar observer
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const progress = fill.getAttribute('data-progress');
                fill.style.width = progress;
                skillObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.1 });

    skillBars.forEach(bar => {
        skillObserver.observe(bar);
    });


    /* ==========================================================================
       ACHIEVEMENTS STATS COUNTER
       ========================================================================== */
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const numElement = card.querySelector('.stat-number');
                const target = parseFloat(numElement.getAttribute('data-target'));
                
                let start = 0;
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // ~60fps
                
                function updateCount() {
                    start += increment;
                    if (start >= target) {
                        numElement.textContent = numElement.getAttribute('data-target') + (numElement.parentElement.innerText.includes('%') ? '%' : '+');
                        if (numElement.getAttribute('data-target') === '85') numElement.textContent = '85M';
                        if (numElement.getAttribute('data-target') === '100') numElement.textContent = '100%';
                    } else {
                        numElement.textContent = Number.isInteger(target) ? Math.floor(start) : start.toFixed(1);
                        requestAnimationFrame(updateCount);
                    }
                }
                updateCount();
                counterObserver.unobserve(card);
            }
        });
    }, { threshold: 0.2 });

    statCards.forEach(card => {
        counterObserver.observe(card);
    });


    /* ==========================================================================
       INTERACTIVE PACKAGE BUDGET CALCULATOR
       ========================================================================== */
    const calcCurrencyButtons = document.querySelectorAll('.curr-btn');
    const calcTypeButtons = document.querySelectorAll('#project-type-opts .opt-btn');
    const calcRangeSlider = document.getElementById('duration-range');
    const calcDurationVal = document.getElementById('duration-val');
    const calcAddonChecks = document.querySelectorAll('.checkbox-grid input[type="checkbox"]');
    const calcPriceDisplay = document.getElementById('price-display');
    const calcBookBtn = document.getElementById('book-package-btn');

    let activeCurrency = 'USD';
    let activeType = 'reels';
    let basePrice = 400;

    // Currency Selector
    if (calcCurrencyButtons.length > 0) {
        calcCurrencyButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedCurr = btn.getAttribute('data-curr');
                activeCurrency = selectedCurr;
                
                calcCurrencyButtons.forEach(b => {
                    if (b.getAttribute('data-curr') === selectedCurr) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                
                const budgetInput = document.getElementById('budget');
                if (budgetInput) {
                    budgetInput.placeholder = activeCurrency === 'USD' ? 'e.g. $400 - $600' : 'e.g. ₹33,000 - ₹50,000';
                }

                calculateBudget();
            });
        });
    }

    // Project Type Selector
    calcTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            calcTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeType = btn.getAttribute('data-val');
            basePrice = parseInt(btn.getAttribute('data-base'), 10);
            
            calculateBudget();
        });
    });

    // Duration slider mapping
    const durationMapping = {
        1: { label: 'Under 30 Seconds', multiplier: 1.0 },
        2: { label: '30 - 60 Seconds', multiplier: 1.3 },
        3: { label: '1 - 3 Minutes', multiplier: 1.6 },
        4: { label: '3+ Minutes', multiplier: 2.0 }
    };

    if (calcRangeSlider) {
        calcRangeSlider.addEventListener('input', () => {
            const step = calcRangeSlider.value;
            calcDurationVal.textContent = durationMapping[step].label;
            calculateBudget();
        });
    }

    // Checkbox triggers
    calcAddonChecks.forEach(check => {
        check.addEventListener('change', calculateBudget);
    });

    function calculateBudget() {
        const step = calcRangeSlider ? parseInt(calcRangeSlider.value, 10) : 1;
        
        // Base Pricing defined purely in INR
        const inrDurationPrices = {
            1: 500,    // <30s
            2: 1000,   // 30-60s
            3: 2000,   // 1-3m
            4: 3500    // 3m+
        };
        
        const inrTypeMultipliers = {
            'reels': 1.0,
            'motion': 1.5,
            'commercial': 2.0,
            'cinematic': 3.0
        };
        
        const inrAddonPrices = {
            'addon-sfx': 400,
            'addon-color': 300,
            'addon-titles': 500,
            'addon-speed': 600
        };
        
        const typeMult = inrTypeMultipliers[activeType] || 1.0;
        let durationBase = inrDurationPrices[step];
        let baseInr = Math.round(durationBase * typeMult);
        
        let addonsCost = 0;
        calcAddonChecks.forEach(check => {
            if (check.checked) {
                addonsCost += inrAddonPrices[check.id] || 500;
            }
        });
        
        let lowEnd = baseInr + addonsCost;
        let highEnd = Math.round(lowEnd * 1.3);
        let symbol = '₹';

        // Convert INR to USD if USD is active
        if (activeCurrency === 'USD') {
            symbol = '$';
            const exchangeRate = 83.5; // 1 USD = 83.5 INR
            lowEnd = Math.round(lowEnd / exchangeRate);
            highEnd = Math.round(highEnd / exchangeRate);
        }

        if (calcPriceDisplay) {
            calcPriceDisplay.textContent = `${symbol}${lowEnd} - ${symbol}${highEnd}`;
        }
    }

    // Auto-populates in form
    if (calcBookBtn) {
        calcBookBtn.addEventListener('click', () => {
            const calculatedPrice = calcPriceDisplay.textContent;
            
            // Set Form Values
            const formBudget = document.getElementById('budget');
            const formType = document.getElementById('project-type');
            
            if (formBudget) {
                formBudget.value = calculatedPrice;
                // Focus styling class trigger
                formBudget.style.borderColor = 'var(--accent)';
            }
            if (formType) {
                formType.value = activeType;
            }
            
            // Scroll to Form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Pulsate border of form wrapper briefly
                const formWrapper = document.querySelector('.contact-form-wrapper');
                if (formWrapper) {
                    formWrapper.style.boxShadow = '0 0 30px rgba(var(--accent-rgb), 0.3)';
                    setTimeout(() => {
                        formWrapper.style.boxShadow = '';
                    }, 1500);
                }
            }
        });
    }

    // Initial calculation
    calculateBudget();


    /* ==========================================================================
       TESTIMONIALS SLIDER
       ========================================================================== */
    const carouselTrack = document.querySelector('.carousel-track');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    
    let currentSlide = 0;
    let autoSlideInterval;

    function goToSlide(index) {
        if (!carouselTrack) return;
        currentSlide = index;
        
        // Move track
        carouselTrack.style.transform = `translateX(-${index * 100}%)`;
        
        // Update dots active status
        carouselDots.forEach((dot, idx) => {
            if (idx === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Dot click triggers
    carouselDots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(autoSlideInterval);
            const slideIdx = parseInt(dot.getAttribute('data-slide'), 10);
            goToSlide(slideIdx);
            startAutoSlide(); // Restart auto rotation
        });
    });

    function startAutoSlide() {
        if (!carouselTrack) return;
        autoSlideInterval = setInterval(() => {
            let nextSlide = currentSlide + 1;
            if (nextSlide >= carouselDots.length) {
                nextSlide = 0;
            }
            goToSlide(nextSlide);
        }, 6000); // Rotate every 6 seconds
    }
    
    // Start auto slider rotation
    startAutoSlide();


    /* ==========================================================================
       CONTACT FORM SUBMISSION
       ========================================================================== */
    const inquiryForm = document.getElementById('inquiry-form');
    const formSuccessOverlay = document.getElementById('form-success');
    const resetFormBtn = document.getElementById('reset-form-btn');

    if (inquiryForm && formSuccessOverlay) {
        inquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Premium CTA Submission Pacing effect
            const submitBtn = inquiryForm.querySelector('button[type="submit"]');
            const originalBtnContent = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span>Processing Brief...</span>';
            submitBtn.disabled = true;

            try {
                // Send real data to FormSubmit via AJAX
                const formData = new FormData(inquiryForm);
                await fetch('https://formsubmit.co/ajax/rajnishkumarofficial@gmail.com', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                // Show completion overlay
                formSuccessOverlay.classList.add('active');
                inquiryForm.style.opacity = '0';
            } catch (error) {
                console.error("Form submission failed", error);
                alert("There was an error sending your brief. Please try again or email directly.");
            } finally {
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
            }
        });
    }

    if (resetFormBtn && inquiryForm && formSuccessOverlay) {
        resetFormBtn.addEventListener('click', () => {
            inquiryForm.reset();
            formSuccessOverlay.classList.remove('active');
            inquiryForm.style.opacity = '1';
        });
    }



    /* ==========================================================================
       PREMIUM CAPTIONS PACK (₹49) INTERACTIVITY
       ========================================================================== */

    // 1. Live Urgency Countdown Timer (Dynamic countdown)
    const cdHours = document.getElementById('cd-hours');
    const cdMins = document.getElementById('cd-mins');
    const cdSecs = document.getElementById('cd-secs');

    if (cdHours && cdMins && cdSecs) {
        // Set an end time 4 hours and 30 minutes from now (or persist in localStorage)
        let savedEndTime = localStorage.getItem('captions_pack_countdown_end');
        let endTime;

        if (savedEndTime && parseInt(savedEndTime) > Date.now()) {
            endTime = parseInt(savedEndTime);
        } else {
            endTime = Date.now() + (4 * 3600 + 29 * 60 + 48) * 1000;
            localStorage.setItem('captions_pack_countdown_end', endTime);
        }

        function updateCountdown() {
            const now = Date.now();
            let distance = endTime - now;

            if (distance <= 0) {
                // Reset to fresh 3 hours if elapsed so it always creates urgency
                endTime = Date.now() + 3 * 3600 * 1000;
                localStorage.setItem('captions_pack_countdown_end', endTime);
                distance = endTime - now;
            }

            const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((distance / 1000 / 60) % 60);
            const seconds = Math.floor((distance / 1000) % 60);

            cdHours.textContent = hours < 10 ? '0' + hours : hours;
            cdMins.textContent = minutes < 10 ? '0' + minutes : minutes;
            cdSecs.textContent = seconds < 10 ? '0' + seconds : seconds;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // 2. Interactive Caption Style Switcher
    const styleTabBtns = document.querySelectorAll('.style-tab-btn');
    const captionAnimatedBox = document.getElementById('caption-animated-box');

    const styleConfigurations = {
        hormozi: {
            className: 'hormozi-active',
            html: `
                <div class="caption-line">
                    <span class="word w1">HOW</span>
                    <span class="word w2">TO</span>
                    <span class="word w3 highlight-word">SCALE</span>
                </div>
                <div class="caption-line">
                    <span class="word w4">YOUR</span>
                    <span class="word w5 highlight-pop">REELS 🚀</span>
                </div>
            `
        },
        cinematic: {
            className: 'cinematic-active',
            html: `
                <div class="caption-line">
                    <span class="word w1">THE</span>
                    <span class="word w2">ART</span>
                    <span class="word w3">OF</span>
                </div>
                <div class="caption-line">
                    <span class="word w4 highlight-word">CINEMATIC</span>
                    <span class="word w5 highlight-pop">VISION</span>
                </div>
            `
        },
        vox: {
            className: 'vox-active',
            html: `
                <div class="caption-line">
                    <span class="word w1">THIS</span>
                    <span class="word w2">ONE</span>
                    <span class="word w3 highlight-word">METRIC</span>
                </div>
                <div class="caption-line">
                    <span class="word w4">CHANGES</span>
                    <span class="word w5 highlight-pop">EVERYTHING</span>
                </div>
            `
        },
        neon: {
            className: 'neon-active',
            html: `
                <div class="caption-line">
                    <span class="word w1">CYBER</span>
                    <span class="word w2 highlight-word">KINETIC</span>
                </div>
                <div class="caption-line">
                    <span class="word w3">IMPACT</span>
                    <span class="word w4 highlight-pop">FLOW ⚡</span>
                </div>
            `
        },
        karaoke: {
            className: 'karaoke-active',
            html: `
                <div class="caption-line">
                    <span class="word w1">STOP</span>
                    <span class="word w2">SCROLLING</span>
                </div>
                <div class="caption-line">
                    <span class="word w3">AND</span>
                    <span class="word w4">WATCH</span>
                    <span class="word w5">THIS 🎯</span>
                </div>
            `
        }
    };

    if (styleTabBtns && captionAnimatedBox) {
        styleTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                styleTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const style = btn.getAttribute('data-style');
                const config = styleConfigurations[style];

                if (config) {
                    captionAnimatedBox.className = 'caption-animated-box ' + config.className;
                    captionAnimatedBox.innerHTML = config.html;
                }
            });
        });
    }

    // 3. FAQ Accordion for Captions Pack
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // 4. Captions Checkout Modal Logic
    const captionsModal = document.getElementById('captions-checkout-modal');
    const btnOpenCheckout = document.getElementById('btn-open-checkout');
    const btnBottomCheckout = document.getElementById('btn-bottom-checkout');
    const btnCloseModal = document.getElementById('captions-modal-close');
    const modalBackdrop = document.getElementById('captions-modal-backdrop');
    const captionsForm = document.getElementById('captions-payment-form');
    const successScreen = document.getElementById('captions-success-screen');
    const btnCloseSuccess = document.getElementById('btn-close-success');
    const copyUpiBtn = document.getElementById('copy-upi-btn');
    const upiCodeText = document.getElementById('upi-id-text');

    function openModal() {
        if (captionsModal) {
            captionsModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    function closeModal() {
        if (captionsModal) {
            captionsModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (btnOpenCheckout) btnOpenCheckout.addEventListener('click', openModal);
    if (btnBottomCheckout) btnBottomCheckout.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    if (btnCloseSuccess) {
        btnCloseSuccess.addEventListener('click', () => {
            closeModal();
            // Reset modal after closing
            setTimeout(() => {
                if (captionsForm) captionsForm.style.display = 'block';
                if (successScreen) successScreen.style.display = 'none';
            }, 300);
        });
    }

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && captionsModal && captionsModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Copy UPI ID to clipboard
    if (copyUpiBtn && upiCodeText) {
        copyUpiBtn.addEventListener('click', () => {
            const upiId = upiCodeText.textContent.trim();
            navigator.clipboard.writeText(upiId).then(() => {
                copyUpiBtn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;color:#22c55e;"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
                setTimeout(() => {
                    copyUpiBtn.innerHTML = '<i data-lucide="copy" style="width:16px;height:16px;"></i>';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 2000);
            }).catch(err => {
                console.error('Could not copy UPI ID', err);
            });
        });
    }

    // Handle Payment Confirmation Submit
    if (captionsForm) {
        captionsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('cust-name').value.trim();
            const phone = document.getElementById('cust-phone').value.trim();
            const email = document.getElementById('cust-email').value.trim();

            // Prepare WhatsApp confirmation link with prefilled details
            const waMsg = encodeURIComponent(
                `Hi Rajnish!\n\nI have made the payment of Rs. 49 for the 100+ Premium Captions Pack.\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nPlease send me the Google Drive download access.`
            );
            const waConfirmBtn = document.getElementById('btn-wa-confirm');
            if (waConfirmBtn) {
                waConfirmBtn.href = `https://wa.me/918521940641?text=${waMsg}`;
            }

            // Switch to success view in modal
            captionsForm.style.display = 'none';
            if (successScreen) {
                successScreen.style.display = 'block';
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }

    /* ==========================================================================
       5. Dedicated Captions Pack Overlay Toggle Logic
       ========================================================================== */
    const captionsSection = document.getElementById('captions-pack');
    const overlayBackBtn = document.getElementById('captions-overlay-back-btn');
    const overlayCloseBtn = document.getElementById('captions-overlay-close-btn');
    const captionsTriggers = document.querySelectorAll('a[href="#captions-pack"], #floating-captions-trigger');

    function openCaptionsOverlay() {
        if (!captionsSection) return;
        captionsSection.classList.add('active');
        document.body.classList.add('captions-overlay-open');
        captionsSection.scrollTop = 0;
        
        // Ensure reveal items inside captions pack are visible
        captionsSection.querySelectorAll('.reveal-item').forEach(el => {
            el.classList.add('revealed');
        });

        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }

        if (window.location.hash !== '#captions-pack') {
            try {
                history.pushState({ overlay: 'captions' }, '', '#captions-pack');
            } catch(e) {}
        }
    }

    function closeCaptionsOverlay(skipHistory) {
        if (!captionsSection) return;
        captionsSection.classList.remove('active');
        document.body.classList.remove('captions-overlay-open');

        // Close checkout modal if open
        if (captionsModal && captionsModal.classList.contains('active')) {
            closeCheckoutModal();
        }

        if (!skipHistory && window.location.hash === '#captions-pack') {
            try {
                history.pushState(null, '', window.location.pathname + window.location.search);
            } catch(e) {}
        }
    }

    // Attach click handlers to all triggers (navbar link, mobile menu, footer, floating button)
    captionsTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            // Close mobile menu if open
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
            }
            openCaptionsOverlay();
        });
    });

    if (overlayBackBtn) {
        overlayBackBtn.addEventListener('click', () => closeCaptionsOverlay());
    }

    if (overlayCloseBtn) {
        overlayCloseBtn.addEventListener('click', () => closeCaptionsOverlay());
    }

    // Handle Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (captionsModal && captionsModal.classList.contains('active')) {
                closeCheckoutModal();
            } else if (captionsSection && captionsSection.classList.contains('active')) {
                closeCaptionsOverlay();
            }
        }
    });

    // Check on initial page load if hash is #captions-pack
    if (window.location.hash === '#captions-pack') {
        openCaptionsOverlay();
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        if (window.location.hash === '#captions-pack') {
            openCaptionsOverlay();
        } else if (captionsSection && captionsSection.classList.contains('active')) {
            closeCaptionsOverlay(true);
        }
    });

});
