// Имитация API
const initialCards = [{
        _id: '1',
        name: "Архыз",
        link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/arkhyz.jpg",
        owner: { _id: 'user1' },
        likes: []
    },
    {
        _id: '2',
        name: "Челябинская область",
        link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/chelyabinsk-oblast.jpg",
        owner: { _id: 'user1' },
        likes: []
    },
    {
        _id: '3',
        name: "Иваново",
        link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/ivanovo.jpg",
        owner: { _id: 'user1' },
        likes: []
    },
    {
        _id: '4',
        name: "Камчатка",
        link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kamchatka.jpg",
        owner: { _id: 'user1' },
        likes: []
    },
    {
        _id: '5',
        name: "Холмогорский район",
        link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kholmogorsky-rayon.jpg",
        owner: { _id: 'user1' },
        likes: []
    },
    {
        _id: '6',
        name: "Байкал",
        link: "https://pictures.s3.yandex.net/frontend-developer/cards-compressed/baikal.jpg",
        owner: { _id: 'user1' },
        likes: []
    }
];

let userData = {
    _id: 'user1',
    name: "Жак-Ив Кусто",
    about: "Исследователь океана",
    avatar: "./images/avatar.jpg"
};

// Задержка для имитации сетевого запроса
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Имитация запросов к серверу
function getUserInfo() {
    return delay(500).then(() => ({...userData }));
}

function getInitialCards() {
    return delay(500).then(() => [...initialCards]);
}

function updateUserInfo(name, about) {
    return delay(500).then(() => {
        userData = {...userData, name, about };
        return {...userData };
    });
}

function addNewCard(name, link) {
    return delay(500).then(() => {
        const newCard = {
            _id: `card${Date.now()}`,
            name,
            link,
            owner: { _id: userData._id },
            likes: []
        };
        initialCards.push(newCard);
        return {...newCard };
    });
}

function deleteCardRequest(cardId) {
    return delay(500).then(() => {
        const index = initialCards.findIndex(card => card._id === cardId);
        if (index !== -1) {
            initialCards.splice(index, 1);
        }
        return {};
    });
}

function likeCardRequest(cardId) {
    return delay(500).then(() => {
        const card = initialCards.find(c => c._id === cardId);
        if (card) {
            if (!card.likes.some(like => like._id === userData._id)) {
                card.likes.push({ _id: userData._id });
            }
            return {...card };
        }
        return {};
    });
}

function unlikeCardRequest(cardId) {
    return delay(500).then(() => {
        const card = initialCards.find(c => c._id === cardId);
        if (card) {
            const index = card.likes.findIndex(like => like._id === userData._id);
            if (index !== -1) {
                card.likes.splice(index, 1);
            }
            return {...card };
        }
        return {};
    });
}

function updateAvatar(avatarUrl) {
    return delay(500).then(() => {
        userData = {...userData, avatar: avatarUrl };
        return {...userData };
    });
}