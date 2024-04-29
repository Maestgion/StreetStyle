export const getMongoosePaginateOptions = (
    page = 1,
    limit = 1,
    customLabels
)=>{
    return {
        page : Math.max(page, 1),
        limit : Math.max(page, 1),
        pagination: true,
        customLables: {
            paginationCounter: "serialNumberStartFrom",
            ...customLabels
        }
    }
}