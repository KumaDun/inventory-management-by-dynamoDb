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
    private List<OrderDetail> items;
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

    public List<OrderDetail> getItems() {
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

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public void setOrderTime(String orderTime) {
        this.orderTime = orderTime;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setItems(List<OrderDetail> items) {
        this.items = items;
    }

    public void setHoldStartTime(String holdStartTime) {
        this.holdStartTime = holdStartTime;
    }

    public void setHoldExpiryTime(String holdExpiryTime) {
        this.holdExpiryTime = holdExpiryTime;
    }

    public void setExecutionTime(String executionTime) {
        this.executionTime = executionTime;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
