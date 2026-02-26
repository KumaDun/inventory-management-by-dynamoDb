package com.example.demo.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

@DynamoDbBean
public class InventoryItem {
    private String itemId;
    private String name;
    private String description;
    private float price;
    private int stockLevel;
    private String category;
    private int threshold;
    private boolean isAvailable;
    private String currency;
    private String shardKey;

    @DynamoDbPartitionKey
    public String getItemId() {
        return itemId;
    }

    @DynamoDbSecondarySortKey(indexNames = {"category-name-index", "shardKey-name-index"})
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public float getPrice() {
        return price;
    }

    public int getStockLevel() {
        return stockLevel;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = {"category-name-index"})
    public String getCategory() {
        return category;
    }

    public int getThreshold() {
        return threshold;
    }

    public boolean getIsAvailable() {
        return isAvailable;
    }

    public String getCurrency() {
        return currency;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(float price) {
        this.price = price;
    }

    public void setStockLevel(int stockLevel) {
        this.stockLevel = stockLevel;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setThreshold(int threshold) {
        this.threshold = threshold;
    }

    public void setAvailable(boolean available) {
        isAvailable = available;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getShardKey() {
        return shardKey;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = "shardKey-name-index")
    public void setShardKey(String shardKey) {
        this.shardKey = shardKey;
    }
}
