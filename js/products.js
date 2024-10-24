class ProductList {
  #productListContainer;
  #loadMoreButton;
  #searchInput;
  #filters;
  #pageNumber = 1;
  #allProducts = [];
  #filteredData = [];
  #currentDisplayData = [];
  #allAppliedFilters = [];
  #sortSelectBox;
  #totalProducts;

  constructor(
    productListId,
    loadMoreButtonId,
    searchInputId,
    filterId,
    selectBoxId,
    totalProducts
  ) {
    this.#productListContainer = document.getElementById(productListId);
    this.#loadMoreButton = document.getElementById(loadMoreButtonId);
    this.#searchInput = document.getElementById(searchInputId);
    this.#filters = document.getElementById(filterId);
    this.#sortSelectBox = document.getElementById(selectBoxId);
    this.#totalProducts = document.querySelectorAll(totalProducts);
    this.fetchProducts();
    this.initEventListeners();
  }

  initEventListeners() {
    this.#loadMoreButton.addEventListener("click", () =>
      this.handleLoadMoreClick()
    );
    this.#searchInput.addEventListener(
      "input",
      this.debounce(() => this.applyFiltersAndSorting(), 300)
    );
    this.#sortSelectBox.addEventListener("change", () =>
      this.applyFiltersAndSorting()
    );
    
  }

  async fetchProducts() {
    try {
      const response = await fetch(
        `https://fakestoreapi.com/products?limit=10&page=${this.#pageNumber}`
      );
      const data = await response.json();
      this.#allProducts = [...this.#allProducts, ...data];
      this.#currentDisplayData = [...this.#allProducts];
      this.renderProducts(this.#currentDisplayData);
      this.renderFilters();
      this.handleOpenFilterEvent();
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  renderProducts(products) {
    [...this.#totalProducts].map(
      (e) => (e.innerHTML = `${products.length} Results`)
    );
    this.#productListContainer.innerHTML = products
      .map(
        (product) => `
      <div class="col-xxs-12 col-xs-6 col-md-4 col-lg-3 col-xl-3 product-card">
        <a href="product_details.html?id=${product.id}">
          <img src="${product.image}" alt="${product.title}">
          <h2>${product.title}</h2>
          <p>$${product.price}</p>
        </a>
      </div>
    `
      )
      .join("");
  }

  handleLoadMoreClick() {
    this.#pageNumber++;
    this.fetchProducts();
  }

  renderFilters() {
    const categories = [
      ...new Set(this.#allProducts.map((product) => product.category)),
    ];
    this.#filters.innerHTML = `
      <div class="filter-wrapper">
        <h3 class="display-flex justify-content-space-between">Filter <button type="button" id="filterClose">X</button></h3>
        <hr/>
        <h4>Category</h4>
        <ul class="filter-categories">
          ${categories
            .map(
              (category, index) => `
            <li class="filter-category">
             <label for="category_${
               index + 1
             }"> <input type="checkbox" id="category_${
                index + 1
              }" name="category_${
                index + 1
              }" value="${category}"> ${category} </label>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
    this.handleFilterEvent();
  }

  handleFilterEvent() {
    const checkboxes = this.#filters.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (event) => {
        const { value, checked } = event.target;
        if (checked) {
          this.#allAppliedFilters.push(value);
        } else {
          this.#allAppliedFilters = this.#allAppliedFilters.filter(
            (filter) => filter !== value
          );
        }
        this.applyFiltersAndSorting();
      });
    });
  }

  applyFiltersAndSorting() {
    // Apply filtering based on selected categories and search input
    this.#filteredData = this.#allProducts.filter((product) => {
      const matchesCategory =
        this.#allAppliedFilters.length === 0 ||
        this.#allAppliedFilters.includes(product.category);
      const matchesSearch = product.title
        .toLowerCase()
        .includes(this.#searchInput.value.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // Apply sorting on filtered data
    const sortType = this.#sortSelectBox.value;
    let sortedData = [...this.#filteredData];
    switch (sortType) {
      case "ascendingOrder":
        sortedData.sort((a, b) => a.price - b.price);
        break;
      case "descendingOrder":
        sortedData.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        sortedData.sort((a, b) => b.rating.rate - a.rating.rate);
        break;
      case "title":
        sortedData.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    this.#currentDisplayData = sortedData;
    this.renderProducts(this.#currentDisplayData);
  }
  toggleFilter() {
    this.#filters.classList.contains("on")
      ? this.#filters.classList.remove("on")
      : this.#filters.classList.add("on");
  }
  handleOpenFilterEvent() {
    const filterBtn = document.querySelector(".mobile-filter a");
    const filterClose = document.querySelector("#filterClose");

    filterBtn.addEventListener("click", () => this.toggleFilter());
    window.addEventListener("resize", () =>
      this.#filters.classList.contains("on")
        ? this.#filters.classList.remove("on")
        : null
    );

    filterBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      this.#filters.classList.toggle("on");
    });

    document.addEventListener("click", (event) => {
      if (
        !this.#filters.contains(event.target) &&
        !filterBtn.contains(event.target)
      ) {
        this.#filters.classList.remove("on");
      }
    });
    filterClose?.addEventListener("click", ()=>this.toggleFilter())


  }
  debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }
}

// Instantiate the ProductList class
const productList = new ProductList(
  "product-list",
  "load-more-button",
  "search-input",
  "filters",
  "sortingBox",
  ".total-products"
);
