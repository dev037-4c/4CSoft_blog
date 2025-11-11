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
let searchInput = null;
let contentArea = null;
let noResultsMessage = null;

function initSearch() {
    searchInput = document.querySelector('.search-input');
    contentArea = document.querySelector('.content');
    
    if (!searchInput || !contentArea) return;
    
    // 상세 페이지인지 확인 (article-detail 클래스가 있으면 상세 페이지)
    const isDetailPage = document.querySelector('.article-detail') !== null;
    
    // 실시간 검색 (입력할 때마다)
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value;
        searchArticles(searchTerm);
    });
    
    // Enter 키로 검색 (모든 페이지에서 작동)
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const searchTerm = this.value;
            searchArticles(searchTerm);
        }
    });
    
    // URL에서 검색어 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && !isDetailPage) {
        searchInput.value = searchParam;
        searchArticles(searchParam);
    }

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

function createNoResultsMessage() {
    if (!noResultsMessage && contentArea) {
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
    
    // 검색 가능한 모든 아티클 요소들 (목록 페이지만)
    const articles = document.querySelectorAll('.featured-article, .article-card, .latest-article');
    
    // newsroom.html의 article 요소들도 포함
    const newsCards = document.querySelectorAll('article[style*="background"]');
    
    // 상세 페이지인지 확인
    const isDetailPage = document.querySelector('.article-detail') !== null;
    const articleDetail = document.querySelector('.article-detail');
    const articleLayout = document.querySelector('.article-layout');
    
    let visibleCount = 0;
    const noResults = createNoResultsMessage();
    
    // 통합 검색 결과 컨테이너 확인/생성
    let globalSearchResults = document.getElementById('global-search-results');
    
    if (searchTerm.trim() === '') {
        // 검색어가 비어있으면 모든 아티클 표시
        articles.forEach(article => {
            article.style.display = '';
            visibleCount++;
        });
        
        newsCards.forEach(card => {
            card.style.display = '';
            visibleCount++;
        });
        
        // 상세 페이지 복원
        if (isDetailPage && articleDetail) {
            articleDetail.style.display = '';
        }
        if (isDetailPage && articleLayout) {
            articleLayout.style.display = '';
        }
        
        // 통합 검색 결과 숨기기
        if (globalSearchResults) {
            globalSearchResults.style.display = 'none';
        }
        
        noResults.style.display = 'none';
        
        // 섹션도 다시 표시
        const sections = document.querySelectorAll('.payment-section, .latest-section, .section-title');
        sections.forEach(section => {
            section.style.display = '';
        });
        
        // 전체보기 링크 다시 표시
        const viewAllLinks = document.querySelectorAll('.view-all-link');
        viewAllLinks.forEach(link => {
            link.style.display = '';
        });
        
        // section-header 다시 표시
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            header.style.display = '';
        });
        
        // 뉴스룸 그리드 레이아웃도 다시 표시
        const newsLayouts = document.querySelectorAll('div[style*="grid-template-columns"]');
        newsLayouts.forEach(layout => {
            layout.style.display = '';
        });
        
        // article-grid도 다시 표시
        const articleGrids = document.querySelectorAll('.article-grid');
        articleGrids.forEach(grid => {
            grid.style.display = '';
        });
        
        return;
    }
    
    // 현재 페이지 아티클 검색 (목록 페이지)
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
    
    // newsroom.html의 카드들 검색
    newsCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const matches = searchWords.every(word => cardText.includes(word));
        
        if (matches) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // 통합 검색 (allArticlesData가 존재하는 경우)
    if (typeof allArticlesData !== 'undefined') {
        const globalResults = allArticlesData.filter(article => {
            const searchableText = `${article.title} ${article.description} ${article.badge} ${article.pageTitle}`.toLowerCase();
            return searchWords.every(word => searchableText.includes(word));
        });
        
        console.log('검색어:', searchTerm);
        console.log('검색 결과 수:', globalResults.length);
        
        // 통합 검색 결과가 있으면 표시
        if (globalResults.length > 0) {
            // 상세 페이지 콘텐츠 숨기기
            if (isDetailPage) {
                if (articleDetail) articleDetail.style.display = 'none';
                if (articleLayout) articleLayout.style.display = 'none';
            }
            
            // 검색 결과 컨테이너 생성 또는 가져오기
            if (!globalSearchResults) {
                globalSearchResults = document.createElement('div');
                globalSearchResults.id = 'global-search-results';
                globalSearchResults.style.cssText = 'margin-top: 2rem; display: block; width: 100%;';
                
                // 검색창 바로 다음에 삽입
                const searchBox = document.querySelector('.search-box');
                if (searchBox && searchBox.nextSibling) {
                    searchBox.parentNode.insertBefore(globalSearchResults, searchBox.nextSibling);
                } else {
                    contentArea.appendChild(globalSearchResults);
                }
                console.log('검색 결과 컨테이너 생성됨');
            }
            
            // 검색 결과를 명시적으로 표시
            globalSearchResults.style.display = 'block';
            globalSearchResults.style.visibility = 'visible';
            globalSearchResults.style.position = 'relative';
            globalSearchResults.style.zIndex = '10';
            
            globalSearchResults.innerHTML = `
                <h2 class="section-title" style="margin-top: 2rem; margin-bottom: 1.5rem; display: block !important;">전체 검색 결과 (${globalResults.length}개)</h2>
                <div class="article-grid" style="display: grid !important; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                    ${globalResults.map(article => `
                        <article class="article-card" style="display: flex; flex-direction: column; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer;">
                            <a href="${article.link}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                                ${article.thumbnail ? `
                                <div class="card-image" style="position: relative; width: 100%; padding-bottom: 60%; overflow: hidden; background: #f5f5f5;">
                                    <img src="${article.thumbnail}" alt="${article.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                    <span class="card-badge" style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(124, 58, 237, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${article.badge}</span>
                                </div>
                                ` : ''}
                                <div class="card-content" style="padding: 1rem; flex: 1; display: flex; flex-direction: column;">
                                    ${!article.thumbnail ? `<span class="card-badge" style="display: inline-block; background: rgba(124, 58, 237, 0.1); color: #7c3aed; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.5rem; width: fit-content;">${article.badge}</span>` : ''}
                                    <h4 class="card-title" style="font-size: 0.95rem; font-weight: 600; color: #1a1a1a; margin: 0 0 0.5rem 0; line-height: 1.4;">${article.title}</h4>
                                    <p class="card-description" style="font-size: 0.8rem; color: #666; line-height: 1.5; margin: 0 0 auto 0;">${article.description}</p>
                                    <p class="card-meta" style="margin-top: 0.75rem; color: #7c3aed; font-size: 0.75rem; font-weight: 500;">📂 ${article.pageTitle}</p>
                                </div>
                            </a>
                        </article>
                    `).join('')}
                </div>
            `;
            
            visibleCount += globalResults.length;
            
            // 원래 페이지의 모든 콘텐츠를 숨기기
            // 1. section-header 숨기기 (섹션 제목 + 전체보기 포함)
            const sectionHeaders = document.querySelectorAll('.section-header');
            sectionHeaders.forEach(header => {
                header.style.display = 'none';
            });
            
            // 2. article-grid 숨기기 (검색 결과 그리드 제외)
            const articleGrids = document.querySelectorAll('.article-grid');
            articleGrids.forEach(grid => {
                if (!globalSearchResults.contains(grid)) {
                    grid.style.display = 'none';
                }
            });
            
            // 3. featured-article 숨기기
            const featuredArticles = document.querySelectorAll('.featured-article');
            featuredArticles.forEach(article => {
                article.style.display = 'none';
            });
            
            // 4. 뉴스룸 레이아웃 숨기기
            const newsLayouts = document.querySelectorAll('div[style*="grid-template-columns: 250px"]');
            newsLayouts.forEach(layout => {
                layout.style.display = 'none';
            });
        } else if (globalSearchResults) {
            globalSearchResults.style.display = 'none';
        }
    }
    
    // 검색 결과가 없을 때 메시지 표시
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
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

// Recommended Articles for detail pages
function initRecommendedArticles() {
    // 상세 페이지인지 확인
    const isDetailPage = document.querySelector('.article-detail') !== null;
    if (!isDetailPage || typeof allArticlesData === 'undefined') return;
    
    const tocContainer = document.querySelector('.table-of-contents');
    if (!tocContainer) return;
    
    // 현재 페이지 URL에서 article 파일명 추출
    const currentPage = window.location.pathname.split('/').pop();
    
    // 현재 게시물 찾기
    const currentArticle = allArticlesData.find(article => article.link === currentPage);
    
    // 추천 게시물 선택 (같은 카테고리 또는 랜덤)
    let recommendedArticles = [];
    
    if (currentArticle) {
        // 같은 카테고리의 다른 게시물 찾기
        const sameCategoryArticles = allArticlesData.filter(article => 
            article.link !== currentPage && 
            (article.pageTitle === currentArticle.pageTitle || article.badge === currentArticle.badge)
        );
        
        // 같은 카테고리에서 최대 2개 선택
        recommendedArticles = sameCategoryArticles
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        
        // 2개가 안 되면 다른 게시물로 채우기
        if (recommendedArticles.length < 2) {
            const otherArticles = allArticlesData
                .filter(article => article.link !== currentPage && !recommendedArticles.includes(article))
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 - recommendedArticles.length);
            recommendedArticles = [...recommendedArticles, ...otherArticles];
        }
    } else {
        // 현재 게시물을 못 찾으면 랜덤으로 2개
        recommendedArticles = allArticlesData
            .filter(article => article.link !== currentPage)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
    }
    
    if (recommendedArticles.length === 0) return;
    
    // 추천 게시물 HTML 생성
    const recommendedSection = document.createElement('div');
    recommendedSection.className = 'recommended-articles';
    recommendedSection.style.cssText = 'margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;';
    
    recommendedSection.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #1a1a1a; margin: 0;">추천 게시물</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${recommendedArticles.map(article => `
                <a href="${article.link}" style="text-decoration: none; color: inherit; display: block; background: white; border-radius: 8px; overflow: hidden; transition: all 0.2s; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    ${article.thumbnail ? `
                    <div style="width: 100%; height: 120px; overflow: hidden; background: #f5f5f5;">
                        <img src="${article.thumbnail}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    ` : ''}
                    <div style="padding: 0.75rem;">
                        <div style="font-size: 0.7rem; color: #7c3aed; font-weight: 600; margin-bottom: 0.25rem;">${article.badge}</div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin-bottom: 0.25rem;">${article.title}</div>
                        <div style="font-size: 0.75rem; color: #666; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${article.description}</div>
                    </div>
                </a>
            `).join('')}
        </div>
        <div style="margin-top: 1.5rem;">
            <a href="https://www.lx2.kr/common/greeting.do" target="_blank" style="display: block; text-decoration: none; background: #1e40af; color: white; text-align: center; padding: 1rem; border-radius: 8px; font-weight: 600; font-size: 0.95rem; transition: all 0.3s;">
                바로 체험하기
            </a>
        </div>
    `;
    
    // 마우스 호버 효과 추가
    const articleLinks = recommendedSection.querySelectorAll('a[href*="article-"]');
    articleLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        });
    });
    
    // 바로 체험하기 버튼 호버 효과
    const experienceBtn = recommendedSection.querySelector('a[href*="lx2.kr"]');
    if (experienceBtn) {
        experienceBtn.addEventListener('mouseenter', function() {
            this.style.background = '#1e3a8a';
            this.style.transform = 'translateY(-2px)';
        });
        experienceBtn.addEventListener('mouseleave', function() {
            this.style.background = '#1e40af';
            this.style.transform = 'translateY(0)';
        });
    }
    
    // 목차 컨테이너에 추가
    tocContainer.appendChild(recommendedSection);
}

// Initialize recommended articles when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecommendedArticles);
} else {
    initRecommendedArticles();
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

