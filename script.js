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
            } else {
                console.error('Failed to load sidebar with fallback method');
            }
        }
    };
    xhr.send();
}

// Set active sidebar item based on current page
function setActiveSidebarItem() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        
        // 상대 경로를 절대 경로로 변환하여 비교
        try {
            const hrefPath = new URL(href, window.location.href).pathname;
            const normalizedCurrentPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath;
            const normalizedHrefPath = hrefPath.endsWith('/') ? hrefPath.slice(0, -1) : hrefPath;
            
            if (normalizedCurrentPath === normalizedHrefPath || 
                currentPath.endsWith(href) ||
                (currentPage === '' && (href === 'index.html' || href === '../index.html')) ||
                (currentPage === 'index.html' && href === '../index.html')) {
                item.classList.add('active');
            }
        } catch (e) {
            // URL 생성 실패 시 간단한 비교
            if (href === currentPage || 
                currentPath.endsWith(href) ||
                (currentPage === '' && href === 'index.html')) {
                item.classList.add('active');
            }
        }
    });
}

// Initialize sidebar when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
    loadSidebar();
}

// Add free trial button next to search box
function addFreeTrialButton() {
    const searchBox = document.querySelector('.search-box');
    if (!searchBox) return;
    
    // 이미 버튼이 있으면 추가하지 않음
    if (document.querySelector('.btn-free-trial')) return;
    
    const contentArea = document.querySelector('.content');
    
    // 검색창을 감싸는 컨테이너가 있는지 확인
    let searchContainer = searchBox.parentElement;
    
    // search-container 클래스가 없으면 생성
    if (!searchContainer.classList.contains('search-container')) {
        const newContainer = document.createElement('div');
        newContainer.className = 'search-container';
        newContainer.style.marginTop = '0';
        
        // content 영역이 있고 검색창이 content의 직접 자식이면
        if (contentArea && searchBox.parentElement === contentArea) {
            // content의 첫 번째 자식으로 삽입
            contentArea.insertBefore(newContainer, contentArea.firstChild);
        } else {
            // 검색창의 현재 위치에 삽입
            searchBox.parentNode.insertBefore(newContainer, searchBox);
        }
        
        newContainer.appendChild(searchBox);
        searchContainer = newContainer;
    } else {
        // 이미 search-container가 있으면 content의 첫 번째 자식으로 이동
        if (contentArea && searchContainer.parentElement === contentArea && contentArea.firstChild !== searchContainer) {
            contentArea.insertBefore(searchContainer, contentArea.firstChild);
        }
        searchContainer.style.marginTop = '0';
    }
    
    const freeTrialBtn = document.createElement('a');
    freeTrialBtn.href = 'https://www.lx2.kr/common/greeting.do';
    freeTrialBtn.target = '_blank';
    freeTrialBtn.className = 'btn-free-trial';
    freeTrialBtn.textContent = '무료체험하기';
    
    searchContainer.appendChild(freeTrialBtn);
}

// Initialize free trial button when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFreeTrialButton);
} else {
    addFreeTrialButton();
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
        // 검색어가 비어있으면 모든 원래 콘텐츠 복원
        // contentArea의 직접 자식 요소들을 다시 표시
        if (contentArea) {
            Array.from(contentArea.children).forEach(child => {
                // 검색 결과 컨테이너는 숨기기
                if (child.id === 'global-search-results') {
                    child.style.display = 'none';
                    return;
                }
                
                // 검색창과 검색 컨테이너는 이미 표시되어 있으므로 그대로
                if (child.classList.contains('search-box') || 
                    child.classList.contains('search-container') ||
                    child.querySelector('.search-box')) {
                    return;
                }
                
                // 나머지 콘텐츠는 다시 표시
                child.style.display = '';
            });
        }
        
        // 모든 아티클 표시
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
        const sections = document.querySelectorAll('.payment-section, .latest-section');
        sections.forEach(section => {
            section.style.display = '';
        });
        
        // section-title도 다시 표시 (검색 결과 컨테이너 안의 것 제외)
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            if (!title.closest('#global-search-results')) {
                title.style.display = '';
            }
        });
        
        // 전체보기 링크 다시 표시
        const viewAllLinks = document.querySelectorAll('.view-all-link');
        viewAllLinks.forEach(link => {
            link.style.display = '';
        });
        
        // section-header 다시 표시 (검색 결과 컨테이너 안의 것 제외)
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            if (!header.closest('#global-search-results')) {
                header.style.display = '';
            }
        });
        
        // 뉴스룸 그리드 레이아웃도 다시 표시 (검색 결과 컨테이너 안의 것 제외)
        const newsLayouts = document.querySelectorAll('div[style*="grid-template-columns"]');
        newsLayouts.forEach(layout => {
            if (!layout.closest('#global-search-results')) {
                layout.style.display = '';
            }
        });
        
        // article-grid도 다시 표시 (검색 결과 컨테이너 안의 것 제외)
        const articleGrids = document.querySelectorAll('.article-grid');
        articleGrids.forEach(grid => {
            if (!grid.closest('#global-search-results')) {
                grid.style.display = '';
            }
        });
        
        return;
    }
    
    // 통합 검색 (allArticlesData가 존재하는 경우)
    let hasGlobalResults = false;
    if (typeof allArticlesData !== 'undefined') {
        // 검색어가 영어인지 확인 (한글이 하나도 없으면 영어로 간주)
        const isEnglishSearch = /^[a-zA-Z0-9\s]+$/.test(searchTerm.trim());
        
        const globalResults = allArticlesData.filter(article => {
            // 영어로만 검색한 경우, badge는 검색 대상에서 제외
            const searchableText = isEnglishSearch 
                ? `${article.title} ${article.description} ${article.pageTitle}`.toLowerCase()
                : `${article.title} ${article.description} ${article.badge} ${article.pageTitle}`.toLowerCase();
            
            // 영어로만 검색한 경우, 검색어가 실제로 텍스트에 포함되어 있는지 확인
            if (isEnglishSearch) {
                // 영어 검색어가 실제로 포함되어 있는지 확인 (한글 텍스트에서 우연히 매칭되는 것 방지)
                return searchWords.every(word => {
                    // 단어가 실제로 포함되어 있고, 단어 경계를 고려
                    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                    return regex.test(searchableText);
                });
            }
            
            // 한글이 포함된 검색어는 기존 로직 사용
            return searchWords.every(word => searchableText.includes(word));
        });
        
        console.log('검색어:', searchTerm);
        console.log('검색 결과 수:', globalResults.length);
        
        // 통합 검색 결과가 있으면 표시
        if (globalResults.length > 0) {
            hasGlobalResults = true;
            
            // 먼저 원래 페이지 콘텐츠를 숨기기
            // contentArea의 직접 자식 요소들을 확인하여 검색 결과 컨테이너를 제외한 나머지 숨기기
            if (contentArea) {
                Array.from(contentArea.children).forEach(child => {
                    // 검색 결과 컨테이너는 제외
                    if (child.id === 'global-search-results') {
                        return;
                    }
                    
                    // 검색창과 검색 컨테이너는 제외
                    if (child.classList.contains('search-box') || 
                        child.classList.contains('search-container') ||
                        child.querySelector('.search-box')) {
                        return;
                    }
                    
                    // 나머지 콘텐츠는 숨기기
                    child.style.display = 'none';
                });
            }
            
            // 추가로 명시적으로 숨기기 (더블 체크)
            // 1. section-header 숨기기
            const sectionHeaders = document.querySelectorAll('.section-header');
            sectionHeaders.forEach(header => {
                if (!header.closest('#global-search-results') && 
                    !header.closest('.search-container') &&
                    !header.closest('.search-box')) {
                    header.style.display = 'none';
                }
            });
            
            // 2. article-grid 숨기기
            const articleGrids = document.querySelectorAll('.article-grid');
            articleGrids.forEach(grid => {
                if (!grid.closest('#global-search-results')) {
                    grid.style.display = 'none';
                }
            });
            
            // 3. featured-article 숨기기
            const featuredArticles = document.querySelectorAll('.featured-article');
            featuredArticles.forEach(article => {
                if (!article.closest('#global-search-results')) {
                    article.style.display = 'none';
                }
            });
            
            // 4. 현재 페이지의 article-card, latest-article도 숨기기
            articles.forEach(article => {
                if (!article.closest('#global-search-results')) {
                    article.style.display = 'none';
                }
            });
            
            // 5. 뉴스룸 레이아웃 숨기기
            const newsLayouts = document.querySelectorAll('div[style*="grid-template-columns"]');
            newsLayouts.forEach(layout => {
                if (!layout.closest('#global-search-results') && 
                    !layout.closest('.search-container')) {
                    layout.style.display = 'none';
                }
            });
            
            // 6. section-title 숨기기
            const sectionTitles = document.querySelectorAll('.section-title');
            sectionTitles.forEach(title => {
                if (!title.closest('#global-search-results') &&
                    !title.closest('.search-container')) {
                    title.style.display = 'none';
                }
            });
            
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
                
                // 검색 컨테이너 다음에 삽입
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer) {
                    // search-container 다음에 삽입
                    searchContainer.insertAdjacentElement('afterend', globalSearchResults);
                } else {
                    // search-container가 없으면 search-box 다음에 삽입
                    const searchBox = document.querySelector('.search-box');
                    if (searchBox) {
                        searchBox.insertAdjacentElement('afterend', globalSearchResults);
                    } else {
                        contentArea.prepend(globalSearchResults);
                    }
                }
                console.log('검색 결과 컨테이너 생성됨');
            }
            
            // 검색 결과를 명시적으로 표시
            globalSearchResults.style.display = 'block';
            globalSearchResults.style.visibility = 'visible';
            globalSearchResults.style.position = 'relative';
            globalSearchResults.style.zIndex = '10';
            
            // 검색 결과 컨테이너가 search-container 다음에 오도록 위치 조정
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer && globalSearchResults.parentElement === contentArea) {
                // search-container 다음에 오도록 이동
                if (searchContainer.nextSibling !== globalSearchResults) {
                    contentArea.insertBefore(globalSearchResults, searchContainer.nextSibling);
                }
            }
            
            // 현재 페이지의 경로에서 상대 경로 계산 함수
            const getCurrentRelativePath = (link) => {
                const currentPath = window.location.pathname;
                // 이미 상대 경로인 경우
                if (link.startsWith('../')) {
                    return link;
                }
                // assets 경로는 그대로 유지
                if (link.startsWith('assets/')) {
                    // index.html이면 assets/, 다른 폴더면 ../assets/
                    return currentPath.includes('/') && !currentPath.endsWith('index.html') ? '../' + link : link;
                }
                // 절대 경로인 경우 (폴더명/파일명 형식)
                if (link.includes('/')) {
                    const currentFolder = currentPath.split('/').slice(-2, -1)[0] || '';
                    const targetFolder = link.split('/')[0];
                    
                    // index.html이면 그대로, 같은 폴더면 파일명만, 다른 폴더면 폴더명/파일명
                    if (!currentFolder || currentPath.endsWith('index.html')) {
                        return link;
                    }
                    if (currentFolder === targetFolder) {
                        return link.split('/').pop();
                    }
                    return '../' + link;
                }
                // 파일명만 있는 경우
                return link;
            };
            
            // HTML 이스케이프 함수
            const escapeHtml = (text) => {
                if (!text) return '';
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };
            
            globalSearchResults.innerHTML = `
                <h2 class="section-title" style="margin-top: 2rem; margin-bottom: 1.5rem; display: block !important;">전체 검색 결과 (${globalResults.length}개)</h2>
                <div class="article-grid" style="display: grid !important; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
                    ${globalResults.map(article => {
                        const relativeLink = getCurrentRelativePath(article.link);
                        const relativeThumbnail = article.thumbnail ? getCurrentRelativePath(article.thumbnail) : '';
                        const safeTitle = escapeHtml(article.title);
                        const safeDescription = escapeHtml(article.description);
                        const safeBadge = escapeHtml(article.badge);
                        const safePageTitle = escapeHtml(article.pageTitle);
                        return `
                        <article class="article-card" style="display: flex; flex-direction: column; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer;">
                            <a href="${relativeLink}" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                                ${relativeThumbnail ? `
                                <div class="card-image" style="position: relative; width: 100%; padding-bottom: 60%; overflow: hidden; background: #f5f5f5;">
                                    <img src="${relativeThumbnail}" alt="${safeTitle}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover;">
                                    <span class="card-badge" style="position: absolute; top: 0.5rem; left: 0.5rem; background: rgba(124, 58, 237, 0.9); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${safeBadge}</span>
                                </div>
                                ` : ''}
                                <div class="card-content" style="padding: 1rem; flex: 1; display: flex; flex-direction: column;">
                                    ${!relativeThumbnail ? `<span class="card-badge" style="display: inline-block; background: rgba(124, 58, 237, 0.1); color: #7c3aed; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.5rem; width: fit-content;">${safeBadge}</span>` : ''}
                                    <h4 class="card-title" style="font-size: 0.95rem; font-weight: 600; color: #1a1a1a; margin: 0 0 0.5rem 0; line-height: 1.4;">${safeTitle}</h4>
                                    <p class="card-description" style="font-size: 0.8rem; color: #666; line-height: 1.5; margin: 0 0 auto 0;">${safeDescription}</p>
                                    <p class="card-meta" style="margin-top: 0.75rem; color: #7c3aed; font-size: 0.75rem; font-weight: 500;">📂 ${safePageTitle}</p>
                                </div>
                            </a>
                        </article>
                    `;
                    }).join('')}
                </div>
            `;
            
            visibleCount = globalResults.length; // 통합 검색 결과만 카운트
        } else {
            // 통합 검색 결과가 없으면 숨기기
            if (globalSearchResults) {
                globalSearchResults.style.display = 'none';
            }
            
            // 통합 검색 결과가 없으면 모든 원래 콘텐츠 숨기기
            if (contentArea) {
                Array.from(contentArea.children).forEach(child => {
                    // 검색 결과 컨테이너는 제외
                    if (child.id === 'global-search-results') {
                        return;
                    }
                    
                    // 검색창과 검색 컨테이너는 제외
                    if (child.classList.contains('search-box') || 
                        child.classList.contains('search-container') ||
                        child.querySelector('.search-box')) {
                        return;
                    }
                    
                    // 나머지 콘텐츠는 숨기기
                    child.style.display = 'none';
                });
            }
            
            // 모든 아티클 숨기기
            articles.forEach(article => {
                article.style.display = 'none';
            });
            
            newsCards.forEach(card => {
                card.style.display = 'none';
            });
            
            // 상세 페이지 숨기기
            if (isDetailPage && articleDetail) {
                articleDetail.style.display = 'none';
            }
            if (isDetailPage && articleLayout) {
                articleLayout.style.display = 'none';
            }
            
            // 섹션 숨기기
            const sections = document.querySelectorAll('.payment-section, .latest-section');
            sections.forEach(section => {
                section.style.display = 'none';
            });
            
            // section-title 숨기기
            const sectionTitles = document.querySelectorAll('.section-title');
            sectionTitles.forEach(title => {
                if (!title.closest('#global-search-results')) {
                    title.style.display = 'none';
                }
            });
            
            // 전체보기 링크 숨기기
            const viewAllLinks = document.querySelectorAll('.view-all-link');
            viewAllLinks.forEach(link => {
                link.style.display = 'none';
            });
            
            // section-header 숨기기
            const sectionHeaders = document.querySelectorAll('.section-header');
            sectionHeaders.forEach(header => {
                if (!header.closest('#global-search-results')) {
                    header.style.display = 'none';
                }
            });
            
            // 뉴스룸 그리드 레이아웃 숨기기
            const newsLayouts = document.querySelectorAll('div[style*="grid-template-columns"]');
            newsLayouts.forEach(layout => {
                if (!layout.closest('#global-search-results')) {
                    layout.style.display = 'none';
                }
            });
            
            // article-grid 숨기기
            const articleGrids = document.querySelectorAll('.article-grid');
            articleGrids.forEach(grid => {
                if (!grid.closest('#global-search-results')) {
                    grid.style.display = 'none';
                }
            });
        }
    }
    
    // 통합 검색 결과가 없을 때만 현재 페이지 아티클 검색
    if (!hasGlobalResults) {
        // 현재 페이지 아티클 검색 (목록 페이지)
        articles.forEach(article => {
            // 검색 결과 컨테이너 안의 아티클은 제외
            if (article.closest('#global-search-results')) return;
            
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
            // 검색 결과 컨테이너 안의 카드는 제외
            if (card.closest('#global-search-results')) return;
            
            const cardText = card.textContent.toLowerCase();
            const matches = searchWords.every(word => cardText.includes(word));
            
            if (matches) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // 검색 결과가 없을 때 메시지 표시 및 모든 콘텐츠 숨기기
    if (visibleCount === 0) {
        // 모든 원래 콘텐츠 숨기기
        if (contentArea) {
            Array.from(contentArea.children).forEach(child => {
                // 검색 결과 컨테이너와 검색창은 제외
                if (child.id === 'global-search-results' ||
                    child.classList.contains('search-box') || 
                    child.classList.contains('search-container') ||
                    child.querySelector('.search-box')) {
                    return;
                }
                
                // 나머지 콘텐츠는 숨기기
                child.style.display = 'none';
            });
        }
        
        // 모든 아티클 숨기기
        articles.forEach(article => {
            article.style.display = 'none';
        });
        
        newsCards.forEach(card => {
            card.style.display = 'none';
        });
        
        // 상세 페이지 숨기기
        if (isDetailPage && articleDetail) {
            articleDetail.style.display = 'none';
        }
        if (isDetailPage && articleLayout) {
            articleLayout.style.display = 'none';
        }
        
        // 섹션 숨기기
        const sections = document.querySelectorAll('.payment-section, .latest-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // section-title 숨기기
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            if (!title.closest('#global-search-results')) {
                title.style.display = 'none';
            }
        });
        
        // 전체보기 링크 숨기기
        const viewAllLinks = document.querySelectorAll('.view-all-link');
        viewAllLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // section-header 숨기기
        const sectionHeaders = document.querySelectorAll('.section-header');
        sectionHeaders.forEach(header => {
            if (!header.closest('#global-search-results')) {
                header.style.display = 'none';
            }
        });
        
        // 뉴스룸 그리드 레이아웃 숨기기
        const newsLayouts = document.querySelectorAll('div[style*="grid-template-columns"]');
        newsLayouts.forEach(layout => {
            if (!layout.closest('#global-search-results')) {
                layout.style.display = 'none';
            }
        });
        
        // article-grid 숨기기
        const articleGrids = document.querySelectorAll('.article-grid');
        articleGrids.forEach(grid => {
            if (!grid.closest('#global-search-results')) {
                grid.style.display = 'none';
            }
        });
        
        // 통합 검색 결과 컨테이너 숨기기
        if (globalSearchResults) {
            globalSearchResults.style.display = 'none';
        }
        
        // "검색 결과가 없습니다" 메시지 표시
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

// Intersection Observer removed - no animations needed

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
    let currentPage = window.location.pathname.split('/').pop() || window.location.pathname;
    // 경로에서 파일명만 추출
    if (currentPage.includes('/')) {
        currentPage = currentPage.split('/').pop();
    }
    // 확장자 제거하지 않고 그대로 사용
    
    // 현재 게시물 찾기
    const currentArticle = allArticlesData.find(article => {
        // 정확한 매칭
        if (article.link === currentPage) return true;
        // 파일명만 비교 (경로가 다른 경우)
        const articleFileName = article.link.split('/').pop();
        return articleFileName === currentPage;
    });
    
    // 추천 게시물 선택 (같은 카테고리 또는 랜덤)
    let recommendedArticles = [];
    
    // 현재 페이지와 비교할 때 사용할 함수
    const isSamePage = (articleLink) => {
        if (articleLink === currentPage) return true;
        const articleFileName = articleLink.split('/').pop();
        return articleFileName === currentPage;
    };
    
    if (currentArticle) {
        // 같은 카테고리의 다른 게시물 찾기
        const sameCategoryArticles = allArticlesData.filter(article => 
            !isSamePage(article.link) && 
            (article.pageTitle === currentArticle.pageTitle || article.badge === currentArticle.badge)
        );
        
        // 같은 카테고리에서 최대 2개 선택
        recommendedArticles = sameCategoryArticles
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
        
        // 2개가 안 되면 다른 게시물로 채우기
        if (recommendedArticles.length < 2) {
            const otherArticles = allArticlesData
                .filter(article => !isSamePage(article.link) && !recommendedArticles.includes(article))
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 - recommendedArticles.length);
            recommendedArticles = [...recommendedArticles, ...otherArticles];
        }
    } else {
        // 현재 게시물을 못 찾으면 랜덤으로 2개
        recommendedArticles = allArticlesData
            .filter(article => !isSamePage(article.link))
            .sort(() => Math.random() - 0.5)
            .slice(0, 2);
    }
    
    if (recommendedArticles.length === 0) return;
    
    // 현재 페이지의 경로에서 상대 경로 계산
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const rootDir = currentPath.split('/').slice(0, -2).join('/'); // 프로젝트 루트까지의 경로
    
    // 링크를 상대 경로로 변환하는 함수
    const convertToRelativePath = (link) => {
        // 이미 상대 경로인 경우 (../로 시작)
        if (link.startsWith('../')) {
            return link;
        }
        // assets 경로는 그대로 유지 (이미 상대 경로로 처리됨)
        if (link.startsWith('assets/')) {
            return '../' + link;
        }
        // 절대 경로인 경우 (폴더명/파일명 형식)
        if (link.includes('/')) {
            // 현재 파일이 어느 폴더에 있는지 확인
            const currentFolder = currentPath.split('/').slice(-2, -1)[0];
            const targetFolder = link.split('/')[0];
            
            // 같은 폴더면 파일명만
            if (currentFolder === targetFolder) {
                return link.split('/').pop();
            }
            // 다른 폴더면 ../폴더명/파일명
            return '../' + link;
        }
        // 파일명만 있는 경우 (같은 폴더)
        return link;
    };
    
    // HTML 이스케이프 함수
    const escapeHtml = (text) => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    // 추천 게시물 HTML 생성
    const recommendedSection = document.createElement('div');
    recommendedSection.className = 'recommended-articles';
    recommendedSection.style.cssText = 'margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e5e7eb;';
    
    recommendedSection.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h3 style="font-size: 1rem; font-weight: 600; color: #1a1a1a; margin: 0;">추천 게시물</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${recommendedArticles.map(article => {
                const relativeLink = convertToRelativePath(article.link);
                // 썸네일 경로도 상대 경로로 변환
                const relativeThumbnail = article.thumbnail ? convertToRelativePath(article.thumbnail) : '';
                const safeTitle = escapeHtml(article.title);
                const safeDescription = escapeHtml(article.description);
                const safeBadge = escapeHtml(article.badge);
                return `
                <a href="${relativeLink}" style="text-decoration: none; color: inherit; display: block; background: white; border-radius: 8px; overflow: hidden; transition: all 0.2s; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    ${relativeThumbnail ? `
                    <div style="width: 100%; height: 120px; overflow: hidden; background: #f5f5f5;">
                        <img src="${relativeThumbnail}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    ` : ''}
                    <div style="padding: 0.75rem;">
                        <div style="font-size: 0.7rem; color: #7c3aed; font-weight: 600; margin-bottom: 0.25rem;">${safeBadge}</div>
                        <div style="font-size: 0.85rem; font-weight: 600; color: #1a1a1a; line-height: 1.4; margin-bottom: 0.25rem;">${safeTitle}</div>
                        <div style="font-size: 0.75rem; color: #666; line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${safeDescription}</div>
                    </div>
                </a>
            `;
            }).join('')}
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

// Add site footer
function addSiteFooter() {
    // 이미 푸터가 있으면 추가하지 않음
    if (document.querySelector('.site-footer')) return;
    
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
        <div class="footer-container">
            <div class="footer-content">
                <p class="footer-copyright">© 2025 4CSoft Inc.</p>
                <p>주식회사 포씨소프트 | 대표자 : 배정훈</p>
                <p>사업자등록번호 : 211-86-52456</p>
            </div>
        </div>
    `;
    
    // body 끝에 추가
    document.body.appendChild(footer);
}

// Initialize footer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSiteFooter);
} else {
    addSiteFooter();
}