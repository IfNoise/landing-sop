// Mobile Menu Toggle
const burger = document.querySelector('.burger');
const navMenu = document.querySelector('.nav-menu');

if (burger && navMenu) {
    burger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate burger
        const spans = burger.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translateY(10px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768 && navMenu) {
            navMenu.classList.remove('active');
            const spans = burger.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});

// Form Handling
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError = document.getElementById('formError');

// ВАЖНО: Замените на ваш реальный URL от Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxF0HkCgAF6cwHXg-Vn6CCZo2OPqPKJv0PBKSBwpRNSlHOqd28dSOnjSGWjmAIPDO9o/exec';

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        
        // Собираем данные явно, чтобы гарантировать все поля
        const data = {
            timestamp: new Date().toISOString(),
            name: formData.get('name') || '',
            farm: formData.get('farm') || '',
            email: formData.get('email') || '',
            phone: formData.get('phone') || '',
            'farm-type': formData.get('farm-type') || '',
            'farm-size': formData.get('farm-size') || '',
            message: formData.get('message') || '',
            website: formData.get('website') || '' // Honeypot field
        };
        
        // Логирование для отладки (удалите после тестирования)
        console.log('Отправляемые данные:', data);
        
        // Hide any previous messages
        if (formSuccess) formSuccess.style.display = 'none';
        if (formError) formError.style.display = 'none';
        
        // Disable submit button
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        
        try {
            // ВАЖНО: Показываем данные перед отправкой для отладки
            alert('Проверка данных перед отправкой:\n\n' + 
                  'Имя: ' + data.name + '\n' +
                  'Ферма: ' + data.farm + '\n' +
                  'Email: ' + data.email + '\n' +
                  'Телефон: ' + data.phone + '\n' +
                  'Тип: ' + data['farm-type'] + '\n' +
                  'Размер: ' + data['farm-size'] + '\n' +
                  'Сообщение: ' + data.message);
            
            // Send data to Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Important for Google Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            // Note: with 'no-cors' mode, we can't read the response
            // but if no error is thrown, we assume success
            
            // Show success message
            if (formSuccess) {
                formSuccess.style.display = 'block';
                contactForm.reset();
                
                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            if (formError) {
                formError.textContent = 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.';
                formError.style.display = 'block';
                formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Add scroll effect to header
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        // Scrolling down
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        // Scrolling up
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});
