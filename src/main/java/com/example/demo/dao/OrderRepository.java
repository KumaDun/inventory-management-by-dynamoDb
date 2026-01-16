package com.example.demo.dao;

import com.example.demo.exceptions.daoExceptions.DaoConflictException;
import com.example.demo.exceptions.daoExceptions.DaoPersistenceException;
import com.example.demo.model.OrderItem;
import com.example.demo.model.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.core.pagination.sync.SdkIterable;
import software.amazon.awssdk.enhanced.dynamodb.*;
import software.amazon.awssdk.enhanced.dynamodb.model.*;
import software.amazon.awssdk.services.dynamodb.model.ConditionalCheckFailedException;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {
    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<OrderItem> orderTable;

    @Autowired
    public OrderRepository(DynamoDbEnhancedClient enhancedClient,
                           @Value("${dynamodb.inventory.table.ordersTable.name}") String tableName) {
        this.enhancedClient = enhancedClient;
        this.orderTable = enhancedClient.table(tableName, TableSchema.fromBean(OrderItem.class));
    }

    public void putItem(OrderItem orderItem) {
        orderTable.putItem(orderItem);
    }

    public void deleteItem(OrderItem orderItem) {
        orderTable.deleteItem(orderItem);
    }

    public void deleteItemByCustomerIdAndOrderTime(String customerId, String orderTime) {
        orderTable.deleteItem(
                Key.builder()
                    .partitionValue(customerId)
                    .sortValue(orderTime)
                    .build());
    }

    public void deleteItemByCustomerId(String customerId) {
        PageIterable<OrderItem> orders = orderTable.query(QueryEnhancedRequest.builder()
                .queryConditional(
                        QueryConditional.keyEqualTo(
                                Key.builder().partitionValue(customerId).build()
                        )
                )
                .build());
        orders.forEach(page -> page.items().forEach(
                orderTable::deleteItem
        ));
    }

    public List<Optional<OrderItem>> getOrdersByCustomerId(String customerId) {
        try {
            PageIterable<OrderItem> pages = orderTable.query(QueryEnhancedRequest.builder()
                    .queryConditional(
                            QueryConditional.keyEqualTo(
                                    Key.builder().partitionValue(customerId).build()
                            )
                    )
                    .build());
            List<Optional<OrderItem>> orderItems = new ArrayList<>();
            pages.forEach(page -> page.items().forEach(
                    item -> orderItems.add(Optional.ofNullable(item))
            ));
            return orderItems;
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory getItem condition check failed",
                    ex
            );
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB getItem operation failed",
                    ex
            );
        }

    }

    public Optional<OrderItem> getOrderByCustomerIdAndOrderTime(String customerId, String orderTime) {
        try {
            OrderItem orderItem = orderTable.getItem(GetItemEnhancedRequest.builder()
                    .key(Key.builder()
                            .partitionValue(customerId)
                            .sortValue(orderTime)
                            .build())
                    .build());
            return Optional.ofNullable(orderItem);
        } catch (ConditionalCheckFailedException ex) {
            throw new DaoConflictException(
                    "Inventory getItem condition check failed",
                    ex
            );
        } catch (DynamoDbException ex) {
            throw new DaoPersistenceException(
                    "DynamoDB getItem operation failed",
                    ex
            );
        }

    }

    public OrderItem getOrderByOrderId(String orderId) {
        SdkIterable<Page<OrderItem>> iterable = orderTable.index("orderIdIndex").query(
                QueryEnhancedRequest.builder()
                        .queryConditional(QueryConditional.keyEqualTo(
                                Key.builder().partitionValue(orderId).build()
                        ))
                        .limit(1) // optional: limit to 1 item
                        .build()
        );

        // Get first item from the first page
        for (Page<OrderItem> page : iterable) {
            if (!page.items().isEmpty()) {
                return page.items().get(0);
            }
        }
        return null;
    }

    public void updateOrderStatusByCustomerIdAndOrderTimes(
            String customerId, String orderTime, OrderStatus status) {
        OrderItem orderToUpdate = new OrderItem();
        orderToUpdate.setCustomerId(customerId);
        orderToUpdate.setOrderTime(orderTime);
        orderToUpdate.setStatus(status);
        UpdateItemEnhancedRequest<OrderItem> request =
                UpdateItemEnhancedRequest.<OrderItem>builder(OrderItem.class)
                        .item(orderToUpdate)
                        .ignoreNulls(true)
                        .build();
        orderTable.updateItem(request);
    }

    public void updateOrderStatus(String orderId, OrderStatus status) {
        OrderItem orderItem = this.getOrderByOrderId(orderId);
        if (orderItem != null) {
            OrderItem newOrder = new OrderItem();
            newOrder.setCustomerId(orderItem.getCustomerId());
            newOrder.setOrderTime(orderItem.getOrderTime());
            newOrder.setStatus(status);
            orderTable.updateItem(UpdateItemEnhancedRequest.<OrderItem>builder(OrderItem.class)
                            .item(newOrder)
                            .ignoreNulls(true)
                            .build());
        }
    }

    public boolean isOrderExpired(String orderId) {
        OrderItem orderItem = this.getOrderByOrderId(orderId);
        if (orderItem != null && orderItem.getOrderTime()!= null) {
            Instant expireTime = Instant.parse(orderItem.getHoldExpiryTime());
            return Instant.now().isAfter(expireTime);
        }
        return false;
    }
}
