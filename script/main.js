//_________________________________Elements________________________________
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '3a2fbab0eb89f4e36c1ee83ca8406715';

const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    preloader = document.querySelector('.preloader'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input');


    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    const loading = document.createElement('div');
    loading.className = 'loading';

//_________________________________Getting Data_____________________________

const DBService = class {   // 3.берёт данные в указанном месте 
    constructor() {
        this.SERVER = 'https://api.themoviedb.org/3';
        this.API_KEY = '3a2fbab0eb89f4e36c1ee83ca8406715';
    }


    getData = async (url) => {
        const res = await fetch(url); //4. fetch сначала получает promise, а только потом данные. Тут надо подождать
        if (res.ok) {
        return res.json(); 
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`);
        }
    }

    getTestData = () => { //2. указывает, куда именно идти за данными
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = query => {
        return this.getData(`${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`)
    }
    getTvShow = id => {
        return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
    }
}
console.log('Result', new DBService().getSearchResult('Няня'));

//6. из полученных данных строим карточки
const renderCard = response => {
    console.log('response: ', response);
    tvShowsList.textContent = '' //знай очищай весь ul от карточек
    if (response.total_results == 0) {
        loading.remove();
        tvShowsList.append(noResults);
    } 
    response.results.forEach(item =>{
        const {     //"Деструктурирующее присваивание"
            id,
            name: title, 
            vote_average: vote, 
            poster_path: poster, 
            backdrop_path: backdrop
        } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg'; // заглушка от отсутствия картинок
        const backdropIMG = backdrop ? IMG_URL + backdrop : 'img/no-poster.jpg';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';
        const card = document.createElement('li');
        
        card.classList.add('tv-shows__item');

        card.innerHTML = `  
            <a href="#" class="tv-card" data-id="${id}">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `           //произвольные выражения
        loading.remove();
        tvShowsList.append(card);
    })
}

//обращение к ДБ через API 
//A. получаем содержимое формы поиска
//B. отправляем запрос
//C. получаем данные (json)
//D. формируем карточки

searchForm.addEventListener('submit', event =>{
    event.preventDefault();
    const value = searchFormInput.value.trim(); 
    if (value) {
        tvShows.append(loading);
        new DBService().getSearchResult(value).then(renderCard);    
    }
    searchFormInput.value = '';

});



//   _____________MENU_________________________________________
//   open/close MENU
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

// закрытие меню при клике мимо него
document.addEventListener('click', event => {
    if ( !event.target.closest('.left-menu') ) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }

});

// выпадение элементов меню
leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active')
        leftMenu.classList.add('openMenu')
        hamburger.classList.add('open')
    }
});
//____________________Module Window_______________________________
// открытие/закрытие модального окна
tvShowsList.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');
    if (card) {
        preloader.style.display = "block"; //показываем прелоадер, пока ждём ответ от сервера
        new DBService().getTvShow(card.dataset.id)   //заполняем модальное окно из данных, полученных с сервера
            .then( ({
                poster_path: posterPath,
                name: title,
                genres,
                overview,
                homepage,
                vote_average: voteAverage
                }) => {
                    tvCardImg.src = IMG_URL + posterPath;
                    tvCardImg.alt = title;
                    modalTitle.textContent = title;
                    // сначала обнуляем список жанров, а потом добавляем жанры
                    genresList.textContent = '';
                    genres.forEach(genre =>{
                        genresList.innerHTML += `<li>${genre.name}</li>`
                    });
                    rating.textContent = voteAverage;
                    description.textContent = overview;
                    modalLink.href = homepage;
            })
            .then( () => {  
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
                preloader.style.display = "none";//убираем прелоадер
            })    
    }
})
// Закрываем модалку
modal.addEventListener('click', event  => {
    
    if(event.target.classList.contains('modal') || 
        event.target.closest('.cross')) {
        modal.classList.add('hide');
        document.body.style.overflow = '';
    }
})

//меняем картинку при наведении курсора на карточку
const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');
    if (card) {
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.dataset.backdrop, img.src] = [img.src, img.dataset.backdrop];
        }
    }
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);