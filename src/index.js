// Імпорт бібліотек
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-more');
  const apiKey = '39918307-8b625420c7ffb23731f2d93d1';
  // Отримуємо всі картинки з галереї
  const galleryImages = document.querySelectorAll('.photo-card img');
  const lightbox = new SimpleLightbox('.gallery img', {
    /* SimpleLightbox options */
    // Отримуємо всі картинки з галереї
  });

  // Додаємо обробку кліку на кожну картинку
  galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => {
      // Знаходимо індекс клікнутої картинки
      const index = Array.from(galleryImages).indexOf(image);
      // Відкриваємо велику версію картинки в SimpleLightbox
      lightbox.openAt(index);
    });
  });

  let page = 1; // Ініціалізуємо номер сторінки
  let totalHits = 0; // Зберігаємо загальну кількість знайдених зображень

  // Функція для отримання зображень на основі введеного користувачем запиту та номеру сторінки
  const fetchImages = async (searchQuery, pageNum) => {
    try {
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: apiKey,
          q: searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          page: pageNum,
          per_page: 40,
        },
      });

      const { data } = response;

      if (pageNum === 1) {
        // Якщо це перший запит, встановлюємо totalHits
        totalHits = data.totalHits;
        if (totalHits > 0) {
          Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
        gallery.innerHTML = ''; // Очищаємо галерею перед новим запитом
      }

      if (data.hits.length === 0) {
        // Перевірка на порожній масив
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        loadMoreBtn.style.display = 'none';
      } else {
        renderImages(data.hits);
        loadMoreBtn.style.display = 'block';
      }

      const perPage = data.perPage || 20;
      if (totalHits <= pageNum * perPage) {
        loadMoreBtn.style.display = 'none';
      }
    } catch (error) {
      Notiflix.Notify.failure(
        'An error occurred while fetching images. Please try again later.'
      );
    }
  };

  // Функція для відображення карток зображень в галереї
  const renderImages = images => {
    images.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('photo-card');

      const img = document.createElement('img');
      img.src = image.webformatURL;
      img.alt = image.tags;
      img.loading = 'lazy';

      const info = document.createElement('div');
      info.classList.add('info');

      const likes = document.createElement('p');
      likes.classList.add('info-item');
      likes.innerHTML = `<b>Likes:</b> ${image.likes}`;

      const views = document.createElement('p');
      views.classList.add('info-item');
      views.innerHTML = `<b>Views:</b> ${image.views}`;

      const comments = document.createElement('p');
      comments.classList.add('info-item');
      comments.innerHTML = `<b>Comments:</b> ${image.comments}`;

      const downloads = document.createElement('p');
      downloads.classList.add('info-item');
      downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;

      info.appendChild(likes);
      info.appendChild(views);
      info.appendChild(comments);
      info.appendChild(downloads);

      card.appendChild(img);
      card.appendChild(info);

      gallery.appendChild(card);
    });

    if (images.length < 20) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.style.display = 'block';
    }
  };

  // Функція для обробки події відправки форми
  const handleSubmit = async e => {
    e.preventDefault();
    const searchQuery = e.target.searchQuery.value;
    page = 1;
    await fetchImages(searchQuery, page);
  };

  // Функція для обробки кліку на кнопку "Завантажити ще"
  const handleLoadMore = async () => {
    page++; // Збільшуємо номер сторінки
    const searchQuery = form.searchQuery.value; // Отримуємо рядок пошуку з форми
    await fetchImages(searchQuery, page);

    if (totalHits - page * 40 > 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${totalHits - page * 40} images.`
      ); // Викликаємо функцію для отримання
    }
    if (totalHits <= page * perPage) {
      loadMoreBtn.style.display = 'none';
      // Notiflix.Notify.info(
      //   "We're sorry, but you've reached the end of search results."
      // );
    }
  };

  form.addEventListener('submit', handleSubmit); // Додаємо обробник події для форми
  loadMoreBtn.addEventListener('click', handleLoadMore); // Додаємо обробник події для кнопки "Завантажити ще"

  window.addEventListener('scroll', () => {
    const footer = document.querySelector('footer');
    const gallery = document.querySelector('.gallery');
    const windowHeight = window.innerHeight;
    const galleryHeight = gallery.getBoundingClientRect().height;
    const scrollY = window.scrollY;

    if (scrollY > galleryHeight - windowHeight) {
      footer.style.display = 'block';
    } else {
      footer.style.display = 'none';
    }
  });
});
