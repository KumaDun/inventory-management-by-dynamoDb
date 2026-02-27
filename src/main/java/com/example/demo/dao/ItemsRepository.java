package com.example.demo.dao;

import com.example.demo.exceptions.daoExceptions.DaoConflictException;
import com.example.demo.exceptions.daoExceptions.DaoPersistenceException;
import com.example.demo.model.InventoryItem;

import com.example.demo.model.ScanItemsPage;
import org.jspecify.annotations.NonNull;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import software.amazon.awssdk.core.pagination.sync.SdkIterable;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.*;
import java.util.concurrent.CompletionException;
import java.util.function.Consumer;

@Repository
public class ItemsRepository {
    private final DynamoDbTable<InventoryItem> itemsTable;

    @Autowired
    public ItemsRepository(DynamoDbEnhancedClient enhancedClient,
            @Value("${dynamodb.inventory.table.itemsTable.name}") String tableName) {
        this.itemsTable = enhancedClient.table(tableName, TableSchema.fromBean(InventoryItem.class));
    }

    private @NonNull String computeShardKey(String itemId) {
        return "PK1";
        // Two sharding is abandoned for ease of maintaining shard cursor
//        if (itemId == null || itemId.isBlank()) {
//            return "PK1";
//        }
//        char last = itemId.charAt(itemId.length() - 1);
//        int v = Character.digit(last, 16);
//        if (v < 0) {
//            v = -v;
//        }
//        return (v % 2 == 0) ? "PK2" : "PK1";
    }

    public int backfillMissingShardKeys(int pageSize) {
        int pageLimit = pageSize > 0 ? pageSize : 100;
        int updatedCount = 0;
        Expression missingShardKeyCondition = Expression.builder()
                .expression("attribute_not_exists(#shardKey)")
                .expressionNames(Map.of("#shardKey", "shardKey"))
                .build();

        ScanEnhancedRequest request = ScanEnhancedRequest.builder()
                .consistentRead(true)
                .limit(pageLimit)
                .build();

        PageIterable<InventoryItem> pages = itemsTable.scan(request);
        for (Page<InventoryItem> page : pages) {
            for (InventoryItem item : page.items()) {
                if (item.getItemId() == null || item.getItemId().isBlank()) {
                    continue;
                }
                if (item.getShardKey() != null && !item.getShardKey().isBlank()) {
                    continue;
                }

                InventoryItem patch = new InventoryItem();
                patch.setItemId(item.getItemId());
                patch.setShardKey(computeShardKey(item.getItemId()));

                try {
                    itemsTable.updateItem(UpdateItemEnhancedRequest.builder(InventoryItem.class)
                            .item(patch)
                            .ignoreNulls(true)
                            .conditionExpression(missingShardKeyCondition)
                            .build());
                    updatedCount++;
                } catch (ConditionalCheckFailedException ignored) {
                    // Another writer already set shardKey; safe to skip.
                }
            }
        }
        return updatedCount;
    }

    public Optional<InventoryItem> putItem(InventoryItem inventoryItem) {
        try {
            if (inventoryItem.getItemId() == null || inventoryItem.getItemId().isBlank()) {
                inventoryItem.setItemId(UUID.randomUUID().toString());
            }
            // 2) Condition: don't overwrite if itemId already exists
            Expression notExists = Expression.builder()
                    .expression("attribute_not_exists(#pk)")
                    .expressionNames(Map.of("#pk", "itemId"))
                    .build();
            String shardKey = this.computeShardKey(inventoryItem.getItemId());
            inventoryItem.setShardKey(shardKey);
            PutItemEnhancedRequest<InventoryItem> request =
                    PutItemEnhancedRequest.builder(InventoryItem.class)
                            .item(inventoryItem)
                            .conditionExpression(notExists)
                            .build();
            itemsTable.putItem(request);

            return Optional.ofNullable(inventoryItem);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory item already exists or condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB putItem operation failed",
                    ex);
        }
    }

    public Optional<InventoryItem> getItem(String itemId) {
        try {
            InventoryItem item = itemsTable.getItem(inventoryItem -> inventoryItem.key(k -> k.partitionValue(itemId)));
            return Optional.ofNullable(item);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory getItem condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB getItem operation failed",
                    ex);
        }
    }

    public void deleteItemById(String itemId) {
        try {
            itemsTable.deleteItem(Key.builder().partitionValue(itemId).build());
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory deleteItem condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB deleteItem operation failed",
                    ex);
        }
    }

    public void deleteItemByItem(InventoryItem inventoryItem) {
        try {
            itemsTable.deleteItem(inventoryItem);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory deleteItem condition check failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB deleteItem operation failed",
                    ex);
        }
    }

    public Optional<InventoryItem> updateAttributeByItemId(String itemId, InventoryItem item) {
        itemsTable.updateItem(UpdateItemEnhancedRequest.builder(InventoryItem.class)
                .item(item)
                .ignoreNulls(true)
                .build());
        return Optional.ofNullable(item);
    }

    public void updateAttributeByItemId(String itemId, Consumer<InventoryItem> setter) {
        InventoryItem inventoryItem = new InventoryItem();
        inventoryItem.setItemId(itemId);
        setter.accept(inventoryItem);
        itemsTable.updateItem(UpdateItemEnhancedRequest.builder(InventoryItem.class)
                .item(inventoryItem)
                .ignoreNulls(true)
                .build());
    }

    public void updateItemStockLevelByItemId(String itemId, int stockLevel) {
        this.updateAttributeByItemId(itemId, item -> item.setStockLevel(stockLevel));
    }

    public void updateItemPriceByItemId(String itemId, float price) {
        this.updateAttributeByItemId(itemId, item -> item.setPrice(price));
    }

    public void updateItemNameByItemId(String itemId, String name) {
        this.updateAttributeByItemId(itemId, item -> item.setName(name));
    }

    public void updateThresholdByItemId(String itemId, int threshold) {
        this.updateAttributeByItemId(itemId, item -> item.setThreshold(threshold));
    }

    public void updateDescriptionByItemId(String itemId, String description) {
        this.updateAttributeByItemId(itemId, item -> item.setDescription(description));
    }

    public void updateAvailableByItemId(String itemId, boolean available) {
        this.updateAttributeByItemId(itemId, item -> item.setAvailable(available));
    }

    public ScanItemsPage scanItems(@Nullable String exclusiveStartKey) {
        try {
            exclusiveStartKey = this.normalizePaginationToken(exclusiveStartKey);
            ScanEnhancedRequest.Builder scanBuilder = ScanEnhancedRequest.builder()
                    .consistentRead(true)
                    .limit(10);
            if (exclusiveStartKey != null) {
                try {
                    System.out.println("build exclusiveStartKey");
                    Map<String, AttributeValue> lastEvaluatedKey = this.decodePaginationToken(exclusiveStartKey);
                    scanBuilder.exclusiveStartKey(lastEvaluatedKey);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
            PageIterable<InventoryItem> pages = itemsTable.scan(scanBuilder.build());
            return this.processPagesIterable(pages);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB scan operation failed",
                    ex);
        }
    }

    public ScanItemsPage searchItemsByCategoryNameGsi(@NonNull String category, @Nullable String name, @Nullable String exclusiveStartKey) {
        try {
            DynamoDbIndex<InventoryItem> categoryNameGsi = itemsTable.index("category-name-index");
            Key.Builder keyBuilder = Key.builder();
            QueryConditional queryConditional;
            if (name != null && !name.isBlank()) {
                keyBuilder.sortValue(name.trim());
                Key key = keyBuilder.partitionValue(category).build();
                queryConditional = QueryConditional.sortBeginsWith(key);
            } else {
                Key key = keyBuilder.partitionValue(category).build();
                queryConditional = QueryConditional.keyEqualTo(key);
            }
            QueryEnhancedRequest.Builder queryBuilder = this.generateRequestBuilderWithExclusiveStartKey(
                    exclusiveStartKey);
            QueryEnhancedRequest request = queryBuilder
                    .queryConditional(queryConditional)
                    .limit(10)
                    .build();
            SdkIterable<Page<InventoryItem>> pagesIterable = categoryNameGsi.query(request);
            return this.processPagesIterable(pagesIterable);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB category-name-index scan operation failed",
                    ex);
        }
    }

    public ScanItemsPage searchItemsByShardNameGsi(@NonNull String name, @Nullable String exclusiveStartKey) {
        try {
            DynamoDbIndex<InventoryItem> shardNameGsi = itemsTable.index("shardKey-name-index");
            String normalizedName = name.trim();
            Key key = Key.builder()
                    .partitionValue("PK1")
                    .sortValue(normalizedName)
                    .build();
            QueryConditional queryConditional = QueryConditional.sortBeginsWith(key);
            QueryEnhancedRequest.Builder requestBuilder = this.generateRequestBuilderWithExclusiveStartKey(exclusiveStartKey);
            QueryEnhancedRequest request = requestBuilder
                    .queryConditional(queryConditional)
                    .limit(5)
                    .build();
            SdkIterable<Page<InventoryItem>> pagesIterable = shardNameGsi.query(request);
            return this.processPagesIterable(pagesIterable);
        } catch (CompletionException ex) {
            Throwable cause = ex.getCause();
            if (cause instanceof DynamoDbException dynamoDbException) {
                throw new DaoPersistenceException(
                        "DynamoDB shardKey-name-index query operation failed",
                        dynamoDbException);
            }
            throw new DaoPersistenceException(
                    "Concurrent shard query failed",
                    ex);
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB shardKey-name-index query operation failed",
                    ex);
        }
    }

    private ScanItemsPage processPagesIterable(SdkIterable<Page<InventoryItem>> iterable) {
        Iterator<Page<InventoryItem>> iterator = iterable.iterator();
        if (!iterator.hasNext()) {
            System.out.println("iterator hasNoNext");
            return new ScanItemsPage(List.of(), null);
        }
        Page<InventoryItem> page = iterator.next();
        System.out.println("page items length " + page.items().size());
        Map<String, AttributeValue> lastEvaluatedKeyMap = page.lastEvaluatedKey();
        String lastEvaluatedKey = null;
        if (lastEvaluatedKeyMap != null && !lastEvaluatedKeyMap.isEmpty()) {
            System.out.println("lastEvaluateKey is " + page.lastEvaluatedKey());
            try{
                lastEvaluatedKey = this.encodePaginationToken(lastEvaluatedKeyMap);
            } catch (IOException e) {
                System.out.println("encodePaginationToken failed due to " + e.getMessage() + e.getCause());
                return new ScanItemsPage(new ArrayList<>(page.items()), null);
            }
        }
        return new ScanItemsPage(
                new ArrayList<>(page.items()), lastEvaluatedKey
        );
    }

    private QueryEnhancedRequest.Builder generateRequestBuilderWithExclusiveStartKey(@Nullable String exclusiveStartKey) {
        QueryEnhancedRequest.Builder queryBuilder = QueryEnhancedRequest.builder();
        exclusiveStartKey = this.normalizePaginationToken(exclusiveStartKey);
        if (exclusiveStartKey != null) {
            System.out.println("build exclusiveStartKey");
            try {
                Map<String, AttributeValue>lastExclusiveStartKey = this.decodePaginationToken(exclusiveStartKey);
                queryBuilder.exclusiveStartKey(lastExclusiveStartKey);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return queryBuilder;
    }

    private String encodePaginationToken(Map<String, AttributeValue> lastKey) throws IOException {
        StringJoiner joiner = new StringJoiner("&");
        for (Map.Entry<String, AttributeValue> entry : lastKey.entrySet()) {
            AttributeValue value = entry.getValue();
            String type;
            String rawValue;
            if (value.s() != null) {
                type = "S";
                rawValue = value.s();
            } else if (value.n() != null) {
                type = "N";
                rawValue = value.n();
            } else if (value.bool() != null) {
                type = "BOOL";
                rawValue = String.valueOf(value.bool());
            } else {
                throw new IOException("Unsupported key attribute type in lastEvaluatedKey: " + entry.getKey());
            }
            String keyPart = URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8);
            String valuePart = URLEncoder.encode(rawValue, StandardCharsets.UTF_8);
            joiner.add(keyPart + "=" + type + ":" + valuePart);
        }
        String payload = joiner.toString();
        System.out.println("encodePaginationToken: " + payload);
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    }

    private @Nullable String normalizePaginationToken(@Nullable String token) {
        if (token == null) {
            return null;
        }

        String normalized = token.trim();
        if (normalized.isEmpty() || "null".equalsIgnoreCase(normalized)) {
            return null;
        }

        if (normalized.length() >= 2 && normalized.startsWith("\"") && normalized.endsWith("\"")) {
            normalized = normalized.substring(1, normalized.length() - 1).trim();
        }

        if (normalized.contains("%")) {
            normalized = URLDecoder.decode(normalized, StandardCharsets.UTF_8);
        }

        return normalized;
    }

    private Map<String, AttributeValue> decodePaginationToken(String token) throws Exception {
        String normalizedToken = this.normalizePaginationToken(token);
        if (normalizedToken == null) {
            return new LinkedHashMap<>();
        }
        String payload = new String(Base64.getUrlDecoder().decode(normalizedToken), StandardCharsets.UTF_8);
        Map<String, AttributeValue> result = new LinkedHashMap<>();
        if (payload.isBlank()) {
            return result;
        }
        for (String pair : payload.split("&")) {
            int equalIndex = pair.indexOf('=');
            int colonIndex = pair.indexOf(':', equalIndex + 1);
            if (equalIndex <= 0 || colonIndex <= equalIndex + 1) {
                throw new IOException("Invalid pagination token format");
            }
            String key = URLDecoder.decode(pair.substring(0, equalIndex), StandardCharsets.UTF_8);
            String type = pair.substring(equalIndex + 1, colonIndex);
            String rawValue = URLDecoder.decode(pair.substring(colonIndex + 1), StandardCharsets.UTF_8);
            AttributeValue attributeValue = switch (type) {
                case "S" -> AttributeValue.builder().s(rawValue).build();
                case "N" -> AttributeValue.builder().n(rawValue).build();
                case "BOOL" -> AttributeValue.builder().bool(Boolean.parseBoolean(rawValue)).build();
                default -> throw new IOException("Unsupported key attribute type in token: " + type);
            };
            result.put(key, attributeValue);
        }
        System.out.println("decodePaginationToken: " + result);
        return result;
    }
}
