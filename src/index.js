import "./pages/index.css";

import {
  getAboutMe,
  getInitialCards,
  patchProfile,
  postNewCard,
  patchAvatar,
  baseUser,
} from "./components/api.js";
import { initialCards } from "./components/cards.js";
import { createCard, toggleLike, deleteCard } from "./components/card.js";
import { openPopup, closePopup } from "./components/modal.js";
import { clearValidation, enableValidation } from "./components/validation.js";

export const cardTemplate = document.querySelector("#card-template").content;

const placesList = document.querySelector(".places__list");

const avatarEditBtn = document.querySelector(".profile__avatar-button");
const avatarEditPopup = document.querySelector(".popup_type_edit_avatar");
const avatarEditForm = document.forms["edit-avatar"];
const avatarLinkInput = avatarEditForm.elements.link;
const avatarLink = document.querySelector(".profile__image");
const avatarSubmitBtn = avatarEditPopup.querySelector(".popup__button");

const profileEditBtn = document.querySelector(".profile__edit-button");
const editProfilePopup = document.querySelector(".popup_type_edit");
const editProfileForm = document.forms["edit-profile"];
const nameInput = editProfileForm.elements.name;
const descriptionInput = editProfileForm.elements.description;
const editProfileSubmitBtn = editProfilePopup.querySelector(".popup__button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileImage = document.querySelector(".profile__image");

const cardAddBtn = document.querySelector(".profile__add-button");
const newCardPopup = document.querySelector(".popup_type_new-card");
const newCardForm = document.forms["new-place"];
const placeNameInput = newCardForm.elements["place-name"];
const imageSrcInput = newCardForm.elements.link;
const newCardSubmitBtn = newCardPopup.querySelector(".popup__button");

const imagePopup = document.querySelector(".popup_type_image");
const image = imagePopup.querySelector(".popup__image");
const caption = imagePopup.querySelector(".popup__caption");

const deletePopup = document.querySelector(".popup_type_remove_card");
const deleteForm = document.forms["remove-card"];

const popups = document.querySelectorAll(".popup");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationConfig);

// Настройки аватара
avatarEditBtn.addEventListener("click", (evt) => {
  avatarEditForm.reset();
  openPopup(avatarEditPopup);
  clearValidation(avatarEditForm, validationConfig);
});

avatarEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const imgUrl = avatarLinkInput.value;

  avatarSubmitBtn.textContent = "Сохранение...";

  patchAvatar(imgUrl)
    .then((res) => {
      avatarLink.style.backgroundImage = `url("${res.avatar}")`;
      closePopup(avatarEditPopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      avatarSubmitBtn.textContent = "Сохранить";
    });
});

// Настройка профиля
profileEditBtn.addEventListener("click", (evt) => {
  nameInput.value = profileTitle.textContent;
  descriptionInput.value = profileDescription.textContent;
  openPopup(editProfilePopup);
  clearValidation(editProfileForm, validationConfig);
});

editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  editProfileSubmitBtn.textContent = "Сохранение...";

  patchProfile(nameInput.value, descriptionInput.value)
    .then((res) => {
      profileTitle.textContent = res.name;
      profileDescription.textContent = res.about;
      closePopup(editProfilePopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      editProfileSubmitBtn.textContent = "Сохранить";
    });
});

// Работа с карточками
cardAddBtn.addEventListener("click", (evt) => {
  openPopup(newCardPopup);
  clearValidation(newCardForm, validationConfig);
});

newCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  newCardSubmitBtn.textContent = "Сохранение...";

  postNewCard(placeNameInput.value, imageSrcInput.value)
    .then((res) => {
      placesList.prepend(
        createCard(res, deleteCard, toggleLike, viewImagePopup, res.owner)
      );
      newCardForm.reset();
      closePopup(newCardPopup);
    })
    .catch((err) => console.log(err))
    .finally(() => {
      newCardSubmitBtn.textContent = "Сохранить";
    });
});

function viewImagePopup(card) {
  image.src = card.link;
  image.alt = card.name;
  caption.textContent = card.name;

  openPopup(imagePopup);
}

popups.forEach((popup) => {
  popup.addEventListener("mousedown", (evt) => {
    if (
      evt.target.classList.contains("popup_is-opened") ||
      evt.target.classList.contains("popup__close")
    ) {
      closePopup(popup);
    }
  });
});

Promise.all([getAboutMe(), getInitialCards()])
  .then(([user, cards]) => {
    profileTitle.textContent = user.name;
    profileDescription.textContent = user.about;
    profileImage.style.backgroundImage = `url("${user.avatar}")`;

    cards.forEach((card) => {
      placesList.append(
        createCard(card, deleteCard, toggleLike, viewImagePopup, user)
      );
    });
  })
  .catch((err) => {
    console.error("Ошибка получения данных пользователя и карточек:", err);

    profileTitle.textContent = baseUser.name;
    profileDescription.textContent = baseUser.about;
    profileImage.style.backgroundImage = `url("${baseUser.avatar}")`;

    initialCards.forEach((card) => {
      placesList.append(
        createCard(card, deleteCard, toggleLike, viewImagePopup, baseUser)
      );
    });
  });
