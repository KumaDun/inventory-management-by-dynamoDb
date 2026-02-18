export const PopType = {
    CreatePop: 0,
    UpdatePop: 1,
} as const

export type PopType = typeof PopType[keyof typeof PopType]