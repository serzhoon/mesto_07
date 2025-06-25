// ======== Настройки валидации ========
const validationSettings = {
    formSelector: '.popup__form',
    inputSelector: '.popup__input',
    submitButtonSelector: '.popup__button',
    inactiveButtonClass: 'popup__button_disabled',
    inputErrorClass: 'popup__input_type_error',
    errorClass: 'popup__error_visible'
};

// ======== Функции валидации ========
function showInputError(formElement, inputElement, errorMessage, settings) {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
}

function handleApiError(error) {
    console.error('API Error:', error);

}

function hideInputError(formElement, inputElement, settings) {
    const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.classList.remove(settings.errorClass);
    errorElement.textContent = '';
}

function checkInputValidity(formElement, inputElement, settings) {
    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    } else {
        hideInputError(formElement, inputElement, settings);
    }
}

function toggleButtonState(inputList, buttonElement, settings) {
    const hasInvalidInput = inputList.some(inputElement => !inputElement.validity.valid);

    if (hasInvalidInput) {
        buttonElement.classList.add(settings.inactiveButtonClass);
        buttonElement.disabled = true;
    } else {
        buttonElement.classList.remove(settings.inactiveButtonClass);
        buttonElement.disabled = false;
    }
}

function setEventListeners(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);

    // Начальное состояние кнопки
    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach(inputElement => {
        inputElement.addEventListener('input', () => {
            checkInputValidity(formElement, inputElement, settings);
            toggleButtonState(inputList, buttonElement, settings);
        });
    });
}

function enableValidation(settings) {
    const formList = Array.from(document.querySelectorAll(settings.formSelector));
    formList.forEach(formElement => {
        setEventListeners(formElement, settings);
    });
}

// ======== Глобальные переменные ========
let userId;

// ======== Основной код ========
document.addEventListener('DOMContentLoaded', () => {
    // Включение валидации
    enableValidation(validationSettings);

    // DOM элементы
    const cardTemplate = document.querySelector('#card-template').content;
    const profileEditButton = document.querySelector('.profile__edit-button');
    const addCardButton = document.querySelector('.profile__add-button');
    const avatarEditButton = document.querySelector('.profile__avatar-edit-button');
    const placesList = document.querySelector('.places__list');
    const profilePopup = document.querySelector('.popup_type_edit');
    const cardPopup = document.querySelector('.popup_type_new-card');
    const avatarPopup = document.querySelector('.popup_type_avatar');
    const imagePopup = document.querySelector('.popup_type_image');
    const profileForm = document.forms['edit-profile'];
    const cardForm = document.forms['new-place'];
    const avatarForm = document.forms['update-avatar'];
    const profileName = document.querySelector('.profile__title');
    const profileDescription = document.querySelector('.profile__description');
    const profileImage = document.querySelector('.profile__image');
    const nameInput = profileForm.querySelector('.popup__input_type_name');
    const jobInput = profileForm.querySelector('.popup__input_type_description');
    const avatarInput = avatarForm.querySelector('.popup__input_type_url');
    const popupImage = imagePopup.querySelector('.popup__image');
    const popupCaption = imagePopup.querySelector('.popup__caption');

    // ======== Функции для работы с сервером ========

    // Загрузка начальных данных
    function loadInitialData() {
        return Promise.all([getUserInfo(), getInitialCards()])
            .then(([userData, cardsData]) => {
                userId = userData._id;

                // Установка данных пользователя
                profileName.textContent = userData.name;
                profileDescription.textContent = userData.about;
                profileImage.style.backgroundImage = `url(${userData.avatar})`;

                // Отрисовка карточек в обратном порядке (новые сверху)
                cardsData.reverse().forEach(card => {
                    renderCard(card);
                });
            })
            .catch(console.error);
    }

    // Функция открытия изображения
    function openImagePopup(cardData) {
        popupImage.src = cardData.link;
        popupImage.alt = cardData.name;
        popupCaption.textContent = cardData.name;
        openModal(imagePopup);
    }

    // Рендер карточки
    function renderCard(cardData) {
        const card = createCard(cardData);
        placesList.prepend(card);
    }

    // Обновленная функция создания карточки
    function createCard(cardData) {
        const cardElement = cardTemplate.querySelector('.card').cloneNode(true);

        const cardImage = cardElement.querySelector('.card__image');
        const cardTitle = cardElement.querySelector('.card__title');
        const deleteButton = cardElement.querySelector('.card__delete-button');
        const likeButton = cardElement.querySelector('.card__like-button');
        const likeCount = cardElement.querySelector('.card__like-count');

        cardImage.src = cardData.link;
        cardImage.alt = cardData.name;
        cardTitle.textContent = cardData.name;
        likeCount.textContent = cardData.likes.length;

        // Проверка, стоит ли наш лайк
        const isLiked = cardData.likes.some(like => like._id === userId);
        if (isLiked) {
            likeButton.classList.add('card__like-button_is-active');
        }

        // Проверка, наша ли карточка
        if (cardData.owner._id !== userId) {
            deleteButton.remove();
        }

        // Обработчики событий
        deleteButton.addEventListener('click', () => {
            const originalText = deleteButton.textContent;
            deleteButton.textContent = 'Удаление...';

            deleteCardRequest(cardData._id)
                .then(() => {
                    cardElement.remove();
                })
                .catch(console.error)
                .finally(() => {
                    deleteButton.textContent = originalText;
                });
        });

        likeButton.addEventListener('click', (evt) => {
            const likeMethod = evt.target.classList.contains('card__like-button_is-active') ?
                unlikeCardRequest :
                likeCardRequest;

            likeMethod(cardData._id)
                .then(updatedCard => {
                    evt.target.classList.toggle('card__like-button_is-active');
                    likeCount.textContent = updatedCard.likes.length;
                })
                .catch(console.error);
        });

        cardImage.addEventListener('click', () => openImagePopup(cardData));

        return cardElement;
    }

    // ======== Функции для модальных окон ========
    function openModal(popup) {
        popup.classList.add('popup_is-opened');
        document.addEventListener('keydown', closeByEscape);
    }

    function closeModal(popup) {
        popup.classList.remove('popup_is-opened');
        document.removeEventListener('keydown', closeByEscape);
    }

    function closeByEscape(evt) {
        if (evt.key === 'Escape') {
            const openedPopup = document.querySelector('.popup_is-opened');
            if (openedPopup) closeModal(openedPopup);
        }
    }

    // ======== Обработчики событий ========

    // Кнопка редактирования профиля
    profileEditButton.addEventListener('click', () => {
        nameInput.value = profileName.textContent;
        jobInput.value = profileDescription.textContent;
        openModal(profilePopup);
    });

    // Кнопка добавления карточки
    addCardButton.addEventListener('click', () => {
        cardForm.reset();
        openModal(cardPopup);
    });

    // Кнопка редактирования аватара
    avatarEditButton.addEventListener('click', () => {
        avatarForm.reset();
        openModal(avatarPopup);
    });

    // Форма редактирования профиля
    profileForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const submitButton = profileForm.querySelector('.popup__button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Сохранение...';

        updateUserInfo(nameInput.value, jobInput.value)
            .then(userData => {
                profileName.textContent = userData.name;
                profileDescription.textContent = userData.about;
                closeModal(profilePopup);
            })
            .catch(console.error)
            .finally(() => {
                submitButton.textContent = originalText;
            });
    });

    // Форма добавления карточки
    cardForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const submitButton = cardForm.querySelector('.popup__button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Сохранение...';

        addNewCard(
                cardForm.elements['place-name'].value,
                cardForm.elements.link.value
            )
            .then(newCard => {
                renderCard(newCard);
                closeModal(cardPopup);
                cardForm.reset();
            })
            .catch(console.error)
            .finally(() => {
                submitButton.textContent = originalText;
            });
    });

    // Форма обновления аватара
    avatarForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        const submitButton = avatarForm.querySelector('.popup__button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Сохранение...';

        updateAvatar(avatarInput.value)
            .then(userData => {
                profileImage.style.backgroundImage = `url(${userData.avatar})`;
                closeModal(avatarPopup);
                avatarForm.reset();
            })
            .catch(console.error)
            .finally(() => {
                submitButton.textContent = originalText;
            });
    });

    // Закрытие попапов
    document.querySelectorAll('.popup').forEach(popup => {
        popup.addEventListener('mousedown', (evt) => {
            if (evt.target.classList.contains('popup_is-opened') ||
                evt.target.classList.contains('popup__close')) {
                closeModal(popup);
            }
        });
    });

    // Добавление анимации для попапов
    document.querySelectorAll('.popup').forEach(popup => {
        popup.classList.add('popup_is-animated');
    });

    // Загрузка начальных данных
    loadInitialData();
});