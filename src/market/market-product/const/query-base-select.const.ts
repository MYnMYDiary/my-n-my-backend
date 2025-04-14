export const DEFAULT_MARKET_PRODUCT_SELECTIONS = [
    'marketProduct.id as id',
    'marketProduct.name as name',
    'marketProduct.price as price',
    `ARRAY(
        SELECT CONCAT('/public/market/product/', unnest(marketProduct.images))
    ) as images`
]