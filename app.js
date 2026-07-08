document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // Navigation & Scroll Effects
    // ==========================================================================
    const header = document.querySelector('.main-header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Header Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link indicator on scroll
        let currentSection = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Navigation Toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
        });
    });


    // ==========================================================================
    // Packages Category Filter
    // ==========================================================================
    const filterTabs = document.querySelectorAll('.filter-tab');
    const packageCards = document.querySelectorAll('.package-card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            // Add active to current
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            packageCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (filterValue === 'all') {
                    card.style.display = 'flex';
                } else if (cardCategory === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });


    // ==========================================================================
    // FAQ Accordion Toggle
    // ==========================================================================
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isOpen = faqItem.classList.contains('open');

            // Close all items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('open');
            });

            // If it wasn't open, open it
            if (!isOpen) {
                faqItem.classList.add('open');
            }
        });
    });


    // ==========================================================================
    // Custom Date Planner & Booking Calculator Logic
    // ==========================================================================
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateInput = document.getElementById('bookingDate');
    const dateString = tomorrow.toISOString().split('T')[0];
    dateInput.value = dateString;
    dateInput.min = new Date().toISOString().split('T')[0]; // Can't book past dates

    // State Variables
    let selectedPackage = "Tent Theme Rooftop";
    let selectedPrice = 3499;
    let selectedDate = dateInput.value;
    let selectedTime = "07:00 PM";
    let selectedAddons = [];

    // Elements
    const timeInput = document.getElementById('bookingTime');
    const themeOptions = document.querySelectorAll('.theme-option');
    const addonCheckboxes = document.querySelectorAll('.addon-checkbox');
    const selectAddonButtons = document.querySelectorAll('.select-addon');
    const bookNowButtons = document.querySelectorAll('.btn-book-now');
    
    // Summary Elements
    const summaryDateTime = document.getElementById('summaryDateTime');
    const summaryBaseName = document.getElementById('summaryBaseName');
    const summaryBasePrice = document.getElementById('summaryBasePrice');
    const summaryAddonsContainer = document.getElementById('summaryAddonsContainer');
    const summaryTotal = document.getElementById('summaryTotal');
    const btnSubmitWhatsApp = document.getElementById('btnSubmitWhatsApp');

    // Init display
    updateSummary();

    // Event listeners
    dateInput.addEventListener('change', (e) => {
        selectedDate = e.target.value;
        updateSummary();
    });

    timeInput.addEventListener('change', (e) => {
        selectedTime = e.target.value;
        updateSummary();
    });

    // Theme selector options in planner
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active style from all option UI panels
            themeOptions.forEach(opt => opt.classList.remove('active'));
            themeOptions.forEach(opt => {
                opt.querySelector('.theme-radio i').className = 'fa-solid fa-circle';
            });

            // Set active current
            option.classList.add('active');
            option.querySelector('.theme-radio i').className = 'fa-solid fa-circle-dot';

            selectedPackage = option.getAttribute('data-package');
            selectedPrice = parseInt(option.getAttribute('data-price'));
            
            updateSummary();
        });
    });

    // Checkbox selections in planner
    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const name = checkbox.getAttribute('data-name');
            const price = parseInt(checkbox.getAttribute('data-price'));

            if (checkbox.checked) {
                // Add to array
                selectedAddons.push({ name, price });
            } else {
                // Remove from array
                selectedAddons = selectedAddons.filter(item => item.name !== name);
            }
            updateSummary();
        });
    });

    // "Add to Plan" click handler in Addons grid
    selectAddonButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const addonName = button.getAttribute('data-addon-name');
            
            // Find related checkbox in form
            const targetCheckbox = Array.from(addonCheckboxes).find(cb => cb.getAttribute('data-name') === addonName);
            
            if (targetCheckbox) {
                targetCheckbox.checked = true;
                // Trigger change event programmatically to sync state
                targetCheckbox.dispatchEvent(new Event('change'));
            }
        });
    });

    // "Book Now" click handler in main packages list
    bookNowButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const packageName = btn.getAttribute('data-package');
            
            // Find option in builder
            const targetOption = Array.from(themeOptions).find(opt => opt.getAttribute('data-package') === packageName);
            
            if (targetOption) {
                // Trigger click to select package
                targetOption.click();
            }

            // Smooth scroll down to builder
            document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Summary calculation and renderer
    function updateSummary() {
        // Date formatting for human-friendly reading
        let displayDate = "Select a date";
        if (selectedDate) {
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            displayDate = new Date(selectedDate).toLocaleDateString('en-US', options);
        }
        
        summaryDateTime.innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${displayDate} @ ${selectedTime}`;
        summaryBaseName.innerText = selectedPackage;
        summaryBasePrice.innerText = `₹${selectedPrice.toLocaleString('en-IN')}`;

        // Render addons list in receipt
        summaryAddonsContainer.innerHTML = '';
        let addonsTotal = 0;

        selectedAddons.forEach(item => {
            addonsTotal += item.price;
            
            const addonRow = document.createElement('div');
            addonRow.className = 'receipt-item';
            addonRow.style.paddingLeft = '1rem';
            addonRow.style.fontSize = '0.85rem';
            addonRow.style.color = 'var(--text-secondary)';
            addonRow.innerHTML = `
                <span>+ ${item.name}</span>
                <span>₹${item.price.toLocaleString('en-IN')}</span>
            `;
            summaryAddonsContainer.appendChild(addonRow);
        });

        // Compute grand total
        const grandTotal = selectedPrice + addonsTotal;
        summaryTotal.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;
    }


    // ==========================================================================
    // WhatsApp Redirect & Confirmation Modal
    // ==========================================================================
    const modal = document.getElementById('bookingModal');
    const closeModal = document.querySelector('.close-modal');
    const modalWhatsAppLink = document.getElementById('modalWhatsAppLink');
    const modalPackageName = document.getElementById('modalPackageName');
    const modalTotal = document.getElementById('modalTotal');

    btnSubmitWhatsApp.addEventListener('click', () => {
        if (!selectedDate) {
            alert('Please select a booking date first.');
            dateInput.focus();
            return;
        }

        // Format Date nicely
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const readableDate = new Date(selectedDate).toLocaleDateString('en-US', options);
        
        const addonsTotal = selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
        const grandTotal = selectedPrice + addonsTotal;

        // Create WhatsApp Message Body
        let messageText = `*🌹 ROMANTIC DATE NIGHT BOOKING 🌹*\n`;
        messageText += `--------------------------------------------\n`;
        messageText += `*Ambiance Setup:* ${selectedPackage}\n`;
        messageText += `*Booking Date:* ${readableDate}\n`;
        messageText += `*Arrival Time:* ${selectedTime}\n`;
        
        if (selectedAddons.length > 0) {
            messageText += `\n*Custom Add-ons:* \n`;
            selectedAddons.forEach((addon, idx) => {
                messageText += `${idx + 1}. ${addon.name} (+₹${addon.price})\n`;
            });
        }
        
        messageText += `--------------------------------------------\n`;
        messageText += `*Base Package price:* ₹${selectedPrice.toLocaleString('en-IN')}\n`;
        if (selectedAddons.length > 0) {
            messageText += `*Add-ons subtotal:* ₹${addonsTotal.toLocaleString('en-IN')}\n`;
        }
        messageText += `*GRAND TOTAL:* ₹${grandTotal.toLocaleString('en-IN')}\n`;
        messageText += `--------------------------------------------\n`;
        messageText += `*Required Advance Slot Booking Deposit:* ₹1,000\n\n`;
        messageText += `Hello, I'd like to check slot availability and reserve this romantic candlelit date package! Please guide me on slot availability and payment confirmation. Thank you!`;

        const encodedMessage = encodeURIComponent(messageText);
        const whatsappURL = `https://wa.me/917069115511?text=${encodedMessage}`;

        // Populate Modal Info
        modalPackageName.innerText = selectedPackage;
        modalTotal.innerText = `₹${grandTotal.toLocaleString('en-IN')}`;
        modalWhatsAppLink.href = whatsappURL;

        // Show Modal
        modal.style.display = 'flex';
    });

    // Close Modal actions
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
