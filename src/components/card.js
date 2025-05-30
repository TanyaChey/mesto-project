import { cardTemplate } from "../index.js";
import { putLike, deleteLike, deleteCard as deleteCardApi } from "./api.js";
import { closePopup, openPopup } from "./modal.js";

const deleteCardPopup = document.querySelector(".popup_type_remove_card");
const deleteCardBtn = deleteCardPopup.querySelector(".popup__button");

function createCard(card, deleteFnc, likeFnc, openImagePopup, user) {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImg = cardElement.querySelector(".card__image");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-button");
  const likeBtn = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-counter");

  cardElement.id = card._id;

  cardImg.src = card.link;
  cardImg.alt = card.name;
  cardElement.querySelector(".card__title").textContent = card.name;

  cardDeleteBtn.addEventListener("click", () => {
    deleteFnc(card);
  });
  likeBtn.addEventListener("click", () => {
    likeFnc(likeBtn, card, likeCounter);
  });

  likeCounter.textContent = card.likes.length;

  cardImg.addEventListener("click", (evt) => openImagePopup(card));

  if (card.owner._id !== user._id) {
    cardDeleteBtn.remove();
  }

  if (card.likes.some((like) => like._id === user._id)) {
    likeBtn.classList.add("card__like-button_is-active");
  }

  return cardElement;
}

deleteCardPopup.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const card_id = deleteCardPopup.dataset.cardId;

  deleteCardBtn.textContent = "Удаление...";

  deleteCardApi(card_id)
    .then(() => {
      document.getElementById(card_id).remove();
      deleteCardPopup.dataset.cardId = "";
      closePopup(deleteCardPopup);
    })
    .catch((err) => console.log(`Ошибка удаления карточки ${err}`))
    .finally(() => deleteCardBtn.textContent = "Да");
});

function deleteCard(card) {
  openPopup(deleteCardPopup);
  deleteCardPopup.dataset.cardId = card._id;
}

function toggleLike(likeBtn, card, likeCounter) {
  const isLiked = likeBtn.classList.contains("card__like-button_is-active");
  if (isLiked) {
    deleteLike(card._id)
      .then((res) => {
        likeBtn.classList.remove("card__like-button_is-active");
        likeCounter.textContent = res.likes.length;
      })
      .catch((err) => console.log(`Ошибка удаления лайка карточки ${err}`));
  } else {
    putLike(card._id)
      .then((res) => {
        likeBtn.classList.add("card__like-button_is-active");
        likeCounter.textContent = res.likes.length;
      })
      .catch((err) => console.log(`Ошибка лайка карточки ${err}`));
  }
}

export { createCard, deleteCard, toggleLike };
