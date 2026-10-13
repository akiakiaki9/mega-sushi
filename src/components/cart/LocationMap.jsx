'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

import L from 'leaflet';

import {
  FaSearch,
  FaTimes,
  FaLocationArrow,
  FaExpand,
  FaCompress,
  FaMapMarkerAlt,
} from 'react-icons/fa';

import 'leaflet/dist/leaflet.css';

// ============================================================
// БУХАРА — координаты по умолчанию
// ============================================================

const BUKHARA_CENTER = {
  lat: 39.7747,
  lng: 64.4286,
};

// Примерные границы города Бухара.
// Используются только для ограничения поиска.
const BUKHARA_BOUNDS = {
  left: 64.25,
  top: 39.90,
  right: 64.55,
  bottom: 39.65,
};

// ============================================================
// Кастомный маркер
// ============================================================

const customIcon = L.divIcon({
  className: 'custom-marker',

  html: `
    <div class="custom-marker__pin">
      <svg
        viewBox="0 0 24 24"
        width="34"
        height="34"
        fill="#ff3d3d"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,

  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// ============================================================
// COMPONENT
// ============================================================

export default function LocationMap({
  coords,
  onPick,
  onAddressFound,

  // Каждый новый locateRequest запускает геолокацию.
  // Например: 1 -> 2 -> 3...
  locateRequest = 0,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Защита от старых reverse-geocode запросов
  const requestIdRef = useRef(0);

  // Последняя установленная позиция
  const lastPositionRef = useRef(null);

  // Чтобы не запускать один locateRequest дважды
  const handledLocateRequestRef = useRef(0);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);
  const [locating, setLocating] = useState(false);

  // Точность последнего определения
  const [accuracy, setAccuracy] = useState(null);

  // Сообщение об ошибке/неточной геолокации
  const [locationMessage, setLocationMessage] = useState('');

  // Показывать ли подсказку "нажмите на кнопку"
  const [showLocateHint, setShowLocateHint] = useState(true);

  // ==========================================================
  // Получить нормальные координаты
  // ==========================================================

  const getValidCoords = useCallback(() => {
    if (
      coords &&
      Number.isFinite(Number(coords.lat)) &&
      Number.isFinite(Number(coords.lng))
    ) {
      return {
        lat: Number(coords.lat),
        lng: Number(coords.lng),
      };
    }

    return BUKHARA_CENTER;
  }, [coords]);

  // ==========================================================
  // Reverse geocoding
  // ==========================================================

  const reverseGeocode = useCallback(
    async (lat, lng) => {
      const myId = ++requestIdRef.current;

      try {
        const url =
          `https://nominatim.openstreetmap.org/reverse` +
          `?format=json` +
          `&lat=${encodeURIComponent(lat)}` +
          `&lon=${encodeURIComponent(lng)}` +
          `&accept-language=ru` +
          `&zoom=18` +
          `&addressdetails=1`;

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(
            `Reverse geocoding HTTP ${res.status}`
          );
        }

        const data = await res.json();

        // За время запроса появилась более новая позиция
        if (myId !== requestIdRef.current) {
          return;
        }

        if (data?.display_name && onAddressFound) {
          onAddressFound(data.display_name);
        }
      } catch (err) {
        if (myId === requestIdRef.current) {
          console.warn(
            'Reverse geocode error:',
            err
          );
        }
      }
    },
    [onAddressFound]
  );

  // ==========================================================
  // Поставить маркер + передвинуть карту
  // ==========================================================

  const setMarkerPosition = useCallback(
    (
      lat,
      lng,
      {
        flyTo = false,
        zoom = 18,
        findAddress = true,
      } = {}
    ) => {
      const map = mapRef.current;
      const marker = markerRef.current;

      if (!map || !marker) {
        return;
      }

      const latitude = Number(lat);
      const longitude = Number(lng);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return;
      }

      // Запоминаем последнюю позицию
      lastPositionRef.current = {
        lat: latitude,
        lng: longitude,
      };

      // Передвигаем маркер
      marker.setLatLng([latitude, longitude]);

      // Передвигаем карту
      if (flyTo) {
        map.flyTo(
          [latitude, longitude],
          zoom,
          {
            animate: true,
            duration: 1.2,
          }
        );
      } else {
        map.setView(
          [latitude, longitude],
          zoom,
          {
            animate: true,
          }
        );
      }

      // Передаём координаты родителю
      if (onPick) {
        onPick({
          lat: latitude,
          lng: longitude,
        });
      }

      // Получаем адрес
      if (findAddress) {
        reverseGeocode(latitude, longitude);
      }

      // Исправляем размеры карты
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 150);
    },
    [onPick, reverseGeocode]
  );

  // ==========================================================
  // МОЁ МЕСТОПОЛОЖЕНИЕ
  // ==========================================================

  const handleMyLocation = useCallback(() => {
    // Скрываем подсказку
    setShowLocateHint(false);

    if (!navigator.geolocation) {
      setLocationMessage(
        'Геолокация не поддерживается вашим браузером'
      );

      alert(
        'Геолокация не поддерживается вашим браузером'
      );

      return;
    }

    setLocating(true);

    setLocationMessage('');

    // Пока определяем — очищаем старую точность
    setAccuracy(null);

    console.log(
      'Начинаем определение местоположения...'
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy: gpsAccuracy,
        } = position.coords;

        console.log(
          'GPS:',
          latitude,
          longitude
        );

        console.log(
          'GPS accuracy:',
          gpsAccuracy,
          'm'
        );

        // Сохраняем точность
        setAccuracy(gpsAccuracy);

        // ====================================================
        // Оценка точности
        // ====================================================

        if (gpsAccuracy <= 30) {
          setLocationMessage(
            `Местоположение определено точно: ±${Math.round(
              gpsAccuracy
            )} м`
          );
        } else if (gpsAccuracy <= 100) {
          setLocationMessage(
            `Точность определения: ±${Math.round(
              gpsAccuracy
            )} м`
          );
        } else if (gpsAccuracy <= 300) {
          setLocationMessage(
            `Точность геолокации около ±${Math.round(
              gpsAccuracy
            )} м. Уточните точку на карте.`
          );

          console.warn(
            'Низкая точность геолокации:',
            gpsAccuracy,
            'м'
          );
        } else {
          setLocationMessage(
            `Геолокация определена неточно: ±${Math.round(
              gpsAccuracy
            )} м. Обязательно проверьте точку на карте.`
          );

          console.warn(
            'Очень низкая точность геолокации:',
            gpsAccuracy,
            'м'
          );
        }

        // ====================================================
        // Ставим маркер
        // ====================================================

        setMarkerPosition(
          latitude,
          longitude,
          {
            flyTo: true,
            zoom: 18,
            findAddress: true,
          }
        );

        setLocating(false);
      },

      (error) => {
        console.warn(
          'GPS error:',
          error.code,
          error.message
        );

        let msg =
          'Не удалось определить местоположение';

        if (error.code === 1) {
          msg =
            'Разрешите доступ к геолокации в браузере';
        }

        if (error.code === 2) {
          msg =
            'Местоположение недоступно. Проверьте Wi-Fi и GPS.';
        }

        if (error.code === 3) {
          msg =
            'Превышено время ожидания геолокации. Попробуйте ещё раз.';
        }

        setLocationMessage(msg);

        alert(msg);

        setLocating(false);
      },

      {
        // Просим максимально возможную точность
        enableHighAccuracy: true,

        // Даём браузеру достаточно времени
        timeout: 30000,

        // Не использовать старую позицию
        maximumAge: 0,
      }
    );
  }, [setMarkerPosition]);

  // ==========================================================
  // АВТОЗАПУСК ГЕОЛОКАЦИИ ИЗ CART
  // ==========================================================

  useEffect(() => {
    if (!locateRequest) {
      return;
    }

    if (
      handledLocateRequestRef.current ===
      locateRequest
    ) {
      return;
    }

    handledLocateRequestRef.current =
      locateRequest;

    // Карта должна уже существовать
    if (!mapRef.current) {
      return;
    }

    handleMyLocation();
  }, [locateRequest, handleMyLocation]);

  // ==========================================================
  // ИНИЦИАЛИЗАЦИЯ КАРТЫ
  // ==========================================================

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const initialCoords = getValidCoords();

    const map = L.map(containerRef.current, {
      center: [initialCoords.lat, initialCoords.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: true,
    });

    // ========================================================
    // CARTO VOYAGER
    // ========================================================

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(map);

    // ========================================================
    // ZOOM
    // ========================================================

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // ========================================================
    // MARKER
    // ========================================================

    const marker = L.marker(
      [initialCoords.lat, initialCoords.lng],
      {
        icon: customIcon,
        draggable: true,
      }
    ).addTo(map);

    // Запоминаем начальную позицию
    lastPositionRef.current = initialCoords;

    // ========================================================
    // ПЕРЕТАСКИВАНИЕ МАРКЕРА
    // ========================================================

    marker.on('dragend', () => {
      // Скрываем подсказку
      setShowLocateHint(false);

      const pos = marker.getLatLng();

      const lat = pos.lat;
      const lng = pos.lng;

      lastPositionRef.current = { lat, lng };

      // При ручном выборе
      // точность GPS больше не важна
      setAccuracy(null);

      setLocationMessage('');

      if (onPick) {
        onPick({ lat, lng });
      }

      reverseGeocode(lat, lng);

      // Центрируем карту
      map.flyTo(
        [lat, lng],
        Math.max(map.getZoom(), 18),
        {
          animate: true,
          duration: 0.8,
        }
      );
    });

    // ========================================================
    // КЛИК ПО КАРТЕ
    // ========================================================

    map.on('click', (e) => {
      // Скрываем подсказку
      setShowLocateHint(false);

      const { lat, lng } = e.latlng;

      lastPositionRef.current = { lat, lng };

      // Ручной выбор
      setAccuracy(null);

      setLocationMessage('');

      marker.setLatLng([lat, lng]);

      map.flyTo(
        [lat, lng],
        Math.max(map.getZoom(), 18),
        {
          animate: true,
          duration: 0.8,
        }
      );

      if (onPick) {
        onPick({ lat, lng });
      }

      reverseGeocode(lat, lng);
    });

    // Сохраняем ссылки
    mapRef.current = map;
    markerRef.current = marker;

    // ========================================================
    // INVALIDATE SIZE
    // ========================================================

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      map.remove();

      mapRef.current = null;

      markerRef.current = null;

      lastPositionRef.current = null;
    };

    // Инициализация один раз
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // СИНХРОНИЗАЦИЯ С ВНЕШНИМИ COORDS
  // ==========================================================

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker || !coords) {
      return;
    }

    const lat = Number(coords.lat);
    const lng = Number(coords.lng);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    const current = marker.getLatLng();

    const dist =
      Math.abs(current.lat - lat) +
      Math.abs(current.lng - lng);

    // Практически одинаковые
    if (dist < 0.00001) {
      return;
    }

    lastPositionRef.current = { lat, lng };

    marker.setLatLng([lat, lng]);

    map.flyTo([lat, lng], 18, {
      animate: true,
      duration: 1,
    });

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);
  }, [coords]);

  // ==========================================================
  // FULLSCREEN
  // ==========================================================

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 250);
    }
  }, [fullscreen]);

  // ==========================================================
  // БЛОКИРОВКА SCROLL В FULLSCREEN
  // ==========================================================

  useEffect(() => {
    if (!fullscreen) {
      return;
    }

    const scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setFullscreen(false);
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      window.scrollTo(0, scrollY);

      window.removeEventListener('keydown', onKey);
    };
  }, [fullscreen]);

  // ==========================================================
  // ПОИСК АДРЕСА
  // ==========================================================

  useEffect(() => {
    if (
      !query.trim() ||
      query.trim().length < 3
    ) {
      setResults([]);
      setShowResults(false);

      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        let searchQuery = query.trim();

        const lowerQuery = searchQuery.toLowerCase();

        const hasBukhara =
          lowerQuery.includes('бухар') ||
          lowerQuery.includes('bukhara');

        if (!hasBukhara) {
          searchQuery = `${searchQuery}, Бухара, Узбекистан`;
        }

        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?format=json` +
          `&q=${encodeURIComponent(searchQuery)}` +
          `&countrycodes=uz` +
          `&viewbox=${BUKHARA_BOUNDS.left},${BUKHARA_BOUNDS.top},${BUKHARA_BOUNDS.right},${BUKHARA_BOUNDS.bottom}` +
          `&bounded=1` +
          `&limit=6` +
          `&accept-language=ru` +
          `&addressdetails=1`;

        const res = await fetch(url, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(
            `Search HTTP ${res.status}`
          );
        }

        const data = await res.json();

        setResults(Array.isArray(data) ? data : []);

        setShowResults(true);
      } catch (err) {
        console.warn('Search error:', err);

        setResults([]);
        setShowResults(false);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // ==========================================================
  // ВЫБОР РЕЗУЛЬТАТА ПОИСКА
  // ==========================================================

  const handleSelectResult = (result) => {
    // Скрываем подсказку
    setShowLocateHint(false);

    const lat = Number(result.lat);
    const lng = Number(result.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    // Ручной выбор
    setAccuracy(null);

    setLocationMessage('');

    // Устанавливаем позицию
    setMarkerPosition(lat, lng, {
      flyTo: true,
      zoom: 18,
      findAddress: false,
    });

    // Используем адрес из результата
    if (result.display_name && onAddressFound) {
      onAddressFound(result.display_name);
    }

    // Очищаем поиск
    setQuery('');

    setResults([]);

    setShowResults(false);
  };

  // ==========================================================
  // CLEAR SEARCH
  // ==========================================================

  const clearSearch = () => {
    setQuery('');

    setResults([]);

    setShowResults(false);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className={`map-wrapper ${fullscreen ? 'map-wrapper--fullscreen' : ''
        }`}
    >
      {/* =====================================================
          SEARCH BAR
      ====================================================== */}

      <div className="map-search">
        <div className="map-search__input-wrap">
          <FaSearch className="map-search__icon" />

          <input
            type="text"
            className="map-search__input"
            placeholder="Введите адрес, улицу или место..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() =>
              results.length > 0 && setShowResults(true)
            }
            autoComplete="off"
          />

          {searching && (
            <span className="map-search__spinner" />
          )}

          {query && !searching && (
            <button
              type="button"
              className="map-search__clear"
              onClick={clearSearch}
              aria-label="Очистить"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* ===================================================
            MY LOCATION
        ==================================================== */}

        <button
          type="button"
          className={`map-search__locate ${locating
              ? 'map-search__locate--loading'
              : ''
            }`}
          onClick={handleMyLocation}
          disabled={locating}
          title="Моё местоположение"
          aria-label="Моё местоположение"
        >
          {locating ? (
            <span className="map-search__spinner" />
          ) : (
            <FaLocationArrow />
          )}
        </button>

        {/* ===================================================
            FULLSCREEN
        ==================================================== */}

        <button
          type="button"
          className="map-search__fullscreen"
          onClick={() => setFullscreen((v) => !v)}
          title={
            fullscreen ? 'Свернуть' : 'На весь экран'
          }
          aria-label={
            fullscreen ? 'Свернуть' : 'На весь экран'
          }
        >
          {fullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>

      {/* =====================================================
          ПОДСКАЗКА — нажмите на кнопку геолокации
      ====================================================== */}

      {showLocateHint && !locating && (
        <div
          className="map-locate-hint"
          onClick={handleMyLocation}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMyLocation();
            }
          }}
        >
          <div className="map-locate-hint__icon">
            <FaLocationArrow />
          </div>

          <div className="map-locate-hint__body">
            <span className="map-locate-hint__title">
              Определить адрес автоматически
            </span>

            <span className="map-locate-hint__subtitle">
              Нажмите на кнопку{' '}
              <FaLocationArrow className="map-locate-hint__inline-icon" />{' '}
              справа от поиска
            </span>
          </div>

          <button
            type="button"
            className="map-locate-hint__close"
            onClick={(e) => {
              e.stopPropagation();
              setShowLocateHint(false);
            }}
            aria-label="Скрыть подсказку"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =====================================================
          SEARCH RESULTS
      ====================================================== */}

      {showResults && results.length > 0 && (
        <div className="map-results">
          {results.map((result) => (
            <button
              key={result.place_id}
              type="button"
              className="map-results__item"
              onClick={() => handleSelectResult(result)}
            >
              <FaMapMarkerAlt className="map-results__icon" />

              <span className="map-results__text">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* =====================================================
          MAP
      ====================================================== */}

      <div
        ref={containerRef}
        className="leaflet-map"
      />

      {/* =====================================================
          LOCATION MESSAGE
      ====================================================== */}

      {locationMessage && (
        <div className="map-location-message">
          <FaLocationArrow />

          <span>{locationMessage}</span>
        </div>
      )}

      {/* =====================================================
          COORDINATES
      ====================================================== */}

      <div className="map-hint">
        <FaMapMarkerAlt />

        <span>
          {Number.isFinite(Number(coords?.lat))
            ? Number(coords.lat).toFixed(5)
            : BUKHARA_CENTER.lat.toFixed(5)}

          {', '}

          {Number.isFinite(Number(coords?.lng))
            ? Number(coords.lng).toFixed(5)
            : BUKHARA_CENTER.lng.toFixed(5)}

          {accuracy !== null && (
            <>
              {' '}
              • ±{Math.round(accuracy)} м
            </>
          )}
        </span>
      </div>
    </div>
  );
}