package com.example.demo.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSortKey;

import java.util.List;

@DynamoDbBean
public class OrderItem {
    private String customerId;
    private String orderTime;          // ISO 8601 String for DynamoDB
    private String orderId;
    private List<OrderItem> items;
    private String holdStartTime;
    private String holdExpiryTime;
    private String executionTime;
    private OrderStatus status;

    @DynamoDbPartitionKey
    public String getCustomerId() {
        return customerId;
    }

    @DynamoDbSortKey
    public String getOrderTime() {
        return orderTime;
    }

    @DynamoDbSecondaryPartitionKey(indexNames = "orderIdIndex")
    public String getOrderId() {
        return orderId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public String getHoldStartTime() {
        return holdStartTime;
    }

    public String getHoldExpiryTime() {
        return holdExpiryTime;
    }

    public String getExecutionTime() {
        return executionTime;
    }

    public OrderStatus getStatus() {
        return status;
    }
}
