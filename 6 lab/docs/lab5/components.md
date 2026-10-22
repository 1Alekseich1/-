# Дерево компонентов BookNest

```text
App [filters, page, catalog, wishlist, mode, detailId, details]
├── Header [props]
│   └── Badge [props]
├── FiltersPanel [props]
│   └── Button [props]
├── Spinner [props] / ErrorBox [props] / EmptyState [props]
│   └── Button [props]
├── BookList [props]
│   └── BookCard [props]
│       ├── Badge [props]
│       └── Button [props]
├── Pagination [props]
│   └── Button [props]
├── Wishlist [props]
│   ├── Badge [props]
│   ├── EmptyState [props]
│   └── Button [props]
├── BookDetails [props]
│   ├── Badge [props]
│   └── Button [props]
└── Footer [props]
```

В `App` находится общее состояние, поскольку фильтры, список карточек, шапка и избранное используют пересекающиеся данные. Детям передаются только типизированные props. `wishlist` хранится в состоянии React и синхронизируется с localStorage. `savedIds`, сформированный из wishlist, вычисляется через useMemo, а не хранится как отдельный state. Компоненты `Badge`, `Button`, `Spinner`, `EmptyState`, `ErrorBox`, `BookCard`, `BookList`, `Pagination`, `Footer` не имеют собственного состояния.

`useDebounce` имеет внутреннее состояние значения с задержкой — это переиспользуемый хук, а не презентационный компонент.
