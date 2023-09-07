"use strict";

const elForm = document.querySelector(".form");
const elFormInput = document.querySelector(".search");
const elFormPrice = document.querySelector(".price");
const elFormStock = document.querySelector(".stock");
const elFormDisPer = document.querySelector(".dis-per");
const elFormRating = document.querySelector(".rating");
const elFormCategories = document.querySelector(".form-categories");
const elStartDatas = document.querySelector(".start");
const elEndDatas = document.querySelector(".end");

const elCategoriesTemplate = document.querySelector(".data-categories").content;

const elDatasList = document.querySelector(".main-list");
const elDatasTemplate = document.querySelector(".data-item").content;

const elBookmarkList = document.querySelector(".bookmark");
const elBookmarksTemplate = document.querySelector(
  ".bookmarks-template"
).content;

const elPagination = document.querySelector(".pagination");
const elPagesTemplate = document.querySelector(".data-pages").content;

let page = 1;

const CommonDatas = async function (
  name,
  category,
  price,
  stock,
  disPer,
  rating
) {
  let startPage = (page - 1) * 20;
  elStartDatas.textContent = startPage;

  const categories = category === "all" ? "" : `/category/${category}`;
  const nameProduct =
    name !== undefined
      ? `/search?q=${name}&limit=20&skip=${startPage}`
      : `?limit=20&skip=${startPage}`;

  const foundData = categories || nameProduct;

  let comDatas;
  try {
    let req = await fetch(`https://dummyjson.com/products${foundData}`);
    comDatas = await req.json();

    renderPages(comDatas.total, elPagination);
    renderData(comDatas.products, elDatasList);
  } catch (err) {
    console.log(`Download data ${err.message}`);
  }

  let priceDatas;
  const priceValue = price === undefined ? 0 : price;
  if (priceValue) {
    priceDatas = comDatas.products.filter((item) => item.price >= priceValue);

    renderData(priceDatas, elDatasList);
  }

  let stockDatas;
  const stockValue = stock === undefined ? 0 : stock;
  if (stockValue) {
    stockDatas = (priceDatas || comDatas.products).filter(
      (item) => item.stock >= stockValue
    );

    renderData(stockDatas, elDatasList);
  }

  let disPerDatas;
  const disPerValue = disPer === undefined ? 0 : disPer;
  if (disPerValue) {
    disPerDatas = (stockDatas || comDatas.products).filter(
      (item) => item.discountPercentage >= disPerValue
    );

    renderData(disPerDatas, elDatasList);
  }

  const ratingValue = rating === undefined ? 0 : rating;
  if (ratingValue) {
    let ratingDatas = (disPerDatas || comDatas.products).filter(
      (item) => item.rating >= ratingValue
    );

    renderData(ratingDatas, elDatasList);
  }
};
CommonDatas(undefined, "all");

elForm.addEventListener("input", () => {
  const inputName = elFormInput.value.trim();
  const price = elFormPrice.value.trim();
  const stock = elFormStock.value.trim();
  const disPer = elFormDisPer.value.trim();
  const rating = elFormRating.value.trim();
  const categories = elFormCategories.value.trim();

  CommonDatas(inputName, categories, price, stock, disPer, rating);
});

// Get Categories
const getCategories = async function (wrapper) {
  const fragment = document.createDocumentFragment();

  try {
    const req = await fetch(`https://dummyjson.com/products/categories`);
    const comDatas = await req.json();

    for (let item of comDatas) {
      let newOption = elCategoriesTemplate.cloneNode(true);

      newOption.querySelector(".form-category").textContent = item;
      newOption.querySelector(".form-category").value = item;

      fragment.appendChild(newOption);
    }
  } catch (err) {
    console.log(`Download data ${err.message}`);
  }
  wrapper.appendChild(fragment);
};
getCategories(elFormCategories);

// Render data
function renderData(arr, wrapper) {
  elEndDatas.textContent = arr.length * page;
  wrapper.innerHTML = null;
  const fragment = document.createDocumentFragment();

  for (let item of arr) {
    const datasTemplate = elDatasTemplate.cloneNode(true);

    datasTemplate.querySelector(".main-item-img").src = item.thumbnail;
    datasTemplate.querySelector(".main-item-title").textContent = item.title;
    datasTemplate.querySelector(".main-item-brand").textContent = item.brand;
    datasTemplate.querySelector(".main-item-category").textContent =
      item.category;
    datasTemplate.querySelector(".main-item-add").dataset.addId = item.id;
    datasTemplate.querySelector(".price").textContent = item.price;
    datasTemplate.querySelector(".stock").textContent = item.stock;
    datasTemplate.querySelector(".dis-per").textContent =
      item.discountPercentage;
    datasTemplate.querySelector(".rating").textContent = item.rating;
    datasTemplate.querySelector(".main-item-desc").textContent =
      item.description;

    fragment.appendChild(datasTemplate);
  }
  wrapper.appendChild(fragment);
}

// Bookmark
let bookmarkArr = JSON.parse(window.localStorage.getItem("bookmark")) || [];

elDatasList.addEventListener("click", (evt) => {
  if (evt.target.dataset.addId !== undefined) {
    fetch(`https://dummyjson.com/products/${evt.target.dataset.addId}`)
      .then((res) => res.json())
      .then((data) => {
        let IDs = bookmarkArr.map((item) => item.id);

        if (!IDs.includes(data.id)) {
          bookmarkArr = [data, ...bookmarkArr];
          window.localStorage.setItem("bookmark", JSON.stringify(bookmarkArr));

          renderBookmarks(bookmarkArr, elBookmarkList);
        }

        if (IDs.includes(data.id)) {
          bookmarkArr = bookmarkArr.filter((item) => item.id !== data.id);
          window.localStorage.setItem("bookmark", JSON.stringify(bookmarkArr));

          renderBookmarks(bookmarkArr, elBookmarkList);
        }
      })
      .catch((err) => console.log(`Download data ${err.message}`));
  }
});
renderBookmarks(bookmarkArr, elBookmarkList);

function renderBookmarks(arr, wrapper) {
  wrapper.innerHTML = null;
  const fragment = document.createDocumentFragment();

  for (let item of arr) {
    const bookmarkTemplate = elBookmarksTemplate.cloneNode(true);

    bookmarkTemplate.querySelector(".bookmark-name").textContent = item.title;
    bookmarkTemplate.querySelector(".price").textContent = item.price;
    bookmarkTemplate.querySelector(".rating").textContent = item.rating;
    bookmarkTemplate.querySelector(".bookmark-delete").dataset.deleteId =
      item.id;

    fragment.appendChild(bookmarkTemplate);
  }
  wrapper.appendChild(fragment);
}

elBookmarkList.addEventListener("click", (evt) => {
  let idBookmarkDelete = evt.target.dataset.deleteId;

  if (idBookmarkDelete !== undefined) {
    bookmarkArr = bookmarkArr.filter(
      (item) => item.id !== idBookmarkDelete * 1
    );
    window.localStorage.setItem("bookmark", JSON.stringify(bookmarkArr));

    renderBookmarks(bookmarkArr, elBookmarkList);
  }
});

// Pagination
elPagination.addEventListener("click", (evt) => {
  evt.preventDefault();
  page = evt.target.dataset.pageId;

  if (page !== undefined) CommonDatas(undefined, "all");
});

function renderPages(arr, wrapper) {
  wrapper.innerHTML = null;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < arr / 20; i++) {
    const datasTemplate = elPagesTemplate.cloneNode(true);

    datasTemplate.querySelector(".page").textContent = i + 1;
    datasTemplate.querySelector(".page").dataset.pageId = i + 1;

    fragment.appendChild(datasTemplate);
  }
  wrapper.appendChild(fragment);
}
