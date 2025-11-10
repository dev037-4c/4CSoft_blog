// Load sidebar
function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    fetch('sidebar.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            sidebarContainer.innerHTML = html;
            setActiveSidebarItem();
            initReleaseModal();
        })
        .catch(error => {
            console.error('Error loading sidebar:', error);
            // Fallback: try to load sidebar with XMLHttpRequest
            loadSidebarFallback();
        });
}

// Fallback method using XMLHttpRequest
function loadSidebarFallback() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) return;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'sidebar.html', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                sidebarContainer.innerHTML = xhr.responseText;
                setActiveSidebarItem();
                initReleaseModal();
            } else {
                console.error('Failed to load sidebar with fallback method');
            }
        }
    };
    xhr.send();
}

// Set active sidebar item based on current page
function setActiveSidebarItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        }
    });
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
    loadSidebar();
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Search functionality
const searchInput = document.querySelector('.search-input');
const contentArea = document.querySelector('.content');

// 검색 결과 없음 메시지 생성
let noResultsMessage = null;

function createNoResultsMessage() {
    if (!noResultsMessage) {
        noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results';
        noResultsMessage.innerHTML = '<p>검색 결과가 없습니다. 다른 검색어를 시도해보세요.</p>';
        noResultsMessage.style.display = 'none';
        contentArea.appendChild(noResultsMessage);
    }
    return noResultsMessage;
}

function searchArticles(searchTerm) {
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    
    // 검색 가능한 모든 아티클 요소들
    const articles = document.querySelectorAll('.featured-article, .article-card, .latest-article');
    
    let visibleCount = 0;
    const noResults = createNoResultsMessage();
    
    if (searchTerm.trim() === '') {
        // 검색어가 비어있으면 모든 아티클 표시
        articles.forEach(article => {
            article.style.display = '';
            visibleCount++;
        });
        noResults.style.display = 'none';
        
        // 섹션도 다시 표시
        const sections = document.querySelectorAll('.payment-section, .latest-section, .section-title');
        sections.forEach(section => {
            section.style.display = '';
        });
        return;
    }
    
    // 현재 페이지 아티클 검색
    articles.forEach(article => {
        // 아티클 내의 모든 검색 가능한 텍스트 수집
        const title = article.querySelector('.article-title, .card-title, .latest-title')?.textContent || '';
        const subtitle = article.querySelector('.article-subtitle, .card-description, .latest-subtitle')?.textContent || '';
        const meta = article.querySelector('.article-meta, .card-meta, .latest-meta')?.textContent || '';
        const badge = article.querySelector('.article-badge, .card-badge')?.textContent || '';
        
        const allText = (title + ' ' + subtitle + ' ' + meta + ' ' + badge).toLowerCase();
        
        // 모든 검색어가 포함되어 있는지 확인
        const matches = searchWords.every(word => allText.includes(word));
        
        if (matches) {
            article.style.display = '';
            visibleCount++;
        } else {
            article.style.display = 'none';
        }
    });
    
    // 검색 결과가 없을 때 메시지 표시
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
    
    // 섹션 제목들도 함께 검색 결과에 따라 표시/숨김 처리
    const sections = document.querySelectorAll('.payment-section, .latest-section, .section-title');
    sections.forEach(section => {
        section.style.display = 'none';
    });
}

if (searchInput) {
    // 실시간 검색 (입력할 때마다)
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value;
        searchArticles(searchTerm);
    });
    
    // Enter 키로 검색
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = this.value;
            searchArticles(searchTerm);
        }
    });

    searchInput.addEventListener('focus', function() {
        this.parentElement.style.background = '#ffffff';
        this.parentElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    });

    searchInput.addEventListener('blur', function() {
        if (this.value.trim() === '') {
            this.parentElement.style.background = 'var(--bg-white)';
            this.parentElement.style.boxShadow = 'var(--shadow-sm)';
        }
    });
}


// Article card click handlers - 링크가 없는 카드에만 적용
document.addEventListener('DOMContentLoaded', function() {
    const articleCards = document.querySelectorAll('.article-card, .featured-article, .latest-article');
    articleCards.forEach(card => {
        const existingLink = card.querySelector('a[href]');
        if (!existingLink) {
            // 링크가 없는 카드에만 클릭 이벤트 추가
            card.addEventListener('click', function() {
                const href = card.getAttribute('data-href');
                if (href) {
                    window.location.href = href;
                }
            });
        }
    });
});

// Payment card hover effects
const paymentCards = document.querySelectorAll('.payment-card');
paymentCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Hero arrow click handler
const heroArrow = document.querySelector('.hero-arrow');
if (heroArrow) {
    heroArrow.addEventListener('click', function() {
        const content = document.querySelector('.content');
        if (content) {
            content.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    } else {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe article cards for animation
document.querySelectorAll('.article-card, .featured-article, .latest-article, .payment-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Nav menu dropdown simulation (optional)
const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        const dropdownIcon = this.querySelector('.dropdown-icon');
        if (dropdownIcon) {
            dropdownIcon.style.transform = 'rotate(180deg)';
            dropdownIcon.style.transition = 'transform 0.3s ease';
        }
    });
    
    item.addEventListener('mouseleave', function() {
        const dropdownIcon = this.querySelector('.dropdown-icon');
        if (dropdownIcon) {
            dropdownIcon.style.transform = 'rotate(0deg)';
        }
    });
});

console.log('Blog page loaded successfully!');

// Active TOC highlighting on scroll
function initTOC() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.article-section[id]');
    
    if (!tocLinks.length || !sections.length) return;
    
    // Use Intersection Observer for better performance
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeSectionId = entry.target.id;
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + activeSectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// Initialize TOC when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTOC);
} else {
    initTOC();
}

// Release Notes Modal Functions
function initReleaseModal() {
    const versionBadge = document.getElementById('version-badge');
    const releaseModal = document.getElementById('release-modal');
    const closeModal = document.getElementById('close-modal');
    
    if (!versionBadge || !releaseModal || !closeModal) return;
    
    // 버전 배지 클릭 시 모달 열기
    versionBadge.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        releaseModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    });
    
    // 닫기 버튼 클릭 시 모달 닫기
    closeModal.addEventListener('click', function() {
        releaseModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    });
    
    // 모달 외부 클릭 시 닫기
    releaseModal.addEventListener('click', function(e) {
        if (e.target === releaseModal) {
            releaseModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && releaseModal.classList.contains('show')) {
            releaseModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    });
}

