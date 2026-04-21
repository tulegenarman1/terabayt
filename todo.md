# Terabayt.kz - Project TODO

## Database & API
- [x] Create database schema for products, categories, and cart items
- [x] Create API procedures for fetching products, categories, and filtering
- [x] Create API procedures for admin: add, edit, delete products and categories
- [x] Create admin authentication with hardcoded credentials (admin/terabayt2024)

## Public Storefront
- [x] Homepage with animated hero banner and featured categories
- [x] Product carousels (New, Recommended, Discounts, Refurbished)
- [x] Product catalog page with filtering by category and brand
- [x] Product card component with name, image, price, availability, Buy button, Kaspi link
- [x] Product detail page with full specs (CPU, GPU, RAM, storage, display, OS)
- [x] Product detail page with images/video gallery and Kaspi.kz buy button
- [x] Search bar functionality to find laptops by name or specs
- [x] Shopping cart sidebar for collecting items
- [x] Footer with contact info (phone: 87072984386, address, WhatsApp, Instagram, 2GIS)

## Admin Panel
- [x] Admin login page with credentials validation (admin/terabayt2024)
- [x] Admin dashboard with product management interface
- [x] Add product form with fields: name, category, brand, price, discount price, images, video URL, specs, availability, Kaspi link
- [x] Edit product functionality
- [x] Delete product functionality
- [x] Category management (create, edit, delete categories)
- [x] Product listing table in admin panel

## Design & UX
- [x] Implement cinematic design with moody gradient (deep teal + burnt orange)
- [x] Add smooth page transitions and animations
- [x] Hover effects on product cards
- [x] Integrate Terabayt.kz brand logo
- [x] Responsive design for mobile and desktop
- [x] Premium typography and spacing

## Features
- [x] Shopping cart state management
- [x] Kaspi.kz integration links on product cards and detail pages
- [x] Contact section with map and social links
- [x] Product filtering by category and brand
- [x] Product search functionality
- [x] Availability status display

## Testing & Deployment
- [x] Write vitest tests for API procedures
- [x] Test admin authentication
- [x] Test API structure and procedures
- [x] Verify Kaspi.kz links work correctly
- [x] Test responsive design on mobile devices

## Fixes
- [x] Исправить админ-панель - убрать авторизацию, сделать доступной по прямой ссылке /admin
- [x] Исправить ошибку БД - таблица products не существует, нужно применить миграцию
- [x] Добавить страницу входа в админ-панель с логином/паролем (admin / terabayt2024)
- [x] Добавить кнопку "Назад" в админ-панели для выхода
- [x] Добавить анимацию при переходе на страницу админ-панели
- [x] Добавить загружку фото товара в админ-панель и отображение на карточках
- [x] Создать API маршрут /api/upload для загружки фото товаров через S3 хранилище

## Bugs
- [x] Упростить загружку фото - сохранять URL вместо реальной загружки на S3
- [x] Исправить ошибку UNAUTHORIZED при добавлении товара - отправлять логин на сервер для установки cookie
- [x] Исправить кнопку "Узнать больше" - должна прокручивать страницу вниз к рекомендуемым товарам
- [x] Заменить логотип "ТБ" на загруженный логотип Terabayt.kz в навигации
- [x] Исправить ошибку "Invalid credentials" при входе в админ-панель - cookie-parser был добавлен в предыдущем checkpoint
- [x] Корзина работает без авторизации - использует sessionId в localStorage
- [x] Заменить логотип "TB" в ProductDetail.tsx на загруженный логотип
- [x] Убрать кнопку корзины со всех страниц
- [x] Добавить поле рассрочки в схему БД (installmentMonths, installmentPrice)
- [x] Добавить поле рассрочки в форму добавления/редактирования товара в админ-панели
- [x] Отобразить информацию о рассрочке на карточке товара в каталоге
- [x] Отобразить информацию о рассрочке на странице детали товара

## Новые требования

- [x] Убрать поля рассрочки (installmentMonths, installmentPrice) из всех компонентов
- [x] Добавить категории товаров: Asus, HP, Lenovo, Dell, Apple и т.д.
- [x] Переделать фильтрацию - показывать товары только по названию и по категориям
- [x] Удалить фильтры по categoryType (gaming, ultrabook, office, budget)
- [x] Обновить админ-панель для работы с новыми категориями

## Требования по безопасности и UI

- [x] Показывать логотипы брендов в каталоге (кликабельные кнопки)
- [x] При клике на название бренда фильтровать только товары этого бренда
- [x] Исправить SQL injection уязвимость в админ-панели (защита от or 1=1)
- [x] Добавить валидацию входных данных на сервере (Zod валидация)
- [x] Использовать параметризованные запросы везде (Drizzle ORM)

## Требования по переделке структуры каталога

- [x] Добавить поле модели (model) в таблицу products
- [x] Главный каталог - показывать логотипы брендов (HP, Asus, Lenovo и т.д.) как кликабельные плитки
- [x] При клике на бренд - открывать подкаталог с моделями этого бренда
- [x] При клике на модель - показывать все ноутбуки этой модели
- [x] Обновить админ-панель для добавления/редактирования модели товара


## Следующие шаги для улучшения

- [x] Добавить функцию редактирования товаров в админ-панели (Edit button)
- [x] Заменить текстовые плитки брендов на логотипы брендов в каталоге
- [x] Добавить систему рейтинга и отзывов на странице деталей товара
- [x] Добавить промо-баннеры и карусели избранных товаров на главную

## Завершающие работы

- [x] Применить миграцию reviews через webdev_execute_sql
- [x] Добавить invalidate/refetch для отзывов после создания нового отзыва
- [x] Написать vitest тесты для review procedures
- [x] Добавить loading/empty states для карусели на главной


## Оптимизация каталога

- [x] Добавить кнопку "Назад" для возврата на предыдущий уровень
- [x] Очистить состояние модели при клике на новую модель

## Редизайн каталога

- [x] Полностью переделать дизайн каталога (Catalog.tsx) в чёрно-изумрудном стиле как на главной

## Редизайн админки и страницы товара

- [x] Переделать AdminLogin.tsx в чёрно-изумрудном стиле
- [x] Переделать AdminDashboard.tsx в чёрно-изумрудном стиле
- [x] Переделать ProductDetail.tsx в чёрно-изумрудном стиле

## Баг-фикс: создание товара

- [x] ProductForm: корректно выбирать существующий categoryId (не hardcode 1) и блокировать сохранение без категории
