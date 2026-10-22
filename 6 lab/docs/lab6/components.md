# Дерево компонентов и владельцы состояния

```text
App (только Providers и Routes)
└── Providers (AuthContext: signedIn; ThemeContext: theme)
    └── BrowserRouter / Layout (NavLink, Outlet, Footer)
        ├── CatalogPage (useSearchParams: q, genre, sort, page; saved ids)
        │   ├── FiltersPanel
        │   ├── Spinner / EmptyState / ErrorBox
        │   ├── BookList → BookCard → Badge / Button
        │   └── Pagination
        ├── DetailPage (useFetch: bookId)
        ├── BookFormPage (react-hook-form, zod, form errors)
        ├── RequireAuth → WishlistPage (localStorage)
        ├── LoginPage (учебная авторизация)
        └── NotFoundPage
```

Состояние каталога хранится в URL; список желаемого — в localStorage. Context только для темы и текущего пользователя, не для данных страниц. Сетевая логика только в api и хуках.
