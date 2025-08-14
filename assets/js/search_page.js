document.addEventListener('DOMContentLoaded', function () {

  if (!document.getElementById('search-page-marker')) {
    return;
  }

  // --- Elemen-elemen khusus halaman pencarian ---
  const postsContainer = document.getElementById('posts-container');
  const pageTitle = document.getElementById('page-title');
  // Type filter removed
  const categoryFilterButton = document.getElementById('category-filter-button');
  const categoryFilterMenu = document.getElementById('category-filter-menu');
  const sortFilterButton = document.getElementById('sort-filter-button');
  const sortFilterMenu = document.getElementById('sort-filter-menu');
  const desktopSearchInput = document.getElementById('desktop-search-input');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  
  // Tambahkan elemen paginasi
  const paginationContainer = document.getElementById('pagination-container');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  const pageNumbersContainer = document.getElementById('page-numbers');

  // Validasi Data & State
  if (typeof searchableData === 'undefined' || typeof pageConfig === 'undefined') {
    console.error('Error: Variabel `searchableData` atau `pageConfig` tidak ditemukan.');
    if (postsContainer) postsContainer.innerHTML = '<p class="text-center text-red-400 col-span-full">Kesalahan konfigurasi halaman.</p>';
    return;
  }
  
  const currentLang = window.location.pathname.includes('/en/') ? 'en' : 'id';
  const translations = {
    types: {
      all: { id: 'Semua Jenis', en: 'All Types' },
      artikel: { id: 'Artikel', en: 'Article' },
      bahan: { id: 'Bahan', en: 'Resource' },
      media: { id: 'Media', en: 'Media' }
    },
    categories: {
      all: { id: 'Semua Kategori', en: 'All Categories' }
    },
    sorts: {
      newest: { id: 'Terbaru', en: 'Newest' },
      oldest: { id: 'Terlama', en: 'Oldest' },
      nameAsc: { id: 'Nama A-Z', en: 'Name A-Z' },
      nameDesc: { id: 'Nama Z-A', en: 'Name Z-A' }
    },
    pageTitles: {
      resultsFor: { id: 'Hasil untuk', en: 'Results for' }
    },
    noResults: {
      message: { id: 'Tidak ada hasil yang ditemukan', en: 'No results found' },
      try: { id: 'Coba', en: 'Try' },
      clearFilterLink: { id: 'bersihkan filter', en: 'clearing the filters' },
      searchInSuggestion: { id: 'Atau, coba cari dalam', en: 'Or, try searching in' },
      otherLangName: { id: 'English', en: 'Bahasa Indonesia' }
    }
  };

  // --- State Management ---
  const allItems = searchableData;
  // Type filter removed
  let selectedCategory = 'all';
  let currentSortCriteria = 'date-desc';
  
  // Tambahkan state untuk paginasi
  let currentPage = 1;
  const itemsPerPage = 6;
  let totalPages = 1;
  let currentFilteredItems = [];

  // Tambahkan state baru untuk menyimpan kategori yang dipilih
  let selectedCategories = new Set(['all']); // Mulai dengan 'all' selected

  // --- Fungsi-fungsi Inti Halaman Pencarian ---
  const truncateWords = (text, numWords) => {
    if (!text) return '';
    const contentWithoutCodeblocks = text.replace(/```[\s\S]*?```/g, '');
    const words = contentWithoutCodeblocks.split(' ');
    if (words.length <= numWords) return contentWithoutCodeblocks;
    return words.slice(0, numWords).join(' ') + '...';
  };

  // Fungsi untuk membuat pagination HTML
  const createPaginationHTML = () => {
    if (totalPages <= 1) {
      if (paginationContainer) paginationContainer.style.display = 'none';
      return;
    }
    
    if (paginationContainer) paginationContainer.style.display = 'flex';
    
    // Update tombol prev/next dengan tinggi yang sama
    if (prevPageButton) {
      prevPageButton.disabled = currentPage === 1;
      prevPageButton.className = `px-3 py-2 text-sm font-medium bg-gray-800 border border-gray-700 rounded-l-lg ${
        currentPage === 1 
          ? 'text-gray-500 opacity-50 cursor-not-allowed' 
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`;
      prevPageButton.onclick = () => {
        if (currentPage > 1) {
          currentPage--;
          updateView();
          scrollToTop();
        }
      };
    }
    
    if (nextPageButton) {
      nextPageButton.disabled = currentPage === totalPages;
      nextPageButton.className = `px-3 py-2 text-sm font-medium bg-gray-800 border border-gray-700 rounded-r-lg ${
        currentPage === totalPages 
          ? 'text-gray-500 opacity-50 cursor-not-allowed' 
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`;
      nextPageButton.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++;
          updateView();
          scrollToTop();
        }
      };
    }
    
    // Generate page numbers
    if (pageNumbersContainer) {
      pageNumbersContainer.innerHTML = '';
      
      // Tentukan range halaman yang akan ditampilkan
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      // Adjust range jika terlalu sedikit halaman
      if (endPage - startPage < 4) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
          startPage = Math.max(1, endPage - 4);
        }
      }
      
      // Tampilkan halaman pertama jika tidak dalam range
      if (startPage > 1) {
        const firstPageButton = createPageButton(1);
        pageNumbersContainer.appendChild(firstPageButton);
        
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'px-2 py-2 text-sm text-gray-400 h-[36px] flex items-center';
          ellipsis.textContent = '...';
          pageNumbersContainer.appendChild(ellipsis);
        }
      }
      
      // Tampilkan halaman dalam range
      for (let i = startPage; i <= endPage; i++) {
        const pageButton = createPageButton(i);
        pageNumbersContainer.appendChild(pageButton);
      }
      
      // Tampilkan halaman terakhir jika tidak dalam range
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'px-2 py-2 text-sm text-gray-400 h-[36px] flex items-center';
          ellipsis.textContent = '...';
          pageNumbersContainer.appendChild(ellipsis);
        }
        
        const lastPageButton = createPageButton(totalPages);
        pageNumbersContainer.appendChild(lastPageButton);
      }
    }
  };

  // Fungsi untuk membuat tombol halaman dengan tinggi yang sama
  const createPageButton = (pageNum) => {
    const button = document.createElement('button');
    button.className = pageNum === currentPage 
      ? 'px-3 py-2 text-sm font-medium text-white bg-amber-600 border border-amber-600 h-[36px]'
      : 'px-3 py-2 text-sm font-medium text-gray-400 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white h-[36px]';
    button.textContent = pageNum;
    button.onclick = () => {
      currentPage = pageNum;
      updateView();
      scrollToTop();
    };
    return button;
  };

  // Fungsi untuk scroll ke atas
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const populateCustomDropdown = (menuElement, options, currentSelection, onSelectCallback) => {
    if (!menuElement) return;
    menuElement.innerHTML = '';
    
    // Jika ini adalah dropdown kategori, gunakan checkbox
    const isCategoryMenu = menuElement === categoryFilterMenu;
    
    options.forEach(option => {
      const optionEl = document.createElement('a');
      optionEl.href = '#';
      optionEl.className = 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg flex items-center space-x-3';
      
      if (isCategoryMenu) {
        // Tentukan status checkbox
        let checkboxState = '';
        if (option.value === 'all') {
          const totalCategories = options.length - 1; // Minus 'all' option
          const selectedCount = selectedCategories.size - (selectedCategories.has('all') ? 1 : 0);
          
          if (selectedCategories.has('all')) {
            checkboxState = '✓'; // All selected
          } else if (selectedCount === totalCategories) {
            checkboxState = '✓'; // All individual categories selected
          } else if (selectedCount > 0) {
            checkboxState = '−'; // Partial selection (dash)
          } else {
            checkboxState = ''; // None selected
          }
        } else {
          // Untuk kategori individual: jika 'all' terpilih ATAU kategori ini terpilih
          checkboxState = (selectedCategories.has('all') || selectedCategories.has(option.value)) ? '✓' : '';
        }
        
        optionEl.innerHTML = `
          <div class="w-4 h-4 border border-gray-400 rounded flex items-center justify-center text-xs font-bold ${
            checkboxState ? 'bg-amber-600 border-amber-600 text-white' : 'bg-transparent'
          }">
            ${checkboxState}
          </div>
          <span class="flex-1">${option.label}</span>
        `;
        
        optionEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          if (option.value === 'all') {
            // Toggle all categories
            if (selectedCategories.has('all')) {
              // Unselect all
              selectedCategories.clear();
            } else {
              // Select all - set semua kategori termasuk 'all'
              selectedCategories.clear();
              options.forEach(opt => selectedCategories.add(opt.value));
            }
          } else {
            // Toggle individual category
            if (selectedCategories.has('all')) {
              // Jika 'all' aktif, hapus 'all' dan set semua kategori individual kecuali yang diklik
              selectedCategories.delete('all');
              options.forEach(opt => {
                if (opt.value !== 'all' && opt.value !== option.value) {
                  selectedCategories.add(opt.value);
                }
              });
            } else {
              // Toggle kategori individual normal
              if (selectedCategories.has(option.value)) {
                selectedCategories.delete(option.value);
              } else {
                selectedCategories.add(option.value);
                // Check if all individual categories are now selected
                const individualCategories = options.filter(opt => opt.value !== 'all');
                const allIndividualSelected = individualCategories.every(opt => selectedCategories.has(opt.value));
                if (allIndividualSelected) {
                  selectedCategories.clear();
                  selectedCategories.add('all');
                }
              }
            }
          }

          // Reset ke halaman pertama ketika filter berubah
          currentPage = 1;
          repopulateAllDropdowns();
          onSelectCallback(Array.from(selectedCategories));
        });
      } else {
        // Regular dropdown behavior for non-category menus
        optionEl.className = (option.value === currentSelection) 
          ? 'block p-3 text-sm text-white bg-amber-600 rounded-lg' 
          : 'block p-3 text-sm text-white hover:bg-gray-700 rounded-lg';
        optionEl.textContent = option.label;
        optionEl.dataset.value = option.value;
        optionEl.addEventListener('click', (e) => {
          e.preventDefault(); 
          e.stopPropagation();
          // Reset ke halaman pertama ketika filter berubah
          currentPage = 1;
          onSelectCallback(option.value);
          menuElement.classList.add('hidden');
        });
      }
      
      menuElement.appendChild(optionEl);
    });
  };

  const setupDropdowns = () => {
  const allMenus = [categoryFilterMenu, sortFilterMenu];
    const closeAllMenus = () => allMenus.forEach(menu => menu && menu.classList.add('hidden'));
    
    window.addEventListener('click', () => closeAllMenus());

    const createToggle = (button, menu) => {
      if (!button || !menu) return;
      
      menu.classList.add('z-30');

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = menu.classList.contains('hidden');
        closeAllMenus();
        if (isHidden) menu.classList.remove('hidden');
      });
    };

  // Type filter removed
    createToggle(categoryFilterButton, categoryFilterMenu);
    createToggle(sortFilterButton, sortFilterMenu);
  };

  const repopulateAllDropdowns = () => {
  // Type filter removed

    // Dropdown Kategori
    const categories = new Set();
    allItems.forEach(item => {
      if (Array.isArray(item.categories)) {
        item.categories.forEach(cat => cat && categories.add(cat));
      }
    });
    const categoryOptions = [{ value: 'all', label: translations.categories.all[currentLang] }];
    Array.from(categories).sort().forEach(cat => categoryOptions.push({ value: cat, label: cat }));
    
    // Update callback untuk category dropdown
    populateCustomDropdown(categoryFilterMenu, categoryOptions, null, (selectedCategoriesArray) => {
      selectedCategories = new Set(selectedCategoriesArray);
      updateView();
    });

    // Dropdown Urutan
    const sortOptions = [ 
      { value: 'date-desc', label: translations.sorts.newest[currentLang] }, 
      { value: 'date-asc', label: translations.sorts.oldest[currentLang] }, 
      { value: 'name-asc', label: translations.sorts.nameAsc[currentLang] }, 
      { value: 'name-desc', label: translations.sorts.nameDesc[currentLang] }
    ];
    populateCustomDropdown(sortFilterMenu, sortOptions, currentSortCriteria, (value) => {
      currentSortCriteria = value;
      currentPage = 1; // Reset ke halaman pertama ketika sorting berubah
      updateView();
    });
  };

  const createItemCardHTML = (item) => {
    const itemUrl = item.url || '#';
    const itemImage = item.image || 'https://placehold.co/600x400/111827/FFFFFF?text=Image+Not+Found';
    const itemCategory = (Array.isArray(item.categories) && item.categories[0]) ? item.categories[0].toUpperCase() : 'UNCATEGORIZED';
    const itemTitle = item.title || 'Tanpa Judul';
    const itemExcerpt = truncateWords(item.content, 20);
    const itemType = item.type || '';
    
    let mediaIconHTML = '';
    if (itemType === 'Media') {
      mediaIconHTML = `
        <div class="absolute top-2 right-2 bg-black/50 p-1.5 rounded-lg z-10 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffffff" viewBox="0 0 256 256"><path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z"></path></svg>
        </div>
      `;
    }

    // Lazy loading: hanya load gambar untuk halaman selain halaman pertama
    const shouldLazyLoad = currentPage > 1;
    const imgAttributes = shouldLazyLoad 
      ? `data-src="${itemImage}" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 z-10 lazy"`
      : `src="${itemImage}" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-500 z-10"`;
    
    return `
      <div class="post-item bg-gray-800 rounded-2xl overflow-hidden h-full shadow-lg transition-all duration-300 border border-gray-700/80 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-amber-500/20">
        <a href="${itemUrl}" class="block group h-full flex flex-col">
          <div class="relative flex-shrink-0 h-48 bg-gray-900">
            <div class="absolute inset-0 shimmer"></div>
            <img ${imgAttributes} alt="[Gambar] ${itemTitle}" loading="lazy" onload="this.style.opacity='1'; const shimmer = this.parentElement.querySelector('.shimmer'); if (shimmer) shimmer.remove();">
            ${mediaIconHTML}
          </div>
          <div class="p-5 flex flex-col flex-grow">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-semibold text-orange-400">${itemType.toUpperCase()}</span>
              <span class="text-gray-500">&bull;</span>
              <span class="text-xs font-semibold text-amber-400">${itemCategory}</span>
            </div>
            <h3 class="mt-2 text-lg font-bold text-white transition-colors group-hover:text-amber-400 line-clamp-2 flex-grow">${itemTitle}</h3>
            <p class="mt-2 text-gray-400 text-sm line-clamp-2">${itemExcerpt}</p>
          </div>
        </a>
      </div>`;
  };

  // Lazy loading function untuk memuat gambar ketika card terlihat
  const initLazyLoading = () => {
    const lazyImages = document.querySelectorAll('img.lazy');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      lazyImages.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback untuk browser yang tidak support IntersectionObserver
      lazyImages.forEach(img => {
        img.src = img.dataset.src;
        img.classList.remove('lazy');
      });
    }
  };

  const updateView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = (urlParams.get('q') || '').toLowerCase().trim();
    
    let filteredItems = allItems.filter(item => {
      // Only filter by category and search query
      if (!selectedCategories.has('all')) {
        if (!Array.isArray(item.categories)) return false;
        const hasMatchingCategory = item.categories.some(cat => selectedCategories.has(cat));
        if (!hasMatchingCategory) return false;
      }
      if (searchQuery) {
        const title = (item.title || '').toLowerCase();
        const content = (item.content || '').replace(/```[\s\S]*?```/g, '').toLowerCase();
        return title.includes(searchQuery) || content.includes(searchQuery);
      }
      return true;
    });

    filteredItems.sort((a, b) => {
      switch (currentSortCriteria) {
        case 'date-asc': return new Date(a.date) - new Date(b.date);
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
        case 'date-desc': default: return new Date(b.date) - new Date(a.date);
      }
    });

    // Simpan hasil filter untuk paginasi
    currentFilteredItems = filteredItems;
    
    // Hitung total halaman
    totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    
    // Pastikan currentPage tidak melebihi totalPages
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    }
    
    // Ambil item untuk halaman saat ini
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsForCurrentPage = filteredItems.slice(startIndex, endIndex);

    postsContainer.innerHTML = '';
    if (itemsForCurrentPage.length > 0) {
      itemsForCurrentPage.forEach(item => { 
        postsContainer.innerHTML += createItemCardHTML(item); 
      });
      
      // Initialize lazy loading setelah konten dimuat
      setTimeout(() => {
        initLazyLoading();
      }, 100);
    } else if (filteredItems.length === 0) {
      const otherLang = currentLang === 'id' ? 'en' : 'id';
      const otherLangName = currentLang === 'id' ? translations.noResults.otherLangName.id : translations.noResults.otherLangName.en;
      
      const newPath = window.location.pathname.replace(`/${currentLang}/`, `/${otherLang}/`);
      const alternateUrl = newPath + window.location.search;
      
  const areFiltersActive = !selectedCategories.has('articles');
      
      let clearFilterHTML = '';
      if (areFiltersActive) {
        const clearFilterBasePath = `/${currentLang}/articles/`;
        const clearFilterUrl = searchQuery ? `${clearFilterBasePath}?q=${encodeURIComponent(searchQuery)}` : clearFilterBasePath;
        clearFilterHTML = `
          <p class="text-sm text-gray-400">
            ${translations.noResults.try[currentLang]} <a href="${clearFilterUrl}" class="text-amber-400 hover:underline font-medium">${translations.noResults.clearFilterLink[currentLang]}</a>.
          </p>
        `;
      }

      let searchOtherLangHTML = '';
      if (searchQuery) {
        searchOtherLangHTML = `
          <p class="text-sm text-gray-400">
            ${translations.noResults.searchInSuggestion[currentLang]} <a href="${alternateUrl}" class="text-amber-400 hover:underline font-medium">${otherLangName}</a>.
          </p>
        `;
      }

      postsContainer.innerHTML = `
        <div class="text-center col-span-full flex flex-col items-center justify-center space-y-3 py-10">
          <h4 class="text-lg font-semibold text-white">${translations.noResults.message[currentLang]}</h4>
          ${clearFilterHTML}
          ${searchOtherLangHTML}
        </div>
      `;
    }
        
    if (pageTitle) {
      const totalResults = filteredItems.length;
      const resultText = totalResults > 0 ? ` (${totalResults})` : '';
      pageTitle.textContent = searchQuery
        ? `${translations.pageTitles.resultsFor[currentLang]} "${searchQuery}"${resultText}`
        : pageConfig.defaultTitle + resultText;
    }
    
    // Update paginasi
    createPaginationHTML();
    
    repopulateAllDropdowns();
  };
  
  const initializePage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');
    const initialCategory = urlParams.get('category');
    
    if (initialQuery) {
      if (desktopSearchInput) desktopSearchInput.value = initialQuery;
      if (mobileSearchInput) mobileSearchInput.value = initialQuery;
    }
    
    // Update initialization untuk multiple categories
    if (initialCategory) {
      const categories = initialCategory.split(',').map(cat => cat.trim());
      selectedCategories = new Set(categories);
      // Jangan set 'all' jika ada kategori spesifik dari URL
      selectedCategories.delete('all');
    } else {
      // Kondisi default: semua kategori terpilih dengan 'all' aktif
      selectedCategories = new Set(['all']);
    }
    
    setupDropdowns();
    setTimeout(() => {
        updateView();
    }, 10);
  };

  // Mulai!
  initializePage();
});
