import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a', {});

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-more');
  const apiKey = '39826341-72b32bf5f28bdbe6242a5fe09';
  let page = 1;
  let totalHits = 0;
  let isLightboxOpen = false;

  const openLightbox = () => {
    lightbox.open();
    isLightboxOpen = true;
    document.addEventListener('keydown', handleKeyPress);
  };

  const closeLightbox = () => {
    lightbox.close();
    isLightboxOpen = false;
    document.removeEventListener('keydown', handleKeyPress);
  };

  const handleKeyPress = event => {
    if (!isLightboxOpen) return;
    if (event.key === 'Escape') {
      closeLightbox();
    } else if (event.key === 'ArrowRight') {
      lightbox.next();
    } else if (event.key === 'ArrowLeft') {
      lightbox.prev();
    }
  };

  const fetchImages = async (searchQuery, pageNum) => {
    try {
      const response = await axios.get('https://pixabay.com/api/', {
        BASE_URL: 'https://pixabay.com/api/',
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
        totalHits = data.totalHits;
        if (totalHits > 0) {
          Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
        gallery.innerHTML = '';
      }

      if (data.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        loadMoreBtn.style.display = 'none';
      } else {
        renderImages(data.hits);
        loadMoreBtn.style.display = 'block';
        lightbox.refresh(); // Оновити групу зображень для SimpleLightbox
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

  const renderImages = images => {
    images.forEach(image => {
      const a = document.createElement('a');
      a.href = image.largeImageURL; // Посилання на велику версію зображення
      a.dataset - lightbox;
      ('image'); // Встановити атрибут для SimpleLightbox

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

      card.appendChild(a);
      a.appendChild(img);
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

  const handleSubmit = async e => {
    e.preventDefault();
    const searchQuery = e.target.searchQuery.value;
    page = 1;
    await fetchImages(searchQuery, page);
  };

  const handleLoadMore = async () => {
    page++;
    const searchQuery = form.searchQuery.value;
    await fetchImages(searchQuery, page);

    if (totalHits - page * 40 > 0) {
      Notiflix.Notify.success(
        `Hooray! We found ${totalHits - page * 40} images.`
      );
    }
    if (totalHits <= page * 40) {
      loadMoreBtn.style.display = 'none';
    }
  };

  form.addEventListener('submit', handleSubmit);
  loadMoreBtn.addEventListener('click', handleLoadMore);

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
