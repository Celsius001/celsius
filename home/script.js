const tabsList = document.getElementById('tabsList');
const newTabBtn = document.getElementById('newTabBtn');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const appFrame = document.getElementById('appFrame');
const homeView = document.getElementById('homeView');
const urlInput = document.getElementById('urlInput');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const reloadBtn = document.getElementById('reloadBtn');

function getIconSrc(url) {
    if (!url.startsWith('celsius://')) return '../favicon.ico';
    const appName = url.replace('celsius://', '');
    return appName === 'home' ? '../favicon.ico' : `../${appName}/favicon.ico`;
}

function createTab(title = 'New Tab', url = 'celsius://home') {
    const tab = document.createElement('div');
    tab.className = 'tab';
    
    const closeBtnHTML = `
        <button class="close-tab">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>`;
    
    tab.innerHTML = `
        <img src="${getIconSrc(url)}" alt="" class="tab-icon">
        <span class="tab-title">${title}</span>
        ${closeBtnHTML}
    `;

    tab.dataset.url = url;

    tab.addEventListener('click', (e) => {
        if (!e.target.closest('.close-tab')) {
            activateTab(tab);
        }
    });

    const closeBtn = tab.querySelector('.close-tab');
    closeBtn.addEventListener('click', () => {
        tab.style.animation = 'none';
        tab.style.opacity = '0';
        tab.style.width = '0';
        tab.style.padding = '0';
        tab.style.border = 'none';
        tab.style.transition = 'all 0.2s';
        
        setTimeout(() => {
            const wasActive = tab.classList.contains('active');
            tab.remove();
            
            const remainingTabs = document.querySelectorAll('.tab');
            if (remainingTabs.length > 0 && wasActive) {
                activateTab(remainingTabs[remainingTabs.length - 1]);
            } else if (remainingTabs.length === 0) {
                appFrame.style.display = 'none';
                homeView.style.display = 'flex';
                urlInput.value = '';
                sidebarLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('[data-app="celsius://home"]').classList.add('active');
            }
        }, 200);
    });

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    tabsList.appendChild(tab);
    updateContent(url);
}

function activateTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateContent(tab.dataset.url);
}

function updateContent(appUrl) {
    urlInput.value = appUrl;
    
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if(link.dataset.app === appUrl) {
            link.classList.add('active');
        }
    });

    if (appUrl === 'celsius://home') {
        appFrame.style.display = 'none';
        homeView.style.display = 'flex';
        appFrame.src = 'about:blank';
    } else if (appUrl.startsWith('celsius://')) {
        homeView.style.display = 'none';
        appFrame.style.display = 'block';
        
        const htmlFile = '../' + appUrl.replace('celsius://', '') + '/index.html';
        appFrame.src = htmlFile;
    } else {
        homeView.style.display = 'none';
        appFrame.style.display = 'block';
        appFrame.src = appUrl;
    }
}

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        let newUrl = urlInput.value.trim();
        
        if (!newUrl.startsWith('celsius://') && !newUrl.startsWith('http')) {
            newUrl = 'https://' + newUrl;
        }
        
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            activeTab.dataset.url = newUrl;
            activeTab.querySelector('.tab-title').textContent = newUrl;
            activeTab.querySelector('.tab-icon').src = getIconSrc(newUrl);
            updateContent(newUrl);
        } else {
            createTab(newUrl, newUrl);
        }
    }
});

newTabBtn.addEventListener('click', () => {
    createTab('Celsius Home', 'celsius://home');
});

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const appUrl = link.dataset.app;
        const titleText = link.href.split('/').slice(-2)[0] || 'Home';
        const formattedTitle = titleText.charAt(0).toUpperCase() + titleText.slice(1);
        const finalTitle = formattedTitle === 'Home' ? 'Celsius Home' : formattedTitle;
        
        const activeTab = document.querySelector('.tab.active');
        
        if (activeTab) {
            activeTab.querySelector('.tab-title').textContent = finalTitle;
            activeTab.querySelector('.tab-icon').src = getIconSrc(appUrl);
            activeTab.dataset.url = appUrl;
            updateContent(appUrl);
        } else {
            createTab(finalTitle, appUrl);
        }
    });
});

reloadBtn.addEventListener('click', () => {
    if (appFrame.style.display === 'block') {
        appFrame.src = appFrame.src;
    }
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});
