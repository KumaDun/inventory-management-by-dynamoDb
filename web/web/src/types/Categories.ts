export const Categories = [
    "Electronics",
    "Furniture",
    "Books",
    "Clothing",
    "Sports"
] as const

export type Category = (typeof Categories)[number]