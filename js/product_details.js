const productListContainer = document.getElementById("product_details");
class ProductDetails {
  #productData = {};
  #starTotal = 5;
  #isHeartActive = false;
  constructor() {
    this.fetchProduct();
  }
  async fetchProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    try {
      const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
      const product = await response.json();
      this.updateUi(product);
      this.setPageTitle(product.title);
      this.#productData = product;
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }
  updateUi(product) {
    const productCard = document.createElement("div");
    productCard.classList.add("row");
    productCard.innerHTML = `
      <section class="product-gallery col-6 col-md-6 col-sm-12 col-xs-12  display-flex">
        <div class="product-gallery-thumb display-flex flex-direction-column">
         <div class="scroll-top">
            <button class="scroll-btn scroll-topBtn" id="scroll-top" title="Scroll top" type="button"><i class="fa-solid fa-chevron-up"></i></button>
          </div>         
          <ul id="thumbnail-gallery" class="thumbnail-gallery display-flex flex-direction-column">
            ${this.generateThumbnails(product)}
          </ul>
          <div class="scroll-bottom">
            <button class="scroll-btn scroll-bottomBtn" id="scroll-bottom" title="Scroll bottom" type="button"><i class="fa-solid fa-chevron-down"></i></button>
          </div>
        </div>
        <div class="product-image-wrapper">
          <div class="product-image" id="image-slider">
            ${this.generateImages(product)}
          </div>
        </div>
      </section>
      <section class="product-info col-6 col-md-6 col-sm-12 col-xs-12 display-flex flex-direction-column">
        <h1 id="heading" class="product-heading">${product.title}</h1>
        <div class="price">
          <span>$${product.price}</span>
        </div>
        <div class="rating">
          <div class="stars-outer">
            <div class="stars-inner"></div>
          </div>
          <span>(${product.rating.count})</span>
        </div>
        <div class="row">
          <div class="col">
              <div id="product-des" class="product-des">${this.renderMoreText()}</div>
          </div>
        </div>
        ${this.generateQuantitySelector()}
          <div class="container"><div class="row"><button type="button" class="btn btn-primary add-to-cart col-5">Add to Cart</button></div></div>
          <div class="row social-media-icons">
            <div class="col-5 display-flex justify-content-center align-content-center">
                <button type="button" title="Save" class="heart-outer">
                  <i class="fa-regular fa-heart"></i> Save
                </button>
                <button type="button" title="Share"><i class="fa-solid fa-share-nodes"></i> Share</button>
            </div>
          </div>
      </section>
      <section class="product-description container">
      <div class="row">
        <div class="col">
          <h2>${product.title}</h2>
          <h3>Description</h3>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet. Nunc sagittis dictum nisi, sed ullamcorper ipsum dignissim ac. In at libero sed nunc venenatis imperdiet sed ornare turpis. Donec vitae dui eget tellus gravida venenatis. Integer fringilla congue eros non fermentum.</p>
        </div>
      </div>
        </section>`;
    productListContainer.appendChild(productCard);
    this.initEventListeners();
    this.setProductRating(product.rating.rate);
  }
  generateThumbnails(product) {
    return Array(5)
      .fill()
      .map(
        (_, i) => `
          <li class="thumbnail-item" tabindex="-1">
            <a href="javascript:void(0)" data-thumid="${i + 1}">
              <img src="${product.image}" alt="${product.title}">
            </a>
          </li>`)
      .join("");
  }
  generateImages(product) {
    return Array(5)
      .fill()
      .map((_, i) => `<img src="${product.image}" alt="${product.title}" data-id="${i + 1}">`)
      .join("");
  }
  generateQuantitySelector() {
    return `
      <div class="quantity-selector">
        <p>Quantity</p>
        <button title="count decrement" type="button" id="decrement" class="decrement btn-count" disabled><i class="fa-solid fa-minus"></i></button>
        <input aria-label="Product counts" title="Product counts" readonly class="countInput" name="product-count" id="count" type="text" value="1">
        <button title="count increment"  type="button" id="increment" class="increment btn-count"><i class="fa-solid fa-plus"></i></button>
      </div>
    `;
  }
  initEventListeners() {
    this.handleThumbnailImgClick();
    this.initImageSlider();
    this.handleProductCount();
    this.toggleHeart();
    this.handleScrollButtons();
    this.handleReadMoreClick();
    this.focusOnHtmlElement(".thumbnail-item:first-child");
  }
  handleProductCount() {
    const incrementEl = document.querySelector("#increment");
    const decrementEl = document.querySelector("#decrement");
    const countEl = document.querySelector("#count");
    const updateCount = (increment = true) => {
      let currentCount = parseInt(countEl.value);
      currentCount = increment ? currentCount + 1 : currentCount - 1;
      countEl.value = currentCount;
      decrementEl.disabled = currentCount === 1;
    };
    incrementEl.addEventListener("click", () => updateCount(true));
    decrementEl.addEventListener("click", () => updateCount(false));
  }
  handleThumbnailImgClick() {
    document.getElementById("scroll-top").addEventListener("click", () => this.productScroll("top"));
    document.getElementById("scroll-bottom").addEventListener("click", () => this.productScroll("bottom"));
  }
  handleScrollButtons() {
    const scrollTop = document.getElementById("scroll-top");
    const scrollBottom = document.getElementById("scroll-bottom");
    scrollTop.addEventListener("click", () => this.productScroll("top"));
    scrollBottom.addEventListener("click", () => this.productScroll("bottom"));
  }
  productScroll(type) {
    const gallery = document.getElementById("thumbnail-gallery");
    gallery.scroll({top: type === "top" ? 0 : gallery.scrollHeight,behavior: "smooth"});
  }
  initImageSlider() {
    const thumbnails = document.querySelectorAll(".thumbnail-gallery a");
    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", (event) => {
        event.preventDefault();
        const imgId = thumb.dataset.thumid;
        this.slideImage(imgId);
      });
    });
  }
  slideImage(id) {
    const displayWidth = document.querySelector(".product-image-wrapper").clientWidth;
    document.querySelector("#image-slider").style.transform = `translateX(${-(id - 1) * displayWidth}px)`;
  }
  setProductRating(rate) {
    const starPercentage = (rate / this.#starTotal) * 100;
    document.querySelector(".stars-inner").style.width = `${ Math.round(starPercentage / 10) * 10}%`;
  }
  toggleHeart() {
    const heartBtn = document.querySelector(".heart-outer");
    heartBtn.addEventListener("click", () => {
      this.#isHeartActive = !this.#isHeartActive;
      heartBtn.innerHTML = this.#isHeartActive
        ? `<i class="fa-solid fa-heart"></i> Save`
        : `<i class="fa-regular fa-heart"></i> Save`;
    });
  }
  setPageTitle(title) {
    document.title = `${document.title.split("|")[0]} | ${title}`;
  }
  renderMoreText() {
    let str = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa. Fusce luctus vestibulum augue ut aliquet. Nunc sagittis dictum nisi, sed ullamcorper ipsum dignissim ac. In at libero sed nunc venenatis imperdiet sed ornare turpis. Donec vitae dui eget tellus gravida venenatis. Integer fringilla congue eros non fermentum.`;
    let part1 = str.length > 122 ? str.substring(0, 122) : str;
    let part2 = str.length > 122 ? str.substring(122) : "";
    return `<span> ${part1} </span><span id="dots">...</span><span id="more" style="display:none"> ${part2} </span><a href="javascript:void(0)" id="readMoreBtn" role="button" title="Read more...">Read more</a>`;
  }
  handleReadMoreClick() {
    var dots = document.getElementById("dots");
    var moreText = document.getElementById("more");
    var btnText = document.getElementById("readMoreBtn");
    btnText.addEventListener("click", ()=>{
      if (dots.style.display === "none") {
        dots.style.display = "inline";
        btnText.innerHTML = "Read more";
        moreText.style.display = "none";
      } else {
        dots.style.display = "none";
        btnText.innerHTML = "Read less";
        moreText.style.display = "inline";
      }
    })
  }
  focusOnHtmlElement(element) {
    document.querySelector(element).focus();
  }
}
new ProductDetails();
