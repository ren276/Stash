import type { StashItem } from './types';
import { isLink } from './types';
import gsap from 'gsap';

// Track injected buttons so we can clean them up
const injectedButtons = new WeakMap<HTMLElement, HTMLElement>();

export function initFormInjection() {
    document.addEventListener('focusin', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            handleInputFocus(target as HTMLInputElement | HTMLTextAreaElement);
        }
    });

    document.addEventListener('focusout', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            // Small delay so clicking the button itself doesn't instantly remove it
            setTimeout(() => {
                const btn = injectedButtons.get(target);
                if (btn && !btn.matches(':hover')) {
                    gsap.to(btn, { 
                        scale: 0.8, 
                        opacity: 0, 
                        duration: 0.2, 
                        onComplete: () => {
                            btn.remove();
                            injectedButtons.delete(target);
                            delete (target as HTMLElement).dataset.stashInjected;
                        }
                    });
                }
            }, 200);
        }
    });
}

function handleInputFocus(input: HTMLInputElement | HTMLTextAreaElement) {
    if (input.dataset.stashInjected) return;

    const hostname = window.location.hostname.toLowerCase();
    const url = window.location.href.toLowerCase();
    
    // Broad detection for career sites and ATS (Applicant Tracking Systems)
    const isJobRelatedSite = 
        // Major job boards
        hostname.includes('linkedin.com') ||
        hostname.includes('wellfound.com') ||
        hostname.includes('indeed.com') ||
        hostname.includes('glassdoor.com') ||
        // Common ATS platforms
        hostname.includes('lever.co') ||
        hostname.includes('greenhouse.io') ||
        hostname.includes('ashbyhq.com') ||
        hostname.includes('workday.com') ||
        hostname.includes('jobvite.com') ||
        hostname.includes('bamboohr.com') ||
        hostname.includes('smartrecruiters.com') ||
        hostname.includes('icims.com') ||
        hostname.includes('breezy.hr') ||
        hostname.includes('recruitee.com') ||
        // General company career site patterns
        url.includes('/careers') ||
        url.includes('/jobs') ||
        url.includes('/apply') ||
        hostname.startsWith('careers.') ||
        hostname.startsWith('jobs.') ||
        hostname.startsWith('apply.') ||
        hostname.startsWith('recruiting.') ||
        // Generic markers
        document.title.toLowerCase().includes('career') ||
        document.title.toLowerCase().includes('job application');

    const context = detectContext(input);
    
    const excludedTypes = ['password', 'checkbox', 'radio', 'file', 'submit', 'button', 'image', 'reset', 'hidden'];
    const isTextField = !excludedTypes.includes(input.type);

    // 1. Known context (Magic Button) - Works on ANY site if context is high-confidence
    if (context) {
        injectSmartFillButton(input);
    } 
    // 2. General Stash Icon - Only shows on Job-related sites to avoid cluttering sites like Google
    else if (isTextField && isJobRelatedSite) {
        injectStashIcon(input, 'general');
    }
}

function detectContext(input: HTMLInputElement | HTMLTextAreaElement): string | null {
    const ariaLabel = input.getAttribute('aria-label') || '';
    const text = [
        input.placeholder,
        input.name,
        input.id,
        input.labels?.[0]?.innerText || '',
        ariaLabel,
    ].join(' ').toLowerCase();

    if (text.includes('linkedin')) return 'linkedin';
    if (text.includes('github')) return 'link';
    if (text.includes('portfolio') || text.includes('website') || text.includes('personal site')) return 'link';
    if (text.includes('bio') || text.includes('about me') || text.includes('summary') || text.includes('cover letter')) return 'snippet';
    if (text.includes('twitter') || text.includes('behance') || text.includes('dribbble')) return 'link';

    // Only inject into URL-type inputs that aren't clearly generic
    if (input.type === 'url') return 'link';

    return null; 
}

function injectSmartFillButton(input: HTMLInputElement | HTMLTextAreaElement) {
    if (document.querySelector('.stash-smart-fill-btn')) return;

    const rect = input.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const smartBtn = document.createElement('div');
    smartBtn.className = 'stash-smart-fill-btn';
    
    Object.assign(smartBtn.style, {
        position: 'absolute',
        left: `${rect.right - 62 + scrollX}px`, // Place it to the left of the main icon
        top: `${rect.top + (rect.height / 2) - 13 + scrollY}px`,
        width: '26px',
        height: '26px',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: '999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity: '0',
        transform: 'scale(0.8)',
    });

    smartBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
    `;
    smartBtn.title = 'Smart Auto-Fill Application';

    smartBtn.onmouseenter = () => {
        smartBtn.style.transform = 'scale(1.15) rotate(15deg)';
        smartBtn.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.6)';
    };
    smartBtn.onmouseleave = () => {
        smartBtn.style.transform = 'scale(1)';
        smartBtn.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
    };

    smartBtn.onclick = (e) => {
        e.stopPropagation();
        runSmartFill();
    };

    document.body.appendChild(smartBtn);
    gsap.to(smartBtn, { opacity: 1, scale: 1, duration: 0.3, delay: 0.1, ease: 'back.out(1.7)' });
    
    // Cleanup on blur
    input.addEventListener('blur', () => {
        setTimeout(() => {
            if (!smartBtn.matches(':hover')) {
                gsap.to(smartBtn, { opacity: 0, scale: 0.8, duration: 0.2, onComplete: () => smartBtn.remove() });
            }
        }, 200);
    }, { once: true });
}

async function runSmartFill() {
    chrome.runtime.sendMessage({ type: 'GET_FULL_PROFILE' }, (profile: { links: any[], snippets: any[] }) => {
        if (!profile) return;

        const inputs = document.querySelectorAll('input, textarea');
        let filledCount = 0;

        inputs.forEach((el) => {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            const context = detectContext(input);
            if (!context) return;

            let bestMatch = '';

            if (context === 'link') {
                const text = getFieldContext(input);
                const match = profile.links.find(l => 
                    text.includes(l.label.toLowerCase()) || 
                    l.label.toLowerCase().includes(text) ||
                    (text.includes('github') && l.url.includes('github')) ||
                    (text.includes('portfolio') && l.category === 'Portfolio')
                );
                if (match) bestMatch = match.url;
            } else if (context === 'snippet') {
                const text = getFieldContext(input);
                const match = profile.snippets.find(s => 
                    text.includes(s.title.toLowerCase()) || 
                    s.title.toLowerCase().includes(text) ||
                    (text.includes('bio') && s.title.toLowerCase().includes('bio')) ||
                    (text.includes('cover') && s.title.toLowerCase().includes('cover'))
                );
                if (match) bestMatch = match.content;
            } else if (context === 'linkedin') {
                const match = profile.links.find(l => l.url.includes('linkedin.com'));
                if (match) bestMatch = match.url;
            }

            if (bestMatch && !input.value) {
                input.value = bestMatch;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                filledCount++;
                
                // Visual feedback
                const originalBg = input.style.background;
                input.style.background = 'rgba(52, 211, 153, 0.1)';
                setTimeout(() => { input.style.background = originalBg; }, 1000);
            }
        });


    });
}

function getFieldContext(input: HTMLInputElement | HTMLTextAreaElement): string {
    return [
        input.placeholder,
        input.name,
        input.id,
        input.labels?.[0]?.innerText || '',
        input.getAttribute('aria-label') || '',
    ].join(' ').toLowerCase();
}

function injectStashIcon(input: HTMLInputElement | HTMLTextAreaElement, context: string) {
    const rect = input.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    const button = document.createElement('div');
    button.className = 'stash-injection-button';

    // Position at the right edge of the input, vertically centred
    const logoUrl = chrome.runtime.getURL('logo.png');
    Object.assign(button.style, {
        position: 'absolute',
        left: `${rect.right - 32 + scrollX}px`,
        top: `${rect.top + (rect.height / 2) - 13 + scrollY}px`,
        width: '26px',
        height: '26px',
        background: '#000',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: '999999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        opacity: '0',
        transform: 'scale(0.8)',
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
    button.appendChild(logoImg);
    button.title = `Stash Quick-Fill (${context})`;

    button.onmouseenter = () => {
        button.style.transform = 'scale(1.15) translateY(-1px)';
        button.style.boxShadow = '0 6px 20px rgba(59,130,246,0.6), 0 0 0 1px rgba(255,255,255,0.2)';
    };
    button.onmouseleave = () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)';
    };

    button.onmousedown = (e) => e.preventDefault();
    button.onclick = (e) => {
        e.stopPropagation();
        showDropdown(input, context, button);
    };

    document.body.appendChild(button);
    gsap.to(button, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });

    input.dataset.stashInjected = 'true';
    injectedButtons.set(input, button);
}

function showDropdown(input: HTMLInputElement | HTMLTextAreaElement, context: string, anchor: HTMLElement) {
    document.querySelector('.stash-dropdown')?.remove();

    const anchorRect = anchor.getBoundingClientRect();

    const dropdown = document.createElement('div');
    dropdown.className = 'stash-dropdown';
    Object.assign(dropdown.style, {
        position: 'fixed',
        left: `${anchorRect.left - 200}px`, 
        top: `${anchorRect.bottom + 10}px`,
        background: 'rgba(20, 20, 20, 0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        webkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '6px',
        zIndex: '1000000',
        minWidth: '240px',
        maxHeight: '300px',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        fontFamily: "'Inter', sans-serif",
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    });

    const header = document.createElement('div');
    header.style.cssText = 'padding: 8px 12px; color: rgba(255,255,255,0.2); font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;';
    header.innerText = `Quick Stash — ${context}`;
    dropdown.appendChild(header);

    document.body.appendChild(dropdown);
    requestAnimationFrame(() => {
        dropdown.style.opacity = '1';
        dropdown.style.transform = 'translateY(0)';
    });

    chrome.runtime.sendMessage({ type: 'GET_STASH_DATA', context }, (response: { data?: StashItem[] }) => {
        const items: StashItem[] = response?.data ?? [];

        if (items.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'padding: 24px 12px; color: rgba(255,255,255,0.3); font-size: 11px; text-align: center; font-weight: 500;';
            empty.innerText = 'No stashed items for this field';
            dropdown.appendChild(empty);
            return;
        }

        items.forEach((item: StashItem) => {
            const displayLabel = isLink(item) ? item.label : item.title;
            const displaySub   = isLink(item) ? item.url   : item.content;
            const injectValue  = isLink(item) ? item.url   : item.content;

            const option = document.createElement('div');
            Object.assign(option.style, {
                padding: '10px 14px',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                marginBottom: '2px',
            });

            const labelEl = document.createElement('div');
            labelEl.style.cssText = 'font-weight: 700; color: #fff; font-size: 13px; letter-spacing: -0.01em;';
            labelEl.innerText = displayLabel || 'Untitled';

            const sub = document.createElement('div');
            sub.style.cssText = 'font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;';
            sub.innerText = displaySub;

            option.appendChild(labelEl);
            option.appendChild(sub);

            option.onmouseenter = () => { 
                option.style.background = 'rgba(255,255,255,0.06)'; 
                option.style.transform = 'translateX(4px)';
            };
            option.onmouseleave = () => { 
                option.style.background = 'transparent'; 
                option.style.transform = 'translateX(0)';
            };

            option.onmousedown = (e) => e.preventDefault();
            option.onclick = () => {
                input.value = injectValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                
                gsap.to(dropdown, { 
                    opacity: 0, 
                    y: -10, 
                    duration: 0.2, 
                    onComplete: () => dropdown.remove() 
                });
            };

            dropdown.appendChild(option);
        });
    });

    const closeDropdown = (e: MouseEvent) => {
        if (!dropdown.contains(e.target as Node) && e.target !== anchor) {
            dropdown.remove();
            document.removeEventListener('mousedown', closeDropdown);
        }
    };
    setTimeout(() => document.addEventListener('mousedown', closeDropdown), 0);
}
