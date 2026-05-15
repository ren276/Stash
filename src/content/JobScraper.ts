import gsap from 'gsap';

export function initJobScraper() {
    const hostname = window.location.hostname;

    const isJobBoard =
        hostname.includes('linkedin.com') ||
        hostname.includes('wellfound.com') ||
        hostname.includes('lever.co') ||
        hostname.includes('greenhouse.io') ||
        hostname.includes('ashbyhq.com') ||
        hostname.includes('workday.com') ||
        hostname.includes('docs.google.com');

    if (!isJobBoard) return;

    tryInjectBadge();

    const observer = new MutationObserver(() => {
        scheduleInject();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            scheduleInject();
        }
    }, 1000);
}

let injectTimer: ReturnType<typeof setTimeout> | null = null;
let currentBadge: HTMLElement | null = null;
let lastJobKey = '';

function scheduleInject() {
    if (injectTimer) clearTimeout(injectTimer);
    injectTimer = setTimeout(() => {
        tryInjectBadge();
    }, 800); 
}

function tryInjectBadge() {
    const { title, company } = extractJobData();
    const jobKey = `${title}-${company}`;

    if (!title || !company) {
        if (currentBadge && document.body.contains(currentBadge)) {
            gsap.to(currentBadge, { 
                opacity: 0, 
                x: 50, 
                duration: 0.5, 
                onComplete: () => {
                    currentBadge?.remove();
                    currentBadge = null;
                    lastJobKey = '';
                }
            });
        }
        return;
    }

    // Only return if we already have a badge for THIS specific job
    if (jobKey === lastJobKey && currentBadge && document.body.contains(currentBadge)) return;

    // If we have a badge for a DIFFERENT job, remove it first
    if (currentBadge) {
        currentBadge.remove();
    }

    lastJobKey = jobKey;
    showStashRoleBadge(title, company);
}

function extractJobData(): { title: string; company: string } {
    const host = window.location.hostname;
    let title = '';
    let company = '';

    if (host.includes('linkedin.com')) {
        title =
            document.querySelector<HTMLElement>('.job-details-jobs-unified-top-card__job-title h1')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('.jobs-unified-top-card__content--two-pane h1')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('.jobs-unified-top-card__job-title')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('h1.t-24.t-bold')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('.job-view-layout-jobs-details h1')?.innerText?.trim() ||
            '';
        
        company =
            document.querySelector<HTMLElement>('.job-details-jobs-unified-top-card__company-name')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('.jobs-unified-top-card__company-name')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('.job-details-jobs-unified-top-card__primary-description a')?.innerText?.trim() ||
            document.querySelector<HTMLElement>('.jobs-unified-top-card__primary-description a')?.innerText?.trim() ||
            '';

        if (!title && window.location.pathname.includes('/jobs/view/')) {
            const titleParts = document.title.split(' | ');
            title = titleParts[0]?.trim() || '';
            if (!company) company = titleParts[1]?.trim() || '';
        }
    } else if (host.includes('wellfound.com')) {
        title = document.querySelector<HTMLElement>('h1[data-test="job-title"]')?.innerText?.trim() || '';
        company = document.querySelector<HTMLElement>('[data-test="startup-name"]')?.innerText?.trim() || '';
    } else if (host.includes('lever.co') || host.includes('jobs.lever.co')) {
        title = document.querySelector<HTMLElement>('.posting-headline h2')?.innerText?.trim() || '';
        company = document.querySelector<HTMLElement>('.main-header-logo img')?.getAttribute('alt')?.trim() || '';
    } else if (host.includes('greenhouse.io')) {
        title = document.querySelector<HTMLElement>('h1.app-title')?.innerText?.trim() || '';
        company = document.querySelector<HTMLElement>('.company-name')?.innerText?.trim() || '';
    } else {
        const parts = document.title.split(/[|–—@]/);
        title = parts[0]?.trim() || '';
        company = parts[1]?.trim() || '';
    }

    return {
        title: cleanText(title),
        company: cleanText(company),
    };
}

function cleanText(s: string): string {
    return s.replace(/&amp;/g, '&').replace(/\n/g, ' ').trim();
}

function showStashRoleBadge(title: string, company: string) {
    currentBadge = document.createElement('div');
    const badge = currentBadge;

    Object.assign(badge.style, {
        position: 'fixed',
        top: '120px',
        right: '32px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(24px) saturate(160%)',
        webkitBackdropFilter: 'blur(24px) saturate(160%)',
        color: 'white',
        padding: '12px 18px',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
        cursor: 'pointer',
        zIndex: '2147483647',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        opacity: '0',
        transform: 'translateX(50px) scale(0.9)',
    });

    const logoUrl = chrome.runtime.getURL('logo.png');
    const iconBox = document.createElement('div');
    Object.assign(iconBox.style, {
        width: '32px',
        height: '32px',
        background: '#000',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.1)',
        flexShrink: '0',
        overflow: 'hidden'
    });
    const logoImg = document.createElement('img');
    logoImg.src = logoUrl;
    Object.assign(logoImg.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scale(1.1)'
    });
    iconBox.appendChild(logoImg);

    const info = document.createElement('div');
    info.style.overflow = 'hidden';

    const label = document.createElement('div');
    label.innerText = 'Stash this role';
    Object.assign(label.style, {
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.4)',
    });

    const jobTitle = document.createElement('div');
    jobTitle.innerText = title.length > 25 ? title.slice(0, 22) + '...' : title;
    Object.assign(jobTitle.style, {
        fontSize: '14px',
        fontWeight: '700',
        color: 'white',
        whiteSpace: 'nowrap',
        marginTop: '1px',
    });

    info.appendChild(label);
    info.appendChild(jobTitle);

    badge.appendChild(iconBox);
    badge.appendChild(info);

    badge.onmouseenter = () => {
        badge.style.transform = 'translateX(0) scale(1.05)';
        badge.style.background = 'rgba(15, 15, 15, 0.9)';
        badge.style.boxShadow = '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.15)';
    };
    badge.onmouseleave = () => {
        badge.style.transform = 'translateX(0) scale(1)';
        badge.style.background = 'rgba(10, 10, 10, 0.8)';
        badge.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)';
    };

    const showStatus = (text: string, isSuccess: boolean) => {
        info.innerHTML = '';
        const statusEl = document.createElement('div');
        statusEl.innerText = text;
        Object.assign(statusEl.style, {
            fontSize: '13px',
            fontWeight: '800',
            color: isSuccess ? '#10b981' : '#ef4444',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        });
        info.appendChild(statusEl);

        if (isSuccess) {
            iconBox.style.background = '#10b981';
            iconBox.innerText = '✓';
        }

        setTimeout(() => {
            gsap.to(badge, { 
                opacity: 0, 
                x: 50, 
                duration: 0.5, 
                ease: 'power2.in',
                onComplete: () => badge.remove()
            });
        }, 2000);
    };

    badge.onclick = () => {
        if (!chrome.runtime?.id) {
            alert('Extension context invalidated. Please refresh the page.');
            return;
        }

        badge.style.pointerEvents = 'none';
        gsap.to(badge, { scale: 0.95, duration: 0.2 });

        chrome.runtime.sendMessage({ type: 'CHECK_STASHED', url: window.location.href }, (checkResponse) => {
            if (checkResponse?.stashed) {
                showStatus('Already in Stash', true);
                return;
            }

            chrome.runtime.sendMessage(
                { type: 'STASH_ROLE', role: { title, company, url: window.location.href } },
                (response) => {
                    if (response?.success) {
                        showStatus('Stashed!', true);
                    } else {
                        showStatus('Error Stashing', false);
                    }
                }
            );
        });
    };

    document.body.appendChild(badge);
    gsap.to(badge, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'expo.out' });
}
