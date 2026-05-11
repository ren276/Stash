import { db } from './lib/db';

// ─── Context Menu Setup ───────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'stash-snippet',
            title: 'Stash for Interview Prep',
            contexts: ['selection'],
        });
    });
    chrome.alarms.create('check-deadlines', { periodInMinutes: 60 });

});

// ─── Alarms ───────────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'check-deadlines') {
        checkDeadlines();
    }
});

async function checkDeadlines() {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // We check for any deadline that matches tomorrow's date
        const jobsWithDeadlines = await db.jobs.where('deadline').notEqual('').toArray();
        const upcoming = jobsWithDeadlines.filter(j => j.deadline === tomorrowStr);

        upcoming.forEach(job => {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon.png',
                title: 'Stash: Deadline Alert! 📅',
                message: `Your application for ${job.title} at ${job.company} is due tomorrow!`,
                priority: 2
            });
        });
    } catch (err) {

    }
}

// ─── Context Menu Click ───────────────────────────────────────────────────────

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'stash-snippet' || !info.selectionText) return;

    const rawUrl = tab?.url || '';
    let domain = '';
    try { domain = new URL(rawUrl).hostname; } catch { domain = rawUrl; }

    try {
        await db.snippets.add({
            title: `From ${domain}`,
            content: info.selectionText,
            tags: [domain, 'interview-prep'],
            createdAt: new Date().toISOString()
        });

    } catch (err: any) {

    }
});

// ─── Message Handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    switch (message.type) {
        case 'GET_STASH_DATA':
            fetchStashData(message.context).then(data => sendResponse({ data }));
            return true; // keep port open for async

        case 'SEARCH_STASH':
            searchStash(message.query).then(data => sendResponse({ data }));
            return true;

        case 'STASH_ROLE':
            stashRole(message.role).then(success => sendResponse({ success }));
            return true;

        case 'CHECK_STASHED':
            db.jobs.where('url').equals(message.url).first().then(existing => {
                sendResponse({ stashed: !!existing });
            });
            return true;
        
        case 'GET_FULL_PROFILE':
            Promise.all([
                db.links.toArray(),
                db.snippets.toArray()
            ]).then(([links, snippets]) => {
                sendResponse({ links, snippets });
            });
            return true;

        default:
            return false;
    }
});

// ─── Data Functions ───────────────────────────────────────────────────────────

async function fetchStashData(context: string): Promise<any[]> {
    try {
        if (context === 'general') {
            const links = await db.links.orderBy('createdAt').reverse().limit(10).toArray();
            const snippets = await db.snippets.orderBy('createdAt').reverse().limit(10).toArray();
            return [...links, ...snippets];
        }

        if (context === 'linkedin' || context === 'link') {
            const links = await db.links.orderBy('createdAt').reverse().limit(15).toArray();
            return links;
        }

        const snippets = await db.snippets.orderBy('createdAt').reverse().limit(15).toArray();
        return snippets;
    } catch (err: any) {

        return [];
    }
}

async function searchStash(query: string): Promise<any[]> {
    try {
        const q = query.toLowerCase();
        
        let snippets = await db.snippets.orderBy('createdAt').reverse().toArray();
        let links = await db.links.orderBy('createdAt').reverse().toArray();
        
        if (q) {
            snippets = snippets.filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
            links = links.filter(l => l.label.toLowerCase().includes(q) || l.url.toLowerCase().includes(q));
        }

        snippets = snippets.slice(0, 20);
        links = links.slice(0, 20);

        return [...links, ...snippets];
    } catch (err: any) {

        return [];
    }
}

async function stashRole(role: { title: string; company: string; url: string }): Promise<boolean> {
    try {
        const existing = await db.jobs.where('url').equals(role.url).first();
        if (existing) {

            return true; // Still success because it's already there
        }

        await db.jobs.add({
            title: role.title,
            company: role.company,
            url: role.url,
            status: 'Interested',
            timestamp: new Date().toISOString()
        });

        return true;
    } catch (err: any) {

        return false;
    }
}
