/* =========================================================
   RASGARAGE V2 — interaksi halaman
   Dipertahankan dari versi lama: efek mengetik #typing-text
   dan scroll reveal (.reveal → .active).
   Ditambah: hamburger, scroll spy, lightbox gallery,
   pilih paket otomatis, WhatsApp, dan form demo.
   ========================================================= */
(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Efek mengetik (fungsi lama, dibuat aman untuk emoji) ---------- */
    const text = "Welcome To RASGARAGE🛠️";
    const typingText = document.getElementById("typing-text");
    const chars = Array.from(text); // Array.from supaya emoji tidak terpotong di tengah
    let index = 0;

    function typing() {
        if (index < chars.length) {
            typingText.textContent += chars[index];
            index++;
            setTimeout(typing, 100);
        } else {
            typingText.classList.remove('is-typing');
        }
    }

    if (typingText) {
        if (prefersReduced) {
            typingText.textContent = text;
        } else {
            typingText.textContent = '';
            typingText.classList.add('is-typing');
            typing();
        }
    }

    /* ---------- Scroll reveal (fungsi lama, class .reveal / .active) ---------- */
    $$('[data-stagger]').forEach((group) => {
        Array.from(group.children).forEach((child, i) => child.style.setProperty('--d', i));
    });

    const reveals = $$('.reveal');
    const reveal = (el) => {
        el.classList.add('active');
        // lepas delay stagger setelah animasi masuk, supaya hover tetap responsif
        setTimeout(() => el.style.removeProperty('--d'), 1200);
    };

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    reveal(entry.target);
                    obs.unobserve(entry.target); // animasi cukup sekali
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach((el) => observer.observe(el));
    } else {
        reveals.forEach(reveal);
    }

    /* ---------- Navbar: hamburger ---------- */
    const header = $('.site-header');
    const toggle = $('.nav-toggle');
    const menu = $('#nav-menu');

    const setMenu = (open) => {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
    };

    toggle.addEventListener('click', () => {
        setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', (e) => { if (!header.contains(e.target)) setMenu(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
        if (e.matches) setMenu(false);
    });

    /* ---------- Scroll spy: tandai menu aktif ---------- */
    const navLinks = $$('.atas a[href^="#"]:not(.btn)');
    const spyTargets = navLinks.map((link) => $(link.getAttribute('href'))).filter(Boolean);

    if ('IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => link.removeAttribute('aria-current'));
                const active = navLinks.find((link) => link.getAttribute('href') === '#' + entry.target.id);
                if (active) active.setAttribute('aria-current', 'true');
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        spyTargets.forEach((section) => spy.observe(section));
    }

    /* ---------- Gallery: lightbox ---------- */
    const items = $$('.gallery-item');
    const lightbox = $('#lightbox');
    const lbImg = $('img', lightbox);
    const lbCaption = $('figcaption', lightbox);
    let current = 0;

    const showPhoto = (i) => {
        current = (i + items.length) % items.length;
        const img = $('img', items[current]);
        lbImg.src = img.getAttribute('src'); // path foto tetap sama dengan yang di HTML
        lbImg.alt = img.alt;
        lbCaption.textContent = img.alt;
    };

    if (typeof lightbox.showModal === 'function') {
        items.forEach((item, i) => {
            $('.gallery-btn', item).addEventListener('click', () => {
                showPhoto(i);
                lightbox.showModal();
            });
        });

        $('.lb-close', lightbox).addEventListener('click', () => lightbox.close());
        $('.lb-prev', lightbox).addEventListener('click', () => showPhoto(current - 1));
        $('.lb-next', lightbox).addEventListener('click', () => showPhoto(current + 1));

        // klik area gelap di luar foto menutup lightbox
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
        lightbox.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') showPhoto(current - 1);
            if (e.key === 'ArrowRight') showPhoto(current + 1);
        });
    } else {
        // browser lama tanpa <dialog>: buka foto di tab baru
        items.forEach((item) => {
            $('.gallery-btn', item).addEventListener('click', () => {
                window.open($('img', item).getAttribute('src'), '_blank', 'noopener');
            });
        });
    }

    /* ---------- Pricing: tombol Book Service mengisi pilihan paket di form ---------- */
    const packageSelect = $('#package');
    $$('[data-package]').forEach((btn) => {
        btn.addEventListener('click', () => {
            packageSelect.value = btn.dataset.package;
            refreshWhatsApp();
        });
    });

    /* ---------- Contact: WhatsApp (nomor diisi di data-number pada index.html) ---------- */
    const form = $('#booking-form');
    const waBtn = $('#wa-button');
    const waNote = $('#wa-note');
    const waNumber = (waBtn.dataset.number || '').replace(/\D/g, '');

    function refreshWhatsApp() {
        if (!waNumber) return;
        const { name, motor, package: pkg, message } = Object.fromEntries(new FormData(form));
        let msg = 'Halo RASGARAGE, saya ingin booking service.';
        if (name) msg = `Halo RASGARAGE, saya ${name} ingin booking service.`;
        if (pkg) msg += ` Layanan/paket: ${pkg}.`;
        if (motor) msg += ` Motor: ${motor}.`;
        if (message) msg += ` Catatan: ${message}`;
        waBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    }

    if (waNumber) {
        refreshWhatsApp();
        form.addEventListener('input', refreshWhatsApp);
        form.addEventListener('change', refreshWhatsApp);
    } else {
        waBtn.addEventListener('click', (e) => {
            e.preventDefault();
            waNote.hidden = false;
        });
    }

    /* ---------- Contact: form demo (belum terhubung ke layanan pengiriman) ---------- */
    const formStatus = $('#form-status');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#name').value.trim();
        formStatus.textContent =
            `Terima kasih${name ? ', ' + name : ''}. Ini form demo yang belum terhubung ke layanan pengiriman, ` +
            'jadi permintaan booking belum terkirim.';
        formStatus.hidden = false;
    });

    /* ---------- Footer: tahun otomatis ---------- */
    const yearEl = $('#year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();