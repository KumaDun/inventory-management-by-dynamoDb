package com.example.demo.dao;

import com.example.demo.exceptions.daoExceptions.DaoConflictException;
import com.example.demo.exceptions.daoExceptions.DaoPersistenceException;
import com.example.demo.model.InventoryItem;

import com.example.demo.model.ScanItemsPage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.PutItemEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.Page;
import software.amazon.awssdk.enhanced.dynamodb.model.PageIterable;
import software.amazon.awssdk.enhanced.dynamodb.model.ScanEnhancedRequest;
import software.amazon.awssdk.enhanced.dynamodb.model.UpdateItemEnhancedRequest;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import java.util.List;
import java.util.ArrayList;

@Repository
public class ItemsRepository {
    private final DynamoDbTable<InventoryItem> itemsTable;

    @Autowired
    public ItemsRepository(DynamoDbEnhancedClient enhancedClient,
            @Value("${dynamodb.inventory.table.itemsTable.name}") String tableName) {
        this.itemsTable = enhancedClient.table(tableName, TableSchema.fromBean(InventoryItem.class));
    }

    private String computeShardKey(String itemId) {
        if (itemId == null || itemId.isBlank()) {
            return "PK1";
        }
        char last = itemId.charAt(itemId.length() - 1);
        int v = Character.digit(last, 16);
        if (v < 0) {
            v = -v;
        }
        return (v % 2 == 0) ? "PK2" : "PK1";
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

    public ScanItemsPage scanItems(String exclusiveStartKey) {
        try {
            String normalizedStartKey = exclusiveStartKey == null ? null : exclusiveStartKey.trim();
            if (normalizedStartKey != null &&
                    (normalizedStartKey.isEmpty() || "null".equalsIgnoreCase(normalizedStartKey))) {
                normalizedStartKey = null;
            }
            ScanEnhancedRequest.Builder scanBuilder = ScanEnhancedRequest.builder()
                    .consistentRead(true)
                    .limit(10);
            if (normalizedStartKey != null) {
                System.out.println("build exclusiveStartKey");
                scanBuilder.exclusiveStartKey(
                        Map.of("itemId", AttributeValue.builder().s(normalizedStartKey).build())
                );
            }
            PageIterable<InventoryItem> pages = itemsTable.scan(scanBuilder.build());
            java.util.Iterator<Page<InventoryItem>> iterator = pages.iterator();
            if (!iterator.hasNext()) {
                System.out.println("iterator hasNoNext");
                return new ScanItemsPage(List.of(), null);
            }
            Page<InventoryItem> page = iterator.next();
            System.out.println("page items length " + page.items().size());
            Map<String, AttributeValue> lastEvaluatedKeyMap = page.lastEvaluatedKey();
            String lastEvaluatedKey = null;
            if (lastEvaluatedKeyMap != null && lastEvaluatedKeyMap.containsKey("itemId")) {
                lastEvaluatedKey = lastEvaluatedKeyMap.get("itemId").s();
            }
            return new ScanItemsPage(
                    new ArrayList<>(page.items()), lastEvaluatedKey
            );
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB scan operation failed",
                    ex);
        }
    }
}
