import gsap from 'gsap';
import type { StashItem } from './types';
import { isLink } from './types';

export function initCommandPalette() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            e.stopImmediatePropagation();
            toggleCommandPalette();
        }
    }, true);
}

let paletteInstance: HTMLElement | null = null;
let backdropInstance: HTMLElement | null = null;
let allItems: StashItem[] = [];
let selectedIndex = -1;

function toggleCommandPalette() {
    if (paletteInstance) {
        closePalette();
        return;
    }
    openPalette();
}

function closePalette() {
    if (!paletteInstance || !backdropInstance) return;

    const wrap = paletteInstance.shadowRoot?.querySelector('.palette-wrap');
    if (!wrap) return;
    
    gsap.to(backdropInstance, { opacity: 0, duration: 0.2 });
    gsap.to(wrap, { 
        opacity: 0, 
        scale: 0.95, 
        y: -10, 
        duration: 0.2, 
        ease: 'power2.in',
        onComplete: () => {
            paletteInstance?.remove();
            backdropInstance?.remove();
            paletteInstance = null;
            backdropInstance = null;
            allItems = [];
            selectedIndex = -1;
        }
    });
}

function openPalette() {
    // Backdrop
    backdropInstance = document.createElement('div');
    backdropInstance.id = 'stash-palette-backdrop';
    Object.assign(backdropInstance.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        webkitBackdropFilter: 'blur(12px)',
        zIndex: '2147483646',
        opacity: '0'
    });
    backdropInstance.onclick = closePalette;

    // Host element with Shadow DOM
    paletteInstance = document.createElement('div');
    paletteInstance.id = 'stash-command-palette-root';
    paletteInstance.style.zIndex = '2147483647';
    paletteInstance.style.position = 'fixed';
    paletteInstance.style.top = '0';
    paletteInstance.style.left = '0';

    const shadow = paletteInstance.attachShadow({ mode: 'open' });

    // Styles injected into Shadow DOM
    const style = document.createElement('style');
    style.textContent = `
        .palette-wrap {
            position: fixed;
            top: 15%;
            left: 50%;
            transform: translateX(-50%);
            width: min(680px, 95vw);
            background: rgba(13, 13, 13, 0.85);
            backdrop-filter: blur(40px) saturate(180%);
            -webkit-backdrop-filter: blur(40px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 50px 100px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
            font-family: 'Outfit', 'Inter', system-ui, -apple-system, sans-serif;
            overflow: hidden;
            z-index: 2147483647;
            opacity: 0;
        }
        .palette-header {
            display: flex;
            align-items: center;
            padding: 4px 24px;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            gap: 16px;
            background: rgba(255,255,255,0.02);
        }
        .palette-icon-wrap {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            color: #fff;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            flex-shrink: 0;
            font-size: 14px;
        }
        .palette-input {
            flex: 1;
            background: transparent;
            border: none;
            padding: 24px 0;
            color: #fff;
            font-size: 18px;
            font-weight: 600;
            outline: none;
            caret-color: #3b82f6;
            letter-spacing: -0.02em;
        }
        .palette-input::placeholder { color: rgba(255,255,255,0.2); font-weight: 500; }
        .palette-hint {
            font-size: 10px;
            color: rgba(255,255,255,0.3);
            flex-shrink: 0;
            background: rgba(255,255,255,0.05);
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .palette-results {
            max-height: 440px;
            overflow-y: auto;
            padding: 16px 12px;
            scrollbar-width: none;
        }
        .palette-results::-webkit-scrollbar { display: none; }
        .palette-empty {
            padding: 64px 20px;
            text-align: center;
            color: rgba(255,255,255,0.2);
            font-size: 15px;
            font-weight: 600;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
        }
        .palette-section {
            padding: 16px 16px 8px;
            font-size: 11px;
            font-weight: 800;
            color: rgba(255,255,255,0.2);
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }
        .palette-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-radius: 16px;
            cursor: pointer;
            gap: 16px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            margin-bottom: 4px;
            border: 1px solid transparent;
            opacity: 0;
            transform: translateX(-10px);
        }
        .palette-row:hover, .palette-row.selected {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.08);
            transform: translateX(0);
        }
        .palette-row.selected {
            background: rgba(59, 130, 246, 0.1);
            border-color: rgba(59, 130, 246, 0.2);
            box-shadow: inset 0 0 20px rgba(59, 130, 246, 0.05);
        }
        .palette-row-title {
            font-size: 15px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 460px;
            letter-spacing: -0.01em;
        }
        .palette-row-sub {
            font-size: 12px;
            color: rgba(255,255,255,0.3);
            margin-top: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 460px;
            font-weight: 500;
        }
        .palette-badge {
            font-size: 10px;
            color: rgba(255,255,255,0.4);
            background: rgba(255,255,255,0.05);
            padding: 6px 12px;
            border-radius: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0;
            transform: scale(0.9);
            border: 1px solid rgba(255,255,255,0.05);
        }
        .palette-row:hover .palette-badge, .palette-row.selected .palette-badge {
            opacity: 1;
            transform: scale(1);
        }
        .palette-badge.copied {
            background: #10b981;
            color: #fff;
            border-color: rgba(255,255,255,0.1);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
            opacity: 1 !important;
            transform: scale(1.05) !important;
        }
        .palette-footer {
            padding: 12px 24px;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 20px;
            font-size: 10px;
            color: rgba(255,255,255,0.2);
            background: rgba(0,0,0,0.1);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .palette-footer kbd {
            background: rgba(255,255,255,0.08);
            color: rgba(255,255,255,0.5);
            padding: 3px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-family: inherit;
            border: 1px solid rgba(255,255,255,0.05);
            margin: 0 4px;
        }
    `;

    const wrap = document.createElement('div');
    wrap.className = 'palette-wrap';

    const header = document.createElement('div');
    header.className = 'palette-header';

    const logoUrl = chrome.runtime.getURL('logo.png');
    const iconWrap = document.createElement('div');
    iconWrap.className = 'palette-icon-wrap';
    iconWrap.style.overflow = 'hidden';
    iconWrap.style.background = '#000';
    iconWrap.style.border = '1px solid rgba(255,255,255,0.1)';
    const logoImg = document.createElement('img');
    logoImg.src = logoUrl;
    Object.assign(logoImg.style, {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: 'scale(1.1)'
    });
    iconWrap.appendChild(logoImg);

    const input = document.createElement('input');
    input.className = 'palette-input';
    input.placeholder = 'Search stashed links & snippets…';
    input.autocomplete = 'off';
    input.spellcheck = false;

    const hint = document.createElement('div');
    hint.className = 'palette-hint';
    hint.innerText = 'Esc to close';

    header.appendChild(iconWrap);
    header.appendChild(input);
    header.appendChild(hint);

    const results = document.createElement('div');
    results.className = 'palette-results';

    const footer = document.createElement('div');
    footer.className = 'palette-footer';
    footer.innerHTML = '<span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span> <span><kbd>↵</kbd> Copy to Stash</span>';

    wrap.appendChild(style);
    wrap.appendChild(header);
    wrap.appendChild(results);
    wrap.appendChild(footer);
    shadow.appendChild(wrap);

    document.body.appendChild(backdropInstance);
    document.body.appendChild(paletteInstance);

    gsap.to(backdropInstance, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(wrap, 
        { opacity: 0, scale: 0.94, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'expo.out' }
    );

    requestAnimationFrame(() => input.focus());
    loadInitialItems(results);

    input.oninput = () => {
        const q = input.value.toLowerCase().trim();
        if (!q) {
            renderResults(results, allItems);
        } else {
            const filtered = allItems.filter(item => {
                const title = isLink(item) ? item.label : item.title;
                const body = isLink(item) ? item.url : item.content;
                const haystack = [title || '', body || ''].join(' ').toLowerCase();
                return haystack.includes(q);
            });
            renderResults(results, filtered);
        }
        selectedIndex = -1;
        updateSelection(results);
    };

    input.addEventListener('keydown', (e) => {
        const rows = results.querySelectorAll<HTMLElement>('.palette-row');
        if (e.key === 'Escape') {
            closePalette();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, rows.length - 1);
            updateSelection(results);
            rows[selectedIndex]?.scrollIntoView({ block: 'nearest' });
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection(results);
            rows[selectedIndex]?.scrollIntoView({ block: 'nearest' });
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const row = rows[selectedIndex] ?? rows[0];
            if (row) row.click();
        }
    });
}

function updateSelection(container: HTMLElement) {
    const rows = container.querySelectorAll<HTMLElement>('.palette-row');
    rows.forEach((row, i) => {
        row.classList.toggle('selected', i === selectedIndex);
    });
}

function loadInitialItems(results: HTMLElement) {
    const empty = document.createElement('div');
    empty.className = 'palette-empty';
    empty.innerText = 'Scanning your stash…';
    results.appendChild(empty);

    if (!chrome.runtime?.id) {
        empty.innerText = 'Extension context invalidated. Please refresh the page.';
        return;
    }

    chrome.runtime.sendMessage({ type: 'SEARCH_STASH', query: '' }, (response: { data?: StashItem[] }) => {
        allItems = response?.data ?? [];
        renderResults(results, allItems);
    });
}

function renderResults(container: HTMLElement, items: StashItem[]) {
    container.innerHTML = '';

    if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'palette-empty';
        empty.innerHTML = '<span>No matching items in your stash.</span>';
        container.appendChild(empty);
        return;
    }

    const links = items.filter(isLink);
    const snippets = items.filter(i => !isLink(i));

    const renderGroup = (title: string, group: StashItem[]) => {
        if (group.length === 0) return;

        const section = document.createElement('div');
        section.className = 'palette-section';
        section.innerText = title;
        container.appendChild(section);

        const groupRows: HTMLElement[] = [];

        group.forEach(item => {
            const row = document.createElement('div');
            row.className = 'palette-row';

            const info = document.createElement('div');
            info.style.overflow = 'hidden';

            const displayTitle = isLink(item) ? item.label : item.title;
            const displaySub = isLink(item)
                ? item.url
                : (item.content.slice(0, 100) + (item.content.length > 100 ? '…' : ''));
            const copyValue = isLink(item) ? item.url : item.content;

            const titleEl = document.createElement('div');
            titleEl.className = 'palette-row-title';
            titleEl.innerText = displayTitle || 'Untitled Item';

            const sub = document.createElement('div');
            sub.className = 'palette-row-sub';
            sub.innerText = displaySub;

            info.appendChild(titleEl);
            info.appendChild(sub);

            const badge = document.createElement('div');
            badge.className = 'palette-badge';
            badge.innerText = 'Copy';

            row.appendChild(info);
            row.appendChild(badge);

            row.onclick = () => {
                navigator.clipboard.writeText(copyValue).then(() => {
                    badge.innerText = '✓ Copied';
                    badge.classList.add('copied');
                    gsap.to(row, { scale: 1.02, duration: 0.2, ease: 'back.out(2)' });
                    setTimeout(() => closePalette(), 500);
                });
            };

            container.appendChild(row);
            groupRows.push(row);
        });

        gsap.to(groupRows, {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: 'expo.out'
        });
    };

    renderGroup('Links', links);
    renderGroup('Snippets', snippets);
}
